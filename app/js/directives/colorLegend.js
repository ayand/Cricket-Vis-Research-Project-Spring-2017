angular.module('myApp').directive('colorLegend', function() {
    var height = 60;

    var convertDimension = function(d) {
        return ((d * height) / 80)
    }

    var width = convertDimension(1500);

    var isWicketBall = function(d) {
        return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
    }

    var inOverRange = function(d, min, max) {
        var over = Math.ceil(d.ovr);
        return over >= min && over <= max;
    }

    var correctZone = function(zone) {
        if (zone <= 4) {
            return 5 - zone;
        } else {
            return 13 - zone;
        }
    }

    var decideColor = function(d) {
      if (isWicketBall(d)) {
          return "rgb(244, 83, 51)";
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
            max2: '=',
            batsmen: '=',
            bowlers: '=',
            inning: '='
        },
        link: function(scope, element, attrs) {
          var legend = d3.select(element[0])
            .append("svg")
              .attr("width", width)
              .attr("height", height)
              // .style("border-top","1px solid #dbdbdb")
              // .style("border-bottom","1px solid #dbdbdb")

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
              .range(["#43A2CA", "#0868AC", "#7BCCC4", "#F45333", "#CCCCCC"]);

          var ballTypes = ["Non-Boundary", "Boundary", "Extra", "Wicket", "Dot Ball"];

          var dataL = convertDimension(50);
          var offset = convertDimension(270);

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
            .attr("cx", convertDimension(145))
            .attr("cy", convertDimension(40))
            .attr("r", convertDimension(12.5))
            .style("fill", function (d, i) {
                return legendColors(i)
            })
            .style("cursor","pointer")
            .on("mouseover", function() {
                var color = d3.select(this)._groups[0][0].style.fill;
                d3.selectAll(".brushedBall").style("opacity", function(d) {
                    if (decideColor(d) == color) {
                        return 1;
                    } else {
                        return 0.2;
                    }
                })

                if (!(scope.inning === 1 || scope.inning === 2)) {
                  d3.selectAll(".ballBar1").style("opacity", function(d) {
                      if (decideColor(d) == color) {
                          return 1;
                      } else {
                          return 0.2;
                      }
                  })

                  d3.selectAll(".ballBar2").style("opacity", function(d) {
                      if (decideColor(d) == color) {
                          return 1;
                      } else {
                          return 0.2;
                      }
                  })
                } else {
                    var activeClassName = (scope.inning == 1) ? ".ballBar1" : ".ballBar2";
                    var inactiveClassName = (scope.inning == 1) ? ".ballBar2" : ".ballBar1";
                    var activeMin = (scope.inning == 1) ? scope.min1 : scope.min2;
                    var activeMax = (scope.inning == 1) ? scope.max1 : scope.max2;

                    d3.selectAll(inactiveClassName).style("opacity", function(d) {
                        if (decideColor(d) == color) {
                            return 1;
                        } else {
                            return 0.2;
                        }
                    });

                    d3.selectAll(".brushedBar").style("opacity", function(d) {
                        if (decideColor(d) == color) {
                            return 1;
                        } else {
                            return 0.2;
                        }
                    });
                }
            })
            .on("mouseout", function() {
                d3.selectAll(".brushedBall").style("opacity", 1);

                if (!(scope.inning === 1 || scope.inning === 2)) {
                  d3.selectAll(".ballBar1").style("opacity", 1)

                  d3.selectAll(".ballBar2").style("opacity", 1)
                } else {
                  var activeClassName = (scope.inning == 1) ? ".ballBar1" : ".ballBar2";
                  var inactiveClassName = (scope.inning == 1) ? ".ballBar2" : ".ballBar1";
                  var activeMin = (scope.inning == 1) ? scope.min1 : scope.min2;
                  var activeMax = (scope.inning == 1) ? scope.max1 : scope.max2;

                  d3.selectAll(inactiveClassName).style("opacity", 1);

                  d3.selectAll(".brushedBar").style("opacity", 1);

                }
            })

          legendItem.append('text')
              .attr("x", convertDimension(175))
              .attr("y", convertDimension(50))
              .text(function (d, i) {
                return d;
              })
              .attr("class", "textselected")
              .style("text-anchor", "start")
              .style("font-size", convertDimension(22.5))
        }
    }
})
