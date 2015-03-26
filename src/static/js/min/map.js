Map=function(h){L.mapbox.accessToken="pk.eyJ1IjoieGlhb2xpIiwiYSI6IkhpWkZhZFkifQ.RgWs4kq33jfD3d46_TTd6g";this.map=L.mapbox.map("map","examples.map-i86nkdio",{maxZoom:17,minZoom:11}).setView([52.37,4.895518],12);this.map.addControl(L.mapbox.geocoderControl("mapbox.places"));this.map.doubleClickZoom.disable();var c=0,l=[],k={},m={};this.starPlotData={};this.markers=[];var r="rgb(255,177,31) rgb(156,230,228) rgb(232,123,141) rgb(128,133,133) rgb(144,103,167) rgb(171,104,87) rgb(204,194,16)".split(" "),
e=[],n=[],t=[],u=new Rainbow,d=this,x=function(){d.markers.forEach(function(a){d.map.removeLayer(a)});d.markers=[]};this.reselect=function(){for(var a=0;a<l.length;++a)k[l[a]].setStyle({fillColor:r[e[a]]})};var y=function(a,b){n.push(d.starPlotData[a]);t.push(a);h.plotRegionStat([d.starPlotData[a]],a,"chart"+a,b[0]);0<n.length&&v()},v=function(){d3.select(".bigPlot").select(".chartBig").remove();h.plotRegionStat(n,t,"chartBig",e)};this.drawRegions=function(){ajax("/data/regions",function(a){var b=
{fillColor:"#66A3FF",color:"#2c7fb8",opacity:.5,fillOpacity:.5};a.forEach(function(a){var f='<center><font size="3"><b>'+a.region+"</b></font></center><b>Region area</b>: "+formatNum(a.area)+" m<sup>2</sup><br /><b>Average price</b>: "+formatNum(a.avgPrice)+" EUR <br /><b>Average price per m<sup>2</sup></b>: "+formatNum(a.avgPricePerSquareMeter)+" EUR <br /><b>Average surface area</b>: "+formatNum(a.avgSurfaceArea)+' m<sup>2</sup><br /><a href="http://www.funda.nl/koop/amsterdam/'+a.region+'/" target="_blank"><center><img src="http://png-5.findicons.com/files/icons/1686/led/16/house.png"> Find a house</center></a>',
f=L.polygon(a.border).bindPopup(f).setStyle(b).addTo(d.map);k[a.region]=f;m[a.region]=b;d.clickedRegions=[];f.on("click",function(b){board_hidden&&(board_hidden=!1,$(".board").animate({"margin-right":"+=500"}));c=a.region;var p=l.indexOf(c);if(0<=p)l.splice(p,1),n.splice(p,1),t.splice(p,1),e.splice(p,1),d3.select(".starPlots").select(".chart"+c).remove(),k[c].setStyle(m[c]),c=0,0<n.length?v():d3.select(".bigPlot").select(".chartBig").remove();else if(!(4<=e.length)){var g,q;for(q in r)if(-1===e.indexOf(q)){g=
q;break}e.push(g);l.push(c);b.target.setStyle({fillColor:r[g]});a.region in d.starPlotData&&(d.starPlotData={});var w={};h.layerType.forEach(function(b){w[b]=a[b]});d.starPlotData[a.region]=w;y(a.region,q)}})})})};formatNum=function(a){a=(""+a).replace(".",",");return(""+a).replace(/(\d)(?=(\d\d\d)+(?!\d))/g,function(a){return a+"."})};this.showMapStat=function(a,b){b="undefined"!==typeof b?b:null;$("span#layer-caption").html(h.layerCaptions[a]);x();if(a==h.layerID.region){var c={fillColor:"#66A3FF",
color:"#2c7fb8",opacity:.5,fillOpacity:.5},f;for(f in k)k[f].setStyle(c),m[f]=c;d.reselect()}else{var e={};b&&b.forEach(function(a){e[a]=!0});ajax("/data/regions",function(c){var g=new L.MarkerClusterGroup;c.forEach(function(d){null!=b&&1!=e[d.region]||ajax("/data/objects/by_region/"+d.region+"/by_type/"+h.layerType[a],function(a){a.forEach(function(a){L.marker(a.coordinate).bindPopup(a.name+"<br/>"+a.subtype).addTo(g)})})});g.addTo(d.map);d.markers.push(g)});ajax("/data/regions/stat",function(b){var c=
0;b.forEach(function(b){c=Math.max(b.place_frequencies[a].value,c)});u.setNumberRange(0,c);u.setSpectrum("lightgreen","darkgreen");var e={fillColor:"#66A3FF",color:"#2c7fb8",opacity:.1,fillOpacity:.2};b.forEach(function(b){var d=k[b.region];if(1E-4<b.place_frequencies[a].value){var c="#"+u.colourAt(b.place_frequencies[a].value),c={fillColor:c,color:c,fillOpacity:.5,opacity:.5};d.setStyle(c);m[b.region]=c}else d.setStyle(e),m[b.region]=e});d.reselect()})}}};
