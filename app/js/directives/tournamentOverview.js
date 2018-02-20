angular.module('myApp').directive('tournamentOverview', function() {
  var yDimension = 900;
  var xDimension = 1200;

  var isWicketBall = function(d) {
      return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
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

  var specialCases = ["Australia", "Bangladesh"];

  return {
      restrict: 'EA',
      scope: {
          data: "=",
          team: "=",
          selectedPlayers: "=",
          currentView: "="
      },
      link: function(scope, element, attrs) {
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

          var battingScale = d3.scaleBand().domain(overs).range([405, 40]);
          var bowlingScale = d3.scaleBand().domain(overs).range([495, 860]);

          var matchScale = d3.scaleBand()
              .domain([0, 1, 2, 3, 4, 5, 6,7, 8])
              .range([50, 1160])
              .paddingInner([0.05]);

              vis.append("text")
                  .attr("x", 55)
                  .attr("y", 20)
                  .style("text-anchor", "end")
                  .text("Batting");

              vis.append("text")
                  .attr("x", 55)
                  .attr("y", 890)
                  .style("text-anchor", "end")
                  .text("Bowling");

              var maxBattingSize = {};
              var maxBowlingSize = {};

              var overScores = [];

              scope.data.batting_balls.forEach(function(d) {
                var overs = d3.nest()
                    .key(function(ball) { return Math.floor(ball.ovr) })
                    .entries(d.values);
                var maxOverLength = d3.max(overs, function(over) { return over.values.length; });
                overs.forEach(function(d) {
                    overScores.push(d3.max(d.values, function(v) { return v.cumul_runs; }))
                })
                maxBattingSize[d.key] = matchScale.bandwidth() / maxOverLength;
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
              })

              //console.log("Over scores: " + overScores);

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

                  battingMatch.append("text")
                      .attr("x", matchScale.bandwidth() / 2)
                      .attr("y", 35)
                      .style("text-anchor", "middle")
                      .text(function(d) { return d.opponent; })
                      .style("fill", "black")
                      .on("click", function(d) {
                          scope.$emit('match', d.key);
                      })
                      .style("cursor", "pointer")

                  if (specialCases.includes(scope.team)) {
                      vis.append("text")
                          .attr("x", matchScale(1) + (matchScale.bandwidth() / 2))
                          .attr("y", 35)
                          .style("text-anchor", "middle")
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

                  var battingBalls = battingMatch.append("g");

                      battingBalls.selectAll(".ball")
                          .data(function(d) { return d.values; })
                          .enter().append("rect")
                          .attr("class", "ball")
                          .classed("activeball", true)
                          .attr("y", function(d) { return battingScale(Math.ceil(d.ovr)); })
                          .attr("x", function(d) {
                              var ballWithinOver = d.ball_within_over - 1;
                              var ballWidth = maxBattingSize[d.game];
                              return ballWithinOver * ballWidth;
                          })
                          .attr("width", function(d) { return maxBattingSize[d.game] })
                          .attr("height", function(d) { return battingScale.bandwidth(); })
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

                              bowlingBalls.selectAll(".ball")
                                  .data(function(d) { return d.values; })
                                  .enter().append("rect")
                                  .attr("class", "ball")
                                  .classed("activeball", true)
                                  .attr("y", function(d) { return bowlingScale(Math.ceil(d.ovr)); })
                                  .attr("x", function(d) {
                                      var ballWithinOver = d.ball_within_over - 1;
                                      var ballWidth = maxBowlingSize[d.game];
                                      return ballWithinOver * ballWidth;
                                  })
                                  .attr("width", function(d) { return maxBowlingSize[d.game] })
                                  .attr("height", function(d) { return bowlingScale.bandwidth(); })
                                  .attr("fill", function(d) { return decideColor(d); })
                                  .style("stroke", "white")

                          battingBalls.style("opacity", 0);
                          bowlingBalls.style("opacity", 0);

                          var battingOvers = battingMatch.append("g");

                          battingOvers.selectAll(".over")
                              .data(function(d) {
                                  return d3.nest()
                                      .key(function(k) { return parseInt(Math.ceil(k.ovr)) })
                                      .rollup(function(leaves) { return d3.max(leaves, function(leaf) { return leaf.cumul_runs; }) })
                                      .entries(d.values);
                              })
                              .enter()
                              .append("rect")
                              .attr("class", "over")
                              .attr("width", matchScale.bandwidth())
                              .attr("height", battingScale.bandwidth())
                              .attr("x", 0)
                              .attr("y", function(d) { return battingScale(d.key) })
                              .attr("fill", function(d) { return overColorScale(d.value); })
                              .on("mouseover", function(d) { console.log(overColorScale(d.value)); })

                              var bowlingOvers = bowlingMatch.append("g");

                              bowlingOvers.selectAll(".over")
                                  .data(function(d) {
                                      return d3.nest()
                                          .key(function(k) { return parseInt(Math.ceil(k.ovr)) })
                                          .rollup(function(leaves) { return d3.max(leaves, function(leaf) { return leaf.cumul_runs; }) })
                                          .entries(d.values);
                                  })
                                  .enter()
                                  .append("rect")
                                  .attr("class", "over")
                                  .attr("width", matchScale.bandwidth())
                                  .attr("height", bowlingScale.bandwidth())
                                  .attr("x", 0)
                                  .attr("y", function(d) { return bowlingScale(d.key) })
                                  .attr("fill", function(d) { return overColorScale(d.value); })
                                  .on("mouseover", function(d) { console.log(d); })

                          vis.append("g")
                              .attr("class", "batAxis")
                              .attr("transform", "translate(50,0)")
                              .call(d3.axisLeft(battingScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]));

                          vis.append("g")
                              .attr("class", "bowlAxis")
                              .attr("transform", "translate(50,0)")
                              .call(d3.axisLeft(bowlingScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]));

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
                                      battingBalls.style("opacity", 1);
                                      bowlingBalls.style("opacity", 1);
                                      battingOvers.style("opacity", 0);
                                      bowlingOvers.style("opacity", 0);
                                  } else {
                                      battingBalls.style("opacity", 0);
                                      bowlingBalls.style("opacity", 0);
                                      battingOvers.style("opacity", 1);
                                      bowlingOvers.style("opacity", 1);
                                  }
                              })
      }
  }
})
