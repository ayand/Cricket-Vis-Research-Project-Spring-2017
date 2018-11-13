angular.module('myApp').directive('tournamentOverview', function() {
  var yDimension = 830;
  var xDimension = 1075;

  var isWicketBall = function(d) {
      return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
  }
  var height = 280
  var convertDimension = function(d) {
      return ((d * height) / 450)
  }

  var decideColor = function(d) {
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
  }

  var teamColors = {};
  teamColors["India"] = "#0080FF";
  teamColors["Bangladesh"] = "#5AAB54";
  teamColors["United Arab Emirates"] = "#003366";
  teamColors["Scotland"] = "#66B2FF";
  teamColors["Ireland"] = "#80FF00";
  teamColors["Afghanistan"] = "#0066CC";
  teamColors["England"] = "#004C99";
  teamColors["South Africa"] = "#006633";
  teamColors["Australia"] = "gold";
  teamColors["New Zealand"] = "#000000";
  teamColors["West Indies"] = "#660000";
  teamColors["Pakistan"] = "#00CC00";
  teamColors["Zimbabwe"] = "#CC0000";
  teamColors["Sri Lanka"] = "#000099";

  var isDotBall = function(d) {
      return !isWicketBall(d) && d.runs_batter == 0 && d.extras_type != "Wd"
          && d.extras_type != "Nb";
  }

  var specialCases = ["Australia", "Bangladesh"];

  return {
      restrict: 'EA',
      scope: {
          data: "=",
          team: "=",
          selectedPlayers: "=",
          currentView: "=",
          currentPlayer: "="
      },
      link: function(scope, element, attrs) {
          var games = scope.data.batting_balls.map(function(d) { return parseInt(d.key) });

          var getIndex = function(i) {
              if (i > 0 && specialCases.includes(scope.team)) {
                  return i + 1;
              }
              return i;
          }

          var getStage = function(i) {
              var groupLimit = (specialCases.includes(scope.team)) ? 4 : 5;
              if (i <= groupLimit) {
                  return "Group";
              } else if (i == groupLimit + 1) {
                  return "Quarter-Final";
              } else if (i == groupLimit + 2) {
                  return "Semi-Final";
              }
              return "Final";
          }

          var vis = d3.select(element[0])
              .append("svg")
              .attr("width", xDimension)
              .attr("height", yDimension);

          vis.append("rect")
              .attr("width", xDimension)
              .attr("height", yDimension)
              .attr("fill", "white")
              .style("stroke", "black");

          var overs = [];
          for (var i = 1; i <= 50; i++) {
              overs.push(i);
          }

          var firstInningScale = d3.scaleBand().domain(overs).range([370, 40]);
          var secondInningScale = d3.scaleBand().domain(overs).range([460, 800]);

          var matchScale = d3.scaleBand()
              .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
              .range([50, xDimension - 10])
              .paddingInner([0.05]);

          var blankSpace = 55.5 / 8;

              vis.append("text")
                  .attr("x", 45)
                  .attr("y", 30)
                  .style("text-anchor", "end")
                  .style("font-size", "10px")
                  .text("Inning 1");

              vis.append("text")
                  .attr("x", 45)
                  .attr("y", 820)
                  .style("text-anchor", "end")
                  .style("font-size", "10px")
                  .text("Inning 2");

              var maxBattingSize = {};
              var maxBowlingSize = {};

              var overScores = [];

              var overLengths = [];

              scope.data.batting_balls.forEach(function(d) {
                var overs = d3.nest()
                    .key(function(ball) { return Math.floor(ball.ovr) })
                    .entries(d.values);
                var maxOverLength = d3.max(overs, function(over) { return over.values.length; });
                overs.forEach(function(d) {
                    overScores.push(d3.max(d.values, function(v) { return v.cumul_runs; }))
                })
                maxBattingSize[d.key] = matchScale.bandwidth() / maxOverLength;
                overLengths.push(maxOverLength)
              })

              scope.data.bowling_balls.forEach(function(d) {
                var overs = d3.nest()
                    .key(function(ball) { return Math.floor(ball.ovr) })
                    .entries(d.values);
                var maxOverLength = d3.max(overs, function(over) { return over.values.length; });
                overs.forEach(function(d) {
                    overScores.push(d3.max(d.values, function(v) { return v.cumul_runs; }))
                })
                maxBowlingSize[d.key] = matchScale.bandwidth() / maxOverLength;
                overLengths.push(maxOverLength)
              })

              var maxOverLength = d3.max(overLengths);
              var finalBallWidth = matchScale.bandwidth() / maxOverLength;

              var scoreRange = d3.extent(overScores);

              var colorLegend = ["#FFFFCC", "#FFEDA0", "#FED976", "#FEB24C", "#FD8D3C",
                  "#FC4E2A", "#E31A1C", "#BD0026", "#800026"]

              var overColorScale = d3.scaleQuantize()
                  .domain(scoreRange)
                  .range(colorLegend);

              var battingMatch = vis.selectAll(".battingMatch")
                  .data(scope.data.batting_balls)
                  .enter().append("g")
                  .attr("class", "battingMatch")
                  .attr("transform", function(d, i) {
                      return "translate("+[matchScale(getIndex(i)),0]+")"
                  });

                  battingMatch.append("rect")
                      .attr("x", 0)
                      .attr("y", 20)
                      .attr("height", 790)
                      .attr("width", matchScale.bandwidth())
                      .attr("fill", function(d) {
                          return d.winning_team == scope.team ? 'white' : "#FF5050";
                      })
                      .style("opacity", 0.3)

                  /*if (specialCases.includes(scope.team)) {
                      vis.append("rect")
                          .attr("x", matchScale(1))
                          .attr("y", 20)
                          .attr("height", 800)
                          .attr("width", matchScale.bandwidth())
                          .attr("fill", "#96BBF7")
                          .style("opacity", 0.3);
                  }*/

                  battingMatch.append("text")
                      .attr("x", matchScale.bandwidth() / 2)
                      .attr("y", 35)
                      .style("text-anchor", "middle")
                      .text(function(d) { return d.opponent; })
                      .style("fill", "black")
                      .style("font-size", "11px")
                      .style("font-weight", "bold")
                      .on("click", function(d) {
                          scope.$emit('match', d.key);
                      })
                      .style("cursor", "pointer")

                  if (specialCases.includes(scope.team)) {
                      vis.append("text")
                          .attr("x", matchScale(1) + (matchScale.bandwidth() / 2))
                          .attr("y", 35)
                          .style("text-anchor", "middle")
                          .style("font-size", "11px")
                          .style("font-weight", "bold")
                          .style("fill", "black")
                          .text((scope.team == "Australia") ? "Bangladesh" : "Australia")
                  }

                  battingMatch.append("text")
                      .attr("x", matchScale.bandwidth() / 2)
                      .attr("y", 420)
                      .style("text-anchor", "middle")
                      .text(function(d) { return d.date.split(" ")[0]; })

                  if (specialCases.includes(scope.team)) {
                      vis.append("text")
                          .attr("x", matchScale(1) + (matchScale.bandwidth() / 2))
                          .attr("y", 420)
                          .style("text-anchor", "middle")
                          .style("fill", "black")
                          .text("2015-02-21")
                  }

                  battingMatch.append("text")
                      .attr("x", matchScale.bandwidth() / 2)
                      .attr("y", 390)
                      .style("text-anchor", "middle")
                      .text(function(d, i) { return getStage(i); })

                  if (specialCases.includes(scope.team)) {
                      vis.append("text")
                          .attr("x", matchScale(1) + (matchScale.bandwidth() / 2))
                          .attr("y", 390)
                          .style("text-anchor", "middle")
                          .style("fill", "black")
                          .text("Group")
                  }

                  battingMatch.append("text")
                      .attr("x", matchScale.bandwidth() / 2)
                      .attr("y", 450)
                      .style("text-anchor", "middle")
                      .text(function(d) {
                          if (d.values[0].inning == 1) {
                              return "First to Bat";
                          }
                          return "Second to Bat";
                      })

                  if (specialCases.includes(scope.team)) {
                      vis.append("text")
                          .attr("x", matchScale(1) + (matchScale.bandwidth() / 2))
                          .attr("y", 450)
                          .style("text-anchor", "middle")
                          .style("fill", "D82E08")
                          .style("font-weight", "bold")
                          .text("Cancelled")
                  }

                  var battingBalls = battingMatch.append("g")
                      .attr("class", "allBalls");

                      battingBalls.selectAll(".ball")
                          .data(function(d) { return d.values; })
                          .enter().append("rect")
                          .attr("class", "ball")
                          .classed("activeball", true)
                          .attr("y", function(d) {
                              if (d.inning == 1) {
                                  return firstInningScale(Math.ceil(d.ovr));
                              } else {
                                  return secondInningScale(Math.ceil(d.ovr));
                              }
                          })
                          .attr("x", function(d) {
                              var ballWithinOver = d.ball_within_over - 1;
                              return ballWithinOver * finalBallWidth;
                          })
                          .attr("width", function(d) { return finalBallWidth })
                          .attr("height", function(d) { return firstInningScale.bandwidth(); })
                          .attr("fill", function(d) { return decideColor(d); })
                          .style("stroke", "white")

                          var bowlingMatch = vis.selectAll(".bowlingMatch")
                              .data(scope.data.bowling_balls)
                              .enter().append("g")
                              .attr("class", "bowlingMatch")
                              .attr("transform", function(d, i) {
                                  return "translate("+[matchScale(getIndex(i)),0]+")"
                              });

                          var bowlingBalls = bowlingMatch.append("g")
                              .attr("class", "allBalls");

                              bowlingBalls.selectAll(".ball")
                                  .data(function(d) { return d.values; })
                                  .enter().append("rect")
                                  .attr("class", "ball")
                                  .classed("activeball", true)
                                  .attr("y", function(d) {
                                    if (d.inning == 1) {
                                        return firstInningScale(Math.ceil(d.ovr));
                                    } else {
                                        return secondInningScale(Math.ceil(d.ovr));
                                    }
                                  })
                                  .attr("x", function(d) {
                                      var ballWithinOver = d.ball_within_over - 1;
                                      return ballWithinOver * finalBallWidth;
                                  })
                                  .attr("width", function(d) { return finalBallWidth })
                                  .attr("height", function(d) { return secondInningScale.bandwidth(); })
                                  .attr("fill", function(d) { return decideColor(d); })
                                  .style("stroke", "white")

                          vis.append("g")
                              .attr("class", "batAxis")
                              .classed("allBalls", true)
                              .attr("transform", "translate(50,0)")
                              .call(d3.axisLeft(firstInningScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]));

                          vis.append("g")
                              .attr("class", "bowlAxis")
                              .classed("allBalls", true)
                              .attr("transform", "translate(50,0)")
                              .call(d3.axisLeft(secondInningScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]));

                          vis.append("line")
                              .attr("x1", 50)
                              .attr("y1", 370)
                              .attr("x2", xDimension - 10)
                              .attr("y2", 370)
                              .style("stroke", "black");

                          vis.append("line")
                              .attr("x1", 50)
                              .attr("y1", 460)
                              .attr("x2", xDimension - 10)
                              .attr("y2", 460)
                              .style("stroke", "black");

                          var allBallStuff = vis.selectAll(".allBalls");

                          var finalScores = [];
                          var numBalls = [];

                          var batLengthDict = {};
                          var bowlLengthDict = {};

                          scope.data.batting_balls.forEach(function(d) {
                              var finalScore = d3.max(d.values, function(ball) {
                                  return ball.cumul_runs;
                              })
                              finalScores.push(finalScore)

                              var length = d.values.filter(function(ball) {
                                  return !isDotBall(ball);
                              }).length;

                              batLengthDict[d.key] = {};
                              batLengthDict[d.key]["score"] = finalScore;
                              batLengthDict[d.key]["length"] = length;

                              numBalls.push(length);
                          })

                          scope.data.bowling_balls.forEach(function(d) {
                              var finalScore = d3.max(d.values, function(ball) {
                                  return ball.cumul_runs;
                              })
                              finalScores.push(finalScore)

                              var length = d.values.filter(function(ball) {
                                  return !isDotBall(ball);
                              }).length;

                              bowlLengthDict[d.key] = {};
                              bowlLengthDict[d.key]["score"] = finalScore;
                              bowlLengthDict[d.key]["length"] = length;

                              numBalls.push(length);
                          })

                          var maxScore = d3.max(finalScores);
                          var maxLength = d3.max(numBalls);

                          var allBallStuff = vis.selectAll(".allBalls");

                          var batPoint1 = null;
                          var batPoint2 = null;
                          var bowlPoint1 = null;
                          var bowlPoint2 = null;

                          var firstInningRunScale = d3.scaleLinear().domain([0, maxScore]).range([385, 40]);
                          var secondInningRunScale = d3.scaleLinear().domain([0, maxScore]).range([515, 800]);
                          var overScale = d3.scaleLinear().domain([1, 50]).range([5, matchScale.bandwidth() - 5])

                          var decideY = function(i, score) {
                              if (i == 1) {
                                  return firstInningRunScale(score);
                              } else {
                                  return secondInningRunScale(score);
                              }
                          }

                          var overLine = d3.line()
                              .x(function(d) { return overScale(parseInt(d.key)) })
                              .y(function(d) {
                                  return decideY(d.value.inning, d.value.maxScore)
                              })

                          var batBallHeightDict = {}
                          var bowlBallHeightDict = {}

                          for (key in batLengthDict) {
                              var barHeight = firstInningRunScale(0) - firstInningRunScale(batLengthDict[key]["score"]);
                              batBallHeightDict[key] = barHeight / batLengthDict[key]["length"]
                          }

                          for (key in bowlLengthDict) {
                              var barHeight = secondInningRunScale(bowlLengthDict[key]["score"]) - secondInningRunScale(0)
                              bowlBallHeightDict[key] = barHeight / bowlLengthDict[key]["length"]
                          }

                              allBallStuff.style("display", "block");

                              var overSummaries = vis.append("g")
                                  .attr("class", "overSummaries");

                              var stack = d3.stack()
                                  .keys(["runs", "wickets"])
                                  .order(d3.stackOrderNone)
                                  .offset(d3.stackOffsetNone);

                              var battingMax = d3.max(scope.data.batting_balls, function(data) {
                                  var nestedData = d3.nest()
                                      .key(ball => Math.ceil(ball.ovr))
                                      .rollup(function(leaves) {
                                          return {
                                              "runs": d3.sum(leaves, leaf => leaf.runs_batter),
                                              "wickets": leaves.filter(leaf => leaf.wicket).length
                                          }
                                      })
                                      .entries(data.values);
                                  return d3.max(nestedData, d => d.value.runs + d.value.wickets);
                              })

                              var bowlingMax = d3.max(scope.data.bowling_balls, function(data) {
                                  var nestedData = d3.nest()
                                      .key(ball => Math.ceil(ball.ovr))
                                      .rollup(function(leaves) {
                                          return {
                                              "runs": d3.sum(leaves, leaf => leaf.runs_batter),
                                              "wickets": leaves.filter(leaf => leaf.wicket).length
                                          }
                                      })
                                      .entries(data.values);
                                  return d3.max(nestedData, d => d.value.runs + d.value.wickets);
                              })

                              var maxBarLength = (battingMax > bowlingMax) ? battingMax : bowlingMax;

                              var stackScale = d3.scaleLinear().domain([0, maxBarLength]).range([0, matchScale.bandwidth()])

                              var batSummary = overSummaries.selectAll(".batSummary")
                                  .data(scope.data.batting_balls)
                                  .enter().append("g")
                                  .attr("class", "batSummary")
                                  .attr("transform", function(d, i) {
                                      return "translate("+[matchScale(getIndex(i)), 0]+")"
                                  });

                              var batArea = batSummary.append("g")
                                  .attr("transform", function(d) {
                                      var y = (d.values[0].inning == 1) ? 0 : 130
                                      if (y == 0) {
                                          return "translate(0, 0)"
                                      }
                                      return "translate("+[0, y + 700]+") scale(1, -1)"
                                  })

                              var batBars = batArea.selectAll(".summaryBar")
                                  .data(function(d) {
                                      var nestedData = d3.nest()
                                          .key(ball => Math.ceil(ball.ovr))
                                          .rollup(function(leaves) {
                                              return {
                                                  "runs": d3.sum(leaves, leaf => leaf.runs_batter),
                                                  "wickets": leaves.filter(leaf => leaf.wicket).length
                                              }
                                          })
                                          .entries(d.values)
                                      return stack(nestedData.map(nest => nest.value));
                                  })
                                  .enter().append("g")
                                  .attr("class", "summaryBar")
                                  .attr("fill", function(d) {
                                      if (d.key == "runs") {
                                          return teamColors[scope.team];
                                      } else {
                                          return "#F45333";
                                      }
                                  })


                              batBars.selectAll("rect")
                                  .data(d => d)
                                  .enter().append("rect")
                                  .attr("x", d => stackScale(d[0]))
                                  .attr("y", (d, i) => firstInningScale(i + 1))
                                  .attr("height", firstInningScale.bandwidth())
                                  .attr("width", d => stackScale(d[1] - d[0]))

                              var bowlSummary = overSummaries.selectAll(".bowlSummary")
                                  .data(scope.data.bowling_balls)
                                  .enter().append("g")
                                  .attr("class", "bowlSummary")
                                  .attr("transform", function(d, i) {
                                      return "translate("+[matchScale(getIndex(i)),0]+")"
                                  });

                                  var bowlArea = bowlSummary.append("g")
                                      .attr("transform", function(d) {
                                          var y = (d.values[0].inning == 1) ? 0 : 130
                                          if (y == 0) {
                                              return "translate(0, 0)"
                                          }
                                          return "translate("+[0, y + 700]+") scale(1, -1)"
                                      })

                                  var bowlBars = bowlArea.selectAll(".summaryBar")
                                      .data(function(d) {
                                          var nestedData = d3.nest()
                                              .key(ball => Math.ceil(ball.ovr))
                                              .rollup(function(leaves) {
                                                  return {
                                                      "runs": d3.sum(leaves, leaf => leaf.runs_batter),
                                                      "wickets": leaves.filter(leaf => leaf.wicket).length
                                                  }
                                              })
                                              .entries(d.values)
                                          return stack(nestedData.map(nest => nest.value));
                                      })
                                      .enter().append("g")
                                      .attr("class", "summaryBar")
                                      .attr("fill", function(d) {
                                          if (d.key == "runs") {
                                              return teamColors[scope.team];
                                          } else {
                                              return "#F45333";
                                          }
                                      })

                                  bowlBars.selectAll("rect")
                                      .data(d => d)
                                      .enter().append("rect")
                                      .attr("x", d => stackScale(d[0]))
                                      .attr("y", (d, i) => firstInningScale(i + 1))
                                      .attr("height", firstInningScale.bandwidth())
                                      .attr("width", d => stackScale(d[1] - d[0]))

                              overSummaries.append("g")
                                  .attr("class", "batAxis")
                                  .classed("allBalls", true)
                                  .attr("transform", "translate(50,0)")
                                  .call(d3.axisLeft(firstInningScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]));

                              overSummaries.append("g")
                                  .attr("class", "bowlAxis")
                                  .classed("allBalls", true)
                                  .attr("transform", "translate(50,0)")
                                  .call(d3.axisLeft(secondInningScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]));

                              scope.$watchCollection('selectedPlayers', function(newPlayers, oldPlayers) {
                                  if (newPlayers.length == 0) {
                                      vis.selectAll(".ball")
                                          .classed("activeball", true)
                                          .classed("inactiveball", false);
                                  } else {
                                      vis.selectAll(".ball")
                                          .classed("activeball", function(d) {
                                              return newPlayers.includes(d.batsman) || newPlayers.includes(d.bowler);
                                          })
                                          .classed("inactiveball", function(d) {
                                              return !newPlayers.includes(d.batsman) && !newPlayers.includes(d.bowler);
                                          })
                                  }
                              })

                              scope.$watch("currentView", function(newVal, oldVal) {
                                  if (newVal == "allBalls") {
                                      allBallStuff.style("display", "block");

                                      overSummaries.style("display", "none");
                                  } else if (newVal == "overSummaries") {
                                      allBallStuff.style("display", "none");

                                      overSummaries.style("display", "block");
                                  }
                              })

                              scope.$watch("currentPlayer", function(newVal, oldVal) {
                                  if (newVal == null) {
                                      d3.selectAll(".ball")
                                          .style("stroke", "white")
                                          .style("stroke-width", 1)
                                  } else {
                                      d3.selectAll(".ball")
                                          .style("stroke", function(d) {
                                              return (d.batsman == newVal.id || d.bowler == newVal.id) ? "orange" : "white";
                                          })
                                          .style("stroke-width", function(d) {
                                              return (d.batsman == newVal.id || d.bowler == newVal.id) ? 3 : 1;
                                          })
                                  }
                              })
      }
  }
})
