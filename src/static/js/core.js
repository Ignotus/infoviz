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
    var showMapStatHandle = null;

    this.plotRegionStat = function(propertiesList, title, plotName, colors, map) {
        var margin = {
            top: 60,
            right: 60,
            bottom: 20,
            left: 60
        };
        
        var interaction = true
        var widthTest = (((window.innerWidth * 0.3)/2) - (window.innerWidth * 0.01))
        var heightTest = (((window.innerHeight * 0.6) / 2) - (window.innerWidth * 0.01))
        
        if (heightTest < widthTest){
            widthTest = heightTest
        }
        
        var width = widthTest - margin.left - margin.right;
        var width2 = (widthTest * 1.5) - margin.left - margin.right;
        var height = widthTest - margin.top - margin.bottom;
        var height2 = (widthTest * 1.5) - margin.top - margin.bottom;
        
        var labelMargin = 15;
        var colours = ['rgb(225,151,76)',
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
            .domain([0,100])
            .range([0,100])
        var culinaryScale = d3.scale.linear()
            .domain([0,100])
            .range([0,100])
        var culturalScale = d3.scale.linear()
            .domain([0,100])
            .range([0,100])
        var greenScale = d3.scale.linear()
            .domain([0,100])
            .range([0,100])
        var nonLeisureScale = d3.scale.linear()
            .domain([0,100])
            .range([0,100])
        var relaxationScale = d3.scale.linear()
            .domain([0,100])
            .range([0,100])
        var spiritualScale = d3.scale.linear()
            .domain([0,100])
            .range([0,100])
        var sportScale = d3.scale.linear()
            .domain([0,100])
            .range([0,100])

        var scales = {activity:activityScale,
                        culinary:culinaryScale,
                        cultural:culturalScale,
                        green:greenScale,
                        nonleisure:nonLeisureScale,
                        relaxation:relaxationScale,
                        spiritual:spiritualScale,
                        sport:sportScale
                    }

        var plotColors = []
        
        for(var color in colors){
            plotColors.push(colours[colors[color]])
        } 
        var location = '.starPlots'
        var displayType = 'inline'
        if(plotName === 'chartBig'){
            width = width2
            height = height2
            interaction = false
            location = '.bigPlot'
            displayType = 'block'
        }
        
        var svg = d3.select(location)
                    .append("svg")
                    .attr('class', plotName)
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style('display', displayType)
                    .style('vertical-align', 'middle')
                    .style('margin', 'auto')
                    
        svg.text('test')
        var star = starPlot()
                    .width(width)
                    .propertiesList(propertiesList)
                    .scales(scales)
                    .colours(plotColors)
                    .title(title)
                    .margin(margin)
                    .labelMargin(labelMargin)
        var starG = svg.append('g')
                        .call(star)

        svg.selectAll('.star-interaction')
            .on('mouseover', function(d) {
                if (interaction){
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
                        .text(d.key + ":  " + Math.round(d.value * 10) / 10)
                        .attr('x', d.textX)
                        .attr('y', d.textY)
                }
            })
            .on('mouseout', function(d) {
                svg.selectAll('.star-label')
                    .style('display', '')
                svg.selectAll('.interaction-circle').remove()
                svg.selectAll('.star-interaction-label').remove()
            })
            .on('click', function(d) {
                // A bit work around. TODO: Change subtr(5) to more workable thing
                self.showMapStatHandle(self.layerID[d.key], plotName.substr(5).split(','))
            })
    }

    
    this.setShowMapStatHandle = function(handle) {
        self.showMapStatHandle = handle;
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
            handle(self.layerID['region']);
        });
    }
}

var core = new Core();
var map = new Map(core);

core.setShowMapStatHandle(map.showMapStat);
map.drawRegions();


