Map = function(core) {
    L.mapbox.accessToken = 'pk.eyJ1IjoieGlhb2xpIiwiYSI6IkhpWkZhZFkifQ.RgWs4kq33jfD3d46_TTd6g';
    var amsterdamCoordinates = [52.3648367,4.9151507];
    this.map = L.mapbox.map('map', 'examples.map-i86nkdio').setView(amsterdamCoordinates, 13);

    var clickedRegion = 0;
    var polygons = {};
    var polygonsStyle = {};
    this.starPlotData = {};
    this.markers = [];
    
    var colours = ['rgb(225,151,76)',
                'rgb(132,186,91)',
                'rgb(211,94,96)',
                'rgb(128,133,133)',
                'rgb(144,103,167)',
                'rgb(171,104,87)',
                'rgb(204,194,16)'];
    var usedColors = [];
    var data =[];
    var label = [];

    var rainbow = new Rainbow();

    var self = this;

    var removeMarkers = function() {
        self.markers.forEach(function(e) {
            self.map.removeLayer(e);
        });

        self.markers = [];
    }

    var drawStarPlot = function(regionName, [color]) {
        data.push(self.starPlotData[regionName])
        label.push(regionName)
        core.plotRegionStat([self.starPlotData[regionName]], regionName, 'chart'+regionName, color);
        if(data.length > 0){
            drawCombinedPlot()
        }
    }
    
    var drawCombinedPlot = function() {
        d3.select('.hist').select('.chartBig').remove()
        console.log(data)
        core.plotRegionStat(data, label, 'chartBig', usedColors);
        d3.select('.hist').select('.chartBig')
                    .style('text-align', 'center')
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
                
                clickedRegions = []
                
                polygon.on('click', function(e1) {
                    clickedRegion = e.region;
                    var clickedRegionIndex = clickedRegions.indexOf(clickedRegion)
                    if(clickedRegionIndex >= 0){
                        clickedRegions.splice(clickedRegionIndex,1)
                        data.splice(clickedRegionIndex,1)
                        label.splice(clickedRegionIndex,1)
                        usedColors.splice(clickedRegionIndex,1)
                        d3.select('.hist').select('.chart'+clickedRegion).remove()
                        polygons[clickedRegion].setStyle(polygonsStyle[clickedRegion]);
                        clickedRegion = 0;
                        if(data.length > 0){
                            drawCombinedPlot()
                        }else{
                            d3.select('.hist').select('.chartBig').remove()
                        }
                    } else {
                        var freeColor
                        for (var color in colours){
                            if(usedColors.indexOf(color) === -1){
                                freeColor = color
                                break
                            }
                        }
                        usedColors.push(freeColor)
                        console.log('usedColors', colours[freeColor])
                        clickedRegions.push(clickedRegion)
                        e1.target.setStyle({fillColor: colours[freeColor]});
                        
                        console.log(clickedRegions)

                        if (e.region in self.starPlotData) {
                            self.starPlotData = {};
                        }
                        var newItem = {};
                        core.layerType.forEach(function(e2) {
                            newItem[e2] = e[e2];
                        });

                        self.starPlotData[e.region] = newItem;

                        drawStarPlot(e.region, color);
                    }
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
                polygonsStyle[key] = style;
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
