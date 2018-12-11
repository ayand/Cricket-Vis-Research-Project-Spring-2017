angular.module('myApp').directive('bipartiteGraph', function() {
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

    return {
        restrict: 'EA',
        scope: {
            balls: '=',
            min: '=',
            max: '=',
            playerDict: '=',
            imageDict: '='
        },
        link: function(scope, element, attrs) {
          var alphabeticalSort = function(a, b) {
            var letterOrder = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            var aName = scope.playerDict[a.toString()]["name"].split(" ");
            var aLastName = aName[aName.length - 1];
            var aFirst = aName[0].charAt(0);
            var bName = scope.playerDict[b.toString()]["name"].split(" ");
            var bLastName = bName[bName.length - 1];
            var bFirst = bName[0].charAt(0)
            if (bLastName == aLastName) {
                return letterOrder.indexOf(aFirst) - letterOrder.indexOf(bFirst);
            }
            return ((aLastName > bLastName) ? 1 : -1)
          }

          var width = 400;

          var convertDimension = function(d) {
              return ((d * width) / 550)
          }

            var vis = d3.select(element[0])
                .append("svg")
                .attr("width", width)
                .attr("height", 240)

            vis.append("rect")
                .attr("width", width)
                .attr("height", 240)
                .attr("fill", "white")

                var newBatsmen = Array.from(new Set(scope.balls.map(function(d) {
                    return d.batsman;
                })));

                //newBatsmen.sort(alphabeticalSort)

                var newBowlers = Array.from(new Set(scope.balls.map(function(d) {
                    return d.bowler;
                })));
                console.log(newBowlers);
                //newBowlers.sort(alphabeticalSort)

                var locationDict = {}

                newBatsmen.forEach(function(d, i) {
                    var coordinate = 10 + (i * 20)
                    locationDict[d.toString()] = coordinate
                })

                newBowlers.forEach(function(d, i) {
                    var coordinate = 10 + (i * 24)
                    locationDict[d.toString()] = coordinate
                })

                var interactionDict = {}

                scope.balls.forEach(function(d) {
                    if (interactionDict[d.batsman.toString()] == null) {
                        interactionDict[d.batsman.toString()] = [];
                    }
                    if (!interactionDict[d.batsman.toString()].includes(d.bowler)) {
                        interactionDict[d.batsman.toString()].push(d.bowler);
                    }
                })

                var edges = []

                for (var key in interactionDict) {
                    for (var i = 0; i < interactionDict[key].length; i++) {
                        edges.push({
                            "batsman": parseInt(key),
                            "bowler": parseInt(interactionDict[key][i])
                        })
                    }
                }

                var edgeLines = vis.selectAll(".edge")
                    .data(edges)
                    .enter().append("line")
                    .attr("class", "edge")
                    .attr("x1", convertDimension(195))
                    .attr("y1", function(d) {
                        return locationDict[d.batsman.toString()];
                    })
                    .attr("x2", convertDimension(355))
                    .attr("y2", function(d) {
                        return locationDict[d.bowler.toString()];
                    })
                    .style("stroke", "#999999")

                var allBatsmen = vis.selectAll(".batsman")
                    .data(newBatsmen)
                    .enter().append("g")
                    .attr("class", "batsman")
                    .classed("activePlayer", true)
                    .attr("transform", function(d, i) {
                        return "translate(" + [0, locationDict[d.toString()]] + ")"
                    })
                    .style("cursor", "pointer")

                allBatsmen.append("circle")
                    .attr("cx", convertDimension(195))
                    .attr("r", 4)
                    .attr("fill", function(d) {
                        return teamColors[scope.playerDict[d.toString()]["team"]]
                    })

                allBatsmen.append("text")
                    .attr("x", convertDimension(180))
                    .attr("y", 3)
                    .text(function(d) {
                        return scope.playerDict[d.toString()]["name"]
                    })
                    .style("text-anchor", "end")
                    .style("font-weight", "bold")
                    .style("font-size", "11px")

                var allBowlers = vis.selectAll(".bowler")
                    .data(newBowlers)
                    .enter().append("g")
                    .attr("class", "bowler")
                    .classed("activePlayer", true)
                    .on("mouseover", function(d) {
                        console.log(d);
                    })
                    .attr("transform", function(d, i) {
                        return "translate(" + [0, locationDict[d.toString()]] + ")"
                    })
                    .style("cursor", "pointer")

                allBowlers.append("circle")
                    .attr("cx", convertDimension(355))
                    .attr("r", 4)
                    .attr("fill", function(d) {
                        return teamColors[scope.playerDict[d.toString()]["team"]]
                    })

                allBowlers.append("text")
                    .attr("x", convertDimension(370))
                    .attr("y", 3)
                    .text(function(d) {
                        return scope.playerDict[d.toString()]["name"]
                    })
                    .style("text-anchor", "start")
                    .style("font-weight", "bold")
                    .style("font-size", "11px")

            scope.$watchCollection('min', function(newMin, oldMin) {
              var filteredBalls = scope.balls.filter(function(d) {
                  var o = Math.ceil(d.ovr);
                  return o >= newMin && o <= scope.max;
              })

              var batsmen = Array.from(new Set(filteredBalls.map(function(d) {
                  return d.batsman;
              })));

              var bowlers = Array.from(new Set(filteredBalls.map(function(d) {
                  return d.bowler;
              })));
              console.log(batsmen.length);
              

              var interactionDict = {}

              filteredBalls.forEach(function(d) {
                  if (interactionDict[d.batsman.toString()] == null) {
                      interactionDict[d.batsman.toString()] = []
                  }
                  if (!interactionDict[d.batsman.toString()].includes(d.bowler)) {
                      interactionDict[d.batsman.toString()].push(d.bowler);
                  }
              })

              allBatsmen.classed("activePlayer", function(d) {
                  return batsmen.includes(d);
              }).classed("inactivePlayer", function(d) {
                  return !batsmen.includes(d);
              })

              allBowlers.classed("activePlayer", function(d) {
                  return bowlers.includes(d);
              }).classed("inactivePlayer", function(d) {
                  return !bowlers.includes(d);
              })

              edgeLines.style("display", function(d) {
                  var condition1 = interactionDict[d.batsman.toString()] != null;
                  if (condition1) {
                      return interactionDict[d.batsman.toString()].includes(d.bowler) ? "block" : "none"
                  }
                  return "none";
              })
            })

            scope.$watchCollection('max', function(newMax, oldMax) {

                var filteredBalls = scope.balls.filter(function(d) {
                    var o = Math.ceil(d.ovr);
                    return o >= scope.min && o <= newMax;
                })

                var batsmen = Array.from(new Set(filteredBalls.map(function(d) {
                    return d.batsman;
                })));

                var bowlers = Array.from(new Set(filteredBalls.map(function(d) {
                    return d.bowler;
                })));

                var interactionDict = {}

                filteredBalls.forEach(function(d) {
                    if (interactionDict[d.batsman.toString()] == null) {
                        interactionDict[d.batsman.toString()] = []
                    }
                    if (!interactionDict[d.batsman.toString()].includes(d.bowler)) {
                        interactionDict[d.batsman.toString()].push(d.bowler);
                    }
                })

                allBatsmen.classed("activePlayer", function(d) {
                    return batsmen.includes(d);
                }).classed("inactivePlayer", function(d) {
                    return !batsmen.includes(d);
                })

                allBowlers.classed("activePlayer", function(d) {
                    return bowlers.includes(d);
                }).classed("inactivePlayer", function(d) {
                    return !bowlers.includes(d);
                })

                edgeLines.style("display", function(d) {
                    var condition1 = interactionDict[d.batsman.toString()] != null;
                    if (condition1) {
                        return interactionDict[d.batsman.toString()].includes(d.bowler) ? "block" : "none"
                    }
                    return "none";
                })
            })
        }
    }
})
