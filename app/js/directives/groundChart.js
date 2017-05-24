angular.module('myApp').directive('groundChart', function() {

    var svgDimension = 580;
    var innerRadius = (svgDimension / 2) - 30;
    var bottomEnd = (svgDimension / 2) - innerRadius;
    var topEnd = (svgDimension / 2) + innerRadius;

    /*var decideColors = function(i) {
      var colors = ["#550000", "#770000", "#990000", "#CC0000", "#FF0000",
          "#FF5500", "#FF7700", "#FF9900"];

      return colors[i];
    }*/

    return {
        restrict: 'EA',
        scope: {
          balls: '=',
          /*batsmen: '=',
          bowlers: '=',
          min: '=',
          max: '=',*/
          dictionary: '='
        },
        link: function(scope, element, attrs) {
          var vis = d3.select(element[0])
            .append("svg")
              .attr("width", svgDimension)
              .attr("height", svgDimension);

          var ground = vis.append("g")

          ground.append("rect")
              .attr("class", "ground")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", svgDimension)
              .attr("height", svgDimension)
              .attr("fill", "#1DA542");

          ground.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (svgDimension / 2))
              .attr("r", innerRadius - 10)
              .attr("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (svgDimension / 2))
              .attr("r", 91.44)
              .attr("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("height", 75.2)
              .attr("width", 12.2)
              .attr("x", (svgDimension / 2) - 6.1)
              .attr("y", (svgDimension / 2) - 37.6)
              .attr("fill", "#B07942");

          var ballX = d3.scaleLinear().range([bottomEnd + 10, topEnd - 10]).domain([0, 360]);
          var ballY = d3.scaleLinear().range([topEnd - 10, bottomEnd + 10]).domain([0, 360]);

          var isWicketBall = function(d) {
              return d.wicket == true && d.extras_type != "Nb";
          }

          var singleThing = [{ "amount": 1 }]

          var pie = d3.pie()
              .value(function(d) {
                  return d.amount;
              })
              var zones = [
                  { "zone": 1, "amount": 1 },
                  { "zone": 2, "amount": 1 },
                  { "zone": 3, "amount": 1 },
                  { "zone": 4, "amount": 1 },
                  { "zone": 5, "amount": 1 },
                  { "zone": 6, "amount": 1 },
                  { "zone": 7, "amount": 1 },
                  { "zone": 8, "amount": 1 }
              ];

              var zoneDonut = d3.pie()
                  .value(function(d) {
                      return d.amount;
                  })

              var arc1 = d3.arc()
                .outerRadius((svgDimension / 2) - 3)
                .innerRadius((svgDimension / 2) - 27);

              var arcs1 = vis.selectAll("g.arc")
                .data(zoneDonut(zones))
                .enter()
                .append("g")
                .attr("transform", "translate(" + (svgDimension / 2) + ", "
                    + (svgDimension / 2) + ")");

              arcs1.append("path")
                .attr("class", "zone-path")
                .attr("fill", "#00CCFF")
                .style("stroke", "white")
                .attr("d", arc1);

              arcs1.append("text")
                  .attr("transform", function(d) { return "translate(" + arc1.centroid(d) + ")"; })
                  .attr("dy", ".35em")
                  .attr("font-family", "sans-serif")
                  .attr("fill", "white")
                  .style("font-weight", "bold")
                  .text(function(d) { return d.data.zone; });

          var arc2 = d3.arc()
              .outerRadius((svgDimension / 2) + 175)
              .innerRadius((svgDimension / 2) - 3);

          var arcs2 = vis.selectAll("g.arc")
              .data(pie(singleThing))
              .enter()
              .append("g")
              .attr("transform", "translate(" + (svgDimension / 2) + ", "
                  + (svgDimension / 2) + ")");

          arcs2.append("path")
              .attr("fill", "#CCCCCC")
              .attr("d", arc2);

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

              var selectedZone = 0;
              var idealRadius = 2.5;

              /*var colors = ["#550000", "#770000", "#990000", "#CC0000", "#FF0000",
                  "#FF5500", "#FF7700", "#FF9900"];*/

              var tip = d3.tip().attr('class', 'd3-tip');
              vis.call(tip);

              var className = (scope.balls[0].inning == 1) ? ".ballBar1" : ".ballBar2";

              /*var ballMouseout = function(newMin, newMax){
                d3.selectAll('.dot').style('opacity',1);

                d3.selectAll(".zone-path")
                     .attr("fill", function(path, i) {
                         if (selectedZone == 0) {
                             return decideColors(i);
                         } else {
                             if (path.data.zone == selectedZone) {
                                 return decideColors(i);
                             } else {
                                 return "gray";
                             }
                         }
                     })

                d3.selectAll(className)
                    .style("opacity", function(ball) {
                        var over = Math.floor(ball.ovr) + 1;
                        if (over >= newMin && over <= newMax) {
                             //console.log('not fading');
                           return 1;
                        } else {
                           //console.log('fading');
                           return 0.2;
                        }
                    });
                tip.hide();
              };

              var ballMouseover = function(curBall){
                // console.log(curBall)
                d3.selectAll('.dot').style('opacity',function(d){
                    if(d==curBall){
                        return 1;
                    }else{
                        return 0.2;
                    }
                });

                if (curBall.z != 0) {
                  d3.selectAll(".zone-path")
                      .attr("fill", function(path, i) {
                          if (curBall.z == path.data.zone) {
                              console.log(decideColors(i));
                              return decideColors(i);
                          } else {
                              return 'gray';
                          }
                      })
                }

                d3.selectAll(className)
                    .style('opacity', function(d) {
                        if (d == curBall) {
                            return 1;
                        } else {
                            return 0.1;
                        }
                });
                tip.html(tooltipText(curBall)).show();

              };*/

              var validBalls = scope.balls.filter(function(d) {
                  return d["x"] != null && d["y"] != null;
              });

              var balls = ground.selectAll(".dot")
                  .data(validBalls);

              balls.enter().append("circle")
                  .attr("class", "dot")
                  .attr("cx", function(d) {
                      return ballX(d["x"]);
                  })
                  .attr("cy", function(d) {
                      return ballY(d["y"]);
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
