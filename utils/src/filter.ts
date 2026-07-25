import { compileExpression as filtrexCompileExpression } from "filtrex";
import { flattenObject, getProperty, quoteRegExp } from "./utils.js";
import { type ID, type Marker, type Line, type Type, type CRU, currentMarkerToLegacyV2 } from "facilmap-types";
import { cloneDeep } from "lodash-es";
import { normalizeFieldValue } from "./objects";
import { CHECKBOX_FALSE_LABEL, CHECKBOX_TRUE_LABEL } from "./format.js";

export type FormulaFunc = (obj: Marker<CRU> | Line<CRU>, type: Type) => string;
export type FilterFunc = (...args: Parameters<FormulaFunc>) => boolean;

const customFuncs = {
	prop(obj: any, key: string) {
		return obj && getProperty(obj, key);
	},

	random() { }, // Does not work well with angular digest cycles

	lower(obj: any) {
		if (typeof obj == "string")
			return obj.toLowerCase();
		else
			return obj;
	}
};

export function filterHasError(expr: string): Error | undefined {
	try {
		if(expr && expr.trim())
			filtrexCompileExpression(expr, { extraFunctions: customFuncs });
	} catch(e: any) {
		return e;
	}
}

export function compileFilterExpression(expr?: string): FilterFunc {
	if(!expr || !expr.trim())
		return () => true;
	else {
		const filterFunc = filtrexCompileExpression(expr, { extraFunctions: customFuncs });
		return (obj, type) => !!filterFunc(prepareObject(obj, type));
	}
}

export function compileFormulaExpression(expr?: string): FormulaFunc {
	try {
		if (expr && expr.trim()) {
			const func = filtrexCompileExpression(expr, { extraFunctions: customFuncs });
			return (obj, type) => {
				const result = func(prepareObject(obj, type));
				switch (typeof result) {
					case "boolean":
						return result ? CHECKBOX_TRUE_LABEL : CHECKBOX_FALSE_LABEL;
					case "number":
					case "bigint":
						return `${result}`;
					case "string":
						return result;
					default:
						return "";
				}
			};
		}
	} catch {
		// Ignore
	}

	return () => "";
}

export function quote(str: string): string {
	return '"' + (""+str).replace(/["\\]/g, '\\$1').replace(/\n/g, "\\n") + '"';
}

export function _getMatchesWithBrackets(str: string, regexp: string): string[] {
	const ret: string[] = [ ];

	(str || "").replace(new RegExp(regexp, "gi"), (match, ...args) => {
		const offset = args[args.length-2];

		const open = match.match(/\(/g);
		const close = match.match(/\)/g);
		let needBraces = (open ? open.length : 0) - (close ? close.length : 0);
		let i = offset+match.length;
		for(; i<str.length && needBraces > 0; i++) {
			if(str[i] == "(")
				needBraces++;
			else if(str[i] == ")")
				needBraces--;
		}

		ret.push(str.substring(offset, i));

		return match;
	});

	return ret;
}

export function makeTypeFilter(previousFilter: string = "", typeId: ID, filteredData: boolean | Record<string, Record<string, boolean>>): string {
	function removePart(str: string, regexp: string[]) {
		str = str || "";
		for (const r of regexp) {
			str = str
				.replace(new RegExp("^" + r + "($|\\s+and\\s+|\\s+or\\s+)", "ig"), "")
				.replace(new RegExp("\\s+(and|or)\\s+" + r + "($|[^0-9a-z])", "ig"), (...args) => args[args.length-3])
		}
		return str;
	}

	let ret = removePart(previousFilter,
		_getMatchesWithBrackets(previousFilter, "(not\\s+)?\\(typeId\\s*==\\s*" + typeId).map(quoteRegExp)
			.concat([ "typeId\\s*[!=]=\\s*" + typeId ]));

	if(typeof filteredData == "boolean") {
		if(filteredData)
			ret = (ret ? ret + " and " : "") + "typeId!=" + typeId;
	} else {
		const append = [ ];
		for(const i in filteredData) {
			const no = Object.keys(filteredData[i]).filter(function(it) { return !filteredData[i][it]; });
			const yes = Object.keys(filteredData[i]).filter(function(it) { return filteredData[i][it]; });

			if(no.length == 0) // No item is not filtered, so we can filter the whole type
				return (ret ? ret + " and " : "") + "typeId!=" + typeId;

			if(yes.length > 0) {
				const negative = "prop(data," + quote(i) + ")" + (no.length > 1 ? " not in (" + no.map(quote).join(",") + ")" : "!=" + quote(no[0]));
				const positive = "prop(data," + quote(i) + ")" + (yes.length > 1 ? " in (" + yes.map(quote).join(",") + ")" : "==" + quote(yes[0]));

				append.push(negative.length < positive.length ? negative : positive);
			}
		}

		if(append.length > 0)
			ret = (ret ? ret + " and " : "") + "not (typeId=="+typeId+" and " + (append.length > 1 ? "(" + append.join(" or ") + ")" : append[0]) + ")";
	}

	return ret;
}

/**
 * Keeps track synchronously of the calculated formula field names to prevent infinite recursion.
 * When a filter/formula function accesses the value of a formula field, its result is calculated on the fly by its getter.
 * The formula field itself might access the value of another formula field again, which has the risk of creating an infinite loop.
 * This variable is normally undefined. When a getter encounters the variable as undefined, it knows that it is the "outermost"
 * getter and initializes the array. Each getter inserts its field name into the array, and if it finds its field name already there,
 * it returns an empty value, since we have an inifinite loop of field references. Since formula fields are calculated synchronously,
 * no more complex logic than tracking field names in this single global variable is necessary.
 */
let handledFieldNames: string[] | undefined = undefined;

export function prepareObject(obj: Marker<CRU> | Line<CRU>, type: Type): any {
	const fixedObj: any = cloneDeep(obj);

	if (!fixedObj.data) {
		fixedObj.data = Object.create(null) as {};
	}
	for (const field of type.fields) {
		if (field.type !== "formula") {
			fixedObj.data[field.name] = normalizeFieldValue(field, fixedObj.data[field.name]);
		}
	}

	let ret = {
		...flattenObject(fixedObj),
		...fixedObj
	};

	// Backwards compatibility for filter expressions that were created before "symbol" was renamed to "icon" (keep old and new properties)
	ret = currentMarkerToLegacyV2(ret, true);

	if(type)
		ret.type = type.type;

	for (const field of type.fields) {
		if (field.type === "formula") {
			let value: [false] | [true, string] = [false];
			const getter = () => {
				if (!value[0]) {
					const isOuterGetter = (handledFieldNames == null);
					if (isOuterGetter) {
						handledFieldNames = [];
					}

					try {
						if (handledFieldNames!.includes(field.name)) {
							// Infinite loop, return empty value.
							value = [true, ""];
						} else {
							handledFieldNames!.push(field.name);
							value = [true, compileFormulaExpression(field.formula)(fixedObj, type)];
						}
					} finally {
						if (isOuterGetter) {
							handledFieldNames = undefined;
						}
					}
				}
				return value[1];
			};

			Object.defineProperty(fixedObj.data, field.name, { get: getter, enumerable: true });
			Object.defineProperty(fixedObj, `data.${field.name}`, { get: getter, enumerable: true });
		}
	}

	return ret;
}