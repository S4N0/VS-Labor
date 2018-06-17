/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

/*Aufgabe 4 Listener, AJAX, REST*/

var GeoTag = function (lat, lon, name, hashtag) {
    this.latitude = lat;
    this.longitude = lon;
    this.name = name;
    this.hashtag = hashtag;
}

var ajax = new XMLHttpRequest();

$("#tag-form button").on("click", function(event){
    ajax.open("POST", "/geotags" , true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.responseType = "json";

    var lat = $("#tag-latitude").val();
    var lon = $("#tag-longitude").val();
    var name = $("#tag-name").val();    
    var hashtag = $("#tag-hashtag").val();

    ajax.send(JSON.stringify(new GeoTag(lat, lon, name, hashtag, 0)));


});

$("#filter-form button").on("click", function(event){

    var latURL = "?lat="+$("#filter-latitude").val();
    var lonURL = "&lon="+$("#filter-longitude").val();
    var termURL = "&term="+$("#filter-search").val();

    ajax.open("GET", "/geotags"+latURL+lonURL+termURL, true);
    ajax.responseType = "json";
    ajax.send(null);
});


ajax.onreadystatechange = function() {

    if(ajax.readyState == 4){
        //Discovery Einträge aktualisieren und Karte
        console.log(ajax.response);
        var resultArray = ajax.response;
        var results = "";

        resultArray.forEach(function(tag){
            results += "<li>";
            results += ("("+tag.latitude+"/"+tag.longitude+") "+tag.name+" "+tag.hashtag);
            results += "</li>";
        });

        $("#results").html(results);
        gtaLocator.updateLocation();
    }
}


/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator() {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function (onsuccess, onerror) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onsuccess, function (error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function (position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function (position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "AIzaSyDFfEw0_3AuFcAceGmGaNex8pKyhyIaEyA";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function (lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR API KEY HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "";
        if (typeof tags !== 'undefined') tags.forEach(function (tag) {
            tagList += "&markers=%7Clabel:" + tag.name
                + "%7C" + tag.latitude + "," + tag.longitude;
        });

        var urlString = "http://maps.googleapis.com/maps/api/staticmap?center="
            + lat + "," + lon + "&markers=%7Clabel:you%7C" + lat + "," + lon
            + tagList + "&zoom=" + zoom + "&size=640x480&sensor=false&key=" + apiKey;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function () {
            if($("#tag-latitude").val() == '' || $("#tag-longitude").val() == ''){
                console.log("trylocate wird ausgeführt");
                tryLocate(function(position){
                  console.log(arguments);//gibt die Parameter dieser Funktion aus (existierende bei Callbacks)
                  
                    var lat = getLatitude(position);
                    var lon = getLongitude(position);

                    
                    $("#tag-latitude").val(lat);
                    $("#tag-longitude").val(lon);
                    $("#filter-latitude").val(lat);
                    $("#filter-longitude").val(lon);
                    
                    $("#result-img").attr("src", getLocationMapSrc(lat, lon, [] ,15));

                    //zeigt Position auf Karte an
                    //console.log($("#result-img"));
                }, function(msg){
                    alert(msg);
                });
            } else{
                $("#result-img").attr("src", getLocationMapSrc($("#tag-latitude").val(), $("#tag-longitude").val(), JSON.parse($("#result-img").attr("data-tags"))  ,15));
            }
        }

        
    }; // ... Ende öffentlicher Teil
})();







/**
 * $(document).ready wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(document).ready(function () {
    gtaLocator.updateLocation();
});
