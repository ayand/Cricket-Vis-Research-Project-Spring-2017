angular.module('myApp').directive('matchupVis', function() {
  var svgDimension = 270;

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

  var correctRingZone = function(zone) {
      if (zone <= 4) {
          return zone - 1;
      } else {
          return 12 - zone;
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
          var selectedZone = 0;
          var zoneColors = [];
          var idealRadius = convertDimension(3.6);

          var pitchCanvas = d3.select("#pitchMap")
              .append("svg")
              .attr("width", svgDimension)
              .attr("height", svgDimension)

          var stumpCanvas = d3.select("#stumpMap")
              .append("svg")
              .attr("width", svgDimension)
              .attr("height", svgDimension)

          var groundCanvas = d3.select("#groundMap")
              .append("svg")
              .attr("width", svgDimension)
              .attr("height", svgDimension)

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

              var correctZone = function(zone) {
                  if (zone <= 4) {
                      return 5 - zone;
                  } else {
                      return 13 - zone;
                  }
              }

              var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return tooltipText(d); });
              pitchCanvas.call(tip);
              stumpCanvas.call(tip);
              groundCanvas.call(tip);

              var zoom = function() {

                  //console.log(d3.event.transform);
                  d3.select(this).attr("transform", d3.event.transform);

                  var dots = pitchCanvas.selectAll(".dot");
                  dots.attr("r", function() {
                      idealRadius = (convertDimension(3.6) / d3.event.transform.k) + 0.25
                      return idealRadius;
                  });
              }

              var isWicketBall = function(d) {
                  return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
              }

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

              pitchCanvas.append("rect")
                  .attr("class", "ground")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("width", svgDimension)
                  .attr("height", svgDimension)
                  .attr("fill", "#FFFFFF");

              var pitchGround = pitchCanvas.append("g")
                 .call(d3.zoom().scaleExtent([1, 12]).translateExtent([[0,0], [svgDimension, svgDimension]]).on("zoom", zoom));

          pitchGround.append("rect")
              .attr("class", "pitch")
              .attr("x", trueX)
              .attr("y", trueY)
              .attr("width", trueWidth)
              .attr("height", trueHeight)
              .attr("fill", "#B07942");

              pitchGround.append("rect")
                  .attr("x", trueX)
                  .attr("y", trueY)
                  .attr("width", trueWidth)
                  .attr("height", convertDimension(58.56))
                  .style("stroke", "white")
                  .style("fill-opacity", 0);

              pitchGround.append("rect")
                  .attr("x", trueX)
                  .attr("y", trueY + convertDimension(482.88))
                  .attr("width", trueWidth)
                  .attr("height", convertDimension(58.56))
                  .style("stroke", "white")
                  .style("fill-opacity", 0);

              pitchGround.append("rect")
                  .attr("x", trueX + convertDimension(12.24))
                  .attr("y", trueY)
                  .attr("width", convertDimension(63.36))
                  .attr("height", convertDimension(29.28))
                  .style("stroke", "white")
                  .style("fill-opacity", 0);

              pitchGround.append("rect")
                  .attr("x", trueX + convertDimension(12.24))
                  .attr("y", trueY + convertDimension(29.28))
                  .attr("width", convertDimension(63.36))
                  .attr("height", convertDimension(29.28))
                  .style("stroke", "white")
                  .style("fill-opacity", 0);

              pitchGround.append("rect")
                  .attr("x", trueX + (convertDimension(12.24)))
                  .attr("y", trueY + convertDimension(482.88))
                  .attr("width", convertDimension(63.36))
                  .attr("height", convertDimension(29.28))
                  .style("stroke", "white")
                  .style("fill-opacity", 0);

              pitchGround.append("rect")
                  .attr("x", trueX + (convertDimension(12.24)))
                  .attr("y", trueY + convertDimension(512.16))
                  .attr("width", convertDimension(63.36))
                  .attr("height", convertDimension(29.28))
                  .style("stroke", "white")
                  .style("fill-opacity", 0);

          pitchGround.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (trueY + (convertDimension(29.28))))
              .attr("r", convertDimension(3.6))
              .attr("fill", "#FAE3A1");

          pitchGround.append("circle")
              .attr("cx", (svgDimension / 2) - convertDimension(9))
              .attr("cy", (trueY + (convertDimension(29.28))))
              .attr("r", convertDimension(3.6))
              .attr("fill", "#FAE3A1");

          pitchGround.append("circle")
              .attr("cx", (svgDimension / 2) + convertDimension(9))
              .attr("cy", (trueY + (convertDimension(29.28))))
              .attr("r", convertDimension(3.6))
              .attr("fill", "#FAE3A1");

          pitchGround.append("circle")
              .attr("cx", (svgDimension / 2))
              .attr("cy", (trueY + (convertDimension(512.16))))
              .attr("r", convertDimension(3.6))
              .attr("fill", "#FAE3A1");

          pitchGround.append("circle")
              .attr("cx", (svgDimension / 2) - convertDimension(9))
              .attr("cy", (trueY + (convertDimension(512.16))))
              .attr("r", convertDimension(3.6))
              .attr("fill", "#FAE3A1");

          pitchGround.append("circle")
              .attr("cx", (svgDimension / 2) + convertDimension(9))
              .attr("cy", (trueY + (convertDimension(512.16))))
              .attr("r", convertDimension(3.6))
              .attr("fill", "#FAE3A1");

          var pitchX = d3.scaleLinear().range([((svgDimension / 2) - (width / 2)), ((svgDimension / 2) + (width / 2))]);
          var pitchY = d3.scaleLinear().range([((svgDimension / 2) - (height / 2)) - (convertDimension(24)), ((svgDimension / 2) + (height / 2))])

          pitchX.domain([-1.525, 1.525]);
          pitchY.domain([-1, 20.12]);

          var ground = groundCanvas.append("g");

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

        var groundX = d3.scaleLinear().range([bottomEnd + convertDimension(10), topEnd - convertDimension(10)]).domain([0, 360]);
        var groundY = d3.scaleLinear().range([topEnd - convertDimension(10), bottomEnd + convertDimension(10)]).domain([0, 360]);

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

            var arcs1 = groundCanvas.selectAll("g.arc")
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

        var arcs2 = groundCanvas.selectAll("g.arc")
            .data(pie(singleThing))
            .enter()
            .append("g")
            .attr("transform", "translate(" + (svgDimension / 2) + ", "
                + (svgDimension / 2) + ")");

        arcs2.append("path")
            .attr("fill", "#FFFFFF")
            .attr("d", arc2);

        var stumpWindow = stumpCanvas.append("g")

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
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("R");

        var stumpX = d3.scaleLinear().range([0, svgDimension]);
        var stumpY = d3.scaleLinear().range([svgDimension, 0])
        stumpX.domain([-1.5, 1.5]);
        stumpY.domain([0, 3]);

        var reversePitchX = d3.scaleLinear().domain([((svgDimension / 2) - (width / 2)), ((svgDimension / 2) + (width / 2))]).range([-1.525, 1.525]);
        var reversePitchY = d3.scaleLinear().domain([((svgDimension / 2) - (height / 2)) - (convertDimension(24)), ((svgDimension / 2) + (height / 2))]).range([-1, 20.12])
        var reverseGroundX = d3.scaleLinear().range([0, 360]).domain([bottomEnd + convertDimension(10), topEnd - convertDimension(10)])
        var reverseGroundY = d3.scaleLinear().range([360, 0]).domain([bottomEnd + convertDimension(10), topEnd - convertDimension(10)])
        var reverseStumpX = d3.scaleLinear().domain([0, svgDimension]).range([-1.5, 1.5]);
        var reverseStumpY = d3.scaleLinear().domain([svgDimension, 0]).range([0, 3])

        var brushStart = function() {}

        var pitchLeftX = null;
        var pitchRightX = null;
        var pitchTopY = null;
        var pitchBottomY = null;

        var stumpLeftX = null;
        var stumpRightX = null;
        var stumpTopY = null;
        var stumpBottomY = null;

        var groundLeftX = null;
        var groundRightX = null;
        var groundTopY = null;
        var groundBottomY = null;

        var pitchBrushMove = function() {
          var e = d3.event.selection;
          if (e) {
              pitchLeftX = reversePitchX(e[0][0]);
              pitchRightX = reversePitchX(e[1][0]);
              pitchTopY = reversePitchY(e[0][1]);
              pitchBottomY = reversePitchY(e[1][1]);
          }
        }

        var pitchBrushEnd = function() {
            console.log("BRUSH END BEING CALLED")
            if (d3.event.selection && pitchLeftX != null) {
              scope.$emit("geoFilter", {
                  "leftX": pitchLeftX,
                  "rightX": pitchRightX,
                  "topY": pitchTopY,
                  "bottomY": pitchBottomY,
                  "xName": "landing_x",
                  "yName": "landing_y"
              })
              console.log("Emitting");
              scope.$emit("clickedPlayer", null)
              scope.$emit("currentBrush", 1)
            } else {
              pitchLeftX = null;
              pitchRightX = null;
              pitchTopY = null;
              pitchBottomY = null;
            }
        }

        var stumpBrushMove = function() {
          var e = d3.event.selection;
          if (e) {
              stumpLeftX = reverseStumpX(e[0][0]);
              stumpRightX = reverseStumpX(e[1][0]);
              stumpTopY = reverseStumpY(e[1][1]);
              stumpBottomY = reverseStumpY(e[0][1]);
          }
        }

        var stumpBrushEnd = function() {
            console.log("BRUSH END BEING CALLED")
            if (d3.event.selection  && stumpLeftX != null) {
              scope.$emit("geoFilter", {
                  "leftX": stumpLeftX,
                  "rightX": stumpRightX,
                  "topY": stumpTopY,
                  "bottomY": stumpBottomY,
                  "xName": "ended_x",
                  "yName": "ended_y"
              })
              console.log("Emitting");
              scope.$emit("clickedPlayer", null)
              scope.$emit("currentBrush", 2)
            } else {
              stumpLeftX = null;
              stumpRightX = null;
              stumpTopY = null;
              stumpBottomY = null;
            }
        }

        var groundBrushMove = function() {
          var e = d3.event.selection;
          if (e) {
              groundLeftX = reverseGroundX(e[0][0]);
              groundRightX = reverseGroundX(e[1][0]);
              groundTopY = reverseGroundY(e[1][1]);
              groundBottomY = reverseGroundY(e[0][1]);
          }
        }

        var groundBrushEnd = function() {
            console.log("BRUSH END BEING CALLED")
            if (d3.event.selection && groundLeftX != null) {
              scope.$emit("geoFilter", {
                  "leftX": groundLeftX,
                  "rightX": groundRightX,
                  "topY": groundTopY,
                  "bottomY": groundBottomY,
                  "xName": "x",
                  "yName": "y"
              })
              console.log("EMITTING");
              scope.$emit("clickedPlayer", null)
              scope.$emit("currentBrush", 3)
            } else {
              groundLeftX = null;
              groundRightX = null;
              groundTopY = null;
              groundBottomY = null;
            }
        }

        var pitchBrush = d3.brush()
            .extent([[trueX, trueY], [(trueX + trueWidth), (trueY + trueHeight)]])
            .on("start", brushStart)
            .on("brush", pitchBrushMove)
            .on("end", pitchBrushEnd)

        var stumpBrush = d3.brush()
            .extent([[0, 0], [svgDimension, svgDimension]])
            .on("start", brushStart)
            .on("brush", stumpBrushMove)
            .on("end", stumpBrushEnd)

        var groundBrush = d3.brush()
            .extent([[0, 0], [svgDimension, svgDimension]])
            .on("start", brushStart)
            .on("brush", groundBrushMove)
            .on("end", groundBrushEnd)

        var pitchBrushArea = pitchGround.append("g")
            .attr("class", "pitchBrush")
            .call(pitchBrush);

        var stumpBrushArea = stumpWindow.append("g")
            .attr("class", "stumpBrush")
            .call(stumpBrush);

        var groundBrushArea = ground.append("g")
            .attr("class", "groundBrush")
            .call(groundBrush);

        scope.$on("clearBrushes", function(event, data) {
            console.log("Clearing");
            if (pitchLeftX != null) {
              pitchBrushArea.call(pitchBrush.move, null);
              pitchLeftX = null;
              pitchRightX = null;
              pitchTopY = null;
              pitchBottomY = null;

              pitchBrushArea.call(pitchBrush);
            }
            if (stumpLeftX != null) {
              stumpBrushArea.call(stumpBrush.move, null);
              stumpLeftX = null;
              stumpRightX = null;
              stumpTopY = null;
              stumpBottomY = null;

              stumpBrushArea.call(stumpBrush);
            }
            if (groundLeftX != null) {
              groundBrushArea.call(groundBrush.move, null);
              groundLeftX = null;
              groundRightX = null;
              groundTopY = null;
              groundBottomY = null;

              groundBrushArea.call(groundBrush);
            }
        })

        var isValidBall = function(d) {
            var pitchCondition = true;
            if (pitchLeftX != null) {
                var condition1 = d["landing_x"] >= pitchLeftX && d["landing_x"] <= pitchRightX;
                var condition2 = d["landing_y"] >= pitchTopY && d["landing_y"] <= pitchBottomY;
                pitchCondition = condition1 && condition2;
            }

            var stumpCondition = true;
            if (stumpLeftX != null) {
              var condition1 = d["ended_x"] >= stumpLeftX && d["ended_x"] <= stumpRightX;
              var condition2 = d["ended_y"] >= stumpTopY && d["ended_y"] <= stumpBottomY;
              stumpCondition = condition1 && condition2;
            }

            var groundCondition = true;
            if (groundLeftX != null) {
              var condition1 = d["x"] >= groundLeftX && d["x"] <= groundRightX;
              var condition2 = d["y"] >= groundTopY && d["y"] <= groundBottomY;
              groundCondition = condition1 && condition2;
            }

            return pitchCondition && stumpCondition && groundCondition;
        }

        scope.$watch('game', function(newVal, oldVal) {
            if (newVal == null) {
                d3.selectAll(".dot").style("display", "block");
            } else {
                d3.selectAll(".dot").style("display", function(d) {  return d.game == newVal.match_id ? "block" : "none" })
            }
        })

        scope.$watchCollection('balls', function(newBalls, oldBalls) {
          zoneColors = [];
          console.log("New Balls: " + newBalls.length);
          var validBalls = newBalls.filter(d => isValidBall(d))
          console.log("Valid Balls: " + validBalls.length);
          if (pitchLeftX != null || stumpLeftX != null || groundLeftX != null) {
              scope.$emit("finalBalls", validBalls)
          }

          var validPitchBalls = validBalls.filter(function(d) { return d["landing_x"] != null && d["landing_y"] != null; });

          var pitchBalls = pitchBrushArea.selectAll(".dot")
              .data(validPitchBalls, function(d) { return d.delivery_number; });

          var pitchBallsEnter = pitchBalls.enter().append("circle")
              .attr("class", "dot")
              .on("mouseover", function(d) { ballMouseover(d); })
              .on("mouseout", function() { ballMouseout(); });

          pitchBalls.merge(pitchBallsEnter)
              .attr("cx", function(d) { return pitchX(d["landing_x"]) })
              .attr("cy", function(d) {
                  var coordinate = d["landing_y"] < 0 ? -0.25 : d["landing_y"];
                  return pitchY(coordinate);
              })
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

          pitchBalls.exit()
            .attr("cx", svgDimension)
            .attr("cy", svgDimension)
            .remove();

            var validStumpBalls = validBalls.filter(function(d) {
                return d["ended_x"] != null && d["ended_y"] != null
                    && d["ended_x"] >= -2 && d["ended_x"] <= 2 && d["ended_y"] <= 4;
            });

            var stumpBalls = stumpWindow.selectAll(".dot")
                .data(validStumpBalls, function(d) { return d.delivery_number; });

            var stumpBallsEnter = stumpBalls.enter().append("circle")
                .attr("class", "dot")
                .on("mouseover", function(d) { ballMouseover(d); })
                .on("mouseout", function() { ballMouseout(); });

            stumpBalls.merge(stumpBallsEnter)
                .attr("cx", function(d) { return stumpX(d["ended_x"]) })
                .attr("cy", function(d) { return stumpY(d["ended_y"]) })
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

            stumpBalls.exit()
                .attr("cx", svgDimension)
                .attr("cy", svgDimension)
                .remove();

            var batsmen = Array.from(new Set(validBalls.map(function(d) {
                return d.batsman;
            })));

            var hands = Array.from(new Set(batsmen.map(function(d) {
                return scope.dictionary[d.toString()]["hand"];
            })));

            if (hands.length == 2) {
              leftBat.style("opacity", 1);
              rightBat.style("opacity", 1);
            }

            if (hands[0] == "Left") {
                leftBat.style("opacity", 1);
                rightBat.style("opacity", 0);
            } else {
                rightBat.style("opacity", 1);
                leftBat.style("opacity", 0);
            }

            if (newBalls.length == 0) {
              leftBat.style("opacity", 0);
              rightBat.style("opacity", 0);
            }

            var validGroundBalls = validBalls.filter(function(d) {
                return d["x"] != null && d["y"] != null;
            });

            var groundBalls = ground.selectAll(".dot")
                .data(validGroundBalls, function(d) { return d.delivery_number; });

            var groundBallsEnter = groundBalls.enter().append("circle")
                .attr("class", "dot")
                .on("mouseover", function(d) { ballMouseover(d); })
                .on("mouseout", function() { ballMouseout(); })

            groundBalls.merge(groundBallsEnter)
                .attr("cx", function(d) { return groundX(d["x"]) })
                .attr("cy", function(d) { return groundY(d["y"]) })
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

            groundBalls.exit()
                .attr("cx", svgDimension / 2)
                .attr("cy", svgDimension / 2)
                .remove();

            var zoneScores = [0,0,0,0,0,0,0,0];

            var consideredBalls = validGroundBalls.filter(function(d) { return d.z != 0; })

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
