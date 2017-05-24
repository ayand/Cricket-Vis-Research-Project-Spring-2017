angular.module('myApp').directive('stumps', function() {
    var svgDimension = 580;


    return {
        restrict: 'EA',
        scope: {
            balls: '=',
            dictionary: '='
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
                  return d.wicket == true && d.extras_type != "Nb";
              }

              var idealRadius = 3;

              /*function zoom() {
                  //Geometric zoom
                  d3.select(this).attr("transform", d3.event.transform);

                  //This part onwards is an attempt at semantic; will almsot definitely need improvement
                  var dots = vis.selectAll(".dot");
                  dots.attr("r", function() {
                      //console.log(d3.event)
                      idealRadius = (3 / d3.event.transform.k) + 0.25
                      return idealRadius;
                  });
              }*/

          var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return tooltipText(d); });
          vis.call(tip);

          var window = vis.append("g")
              //.call(d3.zoom().scaleExtent([1, 24]).translateExtent([[0,0], [svgDimension, svgDimension]]).on("zoom", zoom))

          //vis.call(d3.zoom().scaleExtent([1, 12]).translateExtent([[0,0], [svgDimension, svgDimension]]).on("zoom", zoom))

          window.append("rect")
              .attr("width", svgDimension)
              .attr("height", svgDimension)
              .attr("x", 0)
              .attr("y", 0)
              .attr("fill", "#CCCCCC")

          window.append("rect")
              .attr("height", 137.46)
              .attr("width", 7.366)
              .attr("x", ((svgDimension / 2) - 3.683))
              .attr("y", (svgDimension - 137.46))
              .attr("rx", 4)
              .attr("rx", 4)
              .attr("fill", "#B07942");

          window.append("rect")
              .attr("height", 137.46)
              .attr("width", 7.366)
              .attr("x", ((svgDimension / 2) - 22.1366666667))
              .attr("y", (svgDimension - 137.46))
              .attr("rx", 4)
              .attr("rx", 4)
              .attr("fill", "#B07942");

          window.append("rect")
              .attr("height", 137.46)
              .attr("width", 7.366)
              .attr("x", ((svgDimension / 2) + 14.7706666667))
              .attr("y", (svgDimension - 137.46))
              .attr("rx", 4)
              .attr("rx", 4)
              .attr("fill", "#B07942");

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

          var ballX = d3.scaleLinear().range([0, svgDimension]);
          var ballY = d3.scaleLinear().range([svgDimension, 0])
          ballX.domain([-1.5, 1.5]);
          ballY.domain([0, 3]);

          var validBalls = scope.balls.filter(function(d) {
              return d["ended_x"] != null && d["ended_y"] != null
                  && d["ended_x"] >= -2 && d["ended_x"] <= 2 && d["ended_y"] <= 4;
          });

          var balls = window.selectAll(".dot")
              .data(validBalls);

          balls.enter().append("circle")
              .attr("class", "dot")
              .attr("cx", function(d) {
                  return ballX(d["ended_x"]);
              })
              .attr("cy", function(d) {
                return ballY(d["ended_y"]);

              })
              .attr("r", idealRadius) //Previous value: 3.5
              .attr("fill", function(d) {
                if (isWicketBall(d)) {
                    return "black";
                } else {
                    if (d.runs_batter == 0 && d.extras_type != "Wd" && d.extras_type != "Nb") {
                        return "#999999";
                    } else {
                        if (d.extras_type != "") {
                            return "#FF8000";
                        } else {
                            if (d.runs_batter < 4) {
                              return "#00CCCC";
                            } else {
                                return "#0000FF";
                            }
                        }
                    }
                }
              })

        }
    }
})
