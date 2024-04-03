const messagesEn = {
	"pad-not-found-error": `Map {{padId}} could not be found.`,
	"pad-read-not-found-error": `Map with read-only ID {{padId}} could not be found.`,

	"database": {
		"type-not-found-error": `Type {{typeId}} does not exist.`,
		"object-not-found-in-pad-error": `{{type}} {{id}} of map {{padId}} could not be found.`,
		"old-pad-data-not-available-error": `Old map data not available.`,
		"unknown-type-error": `Unknown type "{{type}}".`,
		"route-points-not-an-array-error": `routePoints is not an array`,
		"route-points-less-than-two-points-error": `A line cannot have less than two route points.`,
		"cannot-use-type-for-line-error": `Cannot use {{type}} type for line.`,
		"cannot-use-type-for-marker-error": `Cannot use {{type}} type for marker.`,
		"unique-pad-ids-error": `Read-only, read-write and admin ID have to be different from each other.`,
		"unique-pad-ids-read-write-error": `Read-only and read-write ID cannot be the same.`,
		"unique-pad-ids-read-admin-error": `Read-only and admin ID cannot be the same.`,
		"unique-pad-ids-write-admin-error": `Read-write and admin ID cannot be the same.`,
		"pad-id-taken-error": `ID '{{id}}' is already taken.`,
		"pad-disappeared-error": `Map has disappeared after updating.`
	},

	"routing": {
		"ors-token-warning": `Warning: No ORS token configured. Please ask the administrator to set ORS_TOKEN in the environment or in config.env.`,
		"too-much-distance-error": `Too much distance between route points. Consider adding some via points.`,
		"invalid-response-error": `Invalid response from routing server.`,
		"mapbox-token-warning": `No Mapbox token configured. Please ask the administrator to set MAPBOX_TOKEN in the environment or in config.env.`,
		"mapbox-error": `Route could not be calculated ({{code}}).`
	},

	"socket": {
		"only-in-admin-error": `Only available in admin mode.`,
		"only-in-write-error": `Only available in write mode.`,
		"pad-id-set-error": `Map ID already set`,
		"pad-not-exist-error": `This map does not exist`,
		"pad-already-loaded-error": `Map already loaded.`,
		"no-map-open-error": `No map opened.`,
		"unknown-format-error": `Unknown format`,
		"route-not-available-error": `Route not available.`,
		"route-name": `FacilMap route`,
		"already-listening-to-history-error": `Already listening to history.`,
		"not-listening-to-history-error": `Not listening to history.`,
		"admin-revert-error": `This kind of change can only be reverted in admin mode.`
	},

	"search": {
		"url-request-error": `Request to "{{url}}" failed with status {{status}}.`,
		"url-response-error": `Invalid response from server.`,
		"url-unknown-format-error": `Unknown file format.`
	},

	"webserver": {
		"map-not-found-error": `Map with ID {{padId}} could not be found.`
	}
};

export default messagesEn;
