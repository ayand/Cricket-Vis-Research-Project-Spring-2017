angular.module('myApp').directive('pitchChart', function() {
    var trueHeight = 451.2 * 1.2;
    var trueWidth = 73.2 * 1.2;
    var height = 402.4 * 1.2; // 442.64
    var width = 61 * 1.2; // 67.1
    var svgDimension = 580;
    var pitchStartX = (svgDimension / 2) - (width / 2);
    var pitchStartY = (svgDimension / 2) - (height / 2);
    var trueX = (svgDimension / 2) - (trueWidth / 2);
    var trueY = (svgDimension / 2) - (trueHeight / 2);

    return {
        restrict: 'EA',
        scope: {
            balls: '=',
            batsmen: '=',
            bowlers: '=',
            min: '=',
            max: '=',
            dictionary: '=',
            zoneColors: '='
        },
        link: function(scope, element, attrs) {
          var selectedZone = 0;
          var zoneColors = [];

          scope.$watchCollection('zoneColors', function(newZones, oldZones) {
              zoneColors = newZones;
          })

          var vis = d3.select(element[0])
            .append("svg")
              .attr("width", svgDimension)
              .attr("height", svgDimension)

          var tooltipText = function(d) {
              var overNumber = Math.floor(d.ovr) + 1;
              var ballNumber = (d.ovr * 10) % 10;
              var batsman = d.batsman_name;
              var bowler = d.bowler_name;
              var runs = d.runs_w_extras;
              var scoreType = d.extras_type;
              var score = "";
              if (scoreType == "Wd") {
                  score = "Wides";
              } else if (scoreType == "Lb") {
                  score = "Leg byes";
              } else if (scoreType == "Nb") {
                  score = "No Ball";
              } else {
                  score = "Runs"
              }
              var line1 = "<strong>Over " + overNumber + ", Ball " + ballNumber + "</strong><br/>";
              var line2 = batsman + ": " + runs + " " + score + "<br/>"
              var line3 = "Bowled by " + bowler + "<br/>";
              var line4 = !isWicketBall(d) ? "" : ("Wicket- " + scope.dictionary[d.who_out.toString()]["name"] + " (" + d.wicket_method + ")");
              var tooltipText = (line1 + line2 + line3 + line4);
              return tooltipText;
          }

          var correctZone = function(zone) {
              if (zone <= 4) {
                  return 5 - zone;
              } else {
                  return 13 - zone;
              }
          }

          var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return tooltipText(d); });
          vis.call(tip);

          vis.append("rect")
              .attr("class", "ground")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", svgDimension)
              .attr("height", svgDimension)
              .attr("fill", "#FFFFFF");


          var ground = vis.append("g")
              .call(d3.zoom().scaleExtent([1, 12]).translateExtent([[0,0], [svgDimension, svgDimension]]).on("zoom", zoom))

          ground.append("rect")
              .attr("class", "pitch")
              .attr("x", trueX)
              .attr("y", trueY)
              .attr("width", trueWidth)
              .attr("height", trueHeight)
              .attr("fill", "#B07942");

          ground.append("rect")
              .attr("x", trueX)
              .attr("y", trueY)
              .attr("width", trueWidth)
              .attr("height", 48.8 * 1.2)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX)
              .attr("y", trueY + (402.4 * 1.2))
              .attr("width", trueWidth)
              .attr("height", 48.8 * 1.2)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX + (10.2 * 1.2))
              .attr("y", trueY)
              .attr("width", 52.8 * 1.2)
              .attr("height", 24.4 * 1.2)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX + (10.2 * 1.2))
              .attr("y", trueY + (24.4 * 1.2))
              .attr("width", 52.8 * 1.2)
              .attr("height", 24.4 * 1.2)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX + (10.2 * 1.2))
              .attr("y", trueY + (402.4 * 1.2))
              .attr("width", 52.8 * 1.2)
              .attr("height", 24.4 * 1.2)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX + (10.2 * 1.2))
              .attr("y", trueY + (426.8 * 1.2))
              .attr("width", 52.8 * 1.2)
              .attr("height", 24.4 * 1.2)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (trueY + (24.4 * 1.2)))
              .attr("r", 3 * 1.2)
              .attr("fill", "#FAE3A1");

          ground.append("circle")
              .attr("cx", (svgDimension / 2) - 9)
              .attr("cy", (trueY + (24.4 * 1.2)))
              .attr("r", 3 * 1.2)
              .attr("fill", "#FAE3A1");

          ground.append("circle")
              .attr("cx", (svgDimension / 2) + 9)
              .attr("cy", (trueY + (24.4 * 1.2)))
              .attr("r", 3 * 1.2)
              .attr("fill", "#FAE3A1");

          ground.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (trueY + (426.8 * 1.2)))
              .attr("r", 3 * 1.2)
              .attr("fill", "#FAE3A1");

          ground.append("circle")
              .attr("cx", (svgDimension / 2) - 9)
              .attr("cy", (trueY + (426.8 * 1.2)))
              .attr("r", 3 * 1.2)
              .attr("fill", "#FAE3A1");

          ground.append("circle")
              .attr("cx", (svgDimension / 2) + 9)
              .attr("cy", (trueY + (426.8 * 1.2)))
              .attr("r", 3 * 1.2)
              .attr("fill", "#FAE3A1");

          var ballX = d3.scaleLinear().range([((svgDimension / 2) - (width / 2)), ((svgDimension / 2) + (width / 2))]);
          var ballY = d3.scaleLinear().range([((svgDimension / 2) - (height / 2)) - (20 * 1.2), ((svgDimension / 2) + (height / 2))])
          ballX.domain([-1.525, 1.525]);
          ballY.domain([-1, 20.12]);

          var colors = ["#550000", "#770000", "#990000", "#CC0000", "#FF0000",
              "#FF5500", "#FF7700", "#FF9900"];

          var idealRadius = 3 * 1.2;

          function zoom() {
              d3.select(this).attr("transform", d3.event.transform);

              var dots = vis.selectAll(".dot");
              dots.attr("r", function() {
                  idealRadius = (2.5 / d3.event.transform.k) + 0.25
                  return idealRadius;
              });
          }

          var isWicketBall = function(d) {
              return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
          }

          var isValidBall = function(d) {
            var batsmanCondition = true;
            if (scope.batsmen.length != 0) {
                batsmanCondition = scope.batsmen.includes(d.batsman);
            }
            var bowlerCondition = true;
            if (scope.bowlers.length != 0) {
                bowlerCondition = scope.bowlers.includes(d.bowler);
            }
            var over = Math.floor(d.ovr) + 1;
            var overCondition = ((over >= scope.min) && (over <= scope.max));
            var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);
            return batsmanCondition && bowlerCondition && overCondition && zoneCondition;
          }

          var tip = d3.tip().attr('class', 'd3-tip');
          vis.call(tip);

          var activeClassName = (scope.balls[0].inning == 1) ? ".ballBar1" : ".ballBar2";
          var inactiveClassName = (scope.balls[0].inning == 1) ? ".ballBar2" : ".ballBar1";

          var ballMouseout = function(newMin, newMax, newBatsmen, newBowlers){
            d3.selectAll('.dot').style('opacity',1);

            d3.selectAll(".zone-path")
                 .attr("fill", function(path, i) {
                     if (selectedZone == 0) {
                         return zoneColors[i];
                     } else {
                         if (path.data.zone == selectedZone) {
                             return zoneColors[i];
                         } else {
                             return "gray";
                         }
                     }
                 })
                 .style("stroke", "#CCCCCC")

              d3.selectAll(activeClassName)
                .style("opacity", function(ball) {
                    if (isValidBall(ball)) {
                       return 1;
                    }
                    return 0.1
                });
            tip.hide();
          };

          var ballMouseover = function(curBall){
            d3.selectAll('.dot').style('opacity',function(d){
                if(d==curBall){
                    return 1;
                }else{
                    return 0.1;
                }
            });

            if (zoneColors.length == 0) {
              d3.selectAll(".zone-path")._groups[0].forEach(function(e) {
                  zoneColors.push(e.attributes.fill.value);
              });
            }

            if (curBall.z != 0) {
              d3.selectAll(".zone-path")
                  .attr("fill", function(path, i) {
                      if (curBall.z == correctZone(path.data.zone)) {
                          return zoneColors[i];
                      } else {
                          return 'gray';
                      }
                  })
                  .style("stroke", "black")
            }

            d3.selectAll(activeClassName)
                .style('opacity', function(d) {
                    if (d == curBall) {
                        return 1;
                    } else {
                        return 0.1;
                    }
            });
            tip.html(tooltipText(curBall)).show();
          };

          var validBalls = scope.balls.filter(function(d) {
              return d["landing_x"] != null && d["landing_y"] != null;
          });

          var balls = ground.selectAll(".dot")
              .data(validBalls);

          balls.enter().append("circle")
              .attr("class", "dot")
              .attr("cx", function(d) {
                  return ballX(d["landing_x"]);
              })
              .attr("cy", function(d) {
                if (d["landing_y"] < 0) {
                    return ballY(-0.25);
                } else {
                    return ballY(d["landing_y"]);
                }
              })
              .attr("r", idealRadius) //Previous value: 3.5
              .attr("fill", function(d) {
                if (isWicketBall(d)) {
                    return "#F45333";
                } else {
                    if (d.runs_batter == 0 && d.extras_type != "Wd" && d.extras_type != "Nb") {
                        return "#CCCCCC";
                    } else {
                        if (d.extras_type != "") {
                            return "#7BCCC4";
                        } else {
                            if (d.runs_batter < 4) {
                              return "#43A2CA";
                            } else {
                                return "#0868AC";
                            }
                        }
                    }
                }
              })



          scope.$watchCollection('batsmen', function(newBatsmen, oldBatsmen) {
              scope.$watchCollection('bowlers', function(newBowlers, oldBowlers) {
                scope.$watch('min', function(newMin, oldMin) {
                    scope.$watch('max', function(newMax, oldMax) {
                      selectedZone = 0;
                      d3.selectAll(".dot")
                          .on("mouseover", function(d) {
                              ballMouseover(d);
                          })
                          .on("mouseout", function() {
                              ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                          })
                          .classed("visibleball",function(d){
                              return isValidBall(d);
                          })
                          .classed("invisibleball", function(d) {
                            return !isValidBall(d);
                          });

                          d3.selectAll(activeClassName)
                              .style("opacity", function(ball) {
                                  if (isValidBall(ball)) {
                                     return 1;
                                  }
                                  return 0.1;
                              })
                              .on("mouseover", function(d) {
                                if (isValidBall(d)) {
                                    ballMouseover(d);
                                }
                              })
                              .on("mouseout", function(d) {
                                if (isValidBall(d)) {
                                  ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                                }
                              });

                          if (selectedZone != 0) {
                              zoneColors = [];
                              d3.selectAll(".zone-path")._groups[0].forEach(function(e) {
                                  zoneColors.push(e.attributes.fill.value);
                              });
                              d3.selectAll(".zone-path")
                                  .attr("fill", function(path, i) {
                                      if (selectedZone == path.data.zone) {
                                          return zoneColors[i];
                                      } else {
                                          return 'gray';
                                      }
                              })
                          }

                          d3.selectAll(".zone-path").on("click", function(d, index) {
                              if (selectedZone == d.data.zone) {
                                  selectedZone = 0;
                                  d3.selectAll(".zone-path")
                                      .attr("fill", function(path, i) {
                                        console.log("Changing color")
                                          return zoneColors[i];
                                      })
                                      .style('stroke', '#CCCCCC');
                                  d3.selectAll(".dot")
                                      .classed("visibleball",function(d){
                                          return isValidBall(d);
                                      })
                                      .classed("invisibleball", function(d) {
                                          return !isValidBall(d);
                                      })

                                  d3.selectAll(activeClassName)
                                    .style("opacity",function(d){
                                      if (isValidBall(d)) {
                                          return 1;
                                      }
                                      return 0.1;
                                    })
                                    .on("mouseover", function(d) {
                                      if (isValidBall(d)) {
                                          ballMouseover(d);
                                      } else {
                                          return;
                                      }
                                    })
                                    .on("mouseout", function(d) {
                                      if (isValidBall(d)) {
                                        ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                                      }
                                    });
                              } else {
                                  if (selectedZone == 0 || zoneColors.length == 0) {
                                    zoneColors = [];
                                    d3.selectAll(".zone-path")._groups[0].forEach(function(e) {
                                        zoneColors.push(e.attributes.fill.value);
                                    });
                                  }
                                  selectedZone = d.data.zone;
                                  d3.selectAll(".zone-path")
                                      .attr("fill", function(path, i) {
                                          if (selectedZone == path.data.zone) {
                                              return zoneColors[i];
                                          } else {
                                              return 'gray';
                                          }
                                  })
                                  .style("stroke", "black");
                                  d3.selectAll(".dot")
                                  .classed("visibleball",function(d){
                                      return isValidBall(d);
                                  })
                                  .classed("invisibleball", function(d) {
                                      return !isValidBall(d);
                                  })

                                  d3.selectAll(activeClassName)
                                    .style("opacity",function(d){
                                      if (isValidBall(d)) {
                                          return 1;
                                      }
                                      return 0.1;
                                    })
                                    .on("mouseover", function(d) {
                                      if (isValidBall(d)) {
                                          console.log("Hovering!")
                                          ballMouseover(d);
                                      }
                                    })
                                    .on("mouseout", function(d) {
                                      if (isValidBall(d)) {
                                        ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                                      }
                                    });
                              }
                          });

                          d3.selectAll(inactiveClassName)
                              .on("mouseover", function(d) {
                                  return;
                              })
                              .on("mouseout", function() {
                                  return;
                              })
                      });
                  });
              });
          });
        }
    }
});
