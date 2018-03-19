angular.module('myApp').directive('generateBallVis', function() {
  var svgDimension = 330;

  var convertDimension = function(d) {
      return ((d * svgDimension) / 580);
  }

  var trueHeight = convertDimension(541.44);
  var trueWidth = convertDimension(87.84);
  var height = convertDimension(482.88); // 442.64
  var width = convertDimension(73.2);
  var pitchStartX = (svgDimension / 2) - (width / 2);
  var pitchStartY = (svgDimension / 2) - (height / 2);
  var trueX = (svgDimension / 2) - (trueWidth / 2);
  var trueY = (svgDimension / 2) - (trueHeight / 2);
  var radiusDifference = convertDimension(30);
  var innerRadius = (svgDimension / 2) - radiusDifference;
  var bottomEnd = (svgDimension / 2) - innerRadius;
  var topEnd = (svgDimension / 2) + innerRadius;
   // 67.1

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
          dictionary: '=',
          zoneColors: '='
      },
      link: function(scope, element, attrs) {
        var selectedZone = 0;
        var zoneColors = [];

        scope.$watchCollection('zoneColors', function(newZones, oldZones) {
            zoneColors = newZones;
        })

        var pitchVis = d3.select("#pitch")
          .append("svg")
            .attr("width", svgDimension)
            .attr("height", svgDimension)

        var stumpVis = d3.select("#stumps")
          .append("svg")
            .attr("width", svgDimension)
            .attr("height", svgDimension);

        var groundVis = d3.select("#ground")
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
            var line1 = "<strong>Over " + overNumber + ", Ball " + ballNumber + "</strong><br/>";
            var line2 = batsman + ": " + runs + " " + score + "<br/>"
            var line3 = "Bowled by " + bowler + "<br/>";
            var line4 = !isWicketBall(d) ? "" : ("Wicket- " + scope.dictionary[d.who_out.toString()]["name"] + " (" + d.wicket_method + ")");
            var tooltipText = (line1 + line2 + line3 + line4);
            return tooltipText;
        }

        var correctZone = function(zone) {
            if (zone <= 4) {
                return 5 - zone;
            } else {
                return 13 - zone;
            }
        }

        var leftPitchX = -1;
        var rightPitchX = -1;
        var topPitchY = -1;
        var bottomPitchY = -1;

        var leftStumpX = -1;
        var rightStumpX = -1;
        var topStumpY = -1;
        var bottomStumpY = -1;

        var leftGroundX = -1;
        var rightGroundX = -1;
        var topGroundY = -1;
        var bottomGroundY = -1;

        var pitchX = d3.scaleLinear().range([((svgDimension / 2) - (width / 2)), ((svgDimension / 2) + (width / 2))]);
        var pitchY = d3.scaleLinear().range([((svgDimension / 2) - (height / 2)) - (convertDimension(24)), ((svgDimension / 2) + (height / 2))])
        pitchX.domain([-1.525, 1.525]);
        pitchY.domain([-1, 20.12]);

        var stumpX = d3.scaleLinear().range([0, svgDimension]);
        var stumpY = d3.scaleLinear().range([svgDimension, 0])
        stumpX.domain([-1.5, 1.5]);
        stumpY.domain([0, 3]);

        var groundExtension = convertDimension(10);
        var groundX = d3.scaleLinear().range([bottomEnd + groundExtension, topEnd - groundExtension]).domain([0, 360]);
        var groundY = d3.scaleLinear().range([topEnd - groundExtension, bottomEnd + groundExtension]).domain([0, 360]);

        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return tooltipText(d); });
        pitchVis.call(tip);
        stumpVis.call(tip);
        groundVis.call(tip);

        pitchVis.append("rect")
            .attr("class", "pitch")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", svgDimension)
            .attr("height", svgDimension)
            .attr("fill", "#FFFFFF");

        var pitch = pitchVis.append("g")
            .call(d3.zoom().scaleExtent([1, 12]).translateExtent([[0,0], [svgDimension, svgDimension]]).on("zoom", zoom))

        pitch.append("rect")
            .attr("class", "pitch")
            .attr("x", trueX)
            .attr("y", trueY)
            .attr("width", trueWidth)
            .attr("height", trueHeight)
            .attr("fill", "#B07942");

        pitch.append("rect")
            .attr("x", trueX)
            .attr("y", trueY)
            .attr("width", trueWidth)
            .attr("height", convertDimension(58.56))
            .style("stroke", "white")
            .style("fill-opacity", 0);

        pitch.append("rect")
            .attr("x", trueX)
            .attr("y", trueY + convertDimension(482.88))
            .attr("width", trueWidth)
            .attr("height", convertDimension(58.56))
            .style("stroke", "white")
            .style("fill-opacity", 0);

        pitch.append("rect")
            .attr("x", trueX + convertDimension(12.24))
            .attr("y", trueY)
            .attr("width", convertDimension(63.36))
            .attr("height", convertDimension(29.28))
            .style("stroke", "white")
            .style("fill-opacity", 0);

        pitch.append("rect")
            .attr("x", trueX + convertDimension(12.24))
            .attr("y", trueY + convertDimension(29.28))
            .attr("width", convertDimension(63.36))
            .attr("height", convertDimension(29.28))
            .style("stroke", "white")
            .style("fill-opacity", 0);

        pitch.append("rect")
            .attr("x", trueX + (convertDimension(12.24)))
            .attr("y", trueY + convertDimension(482.88))
            .attr("width", convertDimension(63.36))
            .attr("height", convertDimension(29.28))
            .style("stroke", "white")
            .style("fill-opacity", 0);

        pitch.append("rect")
            .attr("x", trueX + (convertDimension(12.24)))
            .attr("y", trueY + convertDimension(512.16))
            .attr("width", convertDimension(63.36))
            .attr("height", convertDimension(29.28))
            .style("stroke", "white")
            .style("fill-opacity", 0);

        pitch.append("circle")
            .attr("cx", (svgDimension / 2))
            .attr("cy", (trueY + (convertDimension(29.28))))
            .attr("r", convertDimension(3.6))
            .attr("fill", "#FAE3A1");

        pitch.append("circle")
            .attr("cx", (svgDimension / 2) - convertDimension(9))
            .attr("cy", (trueY + (convertDimension(29.28))))
            .attr("r", convertDimension(3.6))
            .attr("fill", "#FAE3A1");

        pitch.append("circle")
            .attr("cx", (svgDimension / 2) + convertDimension(9))
            .attr("cy", (trueY + (convertDimension(29.28))))
            .attr("r", convertDimension(3.6))
            .attr("fill", "#FAE3A1");

        pitch.append("circle")
            .attr("cx", (svgDimension / 2))
            .attr("cy", (trueY + (convertDimension(512.16))))
            .attr("r", convertDimension(3.6))
            .attr("fill", "#FAE3A1");

        pitch.append("circle")
            .attr("cx", (svgDimension / 2) - convertDimension(9))
            .attr("cy", (trueY + (convertDimension(512.16))))
            .attr("r", convertDimension(3.6))
            .attr("fill", "#FAE3A1");

        pitch.append("circle")
            .attr("cx", (svgDimension / 2) + convertDimension(9))
            .attr("cy", (trueY + (convertDimension(512.16))))
            .attr("r", convertDimension(3.6))
            .attr("fill", "#FAE3A1");

            var stumpWindow = stumpVis.append("g")

            stumpWindow.append("rect")
                .attr("width", svgDimension)
                .attr("height", svgDimension)
                .attr("x", 0)
                .attr("y", 0)
                .attr("fill", "#FFFFFF")

            stumpWindow.append("rect")
                .attr("height", convertDimension(137.46))
                .attr("width", convertDimension(7.366))
                .attr("x", ((svgDimension / 2) - convertDimension(3.683)))
                .attr("y", (svgDimension - convertDimension(137.46)))
                .attr("rx", convertDimension(4))
                .attr("ry", convertDimension(4))
                .attr("fill", "#FAE3A1");

            stumpWindow.append("rect")
                .attr("height", convertDimension(137.46))
                .attr("width", convertDimension(7.366))
                .attr("x", ((svgDimension / 2) - convertDimension(22.1366666667)))
                .attr("y", (svgDimension - convertDimension(137.46)))
                .attr("rx", convertDimension(4))
                .attr("ry", convertDimension(4))
                .attr("fill", "#FAE3A1");

            stumpWindow.append("rect")
                .attr("height", convertDimension(137.46))
                .attr("width", convertDimension(7.366))
                .attr("x", ((svgDimension / 2) + convertDimension(14.7706666667)))
                .attr("y", (svgDimension - convertDimension(137.46)))
                .attr("rx", convertDimension(4))
                .attr("ry", convertDimension(4))
                .attr("fill", "#FAE3A1");

            stumpWindow.append("rect")
                .attr("width", convertDimension(20))
                .attr("height", convertDimension(4))
                .attr("x", (svgDimension / 2))
                .attr("y", (svgDimension - convertDimension(138.793333333)))
                .attr("rx", convertDimension(3))
                .attr("ry", convertDimension(3))
                .attr("fill", "#683F16");

            stumpWindow.append("rect")
                .attr("width", convertDimension(20))
                .attr("height", convertDimension(4))
                .attr("x", ((svgDimension / 2) - convertDimension(20)))
                .attr("y", (svgDimension - convertDimension(138.793333333)))
                .attr("rx", convertDimension(3))
                .attr("ry", convertDimension(3))
                .attr("fill", "#683F16");

            var leftBat = stumpWindow.append("g")
                .attr("class", "left-bat");

            leftBat.append("rect")
                .attr("x", convertDimension(50))
                .attr("y", 0)
                .attr("width", convertDimension(11.25))
                .attr("height", convertDimension(35))
                .attr("fill", "#6F5E25");

            leftBat.append("rect")
                .attr("x", convertDimension(44.625))
                .attr("y", convertDimension(33))
                .attr("width", convertDimension(20))
                .attr("height", convertDimension(90))
                .attr("rx", convertDimension(4))
                .attr("ry", convertDimension(4))
                .attr("fill", "#6F5E25");

            leftBat.append("text")
                .attr("x", convertDimension(54.625))
                .attr("y", convertDimension(80))
                .attr("dy", ".35em")
                .attr("font-family", "sans-serif")
                .attr("fill", "white")
                .style("font-weight", "bold")
                .style("text-anchor", "middle")
                .text("L");

            var rightBat = stumpWindow.append("g")
                .attr("class", "right-bat");

            rightBat.append("rect")
                .attr("x", convertDimension(518.75))
                .attr("y", 0)
                .attr("width", convertDimension(11.25))
                .attr("height", convertDimension(35))
                .attr("fill", "#6F5E25");

            rightBat.append("rect")
                .attr("x", convertDimension(513.375))
                .attr("y", convertDimension(33))
                .attr("width", convertDimension(20))
                .attr("height", convertDimension(90))
                .attr("rx", convertDimension(4))
                .attr("ry", convertDimension(4))
                .attr("fill", "#6F5E25");

            rightBat.append("text")
                .attr("x", convertDimension(523.375))
                .attr("y", convertDimension(80))
                .attr("dy", ".35em")
                .attr("font-family", "sans-serif")
                .attr("fill", "white")
                .style("font-weight", "bold")
                .style("text-anchor", "middle")
                .text("R");

            var ground = groundVis.append("g")

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

                    var arcs1 = groundVis.selectAll("g.arc")
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
                    .outerRadius((svgDimension / 2) + convertDimension(175))
                    .innerRadius((svgDimension / 2) - convertDimension(3));

                var arcs2 = groundVis.selectAll("g.arc")
                    .data(pie(singleThing))
                    .enter()
                    .append("g")
                    .attr("transform", "translate(" + (svgDimension / 2) + ", "
                        + (svgDimension / 2) + ")");

                arcs2.append("path")
                    .attr("fill", "#FFFFFF")
                    .attr("d", arc2);

        var colors = ["#550000", "#770000", "#990000", "#CC0000", "#FF0000",
            "#FF5500", "#FF7700", "#FF9900"];

        var idealRadius = convertDimension(3.6);

        var lassoedItems = [];
        //var lasso = d3.lasso();

        function zoom() {
            d3.select(this).attr("transform", d3.event.transform);

            var dots = pitchVis.selectAll(".dot");
            dots.attr("r", function() {
                idealRadius = (convertDimension(3.6) / d3.event.transform.k) + convertDimension(0.25)
                return idealRadius;
            });
        }

        var isWicketBall = function(d) {
            return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
        }

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
          var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);

          return batsmanCondition && bowlerCondition && overCondition && zoneCondition;
        }

        var isSelectedBall = function(d) {
          var pitchXCondition = true;
          var pitchYCondition = true;
          if (leftPitchX != -1) {
              pitchXCondition = pitchX(d["landing_x"]) >= leftPitchX && pitchX(d["landing_x"]) <= rightPitchX;
              if (d["landing_y"] < 0) {
                  pitchYCondition = pitchY(-0.25) >= topPitchY && pitchY(-0.25) <= bottomPitchY;
              } else {
                  pitchYCondition = pitchY(d["landing_y"]) >= topPitchY && pitchY(d["landing_y"]) <= bottomPitchY;
              }
          }

          var stumpXCondition = true;
          var stumpYCondition = true;
          if (leftStumpX != -1) {
              stumpXCondition = stumpX(d["ended_x"]) >= leftStumpX && stumpX(d["ended_x"]) <= rightStumpX
              stumpYCondition = stumpY(d["ended_y"]) >= topStumpY && stumpY(d["ended_y"]) <= bottomStumpY
          }

          var groundCondition = true;
          if (!lassoedItems.length == 0) {
              groundCondition = lassoedItems.includes(d);
          }

          return pitchXCondition && pitchYCondition && stumpXCondition && stumpYCondition
              && groundCondition;
        }

        var activeClassName = (scope.balls[0].inning == 1) ? ".ballBar1" : ".ballBar2";
        var inactiveClassName = (scope.balls[0].inning == 1) ? ".ballBar2" : ".ballBar1";

        var ballMouseout = function(newMin, newMax, newBatsmen, newBowlers){
          d3.selectAll('.visibleball').style('opacity', function(d) {
              return isSelectedBall(d) ? 1 : 0.1;
          });

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
               .style("stroke", "#CCCCCC")

            d3.selectAll(activeClassName)
              .style("opacity", function(ball) {
                  if (isValidBall(ball) && isSelectedBall(ball)) {
                     return 1;
                  }
                  return 0.1
              });
          tip.hide();
        };

        var ballMouseover = function(curBall) {
          d3.selectAll('.visibleball').style('opacity',function(d){
              if(d==curBall){
                  return 1;
              }else{
                  return 0.1;
              }
          });

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

          d3.selectAll(activeClassName)
              .style('opacity', function(d) {
                  if (d == curBall) {
                      return 1;
                  } else {
                      return 0.1;
                  }
          });
          tip.html(tooltipText(curBall)).show();
        };

        var brushHighlight = function() {
          d3.selectAll(".visibleball")
              .style("opacity", function(d) { return isSelectedBall(d) ? 1 : 0.1; })
              .classed("brushedBall", function(d) { return isSelectedBall(d); })
              .on("mouseover", function(d) {
                  if (isSelectedBall(d)) {
                      ballMouseover(d);
                  }
              })
              .on("mouseout", function() {
                  ballMouseout(scope.min, scope.max, scope.batsmen, scope.bowlers);
              })

          d3.selectAll(activeClassName)
              .style("opacity", function(d) { return isValidBall(d) && isSelectedBall(d) ? 1 : 0.1 })
              .on("mouseover", function(d) {
                  if (isValidBall(d) && isSelectedBall(d)) {
                      ballMouseover(d);
                  }
              })
              .on("mouseout", function(d) {
                  if (isValidBall(d) && isSelectedBall(d)) {
                      ballMouseout(scope.min, scope.max, scope.batsmen, scope.bowlers);
                  }
              })
              .classed("brushedBar", function(d) { return isValidBall(d) && isSelectedBall(d); })
        }

        var brushstart = function() {
            console.log("Starting")
        }

        var pitchBrushMove = function() {
          var e = d3.event.selection;
          if (e) {
              leftPitchX = e[0][0];
              rightPitchX = e[1][0];
              topPitchY = e[0][1];
              bottomPitchY = e[1][1];
              brushHighlight();
          }
        }

        var pitchBrushEnd = function() {
          if (!d3.event.selection) {
            leftPitchX = -1;
            rightPitchX = -1;
            topPitchY = -1;
            bottomPitchY = -1;
            brushHighlight();
          }
        }

        var stumpBrushMove = function() {
          var e = d3.event.selection;
          if (e) {
              leftStumpX = e[0][0];
              rightStumpX = e[1][0];
              topStumpY = e[0][1];
              bottomStumpY = e[1][1];
              brushHighlight();
          }
        }

        var stumpBrushEnd = function() {
          if (!d3.event.selection) {
            leftStumpX = -1;
            rightStumpX = -1;
            topStumpY = -1;
            bottomStumpY = -1;
            brushHighlight();
          }
        }

        var lasso_start = function() {
            console.log("Lasso starting");
        }

        var lasso_draw = function() {
            console.log("Drawing");
        }

        var lasso_end = function() {
          lasso.selectedItems()
              .each(function(d) {
                  if (!lassoedItems.includes(d)) {
                      lassoedItems.push(d);
                  }
              });

          lasso.notSelectedItems()
              .each(function(d) {
                  if (lassoedItems.includes(d)) {
                      var index = lassoedItems.indexOf(d);
                      lassoedItems.splice(index, 1);
                  }
              });

          brushHighlight();
        }

        var pitchBrush = d3.brush()
            .extent([[trueX, trueY], [(trueX + trueWidth), (trueY + trueHeight)]])
            .on("start", brushstart)
            .on("brush", pitchBrushMove)
            .on("end", pitchBrushEnd);

        var stumpBrush = d3.brush()
            .extent([[0, 0], [svgDimension, svgDimension]])
            .on("start", brushstart)
            .on("brush", stumpBrushMove)
            .on("end", stumpBrushEnd);

        var validPitchBalls = scope.balls.filter(function(d) {
            return d["landing_x"] != null && d["landing_y"] != null;
        });

        var pitchBrushArea = pitch.append("g")
            .attr("class", "brush")
            .call(pitchBrush);

        var pitchBalls = pitch.selectAll(".dot")
            .data(validPitchBalls);

        pitchBalls.enter().append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) {
                return pitchX(d["landing_x"]);
            })
            .attr("cy", function(d) {
              if (d["landing_y"] < 0) {
                  return pitchY(-0.25);
              } else {
                  return pitchY(d["landing_y"]);
              }
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

            var validStumpBalls = scope.balls.filter(function(d) {
                return d["ended_x"] != null && d["ended_y"] != null
                    && d["ended_x"] >= -2 && d["ended_x"] <= 2 && d["ended_y"] <= 4;
            });

            var stumpBrushArea = stumpWindow.append("g")
                .attr("class", "brush")
                .call(stumpBrush);

            var stumpBalls = stumpWindow.selectAll(".dot")
                .data(validStumpBalls);

            stumpBalls.enter().append("circle")
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

                var validGroundBalls = scope.balls.filter(function(d) {
                    return d["x"] != null && d["y"] != null;
                });

                var groundBalls = ground.selectAll(".dot")
                    .data(validGroundBalls)
                    .enter().append("circle")
                    .attr("class", "dot")
                    .attr("cx", function(d) {
                        return groundX(d["x"]);
                    })
                    .attr("cy", function(d) {
                        return groundY(d["y"]);
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
                    });

            brushHighlight();

            var lasso = d3.lasso().closePathSelect(true)
                .closePathDistance(100)
                .items(groundBalls)
                .targetArea(ground)
                .on("start", lasso_start)
                .on("draw", lasso_draw)
                .on("end", lasso_end);

            ground.call(lasso);

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

                        //console.log("Resetting zone colors");
                        var zColors = [];
                        d3.selectAll(".zone-path")
                            .attr("fill", function(d, i) {
                                var score = zoneScores[i];
                                zColors.push(colorScales[list][scoreSet.indexOf(score)])
                                return colorScales[list][scoreSet.indexOf(score)];
                            })
                            .style("stroke", "#CCCCCC")

                        scope.$emit('zoneColors', zColors);

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
                        console.log(hands);
                        leftBat.style("opacity", 0);
                        rightBat.style("opacity", 0);
                        if (hands.length == 1) {
                            if (hands[0] == "Left") {
                                leftBat.style("opacity", 1);
                            } else {
                                rightBat.style("opacity", 1);
                            }
                        } else {
                          leftBat.style("opacity", 1);
                          rightBat.style("opacity", 1);
                        }
                        selectedZone = 0;
                        d3.selectAll(".dot")
                            .on("mouseover", function(d) {
                                if (isSelectedBall(d)) {
                                    ballMouseover(d);
                                }
                            })
                            .on("mouseout", function(d) {
                                if (isSelectedBall(d)) {
                                    ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                                }
                            })
                            .classed("visibleball",function(d){
                                return isValidBall(d);
                            })
                            .classed("invisibleball", function(d) {
                              return !isValidBall(d);
                            })
                            .style("opacity", function(d) {
                                return isSelectedBall(d) ? 1 : 0.1;
                            });

                            d3.selectAll(activeClassName)
                                .style("opacity", function(ball) {
                                    if (isValidBall(ball) && isSelectedBall(ball)) {
                                       return 1;
                                    }
                                    return 0.1;
                                })
                                .on("mouseover", function(d) {
                                  if (isValidBall(d)  && isSelectedBall(d)) {
                                      console.log("True")
                                      ballMouseover(d);
                                  } else {
                                      console.log("False")
                                  }
                                })
                                .on("mouseout", function(d) {
                                  if (isValidBall(d)  && isSelectedBall(d)) {
                                    ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                                  }
                                });

                            if (selectedZone != 0) {
                                zoneColors = [];
                                d3.selectAll(".zone-path")._groups[0].forEach(function(e) {
                                    zoneColors.push(e.attributes.fill.value);
                                });
                                d3.selectAll(".zone-path")
                                    .attr("fill", function(path, i) {
                                        if (selectedZone == path.data.zone) {
                                            return zoneColors[i];
                                        } else {
                                            return 'gray';
                                        }
                                })
                            }

                            d3.selectAll(".zone-path").on("click", function(d, index) {
                                if (selectedZone == d.data.zone) {
                                    selectedZone = 0;
                                    d3.selectAll(".zone-path")
                                        .attr("fill", function(path, i) {
                                          console.log("Changing color")
                                            return zoneColors[i];
                                        })
                                        .style('stroke', '#CCCCCC');
                                    d3.selectAll(".dot")
                                        .classed("visibleball",function(d){
                                            return isValidBall(d);
                                        })
                                        .classed("invisibleball", function(d) {
                                            return !isValidBall(d);
                                        })
                                        .style("opacity", function(d) {
                                            return isSelectedBall(d) ? 1 : 0.1
                                        })

                                    d3.selectAll(activeClassName)
                                      .style("opacity",function(d){
                                        if (isValidBall(d) && isSelectedBall(d)) {
                                            return 1;
                                        }
                                        return 0.1;
                                      })
                                      .on("mouseover", function(d) {
                                        if (isValidBall(d) && isSelectedBall(d)) {
                                            ballMouseover(d);
                                        } else {
                                            return;
                                        }
                                      })
                                      .on("mouseout", function(d) {
                                        if (isValidBall(d) && isSelectedBall(d)) {
                                          ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                                        }
                                      });
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
                                    .classed("visibleball",function(d){
                                        return isValidBall(d);
                                    })
                                    .classed("invisibleball", function(d) {
                                        return !isValidBall(d);
                                    })
                                    .style("opacity", function(d) { return isSelectedBall(d) ? 1 : 0.1 })

                                    d3.selectAll(activeClassName)
                                      .style("opacity",function(d){
                                        if (isValidBall(d) && isSelectedBall(d)) {
                                            return 1;
                                        }
                                        return 0.1;
                                      })
                                      .on("mouseover", function(d) {
                                        if (isValidBall(d) && isSelectedBall(d)) {
                                            console.log("Hovering!")
                                            ballMouseover(d);
                                        }
                                      })
                                      .on("mouseout", function(d) {
                                        if (isValidBall(d) && isSelectedBall(d)) {
                                          ballMouseout(newMin, newMax, newBatsmen, newBowlers);
                                        }
                                      });
                                }
                            });

                            d3.selectAll(inactiveClassName)
                                .on("mouseover", function(d) {
                                    return;
                                })
                                .on("mouseout", function() {
                                    return;
                                })

                            brushHighlight();
                        });
                    });
                });
            });
      }
  }
})
