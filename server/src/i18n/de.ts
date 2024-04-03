const messagesDe = {
	"pad-not-found-error": `Karte {{padId}} konnte nicht gefunden werden.`,
	"pad-read-not-found-error": `Karte mit der Lese-ID {{padId}} konnte nicht gefunden werden.`,

	"database": {
		"type-not-found-error": `Typ {{typeId}} existiert nicht.`,
		"object-not-found-in-pad-error": `Objekt {{id}} vom Typ „{{type}}“ konnte auf der Karte {{padId}} nicht gefunden werden.`,
		"old-pad-data-not-available-error": `Alte Karteneinstellungen nicht verfügbar.`,
		"unknown-type-error": `Unbekannter Typ „{{type}}“.`,
		"route-points-not-an-array-error": `routePoints ist kein Array`,
		"route-points-less-than-two-points-error": `Eine Linie kann nicht weniger als zwei Routenpunkte haben.`,
		"cannot-use-type-for-line-error": `Typ der Art „{{type}}“ kann nicht für Linien benutzt werden.`,
		"cannot-use-type-for-marker-error": `Typ der Art „{{type}}“ kann nicht für Marker benutzt werden.`,
		"unique-pad-ids-error": `Lese-ID, Schreib-ID und Admin-ID müssen unterschiedlich sein.`,
		"unique-pad-ids-read-write-error": `Lese-ID und Schreib-ID müssen unterschiedlich sein.`,
		"unique-pad-ids-read-admin-error": `Lese-ID und Admin-ID müssen unterschiedlich sein.`,
		"unique-pad-ids-write-admin-error": `Schreib-ID und Admin-ID müssen unterschiedlich sein.`,
		"pad-id-taken-error": `ID „{{id}}“ ist bereits vergeben.`,
		"pad-disappeared-error": `Karte wurde während des Abspeicherns gelöscht.`
	},

	"routing": {
		"ors-token-warning": `Warnung: Kein ORS-Token konfiguriert. Bitten Sie den Administrator, die Umgebungsvariable ORS_TOKEN zu setzen.`,
		"too-much-distance-error": `Die Distanz zwischen den Routenpunkten ist zu groß. Versuchen Sie, einige Zwischenpunkte hinzuzufügen.`,
		"invalid-response-error": `Ungültige Antwort vom Routenserver.`,
		"mapbox-token-warning": `Kein Mapbox-Token konfiguriert. Bitten Sie den Administrator, die Umgebungsvariable MAPBOX_TOKEN zu setzen.`,
		"mapbox-error": `Route konnte nicht berechnet werden ({{code}}).`
	},

	"socket": {
		"only-in-admin-error": `Nur im Admin-Modus verfügbar.`,
		"only-in-write-error": `Nur im Schreib-Modus verfügbar.`,
		"pad-id-set-error": `Karten-ID bereits gesetzt.`,
		"pad-not-exist-error": `Diese Karte existiert nicht.`,
		"pad-already-loaded-error": `Karte bereits geladen.`,
		"no-map-open-error": `Keine Karte geöffnet.`,
		"unknown-format-error": `Unbekanntes Format`,
		"route-not-available-error": `Route nicht verfügbar.`,
		"route-name": `FacilMap-Route`,
		"already-listening-to-history-error": `Änderungsgeschichte bereits abonniert.`,
		"not-listening-to-history-error": `Änderungsgeschichte nicht abonniert.`,
		"admin-revert-error": `Diese Änderung kann nur im Admin-Modus rückgängig gemacht werden.`
	},

	"search": {
		"url-request-error": `Laden von „{{url}}“ fehlgeschlagen (Status: {{status}}).`,
		"url-response-error": `Ungültige Antwort vom Server.`,
		"url-unknown-format-error": `Unbekanntes Dateiformat.`
	},

	"webserver": {
		"map-not-found-error": `Karte mit der ID {{padId}} konnte nicht gefunden werden.`
	}
};

export default messagesDe;
