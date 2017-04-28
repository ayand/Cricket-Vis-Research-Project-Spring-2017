angular.module('myApp').directive('inningGraph', function() {
    var margin = 20;
    var height = 450;
    var width = 720;

    return {
        restrict: 'EA',
        scope: {
            balls: '=',
            min: '=',
            max: '='
        },
        link: function(scope, element, attrs) {

          var vis = d3.select(element[0])
            .append("svg")
            .attr("width", width + 60)
            .attr("height", height + 20);

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

          var lineX = d3.scaleLinear().range([margin, (width - margin)]);
          var lineY = d3.scaleLinear().range([(height - margin), margin]);
          lineX.domain([1, 50]);
          lineY.domain([0, 100]);
          var lineXAxis = d3.axisBottom(lineX);
          var lineYAxis = d3.axisLeft(lineY);
          vis.append("g")
              .attr("class", "xAxis")
              .attr("transform", "translate(0, " + (height - margin + 10) + ")")
              .call(lineXAxis);
          vis.append("g")
              .attr("class", "yAxis")
              .attr("transform", "translate(" + (margin) + ")")
              .call(lineYAxis);

          scope.$watch('min', function(newMin, oldMin) {
              scope.$watch('max', function(newMax, oldMax) {
                  var allBalls = scope.balls.filter(function(d) {
                      var over = Math.floor(d.ovr) + 1;
                      return over >= newMin && over <= newMax;
                  });

                  var firstInningBalls = allBalls.filter(function(d) {
                      var over = Math.floor(d.ovr) + 1;
                      return d.inning == 1;
                  });

                  var secondInningBalls = allBalls.filter(function(d) {
                      var over = Math.floor(d.ovr) + 1;
                      return d.inning == 2;
                  });

                  var firstPoints = [];
                  var secondPoints = [];
                  for (var i = newMin; i <= newMax; i++) {
                      var inning1 = firstInningBalls.filter(function(d) {
                          var over = Math.floor(d.ovr) + 1;
                          return over == i;
                      });
                      var inning2 = secondInningBalls.filter(function(d) {
                          var over = Math.floor(d.ovr) + 1;
                          return over == i;
                      });
                      if (inning1.length != 0) {
                          firstPoints.push({
                              over: i,
                              score: inning1[inning1.length - 1].cumul_runs
                          })
                      }
                      if (inning2.length != 0) {
                          secondPoints.push({
                              over: i,
                              score: inning2[inning2.length - 1].cumul_runs
                          })
                      }
                  }
                  console.log(firstPoints.length);
                  console.log(secondPoints.length);

                  var lines = [
                    {
                      team: firstInningBalls[0].batting_team,
                      values: firstPoints
                    },
                    {
                      team: secondInningBalls[0].batting_team,
                      values: secondPoints
                    }
                  ];

                  var scoreMin = Math.min(allBalls.map(function(d) {
                      return d.cumul_runs;
                  }));

                  var scoreMax = Math.max(allBalls.map(function(d) {
                      return d.cumul_runs;
                  }))

                  lineX.domain([newMin, newMax]);
                  lineY.domain([scoreMin, scoreMax]);

                  vis.select(".xAxis")
                      .call(lineXAxis);

                  vis.select(".yAxis")
                      .call(lineYAxis);

                  var line = d3.line()
                      .x(function(d) {
                          return lineX(d.over);
                      })
                      .y(function(d) {
                          return lineY(d.score);
                      })

                  var teams = vis.selectAll(".team")
                      .data(lines)
                      .enter().append("g")
                      .attr("class", "city");

                  teams.append("path")
                      .attr("class", "line")
                      .attr("d", function(d) {
                          console.log(d);
                          return line(d.values);
                      })
                      .style("stroke", function(d) {
                          return teamColors[d.team];
                      })

                  //console.log(lines);

                  /*teams.enter().append("path")
                      .attr("class", "line")
                      .attr("d", function(d) {
                          console.log(d);
                          return line(d.values);
                      })
                      .style("fill", "none")
                      .style("stroke", function(d) {
                          return teamColors[d.team];
                      })
                      .style("stroke-width", 2);

                  teams.attr("d", function(d) {
                      return line(d.values);
                      })
                      .style("fill", "none")
                      .style("stroke", function(d) {
                        return teamColors[d.team];
                      })
                      .style("stroke-width", 2);

                  teams.exit().remove();*/
              });
          });

        }
    }
});
