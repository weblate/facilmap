import type { Feature, Geometry } from "geojson";
import type { GeoJsonExport, LineFeature, MarkerFeature, SearchResult } from "facilmap-types";
import { flattenObject } from "facilmap-utils";

type FmFeatureProperties = Partial<MarkerFeature["properties"]> | Partial<LineFeature["properties"]>;
type FeatureProperties = FmFeatureProperties & {
	tags?: Record<string, string>; // Tags for OSM objects
	type?: string;
	id?: string;
}

export type FileResult = SearchResult & {
	isFileResult: true;
	fmTypeId?: number;
	fmProperties?: FmFeatureProperties;
}

export interface FileResultObject {
	features: FileResult[];
	views: GeoJsonExport["facilmap"]["views"];
	types: GeoJsonExport["facilmap"]["types"];
	errors: boolean;
}

async function fileToGeoJSON(file: string): Promise<any> {
	if(file.match(/^\s*</)) {
		const doc = (new window.DOMParser()).parseFromString(file, "text/xml");
		const parserErrorElem = doc.getElementsByTagName("parsererror")[0];
		if (parserErrorElem) {
			throw new Error(`Invalid XML: ${parserErrorElem.textContent}`);
		}

		const xml = doc.documentElement;

		if (xml.matches("gpx")) {
			const { gpx } = await import("@tmcw/togeojson");
			return gpx(xml);
		} else if (xml.matches("kml")) {
			const { kml } = await import("@tmcw/togeojson");
			return kml(xml);
		} else if (xml.matches("osm")) {
			const { default: osmtogeojson } = await import("osmtogeojson");
			return osmtogeojson(xml);
		} else if (xml.matches("TrainingCenterDatabase")) {
			const { tcx } = await import("@tmcw/togeojson");
			return tcx(xml);
		}
	} else if(file.match(/^\s*\{/)) {
		const content = JSON.parse(file);
		if(content.type)
			return content;
	}
}

export async function parseFiles(files: string[]): Promise<FileResultObject> {
	const filesGeoJSON = await Promise.all(files.map(fileToGeoJSON));

	const ret: FileResultObject = { features: [ ], views: [ ], types: { }, errors: false };
	let nextTypeIdx = 1;

	for (const geojson of filesGeoJSON) {
		if(geojson == null) {
			ret.errors = true;
			continue;
		}

		const typeMapping: Record<string, number> = {};

		if (geojson.facilmap) {
			if (geojson.facilmap.types) {
				for (const i of Object.keys(geojson.facilmap.types)) {
					typeMapping[i] = nextTypeIdx++;
					ret.types[typeMapping[i]] = geojson.facilmap.types[i];
				}
			}

			if(geojson.facilmap.views)
				ret.views.push(...geojson.facilmap.views);
		}

		let features: Feature<Geometry, FeatureProperties>[];
		if(geojson.type == "FeatureCollection")
			features = geojson.features || [ ];
		else if(geojson.type == "Feature")
			features = [ geojson ];
		else
			features = [ { type: "Feature", geometry: geojson, properties: { } } ];

		for (const feature of features) {
			let name;

			if(typeof feature.properties != "object")
				feature.properties = { };

			if(feature.properties.name)
				name = feature.properties.name;
			else if(feature.properties.tags && feature.properties.tags.name)
				name = feature.properties.tags.name;
			else if(feature.properties.type)
				name = feature.properties.type + " " + feature.properties.id;
			else if([ "Polygon", "MultiPolygon" ].indexOf(feature.geometry.type) != -1)
				name = "Polygon";
			else if([ "LineString", "MultiLineString" ].indexOf(feature.geometry.type) != -1)
				name = "Line";
			else if([ "Point", "MultiPoint" ].indexOf(feature.geometry.type) != -1)
				name = "Point";
			else
				name = feature.geometry.type || "Object";

			const extraTags = feature.properties.data || feature.properties.tags || flattenObject(Object.assign({}, feature.properties, {coordTimes: null}));

			let f: FileResult = {
				isFileResult: true,
				short_name: name,
				display_name: name,
				extratags: Object.fromEntries(Object.entries(extraTags).map(([k, v]) => [k, `${v}`])),
				geojson: feature.geometry,
				type: feature.properties.type || feature.geometry.type
			};

			if(geojson.facilmap) {
				if(feature.properties.typeId && typeMapping[feature.properties.typeId])
					f.fmTypeId = typeMapping[feature.properties.typeId];
				f.fmProperties = feature.properties;
			}

			ret.features.push(f);
		}
	}

	// if(errors)
	//	return map.messages.showMessage("danger", "Some files could not be parsed.");

	return ret;
}