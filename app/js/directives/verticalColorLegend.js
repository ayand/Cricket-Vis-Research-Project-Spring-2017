angular.module('myApp').directive('verticalColorLegend', function() {
    var width = 300;
    var height = 350;

    return {
        restrict: 'E',
        scope: {},
        link: function(scope, element, attrs) {
            var canvas = d3.select(element[0])
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            canvas.append("text")
                .text("Legend")
                .attr("x", width / 2)
                .attr("y", 25)
                .style("text-anchor", "middle")
                .style("font-size", "20px")
                .style("font-weight", "bold")

            var legendColors = d3.scaleOrdinal()
                .domain(["Non-Boundary", "Boundary", "Extra", "Wicket", "Dot Ball"])
                .range(["#43A2CA", "#0868AC", "#7BCCC4", "#F45333", "#CCCCCC"]);

            var ballTypes = ["Non-Boundary", "Boundary", "Extra", "Wicket", "Dot Ball"];

            var legend = canvas.selectAll(".legendItem")
                .data(ballTypes)
                .enter()
                .append("g")
                .attr("class", "legendItem")
                .attr("transform", function(d, i) {
                    var yTransformation = 30 + (i * 60);
                    return "translate(0," + yTransformation + ")"
                })

            /*legend.append("rect")
                .attr("width", width)
                .attr("height", 84)
                .attr("fill", "white")
                .style("stroke", "black")*/

            legend.append("circle")
                .attr("cx", 35)
                .attr("cy", 38)
                .attr("r", 12)
                .attr("fill", d => legendColors(d))

            legend.append("text")
                .text(d => d)
                .attr("x", 80)
                .attr("y", 48)
                .style("font-size", "18px")
                .style("font-weight", "bold")

        }
    }
})
