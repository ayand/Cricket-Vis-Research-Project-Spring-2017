angular.module('myApp').directive('tournamentView', function() {
    var yDimension = 850;
    var xDimension = 1400;

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
            for (var i = 0; i < 50; i++) {
                overs.push(i);
            }

            var overScale = d3.scaleBand()
                .domain(overs)
                .range([20, ((yDimension - 60) / 2)])

            var match = timeline.selectAll(".match")
                .data(scope.matches)
                .enter()
                .append("g")
                .attr("class", "match")
                .attr("transform", function(d) {
                    var xPosition = matchScale(d.key);
                    var maxOver = d3.max(d.values, function(ball) { return Math.ceil(parseFloat(ball.ovr)) })
                    //console.log(maxOver);
                    //var yPosition = 325
                    var yPosition = d.winning_team != scope.team ? ((yDimension - 60) / 2) - 20 : ((50 - maxOver) * overScale.bandwidth());
                    //console.log(yPosition);
                    return "translate(" + xPosition + ", " + yPosition + ")"
                });

            match.selectAll(".ball")
                .data(function(d) {
                    return d.values;
                })
                .enter()
                .append("rect")
                .attr("class", "ball")
                .attr("y", function(d) { return overScale(Math.floor(d.ovr)); })
                .attr("x", function(d) {
                    var ballWithinOver = d.ball_within_over - 1;
                    var ballWidth = maxOverSizes[d.game];
                    return ballWithinOver * ballWidth;
                })
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("width", function(d) { return maxOverSizes[d.game] })
                .attr("height", function(d) { return overScale.bandwidth(); })
                .attr("fill", function(d) { return decideColor(d); })
                .style("stroke", "white")
                .on("mouseover", function(d) {
                    console.log(d);
                })

                match.append("rect")
                    .attr("fill", function(d) {
                        return d.winning_team == scope.team ? "#33CC33" : "#FF5050"
                    })
                    .style("stroke", "black")
                    .attr("x", 0)
                    .attr("y", function(d) {
                        var maxOver = d3.max(d.values, function(ball) { return Math.ceil(ball.ovr) })
                        var yPosition = 20 + (maxOver * overScale.bandwidth()) + 1
                        return d.winning_team == scope.team ? 0 : yPosition;
                    })
                    .attr("width", matchScale.bandwidth())
                    .attr("height", 19)
                    .on("mouseover", function(d) {
                        console.log(d);
                    });

                match.append("text")
                    .attr("x", matchScale.bandwidth() / 2)
                    .attr("y", function(d) {
                        var maxOver = d3.max(d.values, function(ball) { return Math.ceil(ball.ovr) })
                        var yPosition = 20 + (maxOver * overScale.bandwidth()) + 15
                        return d.winning_team == scope.team ? 15 : yPosition;
                    })
                    .text(function(d) { return d.opponent; })
                    .style("text-anchor", "middle")
                    .style("fill", "white")

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
