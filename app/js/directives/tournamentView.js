angular.module('myApp').directive('tournamentView', function() {
    var yDimension = 880;
    var xDimension = 1200;

    var isWicketBall = function(d) {
        return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
    }

    var decideColor = function(d) {
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
    }

    return {
        restrict: 'EA',
        scope: {
            matches: '=',
            team: '='
        },
        link: function(scope, element, attrs) {
            var vis = d3.select(element[0])
                .append("svg")
                .attr("width", xDimension)
                .attr("height", yDimension);

            vis.append("rect")
                .attr("fill", "#FFFFFF")
                .style("stroke", "black")
                .attr("width", xDimension)
                .attr("height", yDimension);

            var timeline = vis.append("g")
                .attr("class", "timeline")
                .attr("transform", "translate(30,30)");

            var matchScale = d3.scaleBand()
                .domain(scope.matches.map(function(d) { return d.key; }))
                .range([0, xDimension - 60])
                .paddingInner([0.05])

            var maxOverSizes = {}

            scope.matches.forEach(function(d) {
                var overs = d3.nest()
                    .key(function(ball) { return Math.floor(ball.ovr) })
                    .entries(d.values);
                var maxOverLength = d3.max(overs, function(over) { return over.values.length; });
                maxOverSizes[d.key] = matchScale.bandwidth() / maxOverLength;
            })

            var overs = [];
            for (var i = 0; i < 70; i++) {
                overs.push(i);
            }

            var overScale = d3.scaleBand()
                .domain(overs)
                .range([20, ((yDimension - 60) / 2)])

            var winningMatches = scope.matches.filter(function(d) { return d.winning_team == scope.team; })
            var losingMatches = scope.matches.filter(function(d) { return d.winning_team != scope.team; })

                var overs = [];

                for (var i = 1; i <= 50; i++) {
                    overs.push(i);
                }

                var winningOverScale = d3.scaleBand().domain(overs).range([((yDimension - 60) / 2), 20]);
                var losingOverScale = d3.scaleBand().domain(overs).range([((yDimension - 60) / 2), (yDimension - 80)])

                var wins = timeline.selectAll(".win")
                    .data(winningMatches)
                    .enter()
                    .append("g")
                    .attr("class", "win")
                    .attr("transform", function(d) {
                        var xPosition = matchScale(d.key);
                        return "translate(" + xPosition + ", 0)"
                    });

                wins.append("rect")
                    .attr("x", 0)
                    .attr("y", function(d) {
                        var maxOverPosition = winningOverScale(d3.max(d.values, function(ball) { return Math.ceil(ball.ovr) }));
                        return maxOverPosition - 40;
                    })
                    .attr("width", matchScale.bandwidth())
                    .attr("height", 40)
                    .attr("fill", "#33CC33")
                    .on("click", function(d) {
                        scope.$emit('match', d.key);
                    })
                    .style("cursor", "pointer");

                wins.append("text")
                    .attr("x", matchScale.bandwidth() / 2)
                    .attr("y", function(d) {
                        var maxOverPosition = winningOverScale(d3.max(d.values, function(ball) { return Math.ceil(ball.ovr) }));
                        return maxOverPosition - 5;
                    })
                    .style("text-anchor", "middle")
                    .text(function(d) { return d.opponent; })
                    .style("fill", "white")
                    .on("click", function(d) {
                        scope.$emit('match', d.key);
                    })
                    .style("cursor", "pointer")

                    wins.append("text")
                        .attr("x", matchScale.bandwidth() / 2)
                        .attr("y", function(d) {
                            var maxOverPosition = winningOverScale(d3.max(d.values, function(ball) { return Math.ceil(ball.ovr) }));
                            return maxOverPosition - 25;
                        })
                        .style("text-anchor", "middle")
                        .text(function(d) { return d.date.split(" ")[0]; })
                        .style("fill", "white")
                        .on("click", function(d) {
                            scope.$emit('match', d.key);
                        })
                        .style("cursor", "pointer")

                var winBalls = wins.selectAll(".ball")
                    .data(function(d) {
                        return d.values;
                    })
                    .enter()
                    .append("rect")
                    .attr("class", "ball")
                    .attr("y", function(d) { return winningOverScale(Math.ceil(d.ovr)); })
                    .attr("x", function(d) {
                        var ballWithinOver = d.ball_within_over - 1;
                        var ballWidth = maxOverSizes[d.game];
                        return ballWithinOver * ballWidth;
                    })
                    .attr("rx", 5)
                    .attr("ry", 5)
                    .attr("width", function(d) { return maxOverSizes[d.game] })
                    .attr("height", function(d) { return winningOverScale.bandwidth(); })
                    .attr("fill", function(d) { return decideColor(d); })
                    .style("stroke", "white")

                    var losses = timeline.selectAll(".loss")
                        .data(losingMatches)
                        .enter()
                        .append("g")
                        .attr("class", "loss")
                        .attr("transform", function(d) {
                            var xPosition = matchScale(d.key);
                            return "translate(" + xPosition + ", 0)"
                        });

                    losses.append("rect")
                        .attr("x", 0)
                        .attr("y", function(d) {
                            var maxOverPosition = losingOverScale(d3.max(d.values, function(ball) { return Math.ceil(ball.ovr) }));
                            return maxOverPosition + losingOverScale.bandwidth();
                        })
                        .attr("width", matchScale.bandwidth())
                        .attr("height", 40)
                        .attr("fill", "#FF5050")
                        .on("click", function(d) {
                            scope.$emit('match', d.key);
                        })
                        .style("cursor", "pointer");

                    losses.append("text")
                        .attr("x", matchScale.bandwidth() / 2)
                        .attr("y", function(d) {
                            var maxOverPosition = losingOverScale(d3.max(d.values, function(ball) { return Math.ceil(ball.ovr) }));
                            return maxOverPosition + losingOverScale.bandwidth() + 35;
                        })
                        .style("text-anchor", "middle")
                        .text(function(d) { return d.opponent; })
                        .style("fill", "white")
                        .on("click", function(d) {
                            scope.$emit('match', d.key);
                        })
                        .style("cursor", "pointer")

                        losses.append("text")
                            .attr("x", matchScale.bandwidth() / 2)
                            .attr("y", function(d) {
                                var maxOverPosition = losingOverScale(d3.max(d.values, function(ball) { return Math.ceil(ball.ovr) }));
                                return maxOverPosition + losingOverScale.bandwidth() + 15;
                            })
                            .style("text-anchor", "middle")
                            .text(function(d) { return d.date.split(" ")[0]; })
                            .style("fill", "white")
                            .on("click", function(d) {
                                scope.$emit('match', d.key);
                            })
                            .style("cursor", "pointer")

                    var lossBalls = losses.selectAll(".ball")
                        .data(function(d) {
                            return d.values;
                        })
                        .enter()
                        .append("rect")
                        .attr("class", "ball")
                        .attr("y", function(d) { return losingOverScale(Math.ceil(d.ovr)); })
                        .attr("x", function(d) {
                            var ballWithinOver = d.ball_within_over - 1;
                            var ballWidth = maxOverSizes[d.game];
                            return ballWithinOver * ballWidth;
                        })
                        .attr("rx", 5)
                        .attr("ry", 5)
                        .attr("width", function(d) { return maxOverSizes[d.game] })
                        .attr("height", function(d) { return losingOverScale.bandwidth(); })
                        .attr("fill", function(d) { return decideColor(d); })
                        .style("stroke", "white")


                timeline.append("g")
                    .attr("class", "winningOverAxis")
                    .call(d3.axisLeft(winningOverScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]))

                timeline.append("g")
                    .attr("class", "winningOverAxis")
                    .call(d3.axisLeft(losingOverScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]))

                timeline.append("line")
                    .style("stroke", "black")
                    .attr("x1", 0)
                    .attr("y1", (yDimension - 60) / 2)
                    .attr("x2", xDimension - 60)
                    .attr("y2", (yDimension - 60) / 2);

                timeline.append("line")
                    .style("stroke", "black")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", 0)
                    .attr("y2", (yDimension - 60));

        }
    }
})
