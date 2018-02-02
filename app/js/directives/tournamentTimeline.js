angular.module('myApp').directive('tournamentTimeline', function() {
  var yDimension = 500;
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

        vis.append("line")
            .style("stroke", "black")
            .attr("x1", 50)
            .attr("y1", 70)
            .attr("x2", 50)
            .attr("y2", 460);

        vis.append("line")
            .style("stroke", "black")
            .attr("x1", 50)
            .attr("y1", 460)
            .attr("x2", 1160)
            .attr("y2", 460);

        var overs = [];

        for (var i = 1; i <= 50; i++) {
            overs.push(i);
        }

        var overScale = d3.scaleBand().domain(overs).range([460, 90]);
        var matchScale = d3.scaleBand()
            .domain(scope.matches.map(function(d) { return d.date.split(" ")[0]; }))
            .range([50, 1160])
            .paddingInner([0.05]);

        var maxOverSizes = {}

        scope.matches.forEach(function(d) {
            var overs = d3.nest()
                .key(function(ball) { return Math.floor(ball.ovr) })
                .entries(d.values);
            var maxOverLength = d3.max(overs, function(over) { return over.values.length; });
            maxOverSizes[d.key] = matchScale.bandwidth() / maxOverLength;
        })

        vis.append("g")
            .attr("class", "yAxis")
            .attr("transform", "translate(50,0)")
            .call(d3.axisLeft(overScale).tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]))

        vis.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0,460)")
            .call(d3.axisBottom(matchScale))


        var match = vis.selectAll(".match")
            .data(scope.matches)
            .enter().append("g")
            .attr("class", "match")
            .attr("transform", function(d) {
                return "translate("+[matchScale(d.date.split(" ")[0]),0]+")"
            });

        match.append("rect")
            .attr("x", 0)
            .attr("y", 20)
            .attr("height", 440)
            .attr("width", matchScale.bandwidth())
            .attr("fill", function(d) {
                return d.winning_team == scope.team ? 'white' : "#FF5050";
            })
            .style("opacity", 0.3)

            //var label = match.append()

            match.append("text")
                .attr("x", matchScale.bandwidth() / 2)
                .attr("y", 85)
                .style("text-anchor", "middle")
                .text(function(d) { return d.opponent; })
                .style("fill", "black")
                .on("click", function(d) {
                    scope.$emit('match', d.key);
                })
                .style("cursor", "pointer")

        var balls = match.selectAll(".ball")
            .data(function(d) { return d.values; })
            .enter().append("rect")
            .attr("class", "ball")
            .attr("y", function(d) { return overScale(Math.ceil(d.ovr)); })
            .attr("x", function(d) {
                var ballWithinOver = d.ball_within_over - 1;
                var ballWidth = maxOverSizes[d.game];
                return ballWithinOver * ballWidth;
            })
            .attr("width", function(d) { return maxOverSizes[d.game] })
            .attr("height", function(d) { return overScale.bandwidth(); })
            .attr("fill", function(d) { return decideColor(d); })
            .style("stroke", "white")


      }
  }
})
