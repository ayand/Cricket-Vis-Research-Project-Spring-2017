angular.module('myApp').directive('colorLegend', function() {
    var width = 1500;
    var height = 80;

    var isWicketBall = function(d) {
        return d.wicket == true && d.extras_type != "Nb";
    }

    var inOverRange = function(d, min, max) {
        var over = Math.floor(d.ovr) + 1;
        return over >= min && over <= max;
    }

    var decideColor = function(d) {
      if (isWicketBall(d)) {
          return "rgb(222, 45, 38)";
      } else {
          if (d.runs_batter == 0 && d.extras_type != "Wd" && d.extras_type != "Nb") {
              return "rgb(204, 204, 204)";
          } else {
              if (d.extras_type != "") {
                  return "rgb(123, 204, 196)";
              } else {
                  if (d.runs_batter < 4) {
                    return "rgb(67, 162, 202)";
                  } else {
                      return "rgb(8, 104, 172)";
                  }
              }
          }
      }
    }

    return {
        restrict: 'E',
        scope: {
            min1: '=',
            max1: '=',
            min2: '=',
            max2: '='
        },
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
              .attr("stroke", "#FFFFFF")
              .attr("stroke-width", 1);

          var legendColors = d3.scaleOrdinal()
              .domain(["Non-Boundary", "Boundary", "Extra", "Wicket", "Dot Ball"])
              .range(["#43A2CA", "#0868AC", "#7BCCC4", "#DE2D26", "#CCCCCC"]);

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
            .on("mouseover", function() {
                console.log("enter");
                //console.log(d3.select(this)._groups[0][0].style.fill)
                var color = d3.select(this)._groups[0][0].style.fill;
                console.log("Color: " + color);
                console.log(color == "rgb(204, 204, 204)")
                //d3.selectAll(".dot").style('opacity', 0.2)
                d3.selectAll(".dot").style("opacity", function(d) {
                    if (decideColor(d) == color) {
                        return 1;
                    } else {
                        return 0.2;
                    }
                })

                d3.selectAll(".ballBar1").style("opacity", function(d) {
                    if (inOverRange(d, scope.min1, scope.max1) && decideColor(d) == color) {
                        return 1;
                    } else {
                        return 0.2;
                    }
                })

                d3.selectAll(".ballBar2").style("opacity", function(d) {
                    if (inOverRange(d, scope.min2, scope.max2) && decideColor(d) == color) {
                        return 1;
                    } else {
                        return 0.2;
                    }
                })
            })
            .on("mouseout", function() {
                d3.selectAll(".dot").style("opacity", 1);

                d3.selectAll(".ballBar1").style("opacity", function(d) {
                    if (inOverRange(d, scope.min1, scope.max1)) {
                        return 1;
                    } else {
                        return 0.2;
                    }
                })

                d3.selectAll(".ballBar2").style("opacity", function(d) {
                    if (inOverRange(d, scope.min2, scope.max2)) {
                        return 1;
                    } else {
                        return 0.2;
                    }
                })
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
