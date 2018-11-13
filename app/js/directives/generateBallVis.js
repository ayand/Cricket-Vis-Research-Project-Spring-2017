angular.module('myApp').directive('generateBallVis', function() {
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

  var startingXs = [-1.525, 0];
  var startingYs = [];
  var y = 0;
  for (var i = 0; i < 8; i++) {
      startingYs.push(2.515 * i);
  }

  var pitchAreas = []

  var index = 0;
  for (var i = 0; i < startingXs.length; i++) {
      for (var j = 0; j < startingYs.length; j++) {
          pitchAreas.push({
              "leftX": startingXs[i],
              "topY": startingYs[j],
              "rightX": startingXs[i] + 1.525,
              "bottomY": startingYs[j] + 2.515,
              "score": 0,
              "area": index
          });
          index += 1;
      }
  }
  var pitchMapScale = d3.scaleQuantile().range(["#FFEDA0", "#FED976",
      "#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#BD0026", "#800026"])

  var stumpMapScale = d3.scaleQuantile().range(["#FFEDA0", "#FED976",
      "#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#BD0026", "#800026"])

  var groundMapScale = d3.scaleQuantile().range(["#FFEDA0", "#FED976",
      "#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#BD0026", "#800026"])

  var stumpAreas = [];
  index = 0;
  for (var i = -1.5; i < 1.5; i += 0.75) {
      for (var j = 2.25; j > 0; j -= 0.75) {
          stumpAreas.push({
              "leftX": i,
              "topY": j,
              "rightX": i + 0.75,
              "bottomY": j - 0.75,
              "score": 0,
              "area": index
          });
          index += 1;
          //console.log(stumpAreas)
      }
  }

  var totalRadius = (svgDimension / 2) - convertDimension(3);
  var ringNumber = 10;
  var dividedRadius = ((svgDimension / 2) - convertDimension(3)) / ringNumber;

  var groundAreas = [];

  for (var i = 0; i < ringNumber; i++) {
      var ringAreas = [
        { "zone": 1, "score": 0, "amount": 1, "outerRadius": (i + 1) * dividedRadius },
        { "zone": 2, "score": 0, "amount": 1, "outerRadius": (i + 1) * dividedRadius },
        { "zone": 3, "score": 0, "amount": 1, "outerRadius": (i + 1) * dividedRadius },
        { "zone": 4, "score": 0, "amount": 1, "outerRadius": (i + 1) * dividedRadius },
        { "zone": 5, "score": 0, "amount": 1, "outerRadius": (i + 1) * dividedRadius },
        { "zone": 6, "score": 0, "amount": 1, "outerRadius": (i + 1) * dividedRadius },
        { "zone": 7, "score": 0, "amount": 1, "outerRadius": (i + 1) * dividedRadius },
        { "zone": 8, "score": 0, "amount": 1, "outerRadius": (i + 1) * dividedRadius },
      ];

      groundAreas.push(ringAreas);
  }

  var changeHeatMap = function() {
      var pitchMin = d3.min(pitchAreas.filter(d => d["score"] != 0), d => d["score"])
      var pitchMax = d3.max(pitchAreas.filter(d => d["score"] != 0), d => d["score"])
      pitchMapScale.domain([pitchMin, pitchMax])

      var stumpMin = d3.min(stumpAreas.filter(d => d["score"] != 0), d => d["score"])
      var stumpMax = d3.max(stumpAreas.filter(d => d["score"] != 0), d => d["score"])
      stumpMapScale.domain([stumpMin, stumpMax]);

      var groundScores = [];
      groundAreas.forEach(function(zones) {
          zones.forEach(function(zone) {
              if (zone.score != 0) {
                  groundScores.push(zone.score);
              }
          })
      })

      var groundMin = d3.min(groundScores);
      var groundMax = d3.max(groundScores);
      groundMapScale.domain([groundMin, groundMax])

      d3.selectAll(".pitchHeatTile")
          .attr("fill", d => d["score"] == 0 ? "none" : pitchMapScale(d["score"]))
          .style("stroke", d => d["score"] == 0 ? "none" : "gray")

      d3.selectAll(".stumpHeatTile")
          .attr("fill", d => d["score"] == 0 ? "none" : stumpMapScale(d["score"]))
          .style("stroke", d => d["score"] == 0 ? "none" : "gray")

      d3.selectAll(".ringPath")
          .attr("fill", d => d.data.score == 0 ? "none" : groundMapScale(d.data.score))
          .style("stroke", d => d.data.score == 0 ? "none" : "gray")
  }



  return {
      restrict: 'EA',
      scope: {
          balls: '=',
          batsmen: '=',
          bowlers: '=',
          min: '=',
          max: '=',
          dictionary: '=',
          mapView: '='
      },
      link: function(scope, element, attrs) {
        var selectedZone = 0;
        var zoneColors = [];

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

        var selectedHand = null;

        var batsman1 = null;
        var batsman2 = null;

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

        var reverseX = d3.scaleLinear().range([0, 360]).domain([bottomEnd + groundExtension, topEnd - groundExtension])
        var reverseY = d3.scaleLinear().range([360, 0]).domain([bottomEnd + groundExtension, topEnd - groundExtension])

        console.log("TOP Y: " + (topEnd - groundExtension))
        console.log("BOTTOM Y: " + bottomEnd + groundExtension)

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

            var groundHeatMapArea = ground.append("g")

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

                    var groundLassoArea = ground.append("g")



                var arc2 = d3.arc()
                    .outerRadius((svgDimension / 2) + convertDimension(175))
                    .innerRadius((svgDimension / 2) - convertDimension(3));

                var arcs2 = ground.selectAll("g.arc")
                    .data(pie(singleThing))
                    .enter()
                    .append("g")
                    .attr("transform", "translate(" + (svgDimension / 2) + ", "
                        + (svgDimension / 2) + ")");

                arcs2.append("path")
                    .attr("fill", "#FFFFFF")
                    .style("stroke", "black")
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

          var handCondition = true;
          if (selectedHand != null) {
              if (selectedHand == "right") {
                  handCondition = d.bat_right_handed == "y";
              } else {
                  handCondition = d.bat_right_handed != "y";
              }
          }

          var partnershipCondition = true;
          if (batsman1 != null) {
                var condition1 = (batsman1 == d.batsman_name && batsman2 == d.non_striker);
                var condition2 = (batsman1 == d.non_striker && batsman2 == d.batsman_name);
                partnershipCondition = condition1 || condition2;
          }

          return batsmanCondition && bowlerCondition && overCondition
              && zoneCondition && handCondition && partnershipCondition;
        }

        var isValidBall2 = function(d) {
          var bowlerCondition = true;
          if (scope.bowlers.length != 0) {
              bowlerCondition = scope.bowlers.includes(d.bowler);
          }
          var over = Math.floor(d.ovr) + 1;
          var overCondition = ((over >= scope.min) && (over <= scope.max));
          var zoneCondition = (selectedZone == 0 || correctZone(selectedZone) == d.z);

          var handCondition = true;
          if (selectedHand != null) {
              if (selectedHand == "right") {
                  handCondition = d.bat_right_handed == "y";
              } else {
                  handCondition = d.bat_right_handed != "y";
              }
          }

          var partnershipCondition = true;
          if (batsman1 != null) {
                var condition1 = (batsman1 == d.batsman_name && batsman2 == d.non_striker);
                var condition2 = (batsman1 == d.non_striker && batsman2 == d.batsman_name);
                partnershipCondition = condition1 || condition2;
          }

          return bowlerCondition && overCondition
              && zoneCondition && handCondition && partnershipCondition;
        }

        var validPitchBalls = [];
        var validStumpBalls = [];
        var validGroundBalls = [];

        var recalculateHeatMaps = function() {
            pitchAreas.forEach(function(d) {
                d["score"] = 0;
            })
            validPitchBalls.filter(d => isValidBall(d) && d["landing_y"] >= 0).forEach(function(d) {
              var column = d["landing_x"] < 0 ? 0 : 8;
              var row = Math.floor(d["landing_y"] / 2.515);
              pitchAreas[column + row]["score"] += 1
            })

            stumpAreas.forEach(function(d) {
                d["score"] = 0;
            })
            validStumpBalls.filter(function(d) {
                var condition1 = isValidBall(d);
                var condition2 = d["ended_x"] >= -1.5 && d["ended_x"] <= 1.5;
                var condition3 = d["ended_y"] >= 0 && d["ended_y"] <= 2.25;
                return condition1 && condition2 && condition3;
            }).forEach(function(d) {
                var column = Math.floor((d["ended_x"] + 1.5) / 0.75) * 3;
                var row = 2 - Math.floor(d["ended_y"] / 0.75);

                stumpAreas[column + row]["score"] += 1
            })

            groundAreas.forEach(function(zones) {
                zones.forEach(function(zone) {
                    zone.score = 0;
                })
            })

            validGroundBalls.filter(d => isValidBall(d) && d["z"] != 0).forEach(function(d) {
                var x = groundX(d["x"]) - (svgDimension / 2)
                var y = groundY(d["y"])  - (svgDimension / 2)
                var radius = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5)
                var level = Math.floor(radius / dividedRadius);
                if (level >= ringNumber) {
                    level = ringNumber - 1;
                }
                var sector = correctZone(d.z) - 1;
                groundAreas[level][sector].score += 1;
            })

            changeHeatMap();
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

        var tempPlayer = null;

        var belongsToPlayer = function(ball) {
            if (tempPlayer != null) {
                return ball.batsman == tempPlayer || ball.bowler == tempPlayer;
            }
            return true;
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
          var column = curBall["landing_x"] < 0 ? 0 : 8;
          var row = Math.floor(curBall["landing_y"] / 2.515);
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
              .style("opacity", function(d) { return isSelectedBall(d) && belongsToPlayer(d) ? 1 : 0.1; })
              .classed("brushedBall", function(d) { return isSelectedBall(d); })
              .on("mouseover", function(d) {
                  if (isSelectedBall(d)) {
                      ballMouseover(d);
                  }
              })
              .on("mouseout", function(d) {
                if (isValidBall(d) && isSelectedBall(d)) {
                    ballMouseout(scope.min, scope.max, scope.batsmen, scope.bowlers);
                }
              })

          d3.selectAll(activeClassName)
              .style("opacity", function(d) { return isValidBall(d) && isSelectedBall(d) && belongsToPlayer(d) ? 1 : 0.1 })
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
            console.log("Brush canceled")
          } else {
              console.log("Brush still in effect")
          }
        }

        var stumpBrush = d3.brush()
            .extent([[0, 0], [svgDimension, svgDimension]])
            .on("start", brushstart)
            .on("brush", stumpBrushMove)
            .on("end", stumpBrushEnd);

        var lasso_start = function() {
        }

        var lasso_draw = function() {
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

        var changeBallVisibility = function() {
          d3.selectAll(".dot")
              .classed("visibleball",function(d){
                  return isValidBall(d);
              })
              .classed("invisibleball", function(d) {
                return !isValidBall(d);
              })
              .style("opacity", function(d) {
                  return isSelectedBall(d) ? 1 : 0.1;
              });
        }

        var plotPoints = function(canvas, data, xScale, yScale, xName, yName) {
          return canvas.selectAll(".dot")
              .data(data)
              .enter().append("circle")
              .attr("class", "dot")
              .attr("cx", function(d) {
                  return xScale(d[xName]);
              })
              .attr("cy", function(d) {
                  if (yName == "landing_y" && d[yName] < 0) {
                      return pitchY(-0.25);
                  }
                  return yScale(d[yName]);
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
        }

        var pitchBrush = d3.brush()
            .extent([[trueX, trueY], [(trueX + trueWidth), (trueY + trueHeight)]])
            .on("start", brushstart)
            .on("brush", pitchBrushMove)
            .on("end", pitchBrushEnd);

        validPitchBalls = scope.balls.filter(function(d) {
            return d["landing_x"] != null && d["landing_y"] != null;
        });

        var pitchBrushArea = pitch.append("g")
            .attr("class", "brush")
            .call(pitchBrush);

        plotPoints(pitchBrushArea, validPitchBalls, pitchX, pitchY, "landing_x", "landing_y")

        var pitchHeatMapArea = pitch.append("g")

            var pitchAreaRect = pitchHeatMapArea.selectAll(".pitchHeatTile")
                .data(pitchAreas, d => d["index"])
                .enter()
                .append("rect")
                .attr("class", "pitchHeatTile")
                .attr("x", d => pitchX(d["leftX"]))
                .attr("y", d => pitchY(d["topY"]))
                .attr("width", d => (pitchX(d["rightX"]) - pitchX(d["leftX"])))
                .attr("height", d => (pitchY(d["bottomY"]) - pitchY(d["topY"])))
                .attr("fill", "blue")
                .style("stroke", "gray")
                .style("opacity", 0.65)
                .on("mouseover", function(d, i)  {
                });

            validStumpBalls = scope.balls.filter(function(d) {
                return d["ended_x"] != null && d["ended_y"] != null
                    && d["ended_x"] >= -2 && d["ended_x"] <= 2 && d["ended_y"] <= 4;
            });

            var stumpBrushArea = stumpWindow.append("g")
                .attr("class", "brush")
                .call(stumpBrush);

            plotPoints(stumpBrushArea, validStumpBalls, stumpX, stumpY, "ended_x", "ended_y")

                var stumpHeatmapArea = stumpWindow.append("g")

                var stumpAreaRect = stumpHeatmapArea.selectAll(".stumpHeatTile")
                    .data(stumpAreas, d => d["index"])
                    .enter()
                    .append("rect")
                    .attr("class", "stumpHeatTile")
                    .attr("x", d => stumpX(d["leftX"]))
                    .attr("y", d => stumpY(d["topY"]))
                    .attr("width", d => (stumpX(d["rightX"]) - stumpX(d["leftX"])))
                    .attr("height", d => (stumpY(d["bottomY"]) - stumpY(d["topY"])))
                    .attr("fill", "blue")
                    .style("stroke", "gray")
                    .style("opacity", 0.65)
                    .on("mouseover", function(d)  {
                    });

                    var leftBat = stumpWindow.append("g")
                        .attr("class", "left-bat")
                        .style("cursor", "pointer");

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
                        .attr("class", "right-bat")
                        .style("cursor", "pointer");

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

                        leftBat.on("click", function() {
                            if (selectedHand != "left") {
                                selectedHand = "left"
                                leftBat.style("opacity", 1);
                                rightBat.style("opacity", 0.1);
                                //scope.$emit("handFilter", true);
                            } else {
                                selectedHand = null;
                                leftBat.style("opacity", 1);
                                rightBat.style("opacity", 1);
                                //scope.$emit("handFilter", false);
                            }

                            var validBatsmen = new Set(scope.balls.filter(function(d) {
                                return isValidBall2(d);
                            }).map(function(d) {
                                return d.batsman;
                            }))

                            scope.$emit('batsmen', validBatsmen);

                            changeBallVisibility();

                            brushHighlight();
                            recalculateHeatMaps();
                        })

                        rightBat.on("click", function() {
                            if (selectedHand != "right") {
                                selectedHand = "right"
                                rightBat.style("opacity", 1);
                                leftBat.style("opacity", 0.1);
                                //scope.$emit("handFilter", true);
                            } else {
                                selectedHand = null;
                                leftBat.style("opacity", 1);
                                rightBat.style("opacity", 1);
                                //scope.$emit("handFilter", false);
                            }

                            var validBatsmen = new Set(scope.balls.filter(function(d) {
                                return isValidBall2(d);
                            }).map(function(d) {
                                return d.batsman;
                            }))

                            scope.$emit('batsmen', validBatsmen);

                            changeBallVisibility();

                            brushHighlight();
                            recalculateHeatMaps();
                        })

                    stumpHeatmapArea.append("rect")
                        .attr("height", convertDimension(137.46))
                        .attr("width", convertDimension(7.366))
                        .attr("x", ((svgDimension / 2) - convertDimension(3.683)))
                        .attr("y", (svgDimension - convertDimension(137.46)))
                        .attr("rx", convertDimension(4))
                        .attr("ry", convertDimension(4))
                        .attr("fill", "#FAE3A1");

                    stumpHeatmapArea.append("rect")
                        .attr("height", convertDimension(137.46))
                        .attr("width", convertDimension(7.366))
                        .attr("x", ((svgDimension / 2) - convertDimension(22.1366666667)))
                        .attr("y", (svgDimension - convertDimension(137.46)))
                        .attr("rx", convertDimension(4))
                        .attr("ry", convertDimension(4))
                        .attr("fill", "#FAE3A1");

                    stumpHeatmapArea.append("rect")
                        .attr("height", convertDimension(137.46))
                        .attr("width", convertDimension(7.366))
                        .attr("x", ((svgDimension / 2) + convertDimension(14.7706666667)))
                        .attr("y", (svgDimension - convertDimension(137.46)))
                        .attr("rx", convertDimension(4))
                        .attr("ry", convertDimension(4))
                        .attr("fill", "#FAE3A1");

                    stumpHeatmapArea.append("rect")
                        .attr("width", convertDimension(20))
                        .attr("height", convertDimension(4))
                        .attr("x", (svgDimension / 2))
                        .attr("y", (svgDimension - convertDimension(138.793333333)))
                        .attr("rx", convertDimension(3))
                        .attr("ry", convertDimension(3))
                        .attr("fill", "#683F16");

                    stumpHeatmapArea.append("rect")
                        .attr("width", convertDimension(20))
                        .attr("height", convertDimension(4))
                        .attr("x", ((svgDimension / 2) - convertDimension(20)))
                        .attr("y", (svgDimension - convertDimension(138.793333333)))
                        .attr("rx", convertDimension(3))
                        .attr("ry", convertDimension(3))
                        .attr("fill", "#683F16");

                validGroundBalls = scope.balls.filter(function(d) {
                    return d["x"] != null && d["y"] != null;
                });

                var groundBalls = plotPoints(groundLassoArea, validGroundBalls, groundX, groundY, "x", "y")

                var arc1 = d3.arc()
                  .outerRadius((svgDimension / 2) - convertDimension(3))
                  .innerRadius((svgDimension / 2) - convertDimension(27));

                var arcs1 = groundLassoArea.selectAll("g.arc")
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

            recalculateHeatMaps();

            brushHighlight();

            var lasso = d3.lasso().closePathSelect(true)
                .closePathDistance(100)
                .items(groundBalls)
                .targetArea(ground)
                .on("start", lasso_start)
                .on("draw", lasso_draw)
                .on("end", lasso_end);



            groundLassoArea.call(lasso);

            var groundHeatMapArea = groundVis.append("g")

            for (var i = 0; i < ringNumber; i++) {

                var innerRadius = i * dividedRadius;
                var outerRadius = innerRadius + dividedRadius;
                var ringArc = null;
                ringArc = d3.arc()
                    .outerRadius(outerRadius)
                    .innerRadius(innerRadius)

                var className = "groundRing" + i;

                var groundRingArc = groundHeatMapArea.selectAll("." + className)
                    .data(zoneDonut(groundAreas[i]))
                    .enter()
                    .append("g")
                    .attr("class", className)
                    .attr("transform", "translate("+[(svgDimension / 2), (svgDimension / 2)]+")")

                groundRingArc.append("path")
                    .attr("class", "ringPath")
                    .attr("fill", "white")
                    .style("stroke", "#CCCCCC")
                    .style("opacity", 0.8)
                    .attr("d", ringArc)
                    .on("mouseover", function(d) {
                        console.log(d.data);
                    })
            }

            d3.selectAll(".zone-path").on("click", function(d, index) {
                console.log(correctZone(d.data.zone))
                if (selectedZone == d.data.zone) {
                    selectedZone = 0;
                    d3.select("#zoneFilter").style("visibility", "hidden")
                    d3.selectAll(".zone-path")
                        .attr("fill", function(path, i) {
                            return zoneColors[i];
                        })
                        .style('stroke', '#CCCCCC');
                    changeBallVisibility();

                        var validBatsmen = new Set(scope.balls.filter(function(d) {
                            return isValidBall(d);
                        }).map(function(d) {
                            return d.batsman;
                        }))

                        //scope.$emit('batsmen', validBatsmen);

                        brushHighlight();

                } else {
                    if (selectedZone == 0 || zoneColors.length == 0) {
                      zoneColors = [];
                      d3.selectAll(".zone-path")._groups[0].forEach(function(e) {
                          zoneColors.push(e.attributes.fill.value);
                      });
                    }
                    selectedZone = d.data.zone;
                    d3.select("#zoneFilter").style("visibility", "visible")
                    d3.selectAll(".zone-path")
                        .attr("fill", function(path, i) {
                            if (selectedZone == path.data.zone) {
                                return zoneColors[i];
                            } else {
                                return 'gray';
                            }
                        })
                        .style("stroke", "black");

                    changeBallVisibility();

                    var validBatsmen = new Set(scope.balls.filter(function(d) {
                        return isValidBall(d);
                    }).map(function(d) {
                        return d.batsman;
                    }))
                    brushHighlight();
                }
                recalculateHeatMaps();
            });

            var changeBats = function(hands) {
              leftBat.style("display", "none");
              rightBat.style("display", "none");
              leftBat.style("opacity", 1);
              rightBat.style("opacity", 1);
              if (hands.length == 1) {
                  if (hands[0] == "Left") {
                      leftBat.style("display", "block");
                  } else {
                      rightBat.style("display", "block");
                  }
              } else {
                leftBat.style("display", "block");
                rightBat.style("display", "block");
              }
            }

            var collectZoneColors = function() {
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
            }

            var playerChange = function(newBatsmen, newBowlers) {
              recalculateHeatMaps();
              //selectedHand = null;

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
                  var overCondition = ((over >= scope.min) && (over <= scope.max));
                  return batsmanCondition && bowlerCondition && overCondition && (dot.z != 0);
              });

              var zoneScores = [0, 0, 0, 0, 0, 0, 0, 0];
              consideredBalls.forEach(function(d) {
                  var zone = correctZone(d.z) - 1;
                  zoneScores[zone] += d.runs_w_extras;
              });

              var scoreSet = Array.from(new Set(zoneScores.filter(d => d != 0)));
              scoreSet.sort(function(a, b) {
                  return a - b;
              })

              var list = scoreSet.length - 1;

              d3.selectAll(".zone-path")
                  .attr("fill", function(d, i) {
                      var score = zoneScores[i];
                      if (score != 0) {
                        return colorScales[list][scoreSet.indexOf(score)];
                      }
                      return "white"
                  })
                  .style("stroke", "#CCCCCC")

              var batsmen = Array.from(new Set(scope.balls.filter(function(d) {
                  var over = Math.floor(d.ovr) + 1;
                  return over >= scope.min && over <= scope.max;
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
                hands = Array.from(new Set(batsmen.map(function(d) {
                    return scope.dictionary[d.toString()]["hand"];
                })));
              }
              if (selectedHand == null) {
                changeBats(hands);
              }
              selectedZone = 0;
              d3.select("#zoneFilter").style("visibility", "hidden")

              changeBallVisibility();

                  collectZoneColors();

                  brushHighlight();
            }

            scope.$watchCollection('batsmen', function(newBatsmen, oldBatsmen) {
                playerChange(newBatsmen, scope.bowlers);
            });

            scope.$watchCollection('bowlers', function(newBowlers, oldBowlers) {
                playerChange(scope.batsmen, newBowlers);
            });

            var overChange = function(min, max) {
              d3.selectAll(".partnership").style("stroke-width", "1px")
                  .style("stroke", "black")
              d3.selectAll(".partnershipBar").style("opacity", 1)
              recalculateHeatMaps();
              selectedHand = null;
              batsman1 = null;
              batsman2 = null;
              d3.selectAll(".partnership").style("stroke-width", "1px")
                  .style("stroke", "black");
              var distinctBatsmen = new Set();

              var zoneScores = [0, 0, 0, 0, 0, 0, 0, 0];

              scope.balls.forEach(function(dot) {
                var batsmanCondition = true;
                if (scope.batsmen.length != 0) {
                    batsmanCondition = scope.batsmen.includes(dot.batsman);
                }
                var bowlerCondition = true;
                if (scope.bowlers.length != 0) {
                    bowlerCondition = scope.bowlers.includes(dot.bowler);
                }
                var over = Math.floor(dot.ovr) + 1;
                var overCondition = ((over >= min) && (over <= max));
                if (batsmanCondition && bowlerCondition && overCondition
                    && (dot.z != 0)) {
                    var zone = correctZone(dot.z) - 1;
                    zoneScores[zone] += dot.runs_w_extras;
                    distinctBatsmen.add(dot.batsman);
                }
              })

              var scoreSet = Array.from(new Set(zoneScores.filter(d => d != 0)));
              scoreSet.sort(function(a, b) {
                  return a - b;
              })

              var list = scoreSet.length - 1;

              d3.selectAll(".zone-path")
                  .attr("fill", function(d, i) {
                      var score = zoneScores[i];
                      if (score != 0) {
                        return colorScales[list][scoreSet.indexOf(score)];
                      }
                      return "white"
                  })
                  .style("stroke", "#CCCCCC")
                  .style("cursor", "pointer")

              var batsmen = Array.from(distinctBatsmen)
              var hands = Array.from(new Set(batsmen.map(function(d) {
                  return scope.dictionary[d.toString()]["hand"];
              })));
              changeBats(hands);
              selectedZone = 0;
              d3.select("#zoneFilter").style("visibility", "hidden")

              changeBallVisibility();

                  collectZoneColors();
                  brushHighlight();

                  d3.selectAll(".activePlayer")
                      .on("mouseover", function(d) {
                          tempPlayer = d;
                          d3.selectAll(".edge")
                              .style("opacity", function(edge) {
                                  return edge.batsman == d || edge.bowler == d ? 1 : 0.1
                              })
                          brushHighlight();
                      })
                      .on("mouseout", function(d) {
                          tempPlayer = null;
                          d3.selectAll(".edge")
                              .style("opacity", 1)
                          brushHighlight();
                      })

                  d3.selectAll(".inactivePlayer")
                      .on("mouseover", function(d) {
                          return;
                      })
                      .on("mouseout", function(d) {
                          return;
                      })
            }

            scope.$watch('min', function(newMin, oldMin) {
                overChange(newMin, scope.max);
            })

            scope.$watch('max', function(newMax, oldMax) {
                overChange(scope.min, newMax);
            })

            d3.selectAll(".partnership")
                .on("click", function(d) {
                    if (batsman1 == d.batsman_1 && batsman2 == d.batsman_2) {
                        d3.selectAll(".partnership").style("stroke-width", "1px")
                            .style("stroke", "black")
                        d3.selectAll(".partnershipBar").style("opacity", 1)
                        batsman1 = null;
                        batsman2 = null;

                        changeBallVisibility();

                        brushHighlight();
                    } else {

                        d3.selectAll(".partnership").style("stroke-width", e => (d == e) ? "4px" : "1px")
                            .style("stroke", e => (d == e) ? "gold" : "black")
                        d3.selectAll(".partnershipBar").style("opacity", e => (d == e) ? 1 : 0.2)
                        batsman1 = d.batsman_1;
                        batsman2 = d.batsman_2;

                        changeBallVisibility();

                        brushHighlight();
                    }
                    recalculateHeatMaps();
                })

                d3.selectAll(".partnershipBar")
                    .on("click", function(d) {
                        if (batsman1 == d.batsman_1 && batsman2 == d.batsman_2) {
                            d3.selectAll(".partnership").style("stroke-width", "1px")
                                .style("stroke", "black")
                            d3.selectAll(".partnershipBar").style("opacity", 1)
                            batsman1 = null;
                            batsman2 = null;

                            changeBallVisibility();

                            brushHighlight();
                        } else {

                            d3.selectAll(".partnership").style("stroke-width", e => (d == e) ? "4px" : "1px")
                                .style("stroke", e => (d == e) ? "gold" : "black")
                            d3.selectAll(".partnershipBar").style("opacity", e => (d == e) ? 1 : 0.2)
                            batsman1 = d.batsman_1;
                            batsman2 = d.batsman_2;

                            changeBallVisibility();
                            brushHighlight();
                        }
                        recalculateHeatMaps();
                    })

            scope.$watch('mapView', function(newView, oldView) {
                pitchHeatMapArea.style("display", newView == "Balls" ? "none" : "block")
                pitchBrushArea.style("display", newView == "Balls" ? "block" : "none")
                stumpHeatmapArea.style("display", newView == "Balls" ? "none" : "block")
                stumpBrushArea.style("display", newView == "Balls" ? "block" : "none")
                groundLassoArea.style("display", newView == "Balls" ? "block" : "none")
                groundHeatMapArea.style("display", newView == "Balls" ? "none" : "block")
            })

            scope.$on("handFilter", function(event, data) {
                hands = Array.from(new Set(scope.balls.filter(d => isValidBall(d)).map(d => d.batsman).map(d => scope.dictionary[d.toString()]["hand"])))
                selectedHand = null;
                leftBat.style("display", "none");
                rightBat.style("display", "none");
                leftBat.style("opacity", 1);
                rightBat.style("opacity", 1);
                if (hands.length == 1) {
                    if (hands[0] == "Left") {
                        leftBat.style("display", "block");
                    } else {
                        rightBat.style("display", "block");
                    }
                } else {
                  leftBat.style("display", "block");
                  rightBat.style("display", "block");
                }
            })

            scope.$on("zoneFilter", function(event, data) {
              selectedZone = 0;
              //d3.select("#zoneFilter").style("visibility", "hidden")
              d3.selectAll(".zone-path")
                  .attr("fill", function(path, i) {
                      return zoneColors[i];
                  })
                  .style('stroke', '#CCCCCC');
              changeBallVisibility();

                  var validBatsmen = new Set(scope.balls.filter(function(d) {
                      return isValidBall(d);
                  }).map(function(d) {
                      return d.batsman;
                  }))

                  scope.$emit('batsmen', validBatsmen);

                  brushHighlight();
            })
      }
  }
})
