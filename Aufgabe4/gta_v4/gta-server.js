/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
//Middleware Funktionen, die für Aufrufe mit express oder bestimmte Direktiven benutzt werden können (Modularisierung von Funktionen)
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN (DONE)
app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN (DONE)
var GeoTag = function (lat, lon, name, hashtag, id) {
    this.latitude = lat;
    this.longitude = lon;
    this.name = name;
    this.hashtag = hashtag;
    this.id = id;
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN (DONE)

var geoTagManager = (function () {

    var geoTagArray = [];
    var idCounter = 0;

    return {

        add: function (tag) {
            tag.id = idCounter++;
            geoTagArray.push(tag);
        },

        removeByName: function (name) {

            for(var i in geoTagArray){
                if(geoTagArray[i].name == name){
                    geoTagArray.splice(i,1);
                }
            }
            
        },

        getByName: function (name) {
            var res = [];
            
            geoTagArray.filter(tag => tag.name == name).forEach(function (tag) {
                res.push(tag);
            });

            return res;
        },

        getByRadius: function (lat, lon, radius) {
            var posLat = lat;
            var posLon = lon;

            var result = geoTagArray.filter(function (tag) {

                return (((Math.abs(posLat - tag.latitude) < radius) && (Math.abs(posLon - tag.longitude) < radius)));
                
            });
            
            return result;

        },

        /* returns whole array for debugging */
        getAll: function () {
            return geoTagArray;
        },

        getById: function(id){
            return geoTagArray.filter(tag => tag.id == id);
        },

        get: function(index){
            return geoTagArray[index];
        }



    }

})();

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function (req, res) {
   
    res.render('gta', {
        taglist: geoTagManager.getAll(),
        lat: '',
        lon: '',
        tags: '[]'
    });
});

//Route to get a spezific container-ressource
app.get('/geotags/:id',function(req, res){
    var id = req.params.id;
    res.status(200).json(geoTagManager.getById(id));

});

//Route to get geotags by Searchterm, by radius or all
app.get('/geotags', function(req, res){
    var stdRadius = 10;
    var lat = req.query.lat;
    var lon = req.query.lon;
    var term = req.query.term;

    if(term == undefined){
        res.status(200).json(geoTagManager.getAll());
    } else if(term == ""){
        res.status(200).json(geoTagManager.getByRadius(lat, lon, stdRadius));
    } else {
        res.status(200).json(geoTagManager.getByName(term));
    }
});

//Route to add new Geotag
app.post('/geotags', function(req, res){

    geoTagManager.add(req.body);
    res.status(201).json(geoTagManager.getAll());
});

//Debugging: geoTagManager.remove
app.get('/del', function(req, res){
    var lat = req.body.latitude;
    var lon = req.body.longitude;

    console.log("Tag mit \'place\' wurde gelöscht");
    geoTagManager.removeByName("place");
    res.render('gta', {
        taglist: geoTagManager.getAll(),
        lat:000,
        lon:000,
        tags: "[]"
    });
    console.log(geoTagManager.getAll());
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

// TODO: CODE ERGÄNZEN START (DONE)

app.post('/tagging', function (req, res) {
    geoTagManager.add(req.body);
    
    var lat = req.body.latitude;
    var lon = req.body.longitude;
    var stdRadius = 10;
    
    res.render('gta', {
        taglist: geoTagManager.getByRadius(lat, lon, stdRadius),
        lat: lat,
        lon: lon,
        tags: JSON.stringify(geoTagManager.getByRadius(lat, lon, stdRadius))
    });
    
    res.end();
});


/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

// TODO: CODE ERGÄNZEN (DONE)

app.post('/discovery', function (req, res) {
    var stdRadius = 10;
    var lat = req.query.lat;
    var lon = req.query.lon;
    var term = req.query.term;

    if (term !== "") {
        
        res.render('gta', {
            taglist: geoTagManager.getByName(term),
            lat: lat,
            lon: lon,
            tags: JSON.stringify(geoTagManager.getByName(term))
        });
        
    } else{
        
        res.render('gta', {
            taglist: geoTagManager.getByRadius(lat, lon, stdRadius),
            lat: lat,
            lon: lon,
            tags: JSON.stringify(geoTagManager.getByRadius(lat, lon, stdRadius))
        });
    }

});

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
console.log("\n-- Server läuft unter dem Port 3000 --\n");