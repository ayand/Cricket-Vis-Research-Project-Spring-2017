angular.module('myApp').directive('ballChart', function() {
    var height = 362.16; // 442.64
    var width = 54.9; // 67.1
    var svgDimension = 520;
    var pitchStartX = (svgDimension / 2) - (width / 2);
    var pitchStartY = (svgDimension / 2) - (height / 2)

    return {
        restrict: 'EA',
        scope: {
            balls: '=',
            batsmen: '=',
            bowlers: '=',
            min: '=',
            max: '=',
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
              .attr("x", pitchStartX)
              .attr("y", pitchStartY)
              .attr("width", width)
              .attr("height", height)
              .attr("fill", "#F2D1B0");

          var ballX = d3.scaleLinear().range([((svgDimension / 2) - (width / 2)), ((svgDimension / 2) + (width / 2))]);
          var ballY = d3.scaleLinear().range([((svgDimension / 2) - (height / 2)) - 108, ((svgDimension / 2) + (height / 2))])
          ballX.domain([-1.525, 1.525]);
          ballY.domain([-6, 20.12]);

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
              })
              /*dots.attr("cy", function(d) {
                if (d["landing_y"] < 0) {
                    return d3.event.transform.applyY(ballY(-0.5));
                } else {
                    return d3.event.transform.applyY(ballY(d["landing_y"]));
                }
              }).attr("cx", function(d) {
                  return d3.event.transform.applyX(ballX(d["landing_x"]));
              });

              var pitch = vis.selectAll(".pitch");
              pitch.attr("x", d3.event.transform.applyX(pitchStartX))
                  .attr("y", d3.event.transform.applyY(pitchStartY));*/

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
              .outerRadius((svgDimension / 2) + 125)
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
              var selectedZone = 0;

              if (!newVal) {
                  return;
              }

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
                    } else if (d.runs_batter == 0) {
                        return "#AAAAAA";
                    } else if (d.runs_batter < 4) {
                        return "#00CCCC";
                    } else {
                        return "#FF8000";
                    }
                  })
                  .on("mouseover", function(d) {
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
                  });

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

                  };

                  var ballMouseout = function(){
                    d3.selectAll('.dot').style('opacity',1);

                    d3.selectAll(".zone-path").attr("fill", function(path, i) { return colors[i];});
                  };



                  scope.$watch('batsmen', function(newBatsmen, oldBatsmen) {
                      scope.$watch('bowlers', function(newBowlers, oldBowlers) {
                        scope.$watch('min', function(newMin, oldMin) {
                            scope.$watch('max', function(newMax, oldMax) {
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

                                  /*d3.selectAll(".batsman-column")
                                      .style("opacity", function(d, i) {
                                          var batsman = newBatsmen[i];
                                          if (activeBatsmen.includes(batsman)) {
                                              return 1;
                                          } else {
                                              return 0.5;
                                          }
                                      });

                                  d3.selectAll(".bowler-column")
                                      .style("opacity", function(d, i) {
                                          var bowler = newBowlers[i];
                                          if (activeBowlers.includes(bowler)) {
                                              return 1;
                                          } else {
                                              return 0.5;
                                          }
                                      })*/

                                  arcs1.on("click", function(d) {
                                      if (selectedZone == d.data.zone) {
                                          selectedZone = 0;
                                          d3.selectAll(".zone-path")
                                              .transition()
                                              .duration(1000)
                                              .attr("fill", function(path, i) {
                                                  return colors[i];
                                          });
                                          d3.selectAll(".dot")
                                              .style("opacity", function(dot) {
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
                                                      return 1;
                                                  } else {
                                                      return 0;
                                                  }
                                          });
                                      } else {
                                          selectedZone = d.data.zone;
                                          d3.selectAll(".zone-path")
                                              .transition()
                                              .duration(1000)
                                              .attr("fill", function(path) {
                                                  if (d.data.zone == path.data.zone) {
                                                      return "gold";
                                                  } else {
                                                      return "black";
                                                  }
                                          });
                                          d3.selectAll(".dot")
                                              .style("opacity", function(dot) {
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
                                                  var zoneCondition = (selectedZone == dot.z);
                                                  if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                                                      return 1;
                                                  } else {
                                                      return 0;
                                                  }
                                          });
                                      }
                                  });
                              });
                          });
                      });
                  });
          });




        }
    }
});
