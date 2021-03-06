
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 100, bottom: 10, left: 50},
      width = 900 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    // Parse the Data
    d3.csv("data.csv", function(data) {
    
      // Color scale: give me a specie name, I return a color
      
      var color = d3.scaleOrdinal()
        .domain(['blogs', 'fiction', 'public', 'science', 'speech','TOTAL'])
        .range(['red','orange','yellow','green','blue','black'])
    
      // Here I set the list of dimension manually to control the order of axis:
      dimensions = ['Nom', 'Acc', 'Gen', 'Loc', 'Dat', 'Ins']
    
    // Handmade legend
    var datasets = ['blogs', 'fiction', 'public', 'science', 'speech','TOTAL']
    datasets.forEach(function(cat,i) {
        svg.append("circle").attr("cx",width+20).attr("cy",160+i*30)
            .attr("r", 6).style("fill", color(cat))
        svg.append("text").attr("x", width+30).attr("y", 160+i*30).text(cat)
            .style("font-size", "15px").attr("alignment-baseline","middle")
    })


      // For each dimension, I build a linear scale. I store all in a y object
      var y = {}
      for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
          .domain( [0,.55] ) // --> Same axis range for each group
          // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
          .range([height, 0])
      }
    
      // Build the X scale -> it find the best position for each Y axis
      x = d3.scalePoint()
        .range([0, width])
        .domain(dimensions);
    
      // Highlight the specie that is hovered
      var highlight = function(d){
    
        selected_specie = d.Dataset
    
        // first every group turns grey
        d3.selectAll(".line")
          .transition().duration(200)
          .style("stroke", "lightgrey")
          .style("opacity", "0.2")
        // Second the hovered specie takes its color
        d3.selectAll("." + selected_specie)
          .transition().duration(200)
          .style("stroke", color(selected_specie))
          .style("opacity", "1")
      }
    
      // Unhighlight
      var doNotHighlight = function(d){
        d3.selectAll(".line")
          .transition().duration(200).delay(1000)
          .style("stroke", function(d){ return( color(d.Dataset))} )
          .style("opacity", "1")
      }
    
      // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
      function path(d) {
          return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
      }
    
      // Draw the lines
      svg
        .selectAll("myPath")
        .data(data)
        .enter()
        .append("path")
          .attr("class", function (d) { return "line " + d.Dataset } ) // 2 class for each line: 'line' and the group name
          .attr("d",  path)
          .style("fill", "none" )
          .style("stroke", function(d){ return( color(d.Dataset))} )
          .style('stroke-width', 3)
          .style("opacity", 0.5)
          .on("mouseover", highlight)
          .on("mouseleave", doNotHighlight )
    
      // Draw the axis:
      svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
        // Add axis title
        .append("text")
          .style("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d; })
          .style("fill", "black")
          .style('font-size',18)
    
    })