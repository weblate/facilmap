import compression from "compression";
import express, { type Request, type Response } from "express";
import { createServer, type Server as HttpServer } from "http";
import { stringifiedIdValidator, type PadData, type PadId } from "facilmap-types";
import { createSingleTable, createTable } from "./export/table.js";
import Database from "./database/database";
import { exportGeoJson } from "./export/geojson.js";
import { exportGpx, exportGpxZip } from "./export/gpx.js";
import domainMiddleware from "express-domain-middleware";
import { Readable, Writable } from "stream";
import { getOembedJson, getOpensearchXml, getPwaManifest, getStaticFrontendMiddleware, renderMap, type RenderMapParams } from "./frontend";
import { getSafeFilename, normalizePadName, parsePadUrl } from "facilmap-utils";
import { paths } from "facilmap-frontend/build.js";
import config from "./config";
import { exportCsv } from "./export/csv.js";
import * as z from "zod";
import cookieParser from "cookie-parser";
import { getI18n, i18nMiddleware } from "./i18n.js";

function getBaseUrl(req: Request): string {
	return config.baseUrl ?? `${req.protocol}://${req.host}/`;
}

export async function initWebserver(database: Database, port: number, host?: string): Promise<HttpServer> {
	const padMiddleware = async (req: Request<{ padId: string }>, res: Response<string>) => {
		const baseUrl = getBaseUrl(req);

		let params: RenderMapParams;
		if(req.params?.padId) {
			const padData = await database.pads.getPadDataByAnyId(req.params.padId);
			if (padData) {
				params = {
					padData: {
						searchEngines: padData.searchEngines,
						name: normalizePadName(padData.name),
						description: padData.description
					},
					isReadOnly: padData.id === req.params.padId,
					url: `${baseUrl}${encodeURIComponent(req.params.padId)}`
				};
			} else {
				res.status(404);
				params = {
					padData: {
						searchEngines: false,
						name: undefined,
						description: undefined
					},
					isReadOnly: true,
					url: `${baseUrl}${encodeURIComponent(req.params.padId)}`
				};
			}
		} else {
			params = {
				padData: undefined,
				isReadOnly: true,
				url: baseUrl
			};
		}

		res.type("html");
		res.setHeader("Referrer-Policy", "origin");
		res.send(await renderMap(params));
	};

	const app = express();

	app.set("trust proxy", config.trustProxy ?? false);

	app.use(domainMiddleware);
	app.use(compression());
	app.use(cookieParser());

	app.use(i18nMiddleware);

	app.get("/", padMiddleware);

	app.get(`${paths.base}manifest.json`, async (req, res) => {
		res.set("Content-type", "application/manifest+json");
		res.send(await getPwaManifest());
	});

	app.get(`${paths.base}opensearch.xml`, async (req, res) => {
		res.set("Content-type", "application/opensearchdescription+xml");
		res.send(await getOpensearchXml(getBaseUrl(req)));
	});

	app.get(`${paths.base}custom.css`, async (req, res, next) => {
		if (config.customCssFile) {
			res.sendFile(config.customCssFile);
		} else {
			next();
		}
	});

	app.use(`${paths.base}static/sw.js`, (req, res, next) => {
		res.setHeader("Service-Worker-Allowed", "/");
		next();
	});

	app.use(`${paths.base}oembed`, async (req, res, next) => {
		const query = z.object({
			url: z.string(),
			maxwidth: z.number().optional(),
			maxheight: z.number().optional(),
			format: z.string().optional()
		}).parse(req.query);

		if (query.format != null && query.format !== "json") {
			res.status(501).send();
			return;
		}

		const baseUrl = getBaseUrl(req);
		let padData: PadData | undefined;
		if (query.url === baseUrl || `${query.url}/` === baseUrl) {
			padData = undefined;
		} else {
			const parsed = parsePadUrl(query.url, baseUrl);
			if (parsed) {
				padData = await database.pads.getPadDataByAnyId(parsed.padId);
			} else {
				res.status(404).send();
				return;
			}
		}

		res.header("Content-type", "application/json");

		res.send(getOembedJson(baseUrl, padData, query));
	});

	app.use(await getStaticFrontendMiddleware());

	// If no file with this name has been found, we render a pad
	app.get("/:padId", padMiddleware);

	app.get("/:padId/gpx", async (req: Request<{ padId: string }>, res: Response<string>) => {
		const query = z.object({
			useTracks: z.enum(["0", "1"]).default("0"),
			filter: z.string().optional()
		}).parse(req.query);

		const padData = await database.pads.getPadDataByAnyId(req.params.padId);

		if(!padData)
			throw new Error(getI18n().t("webserver.map-not-found-error", { padId: req.params.padId }));

		res.set("Content-type", "application/gpx+xml");
		res.attachment(`${getSafeFilename(normalizePadName(padData.name))}.gpx`);
		void exportGpx(database, padData ? padData.id : req.params.padId, query.useTracks == "1", query.filter).pipeTo(Writable.toWeb(res));
	});

	app.get("/:padId/gpx/zip", async (req: Request<{ padId: string }>, res: Response<string>) => {
		const query = z.object({
			useTracks: z.enum(["0", "1"]).default("0"),
			filter: z.string().optional()
		}).parse(req.query);

		const padData = await database.pads.getPadDataByAnyId(req.params.padId);

		if(!padData)
			throw new Error(getI18n().t("webserver.map-not-found-error", { padId: req.params.padId }));

		res.set("Content-type", "application/zip");
		res.attachment(padData.name.replace(/[\\/:*?"<>|]+/g, '_') + ".zip");
		void exportGpxZip(database, padData ? padData.id : req.params.padId, query.useTracks == "1", query.filter).pipeTo(Writable.toWeb(res));
	});

	app.get("/:padId/table", async (req: Request<{ padId: string }>, res: Response<string>) => {
		const query = z.object({
			filter: z.string().optional(),
			hide: z.string().optional()
		}).parse(req.query);
		const baseUrl = getBaseUrl(req);

		res.type("html");
		res.setHeader("Referrer-Policy", "origin");
		void createTable(
			database,
			req.params.padId,
			query.filter,
			query.hide ? query.hide.split(',') : [],
			`${baseUrl}${encodeURIComponent(req.params.padId)}/table`
		).pipeTo(Writable.toWeb(res));
	});

	app.get("/:padId/rawTable/:typeId", async (req: Request<{ padId: PadId; typeId: string }>, res: Response<string>) => {
		const typeId = stringifiedIdValidator.parse(req.params.typeId);
		const query = z.object({
			filter: z.string().optional(),
			hide: z.string().optional()
		}).parse(req.query);

		res.type("html");
		res.setHeader("Referrer-Policy", "origin");
		void createSingleTable(
			database,
			req.params.padId,
			typeId,
			query.filter,
			query.hide ? query.hide.split(',') : []
		).pipeTo(Writable.toWeb(res));
	});

	app.get("/:padId/geojson", async (req: Request<{ padId: string }>, res: Response<string>) => {
		const query = z.object({
			filter: z.string().optional()
		}).parse(req.query);

		const padData = await database.pads.getPadData(req.params.padId);

		if(!padData)
			throw new Error(getI18n().t("webserver.map-not-found-error", { padId: req.params.padId }));

		res.set("Content-type", "application/geo+json");
		res.attachment(padData.name.replace(/[\\/:*?"<>|]+/g, '_') + ".geojson");

		const result = exportGeoJson(database, req.params.padId, query.filter);
		Readable.fromWeb(result).pipe(res);
	});

	app.get("/:padId/csv/:typeId", async (req: Request<{ padId: string; typeId: string }>, res: Response<string>) => {
		const typeId = stringifiedIdValidator.parse(req.params.typeId);
		const query = z.object({
			filter: z.string().optional(),
			hide: z.string().optional()
		}).parse(req.query);

		const padData = await database.pads.getPadData(req.params.padId);

		if(!padData)
			throw new Error(getI18n().t("webserver.map-not-found-error", { padId: req.params.padId }));

		res.set("Content-type", "text/csv");
		res.attachment(padData.name.replace(/[\\/:*?"<>|]+/g, '_') + ".csv");

		const result = exportCsv(
			database,
			req.params.padId,
			typeId,
			query.filter,
			query.hide ? query.hide.split(',') : []
		);
		Readable.fromWeb(result).pipe(res);
	});

	const server = createServer(app);
	await new Promise<void>((resolve) => {
		server.listen({ port, host }, resolve);
	});
	return server;
}
