angular.module('myApp').directive('groundMatchup', function() {
    var svgDimension = 300;
    var convertDimension = function(d) {
        return ((d * svgDimension) / 580);
    }
    var innerRadius = (svgDimension / 2) - convertDimension(30);
    var bottomEnd = (svgDimension / 2) - innerRadius;
    var topEnd = (svgDimension / 2) + innerRadius;

    var correctZone = function(zone) {
        if (zone <= 4) {
            return 5 - zone;
        } else {
            return 13 - zone;
        }
    }

    var colorScales = [
      ["#ADCCFF"],
      ["#ADCCFF", "#95BEF3"],
      ["#ADCCFF", "#95BEF3", "#7EAFE7"],
      ["#ADCCFF", "#95BEF3", "#7EAFE7", "#66A1DB"],
      ["#ADCCFF", "#95BEF3", "#7EAFE7", "#66A1DB", "#4F93D0"],
      ["#ADCCFF", "#95BEF3", "#7EAFE7", "#66A1DB", "#4F93D0", "#3785C4"],
      ["#ADCCFF", "#95BEF3", "#7EAFE7", "#66A1DB", "#4F93D0", "#3785C4", "#2076B8"],
      ["#ADCCFF", "#95BEF3", "#7EAFE7", "#66A1DB", "#4F93D0", "#3785C4", "#2076B8", "#0868AC"]
    ];

    return {
        restrict: 'EA',
        scope: {
            balls: '=',
            dictionary: '=',
            games: '=',
            game: '='
        },
        link: function(scope, element, attrs) {
            var vis = d3.select(element[0])
                .append("svg")
                .attr("width", svgDimension)
                .attr("height", svgDimension);

            var selectedZone = 0;
            var zoneColors = [];

            var ground = vis.append("g");

          ground.append("rect")
              .attr("class", "ground")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", svgDimension)
              .attr("height", svgDimension)
              .attr("fill", "#40DA69");

          ground.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (svgDimension / 2))
              .attr("r", innerRadius - convertDimension(10))
              .attr("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (svgDimension / 2))
              .attr("r", convertDimension(91.44))
              .attr("stroke", "white")
              .style("fill-opacity", 0);

          ground.append("rect")
              .attr("height", convertDimension(75.2))
              .attr("width", convertDimension(12.2))
              .attr("x", (svgDimension / 2) - convertDimension(6.1))
              .attr("y", (svgDimension / 2) - convertDimension(37.6))
              .attr("fill", "#B07942");

          var ballX = d3.scaleLinear().range([bottomEnd + convertDimension(10), topEnd - convertDimension(10)]).domain([0, 360]);
          var ballY = d3.scaleLinear().range([topEnd - convertDimension(10), bottomEnd + convertDimension(10)]).domain([0, 360]);

          var reverseX = d3.scaleLinear().range([0, 360]).domain([bottomEnd + convertDimension(10), topEnd - convertDimension(10)])
          var reverseY = d3.scaleLinear().range([360, 0]).domain([bottomEnd + convertDimension(10), topEnd - convertDimension(10)])

          var brushStart = function() {}

          var leftX = null;
          var rightX = null;
          var topY = null;
          var bottomY = null;

          var brushMove = function() {
            var e = d3.event.selection;
            if (e) {
                leftX = reverseX(e[0][0]);
                rightX = reverseX(e[1][0]);
                topY = reverseY(e[1][1]);
                bottomY = reverseY(e[0][1]);
            }
          }

          var brushEnd = function() {
              console.log("BRUSH END BEING CALLED")
              if (d3.event.selection && leftX != null) {
                scope.$emit("geoFilter", {
                    "leftX": leftX,
                    "rightX": rightX,
                    "topY": topY,
                    "bottomY": bottomY,
                    "xName": "x",
                    "yName": "y"
                })
                console.log("EMITTING");
                scope.$emit("clickedPlayer", null)
                scope.$emit("currentBrush", 3)
              } else {

              }
          }

          var brush = d3.brush()
              .extent([[0, 0], [svgDimension, svgDimension]])
              .on("start", brushStart)
              .on("brush", brushMove)
              .on("end", brushEnd)

          var isWicketBall = function(d) {
              return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
          }

          var tooltipText = function(d) {
            var overNumber = Math.ceil(d.ovr);
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
            var game = scope.games.filter(function(g) { return g.match_id == d.game; })[0];
            var line1 = "Date: " + game.date.split(" ")[0] + "<br/>";
            var line2 = d.batting_team + " vs. " + d.bowling_team + "<br/>";
            var line3 = "Over " + overNumber + ", Ball " + ballNumber + "<br/>";
            var line4 = batsman + ": " + runs + " " + score + "<br/>";
            var line5 = "Bowled by " + bowler + "<br/>";;
            var line6 = !isWicketBall(d) ? "" : ("Wicket- " + scope.dictionary[d.who_out.toString()]["name"] + " (" + d.wicket_method + ")");
            var tooltipText = (line1 + line2 + line3 + line4 + line5 + line6);
            return tooltipText;
          }

            var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return tooltipText(d); });
            vis.call(tip);

            var ballMouseout = function() {
                d3.selectAll(".dot").style("opacity", 1);

                d3.selectAll(".zone-path")
                    .attr("fill", function(path, i) {
                        if (selectedZone == 0) {
                            return zoneColors[i];
                        } else {
                            if (path.data.zone == selectedZone) {
                                return zoneColors[i];
                            } else {
                                return "gray";
                            }
                        }
                    })
                    .style("stroke", "#CCCCCC");

                tip.hide();
            }

            var ballMouseover = function(curBall) {
                d3.selectAll(".dot").style("opacity", function(d) {
                    return (d == curBall) ? 1 : 0.1;
                })

                if (zoneColors.length == 0) {
                    d3.selectAll(".zone-path")._groups[0].forEach(function(e) {
                      zoneColors.push(e.attributes.fill.value);
                    });
                }

                if (curBall.z != 0) {
                    d3.selectAll(".zone-path")
                        .attr("fill", function(path, i) {
                            if (curBall.z == correctZone(path.data.zone)) {
                                return zoneColors[i];
                            } else {
                                return 'gray';
                            }
                        })
                        .style("stroke", "black")
                }

                tip.html(tooltipText(curBall)).show();
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
                .outerRadius((svgDimension / 2) - convertDimension(3))
                .innerRadius((svgDimension / 2) - convertDimension(27));

              var arcs1 = vis.selectAll("g.arc")
                .data(zoneDonut(zones))
                .enter()
                .append("g")
                .attr("transform", "translate(" + (svgDimension / 2) + ", "
                    + (svgDimension / 2) + ")");

              arcs1.append("path")
                .attr("class", "zone-path")
                .attr("fill", "white")
                .style("stroke", "#CCCCCC")
                .attr("d", arc1)
                .on("click", function(d, index) {
                    if (selectedZone == d.data.zone) {
                        selectedZone = 0;
                        d3.selectAll(".zone-path")
                            .attr("fill", function(path, i) { return zoneColors[i]; })
                            .style("stroke", "#CCCCCC");

                        d3.selectAll(".dot").style("display", "block");
                    } else {
                        if (selectedZone == 0 || zoneColors.length == 0) {
                            zoneColors = [];
                            d3.selectAll(".zone-path")._groups[0].forEach(function(e) {
                                zoneColors.push(e.attributes.fill.value);
                            });
                        }
                        selectedZone = d.data.zone;
                        d3.selectAll(".zone-path")
                            .attr("fill", function(path, i) {
                                if (selectedZone == path.data.zone) {
                                    return zoneColors[i];
                                } else {
                                    return 'gray';
                                }
                            })
                            .style("stroke", "black");

                        d3.selectAll(".dot")
                            .style("display", function(d) {
                                if (selectedZone == 0 || correctZone(selectedZone) == d.z) {
                                    return 'block';
                                } else {
                                    return 'none';
                                }
                            })
                    }
                })

          var arc2 = d3.arc()
              .outerRadius((svgDimension / 2) + convertDimension(175))
              .innerRadius((svgDimension / 2) - convertDimension(3));

          var arcs2 = vis.selectAll("g.arc")
              .data(pie(singleThing))
              .enter()
              .append("g")
              .attr("transform", "translate(" + (svgDimension / 2) + ", "
                  + (svgDimension / 2) + ")");

          arcs2.append("path")
              .attr("fill", "#FFFFFF")
              .attr("d", arc2);

              var selectedZone = 0;
              var idealRadius = convertDimension(2.5);

              scope.$watch('game', function(newVal, oldVal) {
                  if (newVal == null) {
                      vis.selectAll(".dot").style("display", "block");
                  } else {
                      vis.selectAll(".dot").style("display", function(d) {  return d.game == newVal.match_id ? "block" : "none" })
                  }
              })

          var brushArea = ground.append("g")
              .attr("class", "brush")
              .call(brush);

          scope.$on("clearBrushes", function(event, data) {
              console.log(data);
              brushArea.call(brush.move, null);

              leftX = null;
              rightX = null;
              topY = null;
              bottomY = null;
              brushArea.call(brush);
          })

          scope.$on("clearBrush3", function(event, data) {
            brushArea.call(brush.move, null);

            leftX = null;
            rightX = null;
            topY = null;
            bottomY = null;
            brushArea.call(brush);
          })

          scope.$watchCollection('balls', function(newBalls, oldBalls) {
              zoneColors = [];
              var validBalls = newBalls.filter(function(d) {
                  return d["x"] != null && d["y"] != null;
              });

              var balls = ground.selectAll(".dot")
                  .data(validBalls, function(d) { return d.delivery_number; });

              var ballsEnter = balls.enter().append("circle")
                  .attr("class", "dot")
                  .on("mouseover", function(d) { ballMouseover(d); })
                  .on("mouseout", function() { ballMouseout(); })

              balls.merge(ballsEnter)
                  .attr("cx", function(d) { return ballX(d["x"]) })
                  .attr("cy", function(d) { return ballY(d["y"]) })
                  .attr("r", idealRadius)
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

              balls.exit()
                  .attr("cx", svgDimension / 2)
                  .attr("cy", svgDimension / 2)
                  .remove();

              var zoneScores = [0,0,0,0,0,0,0,0];

              var consideredBalls = validBalls.filter(function(d) { return d.z != 0; })

              consideredBalls.forEach(function(d) {
                  var zone = correctZone(d.z) - 1;
                  zoneScores[zone] += d.runs_w_extras;
              })

              var scoreSet = Array.from(new Set(zoneScores.filter(d => d != 0)));
              scoreSet.sort(function(a, b) { return a - b; });

              var list = scoreSet.length - 1;

              d3.selectAll(".zone-path")
                  .attr("fill", function(d, i) {
                      var score = zoneScores[i];
                      if (score != 0) {
                        return colorScales[list][scoreSet.indexOf(score)];
                      }
                      return "white"
                  })
                  .style("stroke", "#CCCCCC");
          })
        }
    }
})
