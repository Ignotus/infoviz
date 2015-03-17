function add_host(path) {
    if (!document.domain) {
        return 'http://root.org.ua' + path;
    }
    return path;
}

var layer_type = ['green', 'sport'];

var layer_id = {
    'region' : -1,
    'green' : 0,
    'sport' : 1
};

var layer_captions = {}

$.ajax({
    url: add_host('/data/objects/types'),
    dataType: 'json',
    success: function load(d) {
        layer_type = d.results;

        for (var i = 0; i < layer_type.length; ++i) {
            layer_id[layer_type[i]] = i;
        }

        for (var e in layer_type) {
            layer_captions[layer_id[e]] = e;
        };
    }
});

layer_captions[layer_id['region']] = "Regions";

// ----------------  show map, please change here --------------- // 
L.mapbox.accessToken = 'pk.eyJ1IjoieGlhb2xpIiwiYSI6IkhpWkZhZFkifQ.RgWs4kq33jfD3d46_TTd6g';

var amsterdamCoordinates = [52.3648367,4.9151507];
var map = L.mapbox.map('map', 'examples.map-i86nkdio').setView(amsterdamCoordinates, 13);
var clicked_regions = [];

var polygons = {};
var polygons_color = {};

var markerss = [];

var rainbow = new Rainbow();

function showMapStat(category_id) {
    $("span#layer-caption").html(layer_captions[category_id]);

    markerss.forEach(function(e) {
        map.removeLayer(e);
    });

    markerss = [];

    if (category_id == -1) {
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

    $.ajax({
        url: add_host('/data/regions'),
        dataType: 'json',
        success: function load(d) {
            var markers = new L.MarkerClusterGroup();
            d.results.forEach(function(e) {
                var path = '/data/objects/by_region/' + e.region + '/by_type/' + layer_type[category_id];
                $.ajax({
                    url: add_host(path),
                    dataType: 'json',
                    success: function load(d) {
                        d.results.forEach(function(e) {
                            L.marker(e.coordinate)
                                    .bindPopup(e.name + '<br/>' + e.subtype)
                                    .addTo(markers);
                        });
                    }
                });
            });
            markers.addTo(map);
            markerss.push(markers);
        }
    });
    
    $.ajax({
        url: add_host('/data/regions/stat'),
        dataType: 'json',
        success: function load(d) {
            var max = 0;
            d.results.forEach(function(e) {
                var val = e.place_frequencies[category_id].value;
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

            d.results.forEach(function(e) {
                if (e.place_frequencies[category_id].value > 0.0001) {
                    var hexColour = rainbow.colourAt(e.place_frequencies[category_id].value);
                    var stringColor = '#' + hexColour;
                    var notEmptyStyle = {
                        fillColor: stringColor,
                        color: stringColor,
                        fillOpacity: 0.5,
                        opacity: 0.5
                    };

                    polygons[e.region].setStyle(notEmptyStyle);
                    polygons_color[e.region] = stringColor;
                } else {
                    polygons[e.region].setStyle(notEmptyStyle);
                }
            });
        }
    });
}

function plotRegionStat(propertiesList, titleList) {
    var margin = {
        top: 60,
        right: 50,
        bottom: 20,
        left: 50
    };
    
    var width = 200 - margin.left - margin.right;
    var width2 = (200 * 2) - margin.left - margin.right;
    var height = 200 - margin.top - margin.bottom;
    var height2 = (200 * 2) - margin.top - margin.bottom;
    
    var labelMargin = 20;
    var colours = ['rgb(114,147,203)',
                    'rgb(225,151,76)',
                    'rgb(132,186,91)',
                    'rgb(211,94,96)',
                    'rgb(128,133,133)',
                    'rgb(144,103,167)',
                    'rgb(171,104,87)',
                    'rgb(204,194,16)'];

    var scale = d3.scale.linear()
        .domain([0,1])
        .range([0,1])
    
    for (var i = 0; i < propertiesList.length; i++){
        var svg = d3.select(".hist")
                    .append("svg")
                    .attr('class', 'chart')
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
        var star = starPlot()
                    .width(width)
                    .propertiesList([propertiesList[i]])
                    .scales(scale)
                    .colours([colours[i]])
                    .title(titleList[i])
                    .margin(margin)
                    .labelMargin(labelMargin)
        var starG = svg.append('g')
                        .call(star)
                        
        svg.selectAll('.star-interaction')
            .on('mouseover', function(d) {
                svg.selectAll('.star-label')
                    .style('display', 'none')
                svg.append('circle')
                    .attr('class', 'interaction-circle')
                    .attr('r', 4)
                    .attr('cx', d.x)
                    .attr('cy', d.y)
                    .attr('fill', 'gray')
                svg.append('text')
                    .attr('class', 'star-interaction-label')
                    .text(d.key + ":  " + d.value)
                    .attr('x', d.textX)
                    .attr('y', d.textY)
            })
            .on('mouseout', function(d) {
                svg.selectAll('.star-label')
                    .style('display', '')
                svg.selectAll('.interaction-circle').remove()
                svg.selectAll('.star-interaction-label').remove()
            })
    }
}

$.ajax({
    url: add_host('/data/regions'),
    dataType: 'json',
    success: function load(d) {
        var regionStyle = {
            fillColor: '#66A3FF',
            color: '#2c7fb8',
            opacity: 0.5,
            fillOpacity: 0.5
        };
        d.results.forEach(function(e) {
            var polygon = L.polygon(e.border)
                .bindPopup(e.region + '')
                .setStyle(regionStyle)
                .addTo(map);

            polygons[e.region] = polygon;
            polygons_color[e.region] = '#66A3FF';

            polygon.on('click', function(e1) {
                if (clicked_regions.length > 0) {
                    clicked_regions.forEach(function(target) {
                        target.setStyle({fillColor: polygons_color[target]});
                    });

                    clicked_regions = [];
                }

                clicked_regions.push(e1.target);

                e1.target.setStyle({fillColor: '#fec44f'});

                d3.select(".hist").select("svg").remove();

                var data = {};
                layer_type.forEach(function(e2) {
                    data[e2] = e[e2];
                });

                console.log(data);
                plotRegionStat([data], ['' + e.region]);
            });
        });
    }
});


//////////////////////////////////////////////

// Больше говн^Wбыдлокода пзязя
$("#region-layer-switcher").click(function() {
    $("span#layer-caption").html("Regions");
    showMapStat(layer_id['regions']);
});

$("#sport-layer-switcher").click(function() {
    $("span#layer-caption").html("Sport");
    showMapStat(layer_id['sport']);
});

$("#green-layer-switcher").click(function() {
    $("span#layer-caption").html("Green");
    showMapStat(layer_id['green']);
});



