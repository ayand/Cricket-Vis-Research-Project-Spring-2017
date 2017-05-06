angular.module('myApp').directive('groundChart', function() {
    var svgDimension = 580;
    var innerRadius = (svgDimension / 2) - 30;
    var bottomEnd = (svgDimension / 2) - innerRadius;
    var topEnd = (svgDimension / 2) + innerRadius;

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
              .attr("height", svgDimension);

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

          var ground = vis.append("g")
              .call(d3.zoom().scaleExtent([1, 12]).translateExtent([[0,0], [svgDimension, svgDimension]]).on("zoom", zoom));

          ground.append("rect")
              .attr("class", "ground")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", svgDimension)
              .attr("height", svgDimension)
              .attr("fill", "#1DA542");

          var ballX = d3.scaleLinear().range([bottomEnd + 10, topEnd - 10]).domain([0, 360]);
          var ballY = d3.scaleLinear().range([topEnd - 10, bottomEnd + 10]).domain([0, 360]);

          var isWicketBall = function(d) {
              return d.wicket == true && d.extras_type != "Nb";
          }

          var singleThing = [{ "amount": 1 }]

          var pie = d3.pie()
              .value(function(d) {
                  return d.amount;
              })

          var arc1 = d3.arc()
              .outerRadius((svgDimension / 2) - 5)
              .innerRadius(innerRadius + 5);

          var arcs1 = vis.selectAll("g.arc")
              .data(pie(singleThing))
              .enter()
              .append("g")
              .attr("transform", "translate(" + (svgDimension / 2) + ", "
                  + (svgDimension / 2) + ")");

          arcs1.append("path")
              .attr("fill", "black")
              .style("stroke", "white")
              .attr("d", arc1);

          arcs1.append("text")
              .attr("transform", function(d) { return "translate(" + arc1.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .attr("font-family", "sans-serif")
              .attr("fill", "white")
              .text(function(d) { return d.data.zone; });

          var arc2 = d3.arc()
              .outerRadius((svgDimension / 2) + 175)
              .innerRadius((svgDimension / 2) - 5);

          var arcs2 = vis.selectAll("g.arc")
              .data(pie(singleThing))
              .enter()
              .append("g")
              .attr("transform", "translate(" + (svgDimension / 2) + ", "
                  + (svgDimension / 2) + ")");

          arcs2.append("path")
              .attr("fill", "#CCCCCC")
              .attr("d", arc2);

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

              var selectedZone = 0;
              var idealRadius = 2.5;

              var colors = ["#550000", "#770000", "#990000", "#CC0000", "#FF0000",
                  "#FF5500", "#FF7700", "#FF9900"];

              var tip = d3.tip().attr('class', 'd3-tip');
              vis.call(tip);

              var className = (scope.balls[0].inning == 1) ? ".ballBar1" : ".ballBar2";

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
                            return 0.1;
                        }
                });
                tip.html(tooltipText(curBall)).show();

              };

              //console.log("dictionary:");
              //console.log(scope.dictionary);

              /*ground.append("rect")
                  .attr("class", "pitch")
                  .attr("x", (svgDimension / 2) - 1.83)
                  .attr("y", (svgDimension / 2) - 11.28)
                  .attr("width", 3.66)
                  .attr("height", 22.56)
                  .attr("fill", "#B07942");*/



              var validBalls = scope.balls.filter(function(d) {
                  return d["x"] != null && d["y"] != null;
              });

              var balls = ground.selectAll(".dot")
                  .data(validBalls);

              balls.enter().append("circle")
                  .attr("class", "dot")
                  .attr("cx", function(d) {
                      return ballX(d["x"]);
                  })
                  .attr("cy", function(d) {
                      return ballY(d["y"]);
                  })
                  .attr("r", idealRadius) //Previous value: 3.5
                  .attr("fill", function(d) {
                    if (isWicketBall(d)) {
                        return "black";
                    } else {
                        if (d.runs_batter == 0 && d.extras_type != "Wd" && d.extras_type != "Nb") {
                            return "#999999";
                        } else {
                            if (d.extras_type != "") {
                                return "#FF8000";
                            } else {
                                if (d.runs_batter < 4) {
                                  return "#00CCCC";
                                } else {
                                    return "#0000FF";
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
                          /*console.log("Current Batsmen: " + newBatsmen)*/
                          //console.log("Current Batsmen: " + newBatsmen.length);
                          var batsmen = Array.from(new Set(scope.balls.filter(function(d) {
                              var over = Math.floor(d.ovr) + 1;
                              return over >= newMin && over <= newMax;
                          }).map(function(d) {
                              return d.batsman;
                          })))
                          if (newBatsmen.length != 0) {
                              batsmen = batsmen.filter(function(d) {
                                  return newBatsmen.includes(d);
                              });
                          }
                          var hands = Array.from(new Set(batsmen.map(function(d) {
                              return scope.dictionary[d.toString()]["hand"];
                          })));
                          /*leftBat.style("opacity", 0);
                          rightBat.style("opacity", 0);
                          if (hands.length == 1) {
                              if (hands[0] == "Left") {
                                  leftBat.style("opacity", 1);
                              } else {
                                  rightBat.style("opacity", 1);
                              }
                          }*/
                          //console.log("Current Bowlers: " + newBowlers.length);
                          d3.selectAll(".dot")
                              .on("mouseover", function(d) {
                                  //console.log(d.landing_y);
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
                                  //console.log(batsmanCondition && bowlerCondition && overCondition && zoneCondition);
                                  if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                      return 'block';
                                  } else {
                                      return 'none';
                                  }
                              });

                              d3.selectAll(".zone-path").on("click", function(d) {
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

        }
    }
})
