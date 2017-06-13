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
            dictionary: '='
        },
        link: function(scope, element, attrs) {

          var selectedZone = 0;
          var zoneColors = [];

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
              //var wicket = d.wicket;
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

              //console.log(d3.event.transform);
              d3.select(this).attr("transform", d3.event.transform);

              var dots = vis.selectAll(".dot");
              dots.attr("r", function() {
                  idealRadius = (2.5 / d3.event.transform.k) + 0.25
                  return idealRadius;
              });
          }

          var isWicketBall = function(d) {
              return d.wicket == true && d.extras_type != "Nb";
          }

          var tip = d3.tip().attr('class', 'd3-tip');
          vis.call(tip);

          var activeClassName = (scope.balls[0].inning == 1) ? ".ballBar1" : ".ballBar2";
          var inactiveClassName = (scope.balls[0].inning == 1) ? ".ballBar2" : ".ballBar1";

          var ballMouseout = function(newMin, newMax, newBatsmen, newBowlers){
            //console.log(newBatsmen);
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
                    var batsmanCondition = true;
                    if (newBatsmen.length != 0) {
                        batsmanCondition = newBatsmen.includes(ball.batsman);
                    }
                    var bowlerCondition = true;
                    if (newBowlers.length != 0) {
                      bowlerCondition = newBowlers.includes(ball.bowler);
                    }
                    var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == ball.z);
                    var over = Math.floor(ball.ovr) + 1;
                    if (over >= newMin && over <= newMax && batsmanCondition && bowlerCondition && zoneCondition) {
                         //console.log('not fading');
                       return 1;
                    } else {
                       //console.log('fading');
                       return 0.1;
                    }
                });

            /*d3.selectAll(activeClassName)
                .style("opacity", function(ball) {
                    var batsmanCondition = true;
                    if (newBatsmen.length != 0) {
                      batsmanCondition = newBatsmen.includes(d.batsman);
                    }
                    var bowlerCondition = true;
                    if (newBowlers.length != 0) {
                      bowlerCondition = newBowlers.includes(d.bowler);
                    }
                    var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);
                    var over = Math.floor(ball.ovr) + 1;
                    if (over >= newMin && over <= newMax && batsmanCondition && bowlerCondition && zoneCondition) {
                         //console.log('not fading');
                       return 1;
                    } else {
                       //console.log('fading');
                       return 0.1;
                    }
                });*/
            tip.hide();
          };

          var ballMouseover = function(curBall){
            // console.log(curBall)
            d3.selectAll('.dot').style('opacity',function(d){
                if(d==curBall){
                    return 1;
                }else{
                    return 0.1;
                }
            });

            if (zoneColors.length == 0) {
              d3.selectAll(".zone-path")._groups[0].forEach(function(e) {
                  //console.log("Colors: " + e.attributes.fill.value)
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
            //console.log("x: " + curBall["ended_x"])
            //console.log("y: " + curBall["ended_y"])

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
                    return "#DE2D26";
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

          //console.log("Ball drawing done");

          scope.$watchCollection('batsmen', function(newBatsmen, oldBatsmen) {
              scope.$watchCollection('bowlers', function(newBowlers, oldBowlers) {
                scope.$watch('min', function(newMin, oldMin) {
                    scope.$watch('max', function(newMax, oldMax) {
                      selectedZone = 0;
                      d3.selectAll(".dot")
                          .on("mouseover", function(d) {
                              //console.log(d.landing_y);
                              ballMouseover(d);
                          })
                          .on("mouseout", function() {
                              ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                          })
                          .style("display",function(d){
                              var batsmanCondition = true;
                              if (newBatsmen.length != 0) {
                                  batsmanCondition = newBatsmen.includes(d.batsman);
                              }
                              var bowlerCondition = true;
                              if (newBowlers.length != 0) {
                                  bowlerCondition = newBowlers.includes(d.bowler);
                              }
                              var over = Math.floor(d.ovr) + 1;
                              var overCondition = ((over >= newMin) && (over <= newMax));
                              var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);
                              //console.log(batsmanCondition && bowlerCondition && overCondition && zoneCondition);
                              if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                  return 'block';
                              } else {
                                  return 'none';
                              }
                          });

                          d3.selectAll(activeClassName)
                              .style("opacity", function(ball) {
                                  var batsmanCondition = true;
                                  if (newBatsmen.length != 0) {
                                    batsmanCondition = newBatsmen.includes(ball.batsman);
                                  }
                                  var bowlerCondition = true;
                                  if (newBowlers.length != 0) {
                                    bowlerCondition = newBowlers.includes(ball.bowler);
                                  }
                                  var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == ball.z);
                                  var over = Math.floor(ball.ovr) + 1;
                                  if (over >= newMin && over <= newMax && batsmanCondition && bowlerCondition && zoneCondition) {
                                       //console.log('not fading');
                                     return 1;
                                  } else {
                                     //console.log('fading');
                                     return 0.1;
                                  }
                              })
                              .on("mouseover", function(d) {
                                var batsmanCondition = true;
                                if (newBatsmen.length != 0) {
                                    batsmanCondition = newBatsmen.includes(d.batsman);
                                }
                                var bowlerCondition = true;
                                if (newBowlers.length != 0) {
                                    bowlerCondition = newBowlers.includes(d.bowler);
                                }
                                var over = Math.floor(d.ovr) + 1;
                                var overCondition = ((over >= newMin) && (over <= newMax));
                                var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);
                                //console.log(batsmanCondition && bowlerCondition && overCondition && zoneCondition);
                                if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                    ballMouseover(d);
                                }
                              })
                              .on("mouseout", function() {
                                  ballMouseout(newMin, newMax, newBatsmen, newBowlers);
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
                              //console.log(d3.selectAll(".zone-path"));

                              //console.log("Colors");
                              //console.log(colors);
                              if (selectedZone == d.data.zone) {
                                  selectedZone = 0;
                                  //console.log("Zones:");
                                  //console.log(d3.selectAll(".zone-path")._groups[0][index].attributes.fill.value);
                                  d3.selectAll(".zone-path")
                                      .attr("fill", function(path, i) {
                                          return zoneColors[i];
                                      })
                                      .style('stroke', '#CCCCCC');
                                  d3.selectAll(".dot")
                                      .style("display", function(dot) {
                                          var batsmanCondition = true;
                                          if (newBatsmen.length != 0) {
                                              batsmanCondition = newBatsmen.includes(dot.batsman);
                                          }
                                          var bowlerCondition = true;
                                          if (newBowlers.length != 0) {
                                              bowlerCondition = newBowlers.includes(dot.bowler);
                                          }
                                          var over = Math.floor(dot.ovr) + 1;
                                          var overCondition = ((over >= newMin) && (over <= newMax));
                                          //var zoneCondition = (selectedZone == 0 || selectedZone == d.z);
                                          if (batsmanCondition && bowlerCondition && overCondition) {
                                              return 'block';
                                          } else {
                                              return 'none';
                                          }
                                  });

                                  d3.selectAll(activeClassName)
                                    .style("opacity",function(d){
                                      var batsmanCondition = true;
                                      if (newBatsmen.length != 0) {
                                          batsmanCondition = newBatsmen.includes(d.batsman);
                                      }
                                      var bowlerCondition = true;
                                      if (newBowlers.length != 0) {
                                          bowlerCondition = newBowlers.includes(d.bowler);
                                      }
                                      var over = Math.floor(d.ovr) + 1;
                                      var overCondition = ((over >= newMin) && (over <= newMax));
                                      var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);
                                      //console.log(batsmanCondition && bowlerCondition && overCondition && zoneCondition);
                                      if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                          return 1;
                                      } else {
                                          return 0.1;
                                      }
                                    })
                                    .on("mouseover", function(d) {
                                      var batsmanCondition = true;
                                      if (newBatsmen.length != 0) {
                                          batsmanCondition = newBatsmen.includes(d.batsman);
                                      }
                                      var bowlerCondition = true;
                                      if (newBowlers.length != 0) {
                                          bowlerCondition = newBowlers.includes(d.bowler);
                                      }
                                      var over = Math.floor(d.ovr) + 1;
                                      var overCondition = ((over >= newMin) && (over <= newMax));
                                      var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);
                                      //console.log(batsmanCondition && bowlerCondition && overCondition && zoneCondition);
                                      if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                          ballMouseover(d);
                                      }

                                    })
                                    .on("mouseout", function() {
                                        ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                                    });
                              } else {
                                  if (selectedZone == 0 || zoneColors.length == 0) {
                                    zoneColors = [];
                                    d3.selectAll(".zone-path")._groups[0].forEach(function(e) {
                                        zoneColors.push(e.attributes.fill.value);
                                    });
                                  }
                                  selectedZone = d.data.zone;
                                  //console.log(zoneColors);
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
                                  .style("display",function(d){
                                      var batsmanCondition = true;
                                      if (newBatsmen.length != 0) {
                                          batsmanCondition = newBatsmen.includes(d.batsman);
                                      }
                                      var bowlerCondition = true;
                                      if (newBowlers.length != 0) {
                                          bowlerCondition = newBowlers.includes(d.bowler);
                                      }
                                      var over = Math.floor(d.ovr) + 1;
                                      var overCondition = ((over >= newMin) && (over <= newMax));
                                      var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);
                                      if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                          return 'block';
                                      } else {
                                          return 'none';
                                      }
                                  });

                                  d3.selectAll(activeClassName)
                                    .style("opacity",function(d){
                                      //console.log("Dealing with active class");
                                      var batsmanCondition = true;
                                      if (newBatsmen.length != 0) {
                                          batsmanCondition = newBatsmen.includes(d.batsman);
                                      }
                                      var bowlerCondition = true;
                                      if (newBowlers.length != 0) {
                                          bowlerCondition = newBowlers.includes(d.bowler);
                                      }
                                      var over = Math.floor(d.ovr) + 1;
                                      var overCondition = ((over >= newMin) && (over <= newMax));
                                      var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);
                                      //console.log(batsmanCondition && bowlerCondition && overCondition && zoneCondition);
                                      if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                          return 1;
                                      } else {
                                          return 0.1;
                                      }
                                    })
                                    .on("mouseover", function(d) {
                                      var batsmanCondition = true;
                                      if (newBatsmen.length != 0) {
                                          batsmanCondition = newBatsmen.includes(d.batsman);
                                      }
                                      var bowlerCondition = true;
                                      if (newBowlers.length != 0) {
                                          bowlerCondition = newBowlers.includes(d.bowler);
                                      }
                                      var over = Math.floor(d.ovr) + 1;
                                      var overCondition = ((over >= newMin) && (over <= newMax));
                                      var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);
                                      //console.log(batsmanCondition && bowlerCondition && overCondition && zoneCondition);
                                      if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                          ballMouseover(d);
                                      }
                                    })
                                    .on("mouseout", function() {
                                        ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                                    });
                              }
                          });

                          /*d3.selectAll(activeClassName)
                              .on("mouseover", function(d) {
                                  return;
                              })
                              .on("mouseout", function() {
                                  return;
                              })

                          d3.selectAll(activeClassName)
                              .on("mouseover", function(d) {
                                  var over = Math.floor(d.ovr) + 1;
                                  if (over >= newMin && over <= newMax) {
                                    ballMouseover(d);
                                  }

                              })
                              .on("mouseout", function() {
                                  ballMouseout(newMin, newMax);
                              })*/

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
