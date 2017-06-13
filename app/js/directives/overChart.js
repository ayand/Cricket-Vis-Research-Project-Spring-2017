'use strict';

angular.module('myApp')
.directive('overChart', function() {
  var margin = 20;
  var height = 450;
  var width = 720;
  var ballBuffer = 2;

  return {
    restrict: 'E',
    scope: {
      val: '=',
      dictionary: '=',
      min: '=',
      max: '=',
      hoverswitch: '=',
    },
    link: function (scope, element, attrs) {
      var vis = d3.select(element[0])
        .append("svg")
          .attr("width", width)
          .attr("height", height);

      //var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);




      var overNumbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
          21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,
          44,45,46,47,48,49,50];

      var overs = d3.scaleBand().range([margin, (width - margin)]);
      //console.log("Overs: " + overs);
      overs.domain(overNumbers);

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

      var isWicketBall = function(d) {
          return d.wicket == true && d.extras_type != "Nb";
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

      var barHeight = function(d) {
        if (d.runs_batter <= 1) {
            return 12;
        } else if (d.runs_batter == 2) {
            return 24;
        } else if (d.runs_batter == 3) {
            return 36;
        } else if (d.runs_batter == 4) {
            return 48;
        } else if (d.runs_batter == 5) {
            return 60;
        } else {
            return 72;
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
          var line1 = "<strong>Over " + overNumber + ", Ball " + ballNumber + "</strong><br/>";
          var line2 = batsman + ": " + runs + " " + score + "<br/>"
          var line3 = "Bowled by " + bowler + "<br/>";
          var line4 = !isWicketBall(d) ? "" : ("Wicket- " + scope.dictionary[d.who_out.toString()]["name"] + " (" + d.wicket_method + ")");
          var tooltipText = (line1 + line2 + line3 + line4);
          return tooltipText;
      }

      var className = (scope.val[0].inning == 1) ? "ballBar1" : "ballBar2";

      var bottomBoundaries = {};

      for (var i = 1; i <= 50; i += 1) {
          bottomBoundaries[i.toString()] = (height - margin - ballBuffer);
      }

      var tip = d3.tip().attr('class', 'd3-tip');
      vis.call(tip);

      var bars = vis.selectAll('.' + className)
          .data(scope.val);

      bars.enter().append("rect")
          .attr("class", className)
          .attr("fill", function(d) {
            return decideColor(d);
          })
          .attr("x", function(d) {
              return overs(Math.floor(d.ovr) + 1);
          })
          .attr("rx", function(d) {
              return 4;
          })
          .attr("ry", function(d) {
              return 4;
          })
          .attr("width", overs.bandwidth())
          .attr("y", function(d) {
              var overNumber = Math.floor(d.ovr) + 1;
              var bottomBoundary = bottomBoundaries[overNumber.toString()];
              var height = barHeight(d);
              var startingPoint = bottomBoundary - height + ballBuffer;
              bottomBoundaries[overNumber.toString()] -= (height + ballBuffer);
              return startingPoint;
          })
          .attr("height", function(d) {
              return barHeight(d);
          })
          .attr("stroke", "#cccccc")

      var overAxis = d3.axisBottom(overs);
      overAxis.tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
      vis.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + (height - margin) + ")")
          .call(overAxis)

          //console.log(scope.hoverswitch)

            scope.$watch('min', function(newMin, oldMin) {
                scope.$watch('max', function(newMax, oldMax) {

                  d3.selectAll('.' + className).style("opacity", function(d) {
                          //console.log('i: ' + i);
                          //console.log('changing');
                          var over = Math.floor(d.ovr) + 1;
                          if (over >= newMin && over <= newMax) {
                              //console.log('not fading');
                              return 1;
                          } else {
                              //console.log('fading');
                              return 0.2;
                          }
                      })
                })
            })

            scope.$watch('hoverswitch', function(newVal, oldVal) {
                //console.log(newVal);
                if (newVal) {
                  d3.selectAll('.' + className)
                    .on("mouseover", function(d) {
                        var over = Math.floor(d.ovr) + 1;
                        if (over >= scope.min && over <= scope.max) {
                          d3.selectAll('.' + className)
                              .style("opacity", function(ball) {
                                  if (d == ball) {
                                      return 1;
                                  } else {
                                      return 0.2;
                                  }
                              });

                          d3.selectAll('.dot').style('opacity',function(dot){
                              if(d==dot || d.inning != dot.inning){
                                  return 1;
                              }else{
                                  return 0.2;
                              }
                          });
                          tip.html(tooltipText(d)).show();
                        }
                    })
                    .on("mouseout", function() {
                        d3.selectAll('.' + className)
                          .style("opacity", function(ball) {
                            var over = Math.floor(ball.ovr) + 1;
                            if (over >= scope.min && over <= scope.max) {
                                //console.log('not fading');
                                return 1;
                            } else {
                                //console.log('fading');
                                return 0.2;
                            }
                          });
                        d3.selectAll(".dot").style("opacity", 1);
                        tip.hide();
                    });
                } else {
                  d3.selectAll('.' + className)
                    .on("mouseover", function() {
                        return;
                    })
                    .on("mouseout", function() {
                        return;
                    })
                }
            })
    }
  }
})
