// 
// Map API (mapbox.com) doc:
// https://www.mapbox.com/mapbox.js/example/v1.0.0/clicks-in-popups/
  
flag = true;

var captions = ["Regions", "Greens", "Sport"]
var layer_type = ['green', 'sport']

// ----------------  show map, please change here --------------- // 
L.mapbox.accessToken = 'pk.eyJ1IjoieGlhb2xpIiwiYSI6IkhpWkZhZFkifQ.RgWs4kq33jfD3d46_TTd6g';

var map = L.mapbox.map('map', 'examples.map-i86nkdio')
	    .setView([52.3648367,4.9151507], 13);

var clicked_regions = [];

var polygons = {};
var polygons_color = {};

var rainbow = new Rainbow(); 

function showMapStat(category_id) {
    $("span#layer-caption").html(captions[category_id + 1]);

    if (category_id == -1) {
        for (var key in polygons) {
            polygons[key].setStyle({fillColor: '#66A3FF', color: '#2c7fb8', opacity: 0.5, fillOpacity: 0.5});
        }
        return;
    }

    $.ajax({
        url: '/data/regions',
        dataType: 'json',
        success: function load(d) {
            var markers = L.markerClusterGroup();
            d.results.forEach(function(e) {
                $.ajax({
                    url: '/data/objects/by_region/' + e.region + '/by_type/' + layer_type[category_id],
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
        }
    });
    
    $.ajax({
        url: '/data/regions/stat',
        dataType: 'json',
        success: function load(d) {
            var max = 0;
            d.results.forEach(function(e) {
                var val = e.place_frequencies[category_id].value;
                max = Math.max(val, max);
            });
            
            rainbow.setNumberRange(0, max);
            rainbow.setSpectrum('lightgreen', 'darkgreen');

            d.results.forEach(function(e) {
                if (e.place_frequencies[category_id].value > 0.0001) {
                    var hexColour = rainbow.colourAt(e.place_frequencies[category_id].value);
                    var stringColor = '#' + hexColour;
                    polygons[e.region].setStyle({fillColor: stringColor,
                                                 color: stringColor,
                                                 fillOpacity: 0.5,
                                                 opacity: 0.5});
                    polygons_color[e.region] = stringColor;
                } else {
                    polygons[e.region].setStyle({fillColor: '#66A3FF', color: '#2c7fb8', opacity: 0.1, fillOpacity: 0.2});
                }
            });
        }
    });
}

function plotRegionStat(region_id) {
    var margin = {top: 60, right: 40, bottom: 30, left: 40},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var y = d3.scale.linear().range([height, 0]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
    var svg = d3.select(".hist").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("/data/regions/stat/" + region_id, function(error, json_data) {
        var data = d3.nest()
            .entries(json_data.results.place_frequencies);

        x.domain(data.map(function(d) { return d.key; }));
        y.domain([0, d3.max(data, function(d) { return d.value; })]);

         svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.key); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(Math.max(0, d.value)); })
            .attr("height", function(d) { return Math.abs(y(d.value) - y(0)); })
            .on('click', function(d, i){
                $('.board').animate({"width": '20'});
                flag = false;
                showMapStat(i);
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + y(0) + ")")
            .call(xAxis)
            .append("text")
            .attr("x", 920)
            .attr("y", 15)
            .text("Type");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Amount");
    });

    function type(d) {
        d.values = +d.values;
        return d;
    }
}

$.ajax({
    url: '/data/regions',
    dataType: 'json',
    success: function load(d) {
        d.results.forEach(function(e) {
            var polygon = L.polygon(e.border)
                .bindPopup(e.region + '')
                .setStyle({fillColor: '#66A3FF', color: '#2c7fb8', opacity: 0.5, fillOpacity: 0.5})
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
                if (flag) {
                    $('.board').animate({"width": '20'});
                }

                $('.board').animate({"width": '1000'});
                flag = true;

                d3.select(".hist").select("svg").remove();
                plotRegionStat(e.region);
            });
        });
    }
});


//////////////////////////////////////////////


//call this function to show and hide the panel/board on the right of screen
var showHideBoard = function(){
	if(flag){
        $('.board').animate({"width": '1000'});
    }else{
        $('.board').animate({"width": '20'});
    }
    flag = !flag;
}
 
$(".hide-board").click(function() {
    $('.board').animate({"width": '20'});
    flag = false;
});

// Больше говн^Wбыдлокода пзязя
$("#region-layer-switcher").click(function() {
    $("span#layer-caption").html("Regions");
    showMapStat(-1);
});

$("#sport-layer-switcher").click(function() {
    $("span#layer-caption").html("Sport");
    // TODO: Get these indexes from somewhere
    showMapStat(1);
});

$("#green-layer-switcher").click(function() {
    $("span#layer-caption").html("Green");
    showMapStat(0);
});



