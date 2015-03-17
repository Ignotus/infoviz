starPlot = function() {
  var width = 200,
      margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      labelMargin = 20,
      propertiesList = {},
      scales = [],
      colours = [],
      title = '',

      g,
      radius = width / 2,
      origin = [radius, radius],
      radians,
      scale = d3.scale.linear()
        .domain([0, 10])
        .range([0, radius])

    function chart(selection) {
        g = selection
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        drawLabels()
        drawLines()
        drawChart()
        drawInteraction()
    }

    function drawLines() {
        r = 0
        for (var key in propertiesList[0]) {
            x = radius * Math.cos(r);
            y = radius * Math.sin(r);
            g.append('line')
                .attr('class', 'star-axis')
                .attr('x1', origin[0])
                .attr('y1', origin[1])
                .attr('x2', origin[0] + x)
                .attr('y2', origin[1] + y)
            r += radians
        }
    }

    function drawLabels() {
        r = 0
        for (var key in propertiesList[0]) {
            x = (radius + labelMargin) * Math.cos(r);
            y = (radius + labelMargin) * Math.sin(r);
            g.append('text')
                .attr('class', 'star-label')
                .attr('x', origin[0] + x)
                .attr('y', origin[1] + y)
                .text(key)
                .style('text-anchor', 'middle')
                .style('dominant-baseline', 'central')
                
            r += radians
        }
    }

    function drawChart() {
        g.append('circle')
            .attr('class', 'star-origin')
            .attr('cx', origin[0])
            .attr('cy', origin[1])
            .attr('r', 1)
        
        var path = d3.svg.line.radial()

        
        r = Math.PI / 2;
        console.log(propertiesList)
        for (var i=0; i < propertiesList.length; i++) {
            var pathData = [];
            var properties = propertiesList[i]
            for (var key in properties) {
                var point = [scale(properties[key]), r]
                pathData.push(point)
                r += radians;
            }        
            g.append('path')
                .attr('class', 'star-path')
                .attr('transform', 'translate(' + origin[0] + ',' + origin[1] + ')')
                .attr('d', path(pathData) + 'Z')
                .style('stroke', colours[i])
                .style('fill', colours[i])
        }
            
        g.append('text')
            .attr('class', 'star-title')
            .attr('x', origin[0]) 
            .attr('y', -(margin.top / 2))
            .text(title)
            .style('text-anchor', 'middle')
    }
    
    function drawInteraction() {
        var path = d3.svg.line.radial()
        var rInteraction = Math.PI / 2;
        var rExtent = 0
        for (var i = 0; i < propertiesList.length; i++) {
            var properties = propertiesList[i]
            for (var key in properties){
                var lInteraction = radius;
                var xInteraction = lInteraction * Math.cos(rInteraction);
                var yInteraction = lInteraction * Math.sin(rInteraction);
                
                var lExtent = radius + labelMargin;
                var xExtent = lExtent * Math.cos(rExtent) + origin[0] + margin.left;
                var yExtent = lExtent * Math.sin(rExtent) + origin[1] + margin.top;

                var userScale = scales[0];
                lValue = scale(properties[key]);
                x = lValue * Math.cos(rExtent) + origin[0] + margin.left;
                y = lValue * Math.sin(rExtent) + origin[1] + margin.top;
                
                var pathData = [
                    [0, rInteraction - radians/2],
                    [lInteraction, rInteraction - radians/2],
                    [lInteraction, rInteraction + radians/2]
                    ];
                var textX =  origin[0] + (radius + labelMargin) * Math.cos(rExtent)
                var textY =  origin[0] + (radius + labelMargin) * Math.sin(rExtent)
                var datumToBind = {
                    textX: xExtent,
                    textY: yExtent,
                    x: x,
                    y: y,
                    key: key,
                    value: properties[key]
                }
                g.append('path')
                    .datum(datumToBind)
                    .attr('class', 'star-interaction')
                    .attr('transform', 'translate(' + origin[0] + ',' + origin[1] + ')')
                    .attr('d', path(pathData) + 'Z')
                /**
                g.append('text')
                    .attr('class', 'star-interaction-label')
                    .text(key + ": " + properties[key])
                    .attr('x', textX)
                    .attr('y', textY)
                    .style('text-anchor', 'middle')
                    .style('dominant-baseline', 'central')
                    //.style('display', 'none')
                **/
                rInteraction += radians;
                rExtent += radians;
            }
        }
    }
  
  chart.scales = function(_) {
    if(!arguments.length) return scales;
    if(Array.isArray(_)) {
      scales = _;
    } else {
      scales = [_];
    }
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    radius = width / 2;
    origin = [radius, radius];
    scale.range([0, radius])
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    origin = [radius, radius];
    return chart;
  };

  chart.labelMargin = function(_) {
    if (!arguments.length) return labelMargin;
    labelMargin = _;
    return chart;
  };

  chart.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return chart;
  };
  
  chart.propertiesList = function(_) {
    if (!arguments.length) return properties;
    propertiesList = _;
    radians = 2 * Math.PI / Object.keys(propertiesList[0]).length;
    return chart;
  };
  
  chart.colours = function(_) {
    if (!arguments.length) return colours;
    colours = _;
    return chart;
  };
  
  chart.interaction = function() {
    drawInteraction();  
  };
  
  return chart;
}