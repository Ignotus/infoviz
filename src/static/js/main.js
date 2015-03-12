// 
// Map API (mapbox.com) doc:
// https://www.mapbox.com/mapbox.js/example/v1.0.0/clicks-in-popups/
  
flag = 1;

// ----------------  show map, please change here --------------- // 
L.mapbox.accessToken = 'pk.eyJ1IjoieGlhb2xpIiwiYSI6IkhpWkZhZFkifQ.RgWs4kq33jfD3d46_TTd6g';
var map = L.mapbox.map('map', 'examples.map-i86nkdio')
	    .setView([52.3648367,4.9151507], 13);

var clicked_regions = [];


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

    d3.json("/data/regions/" + region_id, function(error, json_data) {
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
            .attr("height", function(d) { return Math.abs(y(d.value) - y(0)); });

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
                .setStyle({fillColor: '#66A3FF'})
                .addTo(map);

            polygon.on('click', function(e1) {
                if (clicked_regions.length > 0) {
                    clicked_regions.forEach(function(target) {
                        target.setStyle({fillColor: '#66A3FF'});
                    });

                    clicked_regions = [];
                }

                clicked_regions.push(e1.target);
                e1.target.setStyle({fillColor: '#66FF99'});
                if (flag == 1) {
                    $('.board').animate({"width": '20'});
                }

                $('.board').animate({"width": '1000'});
                flag = 1;

                d3.select(".hist").select("svg").remove();
                plotRegionStat(e.region);
            });
        });
    }
});

var marker = L.marker([52.3648367,4.9151507], {
	      icon: L.mapbox.marker.icon({
	        'marker-color': '#9c89cc'
	      })
	    })
	    .bindPopup('<p>Halloooo~</p>')
	    .addTo(map);
 
//add a function to the element on map...
marker.on('click', function(e) {
	showHideBoard();
});


//////////////////////////////////////////////


//call this function to show and hide the panel/board on the right of screen
var showHideBoard = function(){
	if(flag){
        $('.board').animate({"width": '1000'});
    }else{
        $('.board').animate({"width": '20'});
    }
    flag = flag?0:1;
}
 
$(".hide-board").click(function() {
    $('.board').animate({"width": '20'});
    flag = 0;
});


