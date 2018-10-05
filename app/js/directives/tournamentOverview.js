angular.module('myApp').directive('tournamentOverview', function() {
  var yDimension = 900;
  var xDimension = 1200;

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
          console.log(scope.team);
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

          var firstInningScale = d3.scaleBand().domain(overs).range([405, 40]);
          var secondInningScale = d3.scaleBand().domain(overs).range([495, 860]);

          var matchScale = d3.scaleBand()
              .domain([0, 1, 2, 3, 4, 5, 6,7, 8])
              .range([50, 1190])
              .paddingInner([0.05]);

          var blankSpace = 55.5 / 8;

              vis.append("text")
                  .attr("x", 55)
                  .attr("y", 20)
                  .style("text-anchor", "end")
                  .text("Inning 1");

              vis.append("text")
                  .attr("x", 55)
                  .attr("y", 890)
                  .style("text-anchor", "end")
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
                      .attr("height", 860)
                      .attr("width", matchScale.bandwidth())
                      .attr("fill", function(d) {
                          return d.winning_team == scope.team ? 'white' : "#FF5050";
                      })
                      .style("opacity", 0.3)

                  /*if (specialCases.includes(scope.team)) {
                      vis.append("rect")
                          .attr("x", matchScale(1))
                          .attr("y", 20)
                          .attr("height", 860)
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
                      .attr("y", 455)
                      .style("text-anchor", "middle")
                      .text(function(d) { return d.date.split(" ")[0]; })

                  if (specialCases.includes(scope.team)) {
                      vis.append("text")
                          .attr("x", matchScale(1) + (matchScale.bandwidth() / 2))
                          .attr("y", 455)
                          .style("text-anchor", "middle")
                          .style("fill", "black")
                          .text("2015-02-21")
                  }

                  battingMatch.append("text")
                      .attr("x", matchScale.bandwidth() / 2)
                      .attr("y", 425)
                      .style("text-anchor", "middle")
                      .text(function(d, i) { return getStage(i); })

                  if (specialCases.includes(scope.team)) {
                      vis.append("text")
                          .attr("x", matchScale(1) + (matchScale.bandwidth() / 2))
                          .attr("y", 425)
                          .style("text-anchor", "middle")
                          .style("fill", "black")
                          .text("Group")
                  }

                  battingMatch.append("text")
                      .attr("x", matchScale.bandwidth() / 2)
                      .attr("y", 485)
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
                          .attr("y", 485)
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
                              .attr("y1", 405)
                              .attr("x2", 1160)
                              .attr("y2", 405)
                              .style("stroke", "black");

                          vis.append("line")
                              .attr("x1", 50)
                              .attr("y1", 495)
                              .attr("x2", 1160)
                              .attr("y2", 495)
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
                          var secondInningRunScale = d3.scaleLinear().domain([0, maxScore]).range([515, 860]);
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

                          var scoreProgression = vis.append("g");

                          var batScoreProgression = scoreProgression.selectAll(".batScore")
                              .data(scope.data.batting_balls)
                              .enter().append("g")
                              .attr("class", "batScore")
                              .attr("transform", function(d, i) {
                                  return "translate("+[matchScale(getIndex(i)),0]+")"
                              });

                          batScoreProgression.selectAll(".vertLine")
                              .data(function(d) {
                                return d3.nest()
                                    .key(function(ball) { return Math.ceil(ball.ovr) })
                                    .rollup(function(leaves) { return {
                                          "inning": leaves[0].inning,
                                          "maxScore": d3.max(leaves, function(leaf) { return leaf.cumul_runs; }),
                                          "side": "bat",
                                          "game": parseInt(leaves[0].game)
                                    }})
                                    .entries(d.values)
                              })
                              .enter().append("line")
                              .attr("class", "vertLine")
                              .attr("x1", function(d) { return overScale(parseInt(d.key)) })
                              .attr("y1", function(d) {
                                  return decideY(d.value.inning, 0)
                              })
                              .attr("x2", function(d) { return overScale(parseInt(d.key)) })
                              .attr("y2", function(d) {
                                  return decideY(d.value.inning, d.value.maxScore)
                              })
                              .style("stroke", "#BC9CD3")
                              .style("cursor", "pointer")
                              .on("mouseover", function(d) {
                                  var x = overScale(parseInt(d.key))
                                  var index = getIndex(games.indexOf(d.value.game))
                                  var pointX = x + (matchScale.bandwidth() * index) + (blankSpace * index) + 50
                                  batPoint1 = { x: pointX, y:  decideY(d.value.inning, d.value.maxScore)}
                                  batPoint2 = { x: 50, y:  decideY(d.value.inning, d.value.maxScore) }

                                  d3.selectAll(".vertLine")
                                      .style("opacity", function(point) {
                                          if (point == d || (point.key == d.key && point.value.game == d.value.game)) {
                                              return 1;
                                          }
                                          return 0.1;
                                      })
                                      .each(function(point) {
                                          if (point != d && point.key == d.key && point.value.game == d.value.game) {
                                              bowlPoint1 = { x: pointX, y: decideY(point.value.inning, point.value.maxScore)}
                                              bowlPoint2 = { x: 50, y: decideY(point.value.inning, point.value.maxScore) }
                                          }
                                      })


                                  vis.append("line")
                                      .attr("class", "horizontalLine")
                                      .attr("x1", batPoint1.x)
                                      .attr("y1", batPoint1.y)
                                      .attr("x2", batPoint2.x)
                                      .attr("y2", batPoint2.y)

                                  if (bowlPoint1 != null) {
                                    vis.append("line")
                                        .attr("class", "horizontalLine")
                                        .attr("x1", bowlPoint1.x)
                                        .attr("y1", bowlPoint1.y)
                                        .attr("x2", bowlPoint2.x)
                                        .attr("y2", bowlPoint2.y)
                                  }

                              })
                              .on("mouseout", function(d) {
                                  batPoint1 = null;
                                  batPoint2 = null;
                                  bowlPoint1 = null;
                                  bowlPoint2 = null;

                                  vis.selectAll(".horizontalLine").remove();
                                  d3.selectAll(".vertLine").style("opacity", 1);
                              })

                          batScoreProgression.selectAll(".overLine")
                              .data(function(d) {
                                  return [
                                    d3.nest()
                                        .key(function(ball) { return Math.ceil(ball.ovr) })
                                        .rollup(function(leaves) { return {
                                              "inning": leaves[0].inning,
                                              "maxScore": d3.max(leaves, function(leaf) { return leaf.cumul_runs; }),
                                              "side": "bat",
                                              "game": parseInt(leaves[0].game)
                                        }})
                                        .entries(d.values)
                                  ];
                              })
                              .enter().append("path")
                              .attr("class", "overLine")
                              .attr("d", overLine)

                              batScoreProgression.append("g")
                                  .attr("transform", "translate(0, 405)")
                                  .call(d3.axisTop(overScale).tickValues([1, 50]))
                                  .selectAll("text")
                                  .style("font-weight", "bold")

                          var bowlScoreProgression = scoreProgression.selectAll(".bowlScore")
                              .data(scope.data.bowling_balls)
                              .enter().append("g")
                              .attr("class", "batScore")
                              .attr("transform", function(d, i) {
                                  return "translate("+[matchScale(getIndex(i)),0]+")"
                              });

                              bowlScoreProgression.selectAll(".vertLine")
                                  .data(function(d) {
                                    return d3.nest()
                                        .key(function(ball) { return Math.ceil(ball.ovr) })
                                        .rollup(function(leaves) { return {
                                              "inning": leaves[0].inning,
                                              "maxScore": d3.max(leaves, function(leaf) { return leaf.cumul_runs; }),
                                              "side": "bowl",
                                              "game": parseInt(leaves[0].game)
                                        }})
                                        .entries(d.values)
                                  })
                                  .enter().append("line")
                                  .attr("class", "vertLine")
                                  .attr("x1", function(d) { return overScale(parseInt(d.key)) })
                                  .attr("y1", function(d) {
                                      return decideY(d.value.inning, 0)
                                  })
                                  .attr("x2", function(d) { return overScale(parseInt(d.key)) })
                                  .attr("y2", function(d) { return decideY(d.value.inning, d.value.maxScore) })
                                  .style("stroke", "#BC9CD3")
                                  .style("cursor", "pointer")
                                  .on("mouseover", function(d) {
                                      var x = overScale(parseInt(d.key))
                                      var index = getIndex(games.indexOf(d.value.game))
                                      var pointX = x + (matchScale.bandwidth() * index) + (blankSpace * index) + 50
                                      bowlPoint1 = { x: pointX, y: decideY(d.value.inning, d.value.maxScore)}
                                      bowlPoint2 = { x: 50, y: decideY(d.value.inning, d.value.maxScore) }

                                      d3.selectAll(".vertLine")
                                          .style("opacity", function(point) {
                                              if (point == d || (point.key == d.key && point.value.game == d.value.game)) {
                                                  return 1;
                                              }
                                              return 0.1;
                                          })
                                          .each(function(point) {
                                              if (point != d && point.key == d.key && point.value.game == d.value.game) {
                                                  batPoint1 = { x: pointX, y: decideY(point.value.inning, point.value.maxScore)}
                                                  batPoint2 = { x: 50, y: decideY(point.value.inning, point.value.maxScore) }
                                              }
                                          })


                                      vis.append("line")
                                          .attr("class", "horizontalLine")
                                          .attr("x1", bowlPoint1.x)
                                          .attr("y1", bowlPoint1.y)
                                          .attr("x2", bowlPoint2.x)
                                          .attr("y2", bowlPoint2.y)

                                      if (batPoint1 != null) {
                                        vis.append("line")
                                            .attr("class", "horizontalLine")
                                            .attr("x1", batPoint1.x)
                                            .attr("y1", batPoint1.y)
                                            .attr("x2", batPoint2.x)
                                            .attr("y2", batPoint2.y)
                                      }

                                  })
                                  .on("mouseout", function(d) {
                                      batPoint1 = null;
                                      batPoint2 = null;
                                      bowlPoint1 = null;
                                      bowlPoint2 = null;

                                      vis.selectAll(".horizontalLine").remove();
                                      d3.selectAll(".vertLine").style("opacity", 1);
                                  })

                              bowlScoreProgression.selectAll(".overLine")
                                  .data(function(d) {
                                      return [
                                        d3.nest()
                                            .key(function(ball) { return Math.ceil(ball.ovr) })
                                            .rollup(function(leaves) { return {
                                                  "inning": leaves[0].inning,
                                                  "maxScore": d3.max(leaves, function(leaf) { return leaf.cumul_runs; }),
                                                  "side": "bowl",
                                                  "game": parseInt(leaves[0].game)
                                            }})
                                            .entries(d.values)
                                      ];
                                  })
                                  .enter().append("path")
                                  .attr("class", "overLine")
                                  .attr("d", overLine)

                                  bowlScoreProgression.append("g")
                                      .attr("transform", "translate(0, 495)")
                                      .call(d3.axisBottom(overScale).tickValues([1, 50]))
                                      .selectAll("text")
                                      .style("font-weight", "bold")

                              scoreProgression.append("g")
                                  .attr("class", "batScoreAxis")
                                  .attr("transform", "translate(50, 0)")
                                  .call(d3.axisLeft(firstInningRunScale))

                              scoreProgression.append("g")
                                  .attr("class", "bowlScoreAxis")
                                  .attr("transform", "translate(50, 0)")
                                  .call(d3.axisLeft(secondInningRunScale))

                              allBallStuff.style("display", "block");
                              scoreProgression.style("display", "none");

                              var overSummaries = vis.append("g")
                                  .attr("class", "overSummaries");

                              var stack = d3.stack()
                                  .keys(["runs", "wickets"])
                                  .order(d3.stackOrderNone)
                                  .offset(d3.stackOffsetNone);

                              var batSummary = overSummaries.selectAll(".batSummary")
                                  .data(scope.data.batting_balls)
                                  .enter().append("g")
                                  .attr("class", "batSummary")
                                  .attr("transform", function(d, i) {
                                      console.log(d);
                                      return "translate("+[matchScale(getIndex(i)), 0]+")"
                                  });

                              var batArea = batSummary.append("g")
                                  .attr("transform", function(d) {
                                      var y = (d.values[0].inning == 1) ? 0 : 130
                                      if (y == 0) {
                                          return "translate(0, 0)"
                                      }
                                      return "translate("+[0, y + 770]+") scale(1, -1)"
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
                                  .attr("x", (d, i) => overScale(i + 1))
                                  .attr("y", function(d) {
                                      //console.log(d);
                                      return (385 - (convertDimension(18) * d[1]))
                                  })
                                  .attr("height", function(d) {
                                      //console.log(d)
                                      return convertDimension(18) * (d[1] - d[0]);
                                  })
                                  .attr("width", (matchScale.bandwidth() - 10) / 50)


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
                                          return "translate("+[0, y + 770]+") scale(1, -1)"
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
                                      .attr("x", (d, i) => overScale(i + 1))
                                      .attr("y", function(d) {
                                          //console.log(d);
                                          return (385 - (convertDimension(18) * d[1]))
                                      })
                                      .attr("height", function(d) {
                                          //console.log(d)
                                          return convertDimension(18) * (d[1] - d[0]);
                                      })
                                      .attr("width", (matchScale.bandwidth() - 10) / 50)

                              batSummary.append("g")
                                  .attr("transform", "translate(0, 405)")
                                  .call(d3.axisTop(overScale).tickValues([1, 50]))
                                  .selectAll("text")
                                  .style("font-weight", "bold")

                              bowlSummary.append("g")
                                  .attr("transform", "translate(0, 495)")
                                  .call(d3.axisBottom(overScale).tickValues([1, 50]))
                                  .selectAll("text")
                                  .style("font-weight", "bold")

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
                                      scoreProgression.style("display", "none");
                                      overSummaries.style("display", "none");
                                  } else if (newVal == "overSummaries") {
                                      allBallStuff.style("display", "none");
                                      scoreProgression.style("display", "none");
                                      overSummaries.style("display", "block");
                                  } else {
                                      allBallStuff.style("display", "none");
                                      scoreProgression.style("display", "block");
                                      overSummaries.style("display", "none");
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
