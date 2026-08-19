import { Map } from "leaflet";
import { compileFilterExpression } from "facilmap-utils";
import type { CustomFunction } from "facilmap-types";
import { cloneDeep } from "lodash-es";

interface ExtendedMap extends Map {
	fmFilterCustomFuncs: CustomFunction[];
	updateFmFilter: () => void;
}

Object.assign(Map.prototype, {
	fmFilter: undefined,
	fmFilterFunc: compileFilterExpression(),
	fmFilterCustomFuncs: [],

	setFmFilter(this: ExtendedMap, filter?: string) {
		this.fmFilterFunc = compileFilterExpression(filter, this.fmFilterCustomFuncs);
		this.fmFilter = filter || undefined;
		this.fire("fmFilter");
	},

	setFmFilterCustomFuncs(this: ExtendedMap, customFuncs: CustomFunction[]) {
		this.fmFilterCustomFuncs = cloneDeep(customFuncs);
		this.setFmFilter(this.fmFilter);
	}
});
