angular.module('myApp').directive('ballChart', function() {
    /*var height = 406.08;
    var width = 65.88;*/
    var trueHeight = 451.2;
    var trueWidth = 73.2;
    var height = 402.4; // 442.64
    var width = 61; // 67.1
    var svgDimension = 640;
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
          var vis = d3.select(element[0])
            .append("svg")
              .attr("width", svgDimension)
              .attr("height", svgDimension)
              /*.call(d3.zoom().scaleExtent([1, 10]).translateExtent([[0,0], [svgDimension, svgDimension]]).on("zoom", zoom))
            .append("g");*/

          /*function zoom() {
              vis.attr("transform", d3.event.transform);
              var dots = vis.selectAll(".dot")

          }*/

          var tooltipText = function(d, theDict) {
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
              var line4 = !isWicketBall(d) ? "" : ("Wicket- " + theDict[d.who_out.toString()]["name"] + " (" + d.wicket_method + ")");
              var tooltipText = (line1 + line2 + line3 + line4);
              return tooltipText;
          }

          var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return tooltipText(d, newDict); });
          vis.call(tip);

          vis.append("rect")
              .attr("class", "ground")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", svgDimension)
              .attr("height", svgDimension)
              .attr("fill", "#1DA542");


          var ground = vis.append("g")
              .call(d3.zoom().scaleExtent([1, 12]).translateExtent([[0,0], [svgDimension, svgDimension]]).on("zoom", zoom))

          /*ground.append("circle")
              .attr("class", "ground")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (svgDimension / 2))
              .attr("r", (svgDimension / 2) - 60)
              .attr("fill", "#1DA542");*/


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
              .attr("height", 48.8)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX)
              .attr("y", trueY + 402.4)
              .attr("width", trueWidth)
              .attr("height", 48.8)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX + 10.2)
              .attr("y", trueY)
              .attr("width", 52.8)
              .attr("height", 24.4)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX + 10.2)
              .attr("y", trueY + 24.4)
              .attr("width", 52.8)
              .attr("height", 24.4)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX + 10.2)
              .attr("y", trueY + 402.4)
              .attr("width", 52.8)
              .attr("height", 24.4)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("x", trueX + 10.2)
              .attr("y", trueY + 426.8)
              .attr("width", 52.8)
              .attr("height", 24.4)
              .style("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (trueY + 24.4))
              .attr("r", 3)
              .attr("fill", "#683F16");

          ground.append("circle")
              .attr("cx", (svgDimension / 2) - 10)
              .attr("cy", (trueY + 24.4))
              .attr("r", 3)
              .attr("fill", "#683F16");

          ground.append("circle")
              .attr("cx", (svgDimension / 2) + 10)
              .attr("cy", (trueY + 24.4))
              .attr("r", 3)
              .attr("fill", "#683F16");

          ground.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (trueY + 426.8))
              .attr("r", 3)
              .attr("fill", "#683F16");

          ground.append("circle")
              .attr("cx", (svgDimension / 2) - 10)
              .attr("cy", (trueY + 426.8))
              .attr("r", 3)
              .attr("fill", "#683F16");

          ground.append("circle")
              .attr("cx", (svgDimension / 2) + 10)
              .attr("cy", (trueY + 426.8))
              .attr("r", 3)
              .attr("fill", "#683F16");

          var leftBat = ground.append("g")
              .attr("class", "left-bat");

          leftBat.append("rect")
              .attr("x", (trueX - 5))
              .attr("y", (trueY - 20))
              .attr("width", 10)
              .attr("height", 40)
              .attr("rx", 4)
              .attr("ry", 4);

          leftBat.append("rect")
              .attr("x", (trueX - 2.5))
              .attr("y", (trueY - 30))
              .attr("width", 5)
              .attr("height", 10)
              .attr("fill", "blue");

          var rightBat = ground.append("g")
              .attr("class", "right-bat");

          rightBat.append("rect")
              .attr("x", (trueX - 5 + trueWidth))
              .attr("y", (trueY - 20))
              .attr("width", 10)
              .attr("height", 40)
              .attr("rx", 4)
              .attr("ry", 4);

          rightBat.append("rect")
              .attr("x", (trueX - 2.5 + trueWidth))
              .attr("y", (trueY - 30))
              .attr("width", 5)
              .attr("height", 10)
              .attr("fill", "blue");

          /*leftBat.style("opacity", 0);
          rightBat.style("opacity", 0);*/

          /*ground.append("rect")
              .attr("class", "pitch")
              .attr("x", pitchStartX)
              .attr("y", pitchStartY)
              .attr("width", width)
              .attr("height", height)
              .attr("fill", "#F2D1B0");*/

          var ballX = d3.scaleLinear().range([((svgDimension / 2) - (width / 2)), ((svgDimension / 2) + (width / 2))]);
          var ballY = d3.scaleLinear().range([((svgDimension / 2) - (height / 2)) - 20, ((svgDimension / 2) + (height / 2))])
          ballX.domain([-1.525, 1.525]);
          ballY.domain([-1, 20.12]);

          /*vis.append("circle")
              .attr("class", "black-dot")
              .attr("cx", 25)
              .attr("cy", 25)
              .attr("r", 25);*/

          var zones = [
              { "zone": 1, "amount": 1 },
              { "zone": 2, "amount": 1 },
              { "zone": 3, "amount": 1 },
              { "zone": 4, "amount": 1 },
              { "zone": 5, "amount": 1 },
              { "zone": 6, "amount": 1 },
              { "zone": 7, "amount": 1 },
              { "zone": 8, "amount": 1 }
          ];

          var colors = ["#550000", "#770000", "#990000", "#CC0000", "#FF0000",
              "#FF5500", "#FF7700", "#FF9900"];

          var idealRadius = 2.5;

          function zoom() {
              //Geometric zoom
              d3.select(this).attr("transform", d3.event.transform);

              //This part onwards is an attempt at semantic; will almsot definitely need improvement
              var dots = vis.selectAll(".dot");
              dots.attr("r", function() {
                  //console.log(d3.event)
                  idealRadius = (2.5 / d3.event.transform.k) + 0.25
                  return idealRadius;
              });
          }

          var isWicketBall = function(d) {
              return d.wicket == true && d.extras_type != "Nb";
          }

          var zoneDonut = d3.pie()
              .value(function(d) {
                  return d.amount;
              })

          var arc1 = d3.arc()
              .outerRadius((svgDimension / 2))
              .innerRadius((svgDimension / 2) - 40);

          var arcs1 = vis.selectAll("g.arc")
              .data(zoneDonut(zones))
              .enter()
              .append("g")
              .attr("transform", "translate(" + (svgDimension / 2) + ", "
                  + (svgDimension / 2) + ")");

          arcs1.append("path")
              .attr("class", "zone-path")
              .attr("fill", function(d, i) {
                  //console.log("Index: " + i);
                  return colors[i];
              })
              .style("stroke", "white")
              .attr("d", arc1);

          arcs1.append("text")
              .attr("transform", function(d) { return "translate(" + arc1.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .attr("font-family", "sans-serif")
              .attr("fill", "white")
              .text(function(d) { return d.data.zone; });

          var singleThing = [{ "amount": 1 }]

          var pie = d3.pie()
              .value(function(d) {
                  return d.amount;
              })

          var arc2 = d3.arc()
              .outerRadius((svgDimension / 2) + 175)
              .innerRadius((svgDimension / 2));

          var arcs2 = vis.selectAll("g.arc")
              .data(pie(singleThing))
              .enter()
              .append("g")
              .attr("transform", "translate(" + (svgDimension / 2) + ", "
                  + (svgDimension / 2) + ")");

          arcs2.append("path")
              .attr("fill", "#CCCCCC")
              .attr("d", arc2);

          scope.$watch('balls', function(newVal, oldVal) {
            scope.$watch('dictionary', function(newDict, oldDict) {
              var selectedZone = 0;

              if (!newVal) {
                  return;
              }

              var className = (newVal[0].inning == 1) ? ".ballBar1-active" : ".ballBar2-active";

              var tip = d3.tip().attr('class', 'd3-tip');
              vis.call(tip);
              var ballMouseover = function(curBall){
                // console.log(curBall)
                d3.selectAll('.dot').style('opacity',function(d){
                    if(d==curBall){
                        return 1;
                    }else{
                        return 0.2;
                    }
                });

                if (curBall.z != 0) {
                  d3.selectAll(".zone-path")
                      .attr("fill", function(path, i) {
                          if (curBall.z == path.data.zone) {
                              return colors[i];
                          } else {
                              return 'gray';
                          }
                      })
                }

                d3.selectAll(className)
                    .style('opacity', function(d) {
                        if (d == curBall) {
                            return 1;
                        } else {
                            return 0.2;
                        }
                });
                tip.html(tooltipText(curBall, newDict)).show();

              };

              var ballMouseout = function(newMin, newMax){
                d3.selectAll('.dot').style('opacity',1);

                d3.selectAll(".zone-path")
                     .attr("fill", function(path, i) {
                         if (selectedZone == 0) {
                             return colors[i];
                         } else {
                             if (path.data.zone == selectedZone) {
                                 return colors[i];
                             } else {
                                 return "gray";
                             }
                         }
                     })

                d3.selectAll(className)
                    .style("opacity", function(ball) {
                        var over = Math.floor(ball.ovr) + 1;
                        if (over >= newMin && over <= newMax) {
                             //console.log('not fading');
                           return 1;
                        } else {
                           //console.log('fading');
                           return 0.2;
                        }
                    });
                tip.hide();
              };

              var validBalls = newVal.filter(function(d) {
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
                        return ballY(-0.5);
                    } else {
                        return ballY(d["landing_y"]);
                    }
                  })
                  .attr("r", idealRadius) //Previous value: 3.5
                  .attr("fill", function(d) {
                    if (isWicketBall(d)) {
                        return "black";
                    } else {
                        if (d.runs_batter == 0 && d.extras_type != "Wd" && d.extras_type != "Nb") {
                            return "#AAAAAA";
                        } else {
                            if (d.extras_type != "") {
                                return "#FF8000";
                            } else {
                                if (d.runs_batter < 4) {
                                  return "#00CCCC";
                                } else {
                                    return "#000099";
                                }
                            }
                        }
                    }
                  })
                  /*.on("mouseover", function(d) {
                      console.log(d.z);
                      // if (d.z != 0) {
                      //   d3.selectAll(".zone-path")
                      //       .transition()
                      //       .duration(1000)
                      //       .attr("fill", function(path, i) {
                      //           if (d.z == path.data.zone) {
                      //               return "gold";
                      //           } else {
                      //               return "black";
                      //           }
                      //       })
                      // }
                      ballMouseover(d);
                  })
                  .on("mouseout", function() {
                      // d3.selectAll(".zone-path")
                      //     .transition()
                      //     .duration(1000)
                      //     .attr("fill", function(path, i) {
                      //         if (selectedZone == 0) {
                      //             return colors[i];
                      //         } else {
                      //             if (path.data.zone == selectedZone) {
                      //                 return "gold";
                      //             } else {
                      //                 return "black";
                      //             }
                      //         }
                      //     })
                      ballMouseout();
                  });*/

                  scope.$watch('batsmen', function(newBatsmen, oldBatsmen) {
                      scope.$watch('bowlers', function(newBowlers, oldBowlers) {
                        scope.$watch('min', function(newMin, oldMin) {
                            scope.$watch('max', function(newMax, oldMax) {
                              //var filteredBalls = validBalls
                              /*var filteredBalls = validBalls.filter(function(d) {
                                var over = Math.floor(d.ovr) + 1;
                                var overCondition = ((over >= newMin) && (over <= newMax));
                                return overCondition;
                              });
                              var activeBatsmen = filteredBalls.map(function(d) {
                                  return d.batsman;
                              });
                              var activeBowlers = filteredBalls.map(function(d) {
                                  return d.bowler;
                              });*/

                              /*var hands = Array.from(new Set(newBatsmen.map(function(d) {
                                  console.log(d.bat_right_handed);
                                  if (d.bat_right_handed == "y") {
                                      return "right";
                                  } else {
                                      return "left";
                                  }
                              })));

                              console.log(hands);

                              if (hands.length == 1) {
                                  if (hands[0] == "left") {
                                      leftBat.style("opacity", 1)
                                      rightBat.style("opacity", 0);
                                  } else {
                                      leftBat.style("opacity", 0)
                                      rightBat.style("opacity", 1);
                                  }
                              } else {
                                  leftBat.style("opacity", 0)
                                  rightBat.style("opacity", 0);
                              }*/

                              d3.selectAll(".dot")
                                  // .style("opacity", function(d) {
                                  //     var batsmanCondition = true;
                                  //     if (newBatsmen.length != 0) {
                                  //         batsmanCondition = newBatsmen.includes(d.batsman);
                                  //     }
                                  //     var bowlerCondition = true;
                                  //     if (newBowlers.length != 0) {
                                  //         bowlerCondition = newBowlers.includes(d.bowler);
                                  //     }
                                  //     var over = Math.floor(d.ovr) + 1;
                                  //     var overCondition = ((over >= newMin) && (over <= newMax));
                                  //     var zoneCondition = (selectedZone == 0 || selectedZone == d.z);
                                  //     if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                  //         return 1;
                                  //     } else {
                                  //         return 0;
                                  //     }
                                  // });
                                  .on("mouseover", function(d) {
                                      console.log(d.landing_y);
                                      ballMouseover(d);
                                  })
                                  .on("mouseout", function() {
                                      ballMouseout(newMin, newMax);
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
                                      var zoneCondition = (selectedZone == 0 || selectedZone == d.z);
                                      if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                          return 'block';
                                      } else {
                                          return 'none';
                                      }
                                  });

                                  arcs1.on("click", function(d) {
                                      if (selectedZone == d.data.zone) {
                                          selectedZone = 0;
                                          d3.selectAll(".zone-path")
                                              .attr("fill", function(path, i) {
                                                  return colors[i];
                                          });
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
                                      } else {
                                          selectedZone = d.data.zone;
                                          d3.selectAll(".zone-path")
                                              .attr("fill", function(path, i) {
                                                  if (selectedZone == path.data.zone) {
                                                      return colors[i];
                                                  } else {
                                                      return 'gray';
                                                  }
                                          });
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
                                              var zoneCondition = (selectedZone == 0 || selectedZone == d.z);
                                              if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                                  return 'block';
                                              } else {
                                                  return 'none';
                                              }
                                          });
                                      }
                                  });
                              });
                          });
                      });
                  });
            });
          });
        }
    }
});
