angular.module('myApp').directive('stumpMatchup', function() {
    var svgDimension = 580;

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
                      return d.wicket == true && d.extras_type != "Nb";
                  }

                  var idealRadius = 3;

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
              .attr("height", 137.46)
              .attr("width", 7.366)
              .attr("x", ((svgDimension / 2) - 3.683))
              .attr("y", (svgDimension - 137.46))
              .attr("rx", 4)
              .attr("rx", 4)
              .attr("fill", "#FAE3A1");

          window.append("rect")
              .attr("height", 137.46)
              .attr("width", 7.366)
              .attr("x", ((svgDimension / 2) - 22.1366666667))
              .attr("y", (svgDimension - 137.46))
              .attr("rx", 4)
              .attr("rx", 4)
              .attr("fill", "#FAE3A1");

          window.append("rect")
              .attr("height", 137.46)
              .attr("width", 7.366)
              .attr("x", ((svgDimension / 2) + 14.7706666667))
              .attr("y", (svgDimension - 137.46))
              .attr("rx", 4)
              .attr("rx", 4)
              .attr("fill", "#FAE3A1");

          window.append("rect")
              .attr("width", 20)
              .attr("height", 4)
              .attr("x", (svgDimension / 2))
              .attr("y", (svgDimension - 138.793333333))
              .attr("rx", 3)
              .attr("rx", 3)
              .attr("fill", "#683F16");

          window.append("rect")
              .attr("width", 20)
              .attr("height", 4)
              .attr("x", ((svgDimension / 2) - 20))
              .attr("y", (svgDimension - 138.793333333))
              .attr("rx", 3)
              .attr("rx", 3)
              .attr("fill", "#683F16");

          var leftBat = window.append("g")
              .attr("class", "left-bat");

          leftBat.append("rect")
              .attr("x", 50)
              .attr("y", 0)
              .attr("width", 11.25)
              .attr("height", 35)
              .attr("fill", "#6F5E25");

          leftBat.append("rect")
              .attr("x", 44.625)
              .attr("y", 33)
              .attr("width", 20)
              .attr("height", 90)
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("fill", "#6F5E25");

          leftBat.append("text")
              .attr("x", 49.625)
              .attr("y", 80)
              .attr("dy", ".35em")
              .attr("font-family", "sans-serif")
              .attr("fill", "white")
              .style("font-weight", "bold")
              .text("L");

          var rightBat = window.append("g")
              .attr("class", "right-bat");

          rightBat.append("rect")
              .attr("x", 518.75)
              .attr("y", 0)
              .attr("width", 11.25)
              .attr("height", 35)
              .attr("fill", "#6F5E25");

          rightBat.append("rect")
              .attr("x", 513.375)
              .attr("y", 33)
              .attr("width", 20)
              .attr("height", 90)
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("fill", "#6F5E25");

          rightBat.append("text")
              .attr("x", 519.375)
              .attr("y", 80)
              .attr("dy", ".35em")
              .attr("font-family", "sans-serif")
              .attr("fill", "white")
              .style("font-weight", "bold")
              .text("R");

          var ballX = d3.scaleLinear().range([0, svgDimension]);
          var ballY = d3.scaleLinear().range([svgDimension, 0])
          ballX.domain([-1.5, 1.5]);
          ballY.domain([0, 3]);

          scope.$watch('game', function(newVal, oldVal) {
              if (newVal == null) {
                  vis.selectAll(".dot").style("display", "block");
              } else {
                  vis.selectAll(".dot").style("display", function(d) { console.log("Changing"); return d.game == newVal.match_id ? "block" : "none" })
              }
          })

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
                  .transition()
                  .duration(1000)
                  .attr("cx", function(d) { return ballX(d["ended_x"]) })
                  .attr("cy", function(d) { return ballY(d["ended_y"]) })
                  .attr("r", idealRadius)
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

              balls.exit().remove();

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
