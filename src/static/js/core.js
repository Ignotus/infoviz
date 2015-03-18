Core = function() {
    this.layerType = ['green', 'sport'];
    this.layerID = {
        'region' : -1,
        'green' : 0,
        'sport' : 1
    };

    this.layerCaptions = {};
    this.layerCaptions[this.layerID['region']] = "Regions";

    var self = this;

    this.plotRegionStat = function(propertiesList, titleList) {
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
            .domain([0,100])
            .range([0,100])
        
        var activityScale = d3.scale.linear()
            .domain([0,60])
            .range([0,100])
        var culinaryScale = d3.scale.linear()
            .domain([0,35])
            .range([0,100])
        var culturalScale = d3.scale.linear()
            .domain([0,6])
            .range([0,100])
        var greenScale = d3.scale.linear()
            .domain([0,0.5])
            .range([0,100])
        var nonLeisureScale = d3.scale.linear()
            .domain([0,40])
            .range([0,100])
        var relaxationScale = d3.scale.linear()
            .domain([0,11])
            .range([0,100])
        var spiritualScale = d3.scale.linear()
            .domain([0,2])
            .range([0,100])
        var sportScale = d3.scale.linear()
            .domain([0,2])
            .range([0,100])
        console.log(activityScale(10))
        var scales = {activity:activityScale,
                        culinary:culinaryScale,
                        cultural:culturalScale,
                        green:greenScale,
                        nonleisure:nonLeisureScale,
                        relaxation:relaxationScale,
                        spiritual:spiritualScale,
                        sport:sportScale
                    }
        
        for (var i = 0; i < propertiesList.length; i++) {
            var svg = d3.select(".hist")
                        .append("svg")
                        .attr('class', 'chart')
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
            var star = starPlot()
                        .width(width)
                        .propertiesList([propertiesList[i]])
                        .scales(scales)
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

    
    this.setShowMapStatHandle = function(handle) {
        ajax('/data/objects/types', function(results) {
            self.layerType = results;
            for (var i = 0; i < self.layerType.length; ++i) {
                self.layerID[self.layerType[i]] = i;
            }

            self.layerType.forEach(function(e) {
                self.layerCaptions[self.layerID[e]] = e;

                $(".dropdown-menu").html($(".dropdown-menu").html() +
                        "<li><a href=\"#\" id=\"" + e + "-layer-switcher\">" + e +"</a></li>");

                $(".dropdown-menu").on("click", "#" + e + "-layer-switcher", function() {
                    $("span#layer-caption").html(e);
                    handle(self.layerID[e]);
                });
            });
        });

        $(".dropdown-menu").on("click", "#region-layer-switcher", function() {
            $("span#layer-caption").html("Regions");
            handle(-1);
        });
    }
}

var core = new Core();
var map = new Map(core);

core.setShowMapStatHandle(map.showMapStat);
map.drawRegions();


