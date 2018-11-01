angular.module('myApp').directive('stumpMatchup', function() {
    var svgDimension = 380;

    var convertDimension = function(d) {
        return ((d * svgDimension) / 580);
    }

    return {
        restrict: 'EA',
        scope: {
            balls: '=',
            dictionary: '=',
            games: '=',
            game: '='
        },
        link: function(scope, element, attrs) {
            var vis = d3.select(element[0])
                .append("svg")
                .attr("width", svgDimension)
                .attr("height", svgDimension);

            var zoneColors = [];

                var correctZone = function(zone) {
                    if (zone <= 4) {
                        return 5 - zone;
                    } else {
                        return 13 - zone;
                    }
                }

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

                  var isWicketBall = function(d) {
                      return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
                  }

                  var idealRadius = convertDimension(3.6);

                  var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return tooltipText(d); });
                  vis.call(tip);

                  var ballMouseout = function() {
                      d3.selectAll(".dot").style("opacity", 1);

                      d3.selectAll(".zone-path")
                          .attr("fill", function(path, i) { return zoneColors[i]; })
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

                  var window = vis.append("g")

          window.append("rect")
              .attr("width", svgDimension)
              .attr("height", svgDimension)
              .attr("x", 0)
              .attr("y", 0)
              .attr("fill", "#FFFFFF")

          window.append("rect")
              .attr("height", convertDimension(137.46))
              .attr("width", convertDimension(7.366))
              .attr("x", ((svgDimension / 2) - convertDimension(3.683)))
              .attr("y", (svgDimension - convertDimension(137.46)))
              .attr("rx", convertDimension(4))
              .attr("ry", convertDimension(4))
              .attr("fill", "#FAE3A1");

          window.append("rect")
              .attr("height", convertDimension(137.46))
              .attr("width", convertDimension(7.366))
              .attr("x", ((svgDimension / 2) - convertDimension(22.1366666667)))
              .attr("y", (svgDimension - convertDimension(137.46)))
              .attr("rx", convertDimension(4))
              .attr("ry", convertDimension(4))
              .attr("fill", "#FAE3A1");

          window.append("rect")
              .attr("height", convertDimension(137.46))
              .attr("width", convertDimension(7.366))
              .attr("x", ((svgDimension / 2) + convertDimension(14.7706666667)))
              .attr("y", (svgDimension - convertDimension(137.46)))
              .attr("rx", convertDimension(4))
              .attr("ry", convertDimension(4))
              .attr("fill", "#FAE3A1");

          window.append("rect")
              .attr("width", convertDimension(20))
              .attr("height", convertDimension(4))
              .attr("x", (svgDimension / 2))
              .attr("y", (svgDimension - convertDimension(138.793333333)))
              .attr("rx", convertDimension(3))
              .attr("ry", convertDimension(3))
              .attr("fill", "#683F16");

          window.append("rect")
              .attr("width", convertDimension(20))
              .attr("height", convertDimension(4))
              .attr("x", ((svgDimension / 2) - convertDimension(20)))
              .attr("y", (svgDimension - convertDimension(138.793333333)))
              .attr("rx", convertDimension(3))
              .attr("ry", convertDimension(3))
              .attr("fill", "#683F16");

          var leftBat = window.append("g")
              .attr("class", "left-bat");

          leftBat.append("rect")
              .attr("x", convertDimension(50))
              .attr("y", 0)
              .attr("width", convertDimension(11.25))
              .attr("height", convertDimension(35))
              .attr("fill", "#6F5E25");

          leftBat.append("rect")
              .attr("x", convertDimension(44.625))
              .attr("y", convertDimension(33))
              .attr("width", convertDimension(20))
              .attr("height", convertDimension(90))
              .attr("rx", convertDimension(4))
              .attr("ry", convertDimension(4))
              .attr("fill", "#6F5E25");

          leftBat.append("text")
              .attr("x", convertDimension(54.625))
              .attr("y", convertDimension(80))
              .attr("dy", ".35em")
              .attr("font-family", "sans-serif")
              .attr("fill", "white")
              .style("font-weight", "bold")
              .style("text-anchor", "middle")
              .text("L");

          var rightBat = window.append("g")
              .attr("class", "right-bat");

          rightBat.append("rect")
              .attr("x", convertDimension(518.75))
              .attr("y", 0)
              .attr("width", convertDimension(11.25))
              .attr("height", convertDimension(35))
              .attr("fill", "#6F5E25");

          rightBat.append("rect")
              .attr("x", convertDimension(513.375))
              .attr("y", convertDimension(33))
              .attr("width", convertDimension(20))
              .attr("height", convertDimension(90))
              .attr("rx", convertDimension(4))
              .attr("ry", convertDimension(4))
              .attr("fill", "#6F5E25");

          rightBat.append("text")
              .attr("x", convertDimension(523.375))
              .attr("y", convertDimension(80))
              .attr("dy", ".35em")
              .attr("font-family", "sans-serif")
              .attr("fill", "white")
              .style("text-anchor", "middle")
              .style("font-weight", "bold")
              .text("R");

          var ballX = d3.scaleLinear().range([0, svgDimension]);
          var ballY = d3.scaleLinear().range([svgDimension, 0])
          ballX.domain([-1.5, 1.5]);
          ballY.domain([0, 3]);

          var brushStart = function() {}

          var reverseX = d3.scaleLinear().domain([0, svgDimension]).range([-1.5, 1.5]);
          var reverseY = d3.scaleLinear().domain([svgDimension, 0]).range([0, 3])

          var leftX = null;
          var rightX = null;
          var topY = null;
          var bottomY = null;

          var brushMove = function() {
            var e = d3.event.selection;
            if (e) {
                leftX = reverseX(e[0][0]);
                rightX = reverseX(e[1][0]);
                topY = reverseY(e[1][1]);
                bottomY = reverseY(e[0][1]);
            }
          }

          var brushEnd = function() {
              if (d3.event.selection) {
                scope.$emit("geoFilter", {
                    "leftX": leftX,
                    "rightX": rightX,
                    "topY": topY,
                    "bottomY": bottomY,
                    "xName": "ended_x",
                    "yName": "ended_y"
                })
                console.log("Emitting");
              } else {
                scope.$emit("geoFilter", {
                    "leftX": null,
                    "rightX": rightX,
                    "topY": topY,
                    "bottomY": bottomY,
                    "xName": "ended_x",
                    "yName": "ended_y"
                })
              }
          }

          var brush = d3.brush()
              .extent([[0, 0], [svgDimension, svgDimension]])
              .on("start", brushStart)
              .on("brush", brushMove)
              .on("end", brushEnd)

          scope.$watch('game', function(newVal, oldVal) {
              if (newVal == null) {
                  vis.selectAll(".dot").style("display", "block");
              } else {
                  vis.selectAll(".dot").style("display", function(d) {  return d.game == newVal.match_id ? "block" : "none" })
              }
          })

          var brushArea = window.append("g")
              .attr("class", "brush")
              .call(brush);

          scope.$watchCollection('balls', function(newBalls, oldBalls) {
              zoneColors = [];
              var validBalls = newBalls.filter(function(d) {
                  return d["ended_x"] != null && d["ended_y"] != null
                      && d["ended_x"] >= -2 && d["ended_x"] <= 2 && d["ended_y"] <= 4;
              });

              var balls = window.selectAll(".dot")
                  .data(validBalls, function(d) { return d.delivery_number; });

              var ballsEnter = balls.enter().append("circle")
                  .attr("class", "dot")
                  .on("mouseover", function(d) { ballMouseover(d); })
                  .on("mouseout", function() { ballMouseout(); });

              balls.merge(ballsEnter)
                  .attr("cx", function(d) { return ballX(d["ended_x"]) })
                  .attr("cy", function(d) { return ballY(d["ended_y"]) })
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

              balls.exit()
                  .attr("cx", svgDimension)
                  .attr("cy", svgDimension)
                  .remove();

              var batsmen = Array.from(new Set(newBalls.map(function(d) {
                  return d.batsman;
              })));

              var hands = Array.from(new Set(batsmen.map(function(d) {
                  return scope.dictionary[d.toString()]["hand"];
              })));

              if (hands[0] == "Left") {
                  leftBat.style("opacity", 1);
                  rightBat.style("opacity", 0);
              } else {
                  rightBat.style("opacity", 1);
                  leftBat.style("opacity", 0);
              }

          })
        }
    }
})
