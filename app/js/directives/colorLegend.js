angular.module('myApp').directive('colorLegend', function() {
    var width = 1500;
    var height = 80;

    return {
        restrict: 'E',
        scope: {},
        link: function(scope, element, attrs) {
          var legend = d3.select(element[0])
            .append("svg")
              .attr("width", width)
              .attr("height", height)

          legend.append('rect')
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", width)
              .attr("height", height)
              .attr("fill", "none")
              .attr("stroke", "#CCCCCC")
              .attr("stroke-width", 1);

          var legendColors = d3.scaleOrdinal()
              .domain(["Non-Boundary", "Boundary", "Extra", "Wicket", "Dot Ball"])
              .range(["#00CCCC", "#0000FF", "#FF8000", "black", "#999999"]);

          var ballTypes = ["Non-Boundary", "Boundary", "Extra", "Wicket", "Dot Ball"];

          var dataL = 50;
          var offset = 270;

          var legendItem = legend.selectAll('.legend')
            .data(ballTypes)
            .enter().append('g')
            .attr("class", "legend")
            .attr("transform", function (d, i) {
             if (i === 0) {
                dataL = d.length + offset
                return "translate(0,0)"
            } else {
             var newdataL = dataL
             dataL +=  d.length + offset
             return "translate(" + (newdataL) + ",0)"
            }
          })

          legendItem.append('circle')
            .attr("cx", 145)
            .attr("cy", 40)
            .attr("r", 12.5)
            .style("fill", function (d, i) {
                return legendColors(i)
            })

          legendItem.append('text')
              .attr("x", 175)
              .attr("y", 50)
              .text(function (d, i) {
                return d;
              })
              .attr("class", "textselected")
              .style("text-anchor", "start")
              .style("font-size", 22.5)
        }
    }
})
