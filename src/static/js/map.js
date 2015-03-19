Map = function(core) {
    L.mapbox.accessToken = 'pk.eyJ1IjoieGlhb2xpIiwiYSI6IkhpWkZhZFkifQ.RgWs4kq33jfD3d46_TTd6g';
    var amsterdamCoordinates = [52.3648367,4.9151507];
    this.map = L.mapbox.map('map', 'examples.map-i86nkdio').setView(amsterdamCoordinates, 13);

    var clickedRegion = 0;
    var polygons = {};
    var polygonsStyle = {};
    this.starPlotData = {};
    this.markers = [];

    var rainbow = new Rainbow();

    var self = this;

    var removeMarkers = function() {
        self.markers.forEach(function(e) {
            self.map.removeLayer(e);
        });

        self.markers = [];
    }

    var drawStarPlot = function() {
        var data = [];
        var label = [];
        for (var key in self.starPlotData) {
            data.push(self.starPlotData[key]);
            label.push(key);
        };

        d3.select('.hist').html("");
        core.plotRegionStat(data, label, 'chart');
    }

    this.drawRegions = function() {
        ajax('/data/regions', function(results) {
            var regionStyle = {
                fillColor: '#66A3FF',
                color: '#2c7fb8',
                opacity: 0.5,
                fillOpacity: 0.5
            };

            results.forEach(function(e) {
                var popupMessage = '<center><font size="3"><b>' + e.region + '</b></font></center>'
                        + '<b>Region area</b>: ' + e.area + ' m^2<br />'
                        + '<b>Average price</b>: ' + e.avgPrice + ' EUR <br />'
                        + '<b>Average price per m^2</b>: ' + e.avgPricePerSquareMeter + ' EUR <br />'
                        + '<b>Average surface area</b>: ' + e.avgSurfaceArea + ' m^2<br />'
                        + '<a href="http://www.funda.nl/koop/amsterdam/'
                        + e.region + '/"><center>Find a house</center></a>';
                var polygon = L.polygon(e.border)
                    .bindPopup(popupMessage)
                    .setStyle(regionStyle)
                    .addTo(self.map);

                polygons[e.region] = polygon;
                polygonsStyle[e.region] = regionStyle;

/*
                polygon.on('dblclick', function(e1) {
                    if (clickedRegion != 0) {
                        polygons[clickedRegion].setStyle(polygonsStyle[clickedRegion]);
                        clickedRegion = 0;
                    }
                    
                    clickedRegion = e.region;
                    e1.target.setStyle({fillColor: '#fec44f'});

                    var newItem = {};
                    core.layerType.forEach(function(e2) {
                        newItem[e2] = e[e2];
                    });

                    self.starPlotData = {};
                    self.starPlotData[e.region] = newItem;

                    drawStarPlot();
                });
*/
                polygon.on('click', function(e1) {
                    if (clickedRegion != 0) {
                        polygons[clickedRegion].setStyle(polygonsStyle[clickedRegion]);
                        clickedRegion = 0;
                    }
                    
                    clickedRegion = e.region;
                    e1.target.setStyle({fillColor: '#fec44f'});

                    if (e.region in self.starPlotData) {
                        self.starPlotData = {};
                    }
                    var newItem = {};
                    core.layerType.forEach(function(e2) {
                        newItem[e2] = e[e2];
                    });

                    self.starPlotData[e.region] = newItem;

                    drawStarPlot();
                });
            });
        });
    }

    this.showMapStat = function(categoryID) {
        $("span#layer-caption").html(core.layerCaptions[categoryID]);

        removeMarkers();

        if (categoryID == core.layerID['region']) {
            var style = {
                fillColor: '#66A3FF',
                color: '#2c7fb8',
                opacity: 0.5,
                fillOpacity: 0.5
            };

            for (var key in polygons) {
                polygons[key].setStyle(style);
            }
            return;
        }


        ajax('/data/regions', function(results) {
            var markers = new L.MarkerClusterGroup();
            results.forEach(function(e) {
                var path = '/data/objects/by_region/' + e.region + '/by_type/' + core.layerType[categoryID];
                ajax(path, function(obj) {
                    obj.forEach(function(e) {
                        L.marker(e.coordinate)
                            .bindPopup(e.name + '<br/>' + e.subtype)
                            .addTo(markers);
                    });
                });
            });
            markers.addTo(self.map);
            self.markers.push(markers);
        });
       
        ajax('/data/regions/stat', function(results) {
            var max = 0;
            results.forEach(function(e) {
                var val = e.place_frequencies[categoryID].value;
                max = Math.max(val, max);
            });
                
            rainbow.setNumberRange(0, max);
            rainbow.setSpectrum('lightgreen', 'darkgreen');

            var emptyStyle = {
                fillColor: '#66A3FF',
                color: '#2c7fb8',
                opacity: 0.1,
                fillOpacity: 0.2
            }

            results.forEach(function(e) {
                var polygon = polygons[e.region];
                if (e.place_frequencies[categoryID].value > 0.0001) {
                    var hexColour = rainbow.colourAt(e.place_frequencies[categoryID].value);
                    var stringColor = '#' + hexColour;
                    var notEmptyStyle = {
                        fillColor: stringColor,
                        color: stringColor,
                        fillOpacity: 0.5,
                        opacity: 0.5
                    };

                    polygon.setStyle(notEmptyStyle);
                    polygonsStyle[e.region] = notEmptyStyle;
                } else {
                    polygon.setStyle(emptyStyle);
                    polygonsStyle[e.region] = emptyStyle;
                }
            });
        });
    }
}
