/*--------------------------------
-------EXTERNAL RESOURCES---------
--------------------------------*/

// GeoJSON data sources
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"
var tectonicplatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Map layers
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
});

var grayMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});


/*--------------------------------
--------CREATE BASE MAP-----------
--------------------------------*/

// Create map
var map = L.map( "map", {
    center: [15, -10],
    zoom: 2,
    layers: [satelliteMap, grayMap, outdoors]
});

// Define base map layers
var baseMaps = {
    "Satellite Map": satelliteMap,
    "Grayscale Map": grayMap,
    "Outdoors Map": outdoors
};

// Define layer groups
var earthquakes = new L.layerGroup();
var tectonicplates = new L.layerGroup();

// Create map overlays
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicplates
};

// Create a layer control, adding the baseMaps and overlayMaps
L.control.layers( baseMaps, overlayMaps, {
    collapsed: true
}).addTo( map);


/*--------------------------------
--------EARTHQUAKE LAYER----------
--------------------------------*/

d3.json( earthquakesURL).then( function( earthquakeData) {

    // Sizing for markers
    function markerSize( magnitude) {
        if (magnitude === 0) {
        return 1;
        }
        return magnitude * 4;
    }

    // Color for markers
    function chooseColor( depth) {
        switch( true) {
            case depth > 90:
                return "red";
            case depth > 70:
                return "orangered";
            case depth > 50:
                return "orange";
            case depth > 30:
                return "gold";
            case depth > 10:
                return "yellow";
            default:
                return "lightgreen";
        }
    }

    // Other marker style properties
    function stylize( feature) {
        return {
            fillColor: chooseColor( feature.geometry.coordinates[2]),
            fillOpacity: 0.5,
            color: "black",
            radius: markerSize( feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // Create a GeoJSON layer
    L.geoJson( earthquakeData, {
        pointToLayer: function( feature, latlng) {
            return L.circleMarker( latlng);
        },
        style: stylize,
        onEachFeature: function( feature, layer) {
            layer.bindPopup( "<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: "
            + new Date( feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    }).addTo( earthquakes);   // First add to earthquake layer
    earthquakes.addTo( map);  // Then add layer to map (allows turning on and off)


/*--------------------------------
------TECTONIC PLATES LAYER-------
--------------------------------*/

    // Get the tectonic plate data from tectonicplatesURL
    d3.json( tectonicplatesURL).then( function( platesData) {
        L.geoJson(platesData, {
            color: "orange",
            weight: 2
        }).addTo( tectonicplates);  // First add to tectonicplate layer
        tectonicplates.addTo(map);  // Then add layer to map (allows turning on and off)
    });


/*--------------------------------
-----------MAP LEGEND-------------
--------------------------------*/

    // Add legend
    var legend = L.control( {position: "bottomleft"});
    legend.onAdd = function() {
        var div = L.DomUtil.create( "div", "info legend");
        // Intervals
        var depth = [-10, 10, 30, 50, 70, 90];
        // Title
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
        // Color
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML 
                += '<i style="background: ' + chooseColor( depth[i] + 1)
                + '"></i> ' + depth[i]
                + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(map);
});