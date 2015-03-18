Map = function(core) {
    L.mapbox.accessToken = 'pk.eyJ1IjoieGlhb2xpIiwiYSI6IkhpWkZhZFkifQ.RgWs4kq33jfD3d46_TTd6g';
    var amsterdamCoordinates = [52.3648367,4.9151507];
    this.map = L.mapbox.map('map', 'examples.map-i86nkdio').setView(amsterdamCoordinates, 13);

    var clickedRegions = [];
    var polygons = {};
    var polygonsColor = {};
    this.markers = [];

    var rainbow = new Rainbow();

    var self = this;

    var removeMarkers = function() {
        self.markers.forEach(function(e) {
            self.map.removeLayer(e);
        });

        self.markers = [];
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
                var polygon = L.polygon(e.border)
                    .bindPopup(e.region + '')
                    .setStyle(regionStyle)
                    .addTo(self.map);

                polygons[e.region] = polygon;
                polygonsColor[e.region] = '#66A3FF';

                polygon.on('click', function(e1) {
                    if (clickedRegions.length > 0) {
                        clickedRegions.forEach(function(target) {
                            target.setStyle({fillColor: polygonsColor[target]});
                        });

                        clickedRegions = [];
                    }

                    clickedRegions.push(e1.target);

                    e1.target.setStyle({fillColor: '#fec44f'});

                    d3.select(".hist").select("svg").remove();

                    var data = {};
                    core.layerType.forEach(function(e2) {
                        data[e2] = e[e2];
                    });

                    core.plotRegionStat([data], ['' + e.region]);
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
                if (e.place_frequencies[categoryID].value > 0.0001) {
                    var hexColour = rainbow.colourAt(e.place_frequencies[categoryID].value);
                    var stringColor = '#' + hexColour;
                    var notEmptyStyle = {
                        fillColor: stringColor,
                        color: stringColor,
                        fillOpacity: 0.5,
                        opacity: 0.5
                    };

                    polygons[e.region].setStyle(notEmptyStyle);
                    polygonsColor[e.region] = stringColor;
                } else {
                    polygons[e.region].setStyle(notEmptyStyle);
                }
            });
        });
    }
}
