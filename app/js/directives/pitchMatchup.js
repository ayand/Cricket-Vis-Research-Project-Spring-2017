angular.module('myApp').directive('pitchMatchup', function() {
  var trueHeight = 451.2 * 1.2;
  var trueWidth = 73.2 * 1.2;
  var height = 402.4 * 1.2; // 442.64
  var width = 61 * 1.2; // 67.1
  var svgDimension = 580;
  var pitchStartX = (svgDimension / 2) - (width / 2);
  var pitchStartY = (svgDimension / 2) - (height / 2);
  var trueX = (svgDimension / 2) - (trueWidth / 2);
  var trueY = (svgDimension / 2) - (trueHeight / 2);
  var idealRadius = 3 * 1.2;

  return {
      restrict: 'EA',
      scope: {
          balls: '=',
          dictionary: '=',
          games: '=',
          game: '='
      },
      link: function(scope, element, attrs) {
              var selectedZone = 0;
              var zoneColors = [];

              var vis = d3.select(element[0])
                  .append("svg")
                  .attr("width", svgDimension)
                  .attr("height", svgDimension);

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
                  var game = scope.games.filter(function(g) { return g.match_id == d.game; })[0];
                  var line1 = "Date: " + game.date.split(" ")[0] + "<br/>";
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

              var zoom = function() {

                  //console.log(d3.event.transform);
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

              var ballMouseout = function() {
                  d3.selectAll(".dot").style("opacity", 1);

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
                      .style("stroke", "#CCCCCC");

                  tip.hide();
              }

              var ballMouseover = function(curBall) {
                  d3.selectAll(".dot").style("opacity", function(d) {
                      return (d == curBall) ? 1 : 0.1;
                  })

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

                  tip.html(tooltipText(curBall)).show();
              }

              vis.append("rect")
                  .attr("class", "ground")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("width", svgDimension)
                  .attr("height", svgDimension)
                  .attr("fill", "#FFFFFF");

              var ground = vis.append("g")
                 .call(d3.zoom().scaleExtent([1, 12]).translateExtent([[0,0], [svgDimension, svgDimension]]).on("zoom", zoom));

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

          scope.$watch('game', function(newVal, oldVal) {
              if (newVal == null) {
                  vis.selectAll(".dot").style("display", "block");
              } else {
                  vis.selectAll(".dot").style("display", function(d) { console.log("Changing"); return d.game == newVal.match_id ? "block" : "none" })
              }
          })

          scope.$watchCollection('balls', function(newBalls, oldBalls) {
              zoneColors = [];
              var validBalls = newBalls.filter(function(d) { return d["landing_x"] != null && d["landing_y"] != null; });

              var balls = ground.selectAll(".dot")
                  .data(validBalls, function(d) { return d.delivery_number; });

              var ballsEnter = balls.enter().append("circle")
                  .attr("class", "dot")
                  .on("mouseover", function(d) { ballMouseover(d); })
                  .on("mouseout", function() { ballMouseout(); });


              balls.merge(ballsEnter)
                  .transition()
                  .duration(1000)
                  .attr("cx", function(d) { return ballX(d["landing_x"]) })
                  .attr("cy", function(d) {
                      var coordinate = d["landing_y"] < 0 ? -0.25 : d["landing_y"];
                      return ballY(coordinate);
                  })
                  .attr("r", idealRadius)
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

              /*d3.selectAll(".dot")
                  .on("mouseover", function(d) { ballMouseover(d); })
                  .on("mouseout", function() { ballMouseout(); });*/

              balls.exit().remove();

              /*d3.selectAll(".dot")
                  .on("mouseover", function(d) { ballMouseover(d); })
                  .on("mouseout", function() { ballMouseout(); });*/

              //console.log("Done")
          })


      }
  }
})
