angular.module('myApp').directive('groundChart', function() {

    var svgDimension = 580;
    var innerRadius = (svgDimension / 2) - 30;
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
      ["#FFF7BC"],
      ["#FFF7BC", "#D95F0E"],
      ["#FFF7BC", "#FEC44F", "#D95F0E"],
      ["#FFFFD4", "#FED98E", "#FE9929", "#CC4C02"],
      ["#FFFFD4", "#FED98E", "#FE9929", "#D95F0E", "#993404"],
      ["#FFFFD4", "#FEE391", "#FEC44F", "#FE9929", "#D95F0E", "#993404"],
      ["#FFFFD4", "#FEE391", "#FEC44F", "#FE9929", "#EC7014", "#CC4C02", "#8C2D04"],
      ["#FFFFE5", "#FFF7BC", "#FEE391", "#FEC44F", "#FE9929", "#EC7014", "#CC4C02", "#8C2D04"]
    ];

    return {
        restrict: 'EA',
        scope: {
          balls: '=',
          batsmen: '=',
          bowlers: '=',
          min: '=',
          max: '=',
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
              .attr("fill", "#40DA69");

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
                .attr("fill", "white")
                .style("stroke", "#CCCCCC")
                .attr("d", arc1);

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
              .attr("fill", "#FFFFFF")
              .attr("d", arc2);

              var selectedZone = 0;
              var idealRadius = 2.5;

              var tip = d3.tip().attr('class', 'd3-tip');
              vis.call(tip);

              var className = (scope.balls[0].inning == 1) ? ".ballBar1" : ".ballBar2";

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
                  });

                  scope.$watchCollection('batsmen', function(newBatsmen, oldBatsmen) {
                      scope.$watchCollection('bowlers', function(newBowlers, oldBowlers) {
                          scope.$watch('min', function(newMin, oldMin) {
                              scope.$watch('max', function(newMax, oldMax) {
                                  var consideredBalls = scope.balls.filter(function(dot) {
                                      var batsmanCondition = true;
                                      if (newBatsmen.length != 0) {
                                          batsmanCondition = newBatsmen.includes(dot.batsman);
                                      }
                                      var bowlerCondition = true;
                                      if (newBowlers.length != 0) {
                                          bowlerCondition = newBowlers.includes(dot.bowler);
                                      }
                                      var over = Math.floor(dot.ovr) + 1;
                                      var overCondition = ((over >= newMin) && (over <= newMax));
                                      return batsmanCondition && bowlerCondition && overCondition && (dot.z != 0);
                                  });

                                  var zoneScores = [0, 0, 0, 0, 0, 0, 0, 0];

                                  consideredBalls.forEach(function(d) {
                                      var zone = correctZone(d.z) - 1;
                                      zoneScores[zone] += d.runs_w_extras;
                                  });

                                  var scoreSet = Array.from(new Set(zoneScores));
                                  scoreSet.sort(function(a, b) {
                                      return a - b;
                                  })

                                  var list = scoreSet.length - 1;

                                  d3.selectAll(".zone-path")
                                      .attr("fill", function(d, i) {
                                          var score = zoneScores[i];
                                          return colorScales[list][scoreSet.indexOf(score)];
                                      })
                                      .style("stroke", "#CCCCCC")
                                      .on("mouseover", function(d, i) {
                                          //console.log(zoneScores[i])
                                      });
                              })
                          })
                      })
                  })
        }
    }
})
