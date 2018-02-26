angular.module('myApp').directive('stumps', function() {
    var svgDimension = 580;


    return {
        restrict: 'EA',
        scope: {
            balls: '=',
            dictionary: '=',
            batsmen: '=',
            min: '=',
            max: '='
        },
        link: function(scope, element, attrs) {
          var vis = d3.select(element[0])
            .append("svg")
              .attr("width", svgDimension)
              .attr("height", svgDimension);

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
                  var line1 = "<strong>Over " + overNumber + ", Ball " + ballNumber + "</strong><br/>";
                  var line2 = batsman + ": " + runs + " " + score + "<br/>"
                  var line3 = "Bowled by " + bowler + "<br/>";
                  var line4 = !isWicketBall(d) ? "" : ("Wicket- " + scope.dictionary[d.who_out.toString()]["name"] + " (" + d.wicket_method + ")");
                  var tooltipText = (line1 + line2 + line3 + line4);
                  return tooltipText;
              }

              var isWicketBall = function(d) {
                  return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
              }

              var stumpX = d3.scaleLinear().range([0, svgDimension]);
              var stumpY = d3.scaleLinear().range([svgDimension, 0])
              stumpX.domain([-1.5, 1.5]);
              stumpY.domain([0, 3]);

              var isValidBall = function(d) {
                var batsmanCondition = true;
                if (scope.batsmen.length != 0) {
                    batsmanCondition = scope.batsmen.includes(d.batsman);
                }
                var bowlerCondition = true;
                if (scope.bowlers.length != 0) {
                    bowlerCondition = scope.bowlers.includes(d.bowler);
                }
                var over = Math.floor(d.ovr) + 1;
                var overCondition = ((over >= scope.min) && (over <= scope.max));
                var zoneCondition = (scope.zone == 0 || correctZone(scope.zone) == d.z);

                return batsmanCondition && bowlerCondition && overCondition && zoneCondition;
              }

              var activeClassName = (scope.balls[0].inning == 1) ? ".ballBar1" : ".ballBar2";
              var inactiveClassName = (scope.balls[0].inning == 1) ? ".ballBar2" : ".ballBar1";

              var idealRadius = 3;

          var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return tooltipText(d); });
          vis.call(tip);

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



          var validBalls = scope.balls.filter(function(d) {
              return d["ended_x"] != null && d["ended_y"] != null
                  && d["ended_x"] >= -2 && d["ended_x"] <= 2 && d["ended_y"] <= 4;
          });

          var balls = window.selectAll(".dot")
              .data(validBalls);

          balls.enter().append("circle")
              .attr("class", "dot")
              .attr("cx", function(d) {
                  return stumpX(d["ended_x"]);
              })
              .attr("cy", function(d) {
                return stumpY(d["ended_y"]);

              })
              .attr("r", idealRadius) //Previous value: 3.5
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

          scope.$watchCollection('batsmen', function(newBatsmen, oldBatsmen) {
              scope.$watch('min', function(newMin, oldMin) {
                  scope.$watch('max', function(newMax, oldMax) {
                    var batsmen = Array.from(new Set(scope.balls.filter(function(d) {
                        var over = Math.floor(d.ovr) + 1;
                        return over >= newMin && over <= newMax;
                    }).map(function(d) {
                        return d.batsman;
                    })))
                    if (newBatsmen.length != 0) {
                        batsmen = batsmen.filter(function(d) {
                            return newBatsmen.includes(d);
                        });
                    }
                    var hands = [];
                    if (newBatsmen.length != 0) {
                      var hands = Array.from(new Set(batsmen.map(function(d) {
                          return scope.dictionary[d.toString()]["hand"];
                      })));
                    }

                    leftBat.style("opacity", 0);
                    rightBat.style("opacity", 0);
                    if (hands.length == 1) {
                        if (hands[0] == "Left") {
                            leftBat.style("opacity", 1);
                        } else {
                            rightBat.style("opacity", 1);
                        }
                    }
                  })
              })
          })

        }
    }
})
