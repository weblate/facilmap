import { bboxValidator, colourValidator, idValidator, padIdValidator, pointValidator, routeModeValidator, zoomLevelValidator } from "./base.js";
import { CRU, type CRUType, cruValidator, optionalCreate, onlyRead, exceptCreate, optionalUpdate, mapValues, exceptRead } from "./cru";
import * as z from "zod";

export const extraInfoValidator = z.record(z.array(z.tuple([z.number(), z.number(), z.number()])));
export type ExtraInfo = z.infer<typeof extraInfoValidator>;

export const trackPointValidator = cruValidator({
	...pointValidator.shape,
	ele: optionalCreate(z.number().or(z.null()), null),
	idx: onlyRead(z.number()),
	zoom: onlyRead(zoomLevelValidator)
});
export type TrackPoint<Mode extends CRU = CRU.READ> = CRUType<Mode, typeof trackPointValidator>;

export const lineValidator = cruValidator({
	id: exceptCreate(idValidator),
	routePoints: optionalUpdate(z.array(pointValidator).min(2)),
	typeId: optionalUpdate(idValidator),
	name: optionalCreate(z.string().trim(), ""),
	mode: optionalCreate(routeModeValidator, ""),
	colour: optionalCreate(colourValidator, "0000ff"),
	width: optionalCreate(z.number(), 4),
	data: optionalCreate(z.record(z.string())),
	extraInfo: optionalCreate(extraInfoValidator.or(z.null()), null),

	...mapValues(bboxValidator.shape, onlyRead),
	distance: onlyRead(z.number()),
	ascent: onlyRead(z.number().or(z.null())),
	descent: onlyRead(z.number().or(z.null())),
	time: onlyRead(z.number().or(z.null())),
	padId: onlyRead(padIdValidator),

	trackPoints: exceptRead(z.array(trackPointValidator.create).optional())
});
export type Line<Mode extends CRU = CRU.READ> = CRUType<Mode, typeof lineValidator>;
