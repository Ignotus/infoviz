// 
// Map API (mapbox.com) doc:
// https://www.mapbox.com/mapbox.js/example/v1.0.0/clicks-in-popups/
  
flag = 1; 


// ----------------  show map, please change here --------------- // 
L.mapbox.accessToken = 'pk.eyJ1IjoieGlhb2xpIiwiYSI6IkhpWkZhZFkifQ.RgWs4kq33jfD3d46_TTd6g';
var map = L.mapbox.map('map', 'examples.map-i86nkdio')
	    .setView([52.3648367,4.9151507], 13);

var clicked_regions = [];

$.ajax({
    url: '/data/regions',
    dataType: 'json',
    success: function load(d) {
        d.results.forEach(function(e) {
            var polygon = L.polygon(e.border)
                .bindPopup(e.region + '')
                .setStyle({fillColor: '#66A3FF'})
                .addTo(map);

            polygon.on('click', function(e) {
                if (clicked_regions.length > 0) {
                    clicked_regions.forEach(function(target) {
                        target.setStyle({fillColor: '#66A3FF'});
                    });

                    clicked_regions = [];
                }

                clicked_regions.push(e.target);
                e.target.setStyle({fillColor: '#66FF99'});
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
        $('.board').animate({"margin-right": '-=300'});
    }else{
        $('.board').animate({"margin-right": '+=300'});
    }
    flag = flag?0:1;
}
 




