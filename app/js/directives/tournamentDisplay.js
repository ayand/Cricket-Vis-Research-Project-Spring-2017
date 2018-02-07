angular.module('myApp').directive('tournamentDisplay', function() {
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

  return {
      restrict: 'EA',
      scope: {
          data: '=',
          team: '=',
          selectedPlayers: '='
      },
      link: function(scope, element, attrs) {
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

          var battingScale = d3.scaleBand().domain(overs).range([425, 40]);
          var bowlingScale = d3.scaleBand().domain(overs).range([475, 860]);



          var matchScale = d3.scaleBand()
              .domain(scope.data.batting_balls.map(function(d) { return d.date.split(" ")[0]; }))
              .range([50, 1160])
              .paddingInner([0.05]);

          var xAxis = vis.append("g")
              .attr("class", "matchAxis")
              .attr("transform", "translate(0,440)")
              .call(d3.axisBottom(matchScale));

          xAxis.selectAll(".domain")
              .style("opacity", 0);

          xAxis.selectAll("line")
              .style("opacity", 0);

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

          scope.data.batting_balls.forEach(function(d) {
            var overs = d3.nest()
                .key(function(ball) { return Math.floor(ball.ovr) })
                .entries(d.values);
            var maxOverLength = d3.max(overs, function(over) { return over.values.length; });
            maxBattingSize[d.key] = matchScale.bandwidth() / maxOverLength;
          })

          scope.data.bowling_balls.forEach(function(d) {
            var overs = d3.nest()
                .key(function(ball) { return Math.floor(ball.ovr) })
                .entries(d.values);
            var maxOverLength = d3.max(overs, function(over) { return over.values.length; });
            maxBowlingSize[d.key] = matchScale.bandwidth() / maxOverLength;
          })

          console.log(maxBattingSize);
          console.log(maxBowlingSize);

          var battingMatch = vis.selectAll(".battingMatch")
              .data(scope.data.batting_balls)
              .enter().append("g")
              .attr("class", "battingMatch")
              .attr("transform", function(d) {
                  return "translate("+[matchScale(d.date.split(" ")[0]),0]+")"
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

          /*battingMatch.append("rect")
              .attr("x", 0)
              .attr("y", 425)
              .attr("width", matchScale.bandwidth() + 15)
              .attr("height", 50)
              .attr("fill", "none")
              .style("stroke", "black");*/

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

              var battingBalls = battingMatch.selectAll(".ball")
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
                  .attr("transform", function(d) {
                      return "translate("+[matchScale(d.date.split(" ")[0]),0]+")"
                  });

                  var bowlingBalls = bowlingMatch.selectAll(".ball")
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
                  .attr("y1", 425)
                  .attr("x2", 1160)
                  .attr("y2", 425)
                  .style("stroke", "black");

              vis.append("line")
                  .attr("x1", 50)
                  .attr("y1", 475)
                  .attr("x2", 1160)
                  .attr("y2", 475)
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

      }
  }
})
