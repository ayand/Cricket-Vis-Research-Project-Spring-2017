angular.module('myApp').directive('playerGraph', function() {
    var alphabeticalSort = function(a, b) {
      var teams = ["Afghanistan", "Australia", "Bangladesh", "England", "India",
          "Ireland", "New Zealand", "Pakistan", "Scotland", "South Africa",
          "Sri Lanka", "United Arab Emirates", "West Indies", "Zimbabwe"];
      var letterOrder = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      var aName = a.name.split(" ");
      var aLastName = aName[aName.length - 1];
      var aFirst = aName[0].charAt(0);
      var bName = b.name.split(" ");
      var bLastName = bName[bName.length - 1];
      var bFirst = bName[0].charAt(0)
      if (bLastName == aLastName) {
          return letterOrder.indexOf(aFirst) - letterOrder.indexOf(bFirst);
      }
      return ((aLastName > bLastName) ? 1 : -1)

    }

    var noClick = false;

    return {
        restrict: 'EA',
        scope: {
            graph: '=',
            playerDict: '=',
            imageDict: '=',
            side: '=',
            sortKey: '='
        },
        link: function(scope, element, attrs) {
            var visiblePlayers = [];

            var isVisiblePlayer = function(d) {
                return visiblePlayers.includes(d);
            }

            var svg = d3.select(element[0])
                .append("svg")
                .attr("width", 1200)
                .attr("height", 283);

            var sortByKey = function(key) {
                var teams = ["Afghanistan", "Australia", "Bangladesh", "England", "India",
                    "Ireland", "New Zealand", "Pakistan", "Scotland", "South Africa",
                    "Sri Lanka", "United Arab Emirates", "West Indies", "Zimbabwe"];
                scope.graph.nodes.sort(function(a, b) {
                  if (a.team == b.team) {
                      if (a[key] == b[key]) {
                          return alphabeticalSort(a, b);
                      }
                      return b[key] - a[key];
                  }
                  return teams.indexOf(a.team) - teams.indexOf(b.team);
                })
            }

            var nodeTipText = function(d) {
                var topSection = "<img align='center' class='center-block' height='50' src='" + scope.imageDict[scope.playerDict[d.id.toString()]["name"]] + "'>\
                    <h4 align='center'>" + d.name + "</h4>\
                    <h5 align='center'>" + d.team + "</h5>\n";
                var runsScored = d.runs_scored;
                var ballsFaced = d.balls_faced;
                var strikeRate = d.strike_rate != -1 ? d.strike_rate.toFixed(3) : "N/A";
                var oversBowled = d.overs_bowled;
                var runsConceded = d.runs_conceded;
                var wicketsTaken = d.wickets_taken;
                var bottomSection = "<div class='row' style='padding-top:3px; padding-bottom:3px'>\
                                        <div class='col-sm-6 col-md-6 col-lg-6'>\
                                            <strong>" + (scope.side == "Batting" ? "Runs Scored:" : "Runs Conceded:") + "</strong>\
                                        </div>\
                                        <div class='col-sm-6 col-md-6 col-lg-6' style='text-align:right'>\
                                            <strong>" + (scope.side == "Batting" ? runsScored : runsConceded) + "</strong>\
                                        </div>\
                                     </div>\
                                     <div class='row' style='padding-top:3px; padding-bottom:3px'>\
                                        <div class='col-sm-6 col-md-6 col-lg-6'>\
                                            <strong>" + (scope.side == "Batting" ? "Balls Faced:" : "Overs Bowled:") + "</strong>\
                                        </div>\
                                        <div class='col-sm-6 col-md-6 col-lg-6' style='text-align:right'>\
                                            <strong>" + (scope.side == "Batting" ? ballsFaced : oversBowled) + "</strong>\
                                        </div>\
                                     </div>\
                                     <div class='row' style='padding-top:3px; padding-bottom:3px'>\
                                        <div class='col-sm-6 col-md-6 col-lg-6'>\
                                            <strong>" + (scope.side == "Batting" ? "Strike Rate:" : "Wickets Taken:") + "</strong>\
                                        </div>\
                                        <div class='col-sm-6 col-md-6 col-lg-6' style='text-align:right'>\
                                            <strong>" + (scope.side == "Batting" ? strikeRate : wicketsTaken) + "</strong>\
                                        </div>\
                                     </div>\
                                    "
                return topSection + bottomSection
            }

            var edgeTipText = function(d) {
              return "<div align='center' class='row'>\
                          <div class='col-sm-12 col-md-12 col-lg-12'>\
                              <h5>" + scope.playerDict[d.batsman.toString()]["name"] + " vs. " + scope.playerDict[d.bowler.toString()]["name"] + "</h5>\
                          </div>\
                      </div>\
                      <div align='center' class='row' style='border-top: 1 px solid white'>\
                          <div align='left' class='col-sm-6 col-md-6 col-lg-6'>\
                              <strong>Number of Balls:</strong>\
                          </div>\
                          <div align='right' class='col-sm-6 col-md-6 col-lg-6'>\
                              <strong>" + d.number_of_balls + "</strong>\
                          </div>\
                      </div>\
                      <div class='row' style='border-top: 1 px solid white'>\
                          <div align='left' class='col-sm-6 col-md-6 col-lg-6'>\
                              <strong>Runs Scored:</strong>\
                          </div>\
                          <div align='right' class='col-sm-6 col-md-6 col-lg-6'>\
                              <strong>" + d.runs_scored + "</strong>\
                          </div>\
                      </div>"
            }

            var nodeTip = d3.tip().attr('class', 'node-tip').html(function(d) { return nodeTipText(d); });
            svg.call(nodeTip);

            var edgeTip = d3.tip().attr('class', 'edge-tip').html(function(d) { return edgeTipText(d); });
            svg.call(edgeTip);

            var teams = Array.from(new Set(scope.graph.nodes.map(function(d) {
                return d.team;
            })));

            teams.sort();

            var teamScale = d3.scaleBand().domain(teams).range([0, 1150]);

            svg.append("g")
                .attr("class", "xAxis")
                .attr("transform", "translate(0, 20)")
                .call(d3.axisTop(teamScale));

            d3.select(".xAxis")
                .selectAll("line")
                .style("display", "none")

            d3.select(".xAxis")
                .selectAll("text")
                .style("font-weight", "bold")

            var coordinateDict = {}

            var teamDivision = d3.nest()
                .key(function(d) { return d.team })
                .entries(scope.graph.nodes);

            teamDivision.forEach(function(d) {
                coordinateDict[d.key] = {
                    "lastPosition": 30,
                    "playerDict": {}
                };
                d.values.forEach(function(player) {
                    coordinateDict[d.key]["playerDict"][player.id.toString()] = coordinateDict[d.key]["lastPosition"]
                    coordinateDict[d.key]["lastPosition"] += 12.5;
                })
            })

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

            var selectedPlayer = null;
            var selectedTeam = null;
            var currentCombo = null;
            var relevantOpponents = [];

            var temporaryPlayer = null;
            var temporaryOpponents = [];

            var temporaryPlayers = null;

            var edges = svg.selectAll(".edge")
                .data(scope.graph.edges)
                .enter().append("line")
                .attr("class", "edge")
                .attr("x1", function(d) {
                    var team = scope.playerDict[d.batsman.toString()]["team"]
                    return teamScale(team) + (teamScale.bandwidth() / 2);
                })
                .attr("y1", function(d) {
                    var team = scope.playerDict[d.batsman.toString()]["team"]
                    return coordinateDict[team]["playerDict"][d.batsman.toString()]
                })
                .attr("x2", function(d) {
                    var team = scope.playerDict[d.bowler.toString()]["team"]
                    return teamScale(team) + (teamScale.bandwidth() / 2);
                })
                .attr("y2", function(d) {
                    var team = scope.playerDict[d.bowler.toString()]["team"]
                    return coordinateDict[team]["playerDict"][d.bowler.toString()]
                })
                .style("stroke", "#888888")
                .style("stroke-width", 2)
                .style("opacity", 0.5)
                .style("display", "none")


            var playerNodes = svg.selectAll(".playerNode")
                .data(scope.graph.nodes)
                .enter().append("circle")
                .attr("class", "playerNode")
                .attr("cx", function(d) { return teamScale(d.team) + (teamScale.bandwidth() / 2); })
                .attr("cy", function(d) { return coordinateDict[d.team]["playerDict"][d.id.toString()] })
                .attr("r", 4)
                .attr("fill", function(d) { return teamColors[d.team]; })
                .on("mouseover", function(d) {
                    if (selectedPlayer == null) {
                      temporaryPlayer = d.id;

                      temporaryOpponents = [];

                      scope.graph.edges.forEach(function(edge) {
                        var relevantSide = (scope.side == "Batting") ? edge.batsman : edge.bowler;
                        var opponentSide = (scope.side == "Batting") ? edge.bowler : edge.batsman;
                        if (d.id == relevantSide) {
                            temporaryOpponents.push(opponentSide);
                        }
                      })

                      d3.selectAll(".playerNode")
                          .style("display", function(node) {
                              return (node.id == temporaryPlayer || temporaryOpponents.includes(node.id)) ? "block" : "none";
                          })
                          .style("stroke", function(node) {
                              return (node == d) ? "orange" : "none";
                          })


                      d3.selectAll(".playerName")
                          .style("display", function(name) {
                              return (name.id == temporaryPlayer || temporaryOpponents.includes(name.id)) ? "block" : "none";
                          })

                    }
                    //nodeTip.show(d);
                    scope.$emit("playerStats", d);
                    if (selectedPlayer != null && selectedPlayer != d.id) {
                      var relevantEdges = scope.graph.edges.filter(function(edge) {
                        var relevantSide = (scope.side == "Batting") ? edge.batsman : edge.bowler;
                        var opponentSide = (scope.side == "Batting") ? edge.bowler : edge.batsman;
                        return selectedPlayer == relevantSide && d.id == opponentSide;
                      });
                      var relevantEdge = null;
                      if (relevantEdges.length != 0) {
                          relevantEdge = relevantEdges[0];
                      }
                      //console.log("SHOWING")
                      console.log(relevantEdge);
                      if (relevantEdge != null) {
                          edgeTip.show(relevantEdge);
                      }
                    }
                })
                .on("mouseout", function(d) {
                    if (selectedPlayer == null) {
                      temporaryPlayer = null;
                      d3.select(".xAxis").selectAll("text")
                          .style("fill", "black")
                      temporaryOpponents = [];
                      //d3.selectAll(".edge").style("display", "none")
                      if (temporaryPlayers != null) {
                        d3.selectAll(".playerNode").style("display", function(d) {
                            var condition1 = scope.side == "Batting" && temporaryPlayers["batsmen"].includes(d.id);
                            var condition2 = scope.side == "Bowling" && temporaryPlayers["bowlers"].includes(d.id);
                            return (condition1 || condition2) ? "block": "none";
                        }).style("stroke", "none")

                        d3.selectAll(".playerName").style("display", function(d) {
                            var condition1 = scope.side == "Batting" && temporaryPlayers["batsmen"].includes(d.id);
                            var condition2 = scope.side == "Bowling" && temporaryPlayers["bowlers"].includes(d.id);
                            return (condition1 || condition2) ? "block": "none";
                        })
                      } else {
                        d3.selectAll(".playerName").style("display", "block");
                        d3.selectAll(".playerNode").style("display", "block")
                            .style("stroke", "none");
                      }

                    }
                    //nodeTip.hide();
                    scope.$emit("playerStats", null);
                    if (selectedPlayer != null && selectedPlayer != d.id) {
                        edgeTip.hide();
                    }
                })
                .on("click", function(d) {
                    //d3.selectAll(".selection").remove();
                    scope.$emit("clearBrushes2", "clearBrushes")
                    temporaryPlayers = null;
                    d3.selectAll(".edge").style("display", "none")
                    if (selectedPlayer != d.id) {
                      if (selectedPlayer != null) {
                          edgeTip.hide();
                      }
                      selectedPlayer = d.id;

                      selectedTeam = null;
                      d3.select(".xAxis").selectAll("text")
                          .style("fill", "black")
                      relevantOpponents = [];

                      scope.graph.edges.forEach(function(edge) {
                        var relevantSide = (scope.side == "Batting") ? edge.batsman : edge.bowler;
                        var opponentSide = (scope.side == "Batting") ? edge.bowler : edge.batsman;
                        if (d.id == relevantSide) {
                            relevantOpponents.push(opponentSide);
                        }
                      })

                      d3.selectAll(".playerNode")
                          .style("display", function(node) {
                              return (node.id == selectedPlayer || relevantOpponents.includes(node.id)) ? "block" : "none";
                          })
                          .style("stroke", function(node) {

                              return (node == d) ? "orange" : "none";
                          })

                      d3.selectAll(".playerName")
                          .style("display", function(name) {
                              return (name.id == selectedPlayer || relevantOpponents.includes(name.id)) ? "block" : "none";
                          })
                      scope.$emit("clickedPlayer", d);
                    } else {
                        selectedPlayer = null;
                        selectedTeam = null;
                        d3.select(".xAxis").selectAll("text")
                            .style("fill", "black")
                        relevantOpponents = [];
                        d3.selectAll(".edge").style("display", "none")
                        d3.selectAll(".playerName").style("display", "block");
                        d3.selectAll(".playerNode").style("display", "block")
                            .style("stroke", "none");
                       scope.$emit("clickedPlayer", null);
                    }
                })
                .on('contextmenu', function(d) {
                    //console.log(d);
                    d3.event.preventDefault()
                    if (selectedPlayer != null) {
                      var relevantEdge = scope.graph.edges.filter(function(edge) {
                        var relevantSide = (scope.side == "Batting") ? edge.batsman : edge.bowler;
                        var opponentSide = (scope.side == "Batting") ? edge.bowler : edge.batsman;
                        return selectedPlayer == relevantSide && d.id == opponentSide;
                      })[0];
                      currentCombo = relevantEdge;
                      d3.selectAll(".edge")
                          .style("display", function(edge) {
                              return edge == relevantEdge ? "block" : "none";
                          })
                      scope.$emit("playerCombo", relevantEdge);
                      d3.selectAll(".playerNode")
                          .style("stroke", function(node) {
                              if (node.id == selectedPlayer) {
                                  return "orange";
                              }
                              return (node == d) ? "#A120D8" : "none";
                          })
                    }
                })
                .style("cursor", "pointer")
                .style("stroke-width", 3);

            var playerNames = svg.selectAll(".playerName")
                .data(scope.graph.nodes)
                .enter().append("text")
                .attr("class", "playerName")
                .attr("x", function(d) { return teamScale(d.team) + (teamScale.bandwidth() / 2) + 9; })
                .attr("y", function(d) { return coordinateDict[d.team]["playerDict"][d.id.toString()] + 3 })
                .text(function(d) {
                    var names = d.name.split(" ");
                    var lastName = names[names.length - 1]
                    var firstInitial = names[0].charAt(0)
                    return firstInitial + ". " + lastName;
                })
                .style("font-weight", "bold")
                .style("font-size", "8px")

            var keyDict = {}
            keyDict["Runs Scored"] = "runs_scored";
            keyDict["Balls Faced"] = "balls_faced";
            keyDict["Strike Rate"] = "strike_rate";
            keyDict["Runs Conceded"] = "runs_conceded";
            keyDict["Overs Bowled"] = "overs_bowled";
            keyDict["Wickets Taken"] = "wickets_taken";

            scope.$watch('sortKey', function(newVal, oldVal) {
                //console.log(newVal);
                if (newVal != oldVal) {
                  var tempDict = {};

                  if (newVal != "Alphabetical Order") {
                    sortByKey(keyDict[newVal]);
                    var tempDivision = d3.nest()
                        .key(function(d) { return d.team })
                        .entries(scope.graph.nodes);

                    tempDivision.forEach(function(d) {
                        tempDict[d.key] = {
                            "lastPosition": 30,
                            "playerDict": {}
                        };
                        d.values.forEach(function(player) {
                            tempDict[d.key]["playerDict"][player.id.toString()] = tempDict[d.key]["lastPosition"]
                            tempDict[d.key]["lastPosition"] += 12.5;
                        })
                    })
                  }
                  edges.transition()
                      .duration(1500)
                      .attr("y1", function(d) {
                          var team = scope.playerDict[d.batsman.toString()]["team"]
                          return (newVal == "Alphabetical Order") ? coordinateDict[team]["playerDict"][d.batsman.toString()] : tempDict[team]["playerDict"][d.batsman.toString()]
                      })
                      .attr("y2", function(d) {
                          var team = scope.playerDict[d.bowler.toString()]["team"]
                          return (newVal == "Alphabetical Order") ? coordinateDict[team]["playerDict"][d.bowler.toString()] : tempDict[team]["playerDict"][d.bowler.toString()]
                      })

                  playerNodes.transition()
                      .duration(1500)
                      .attr("cy", function(d) { return (newVal == "Alphabetical Order") ? coordinateDict[d.team]["playerDict"][d.id.toString()] : tempDict[d.team]["playerDict"][d.id.toString()] })

                  playerNames.transition()
                      .duration(1500)
                      .attr("y", function(d) { return (newVal == "Alphabetical Order") ? (coordinateDict[d.team]["playerDict"][d.id.toString()] + 3) : (tempDict[d.team]["playerDict"][d.id.toString()] + 3) })
                }
            })

            scope.$on('players', function(event, newVal) {
                console.log(newVal)
                if (newVal != null) {
                  temporaryPlayers = newVal;
                  d3.selectAll(".edge").style("display", "none")
                  temporaryPlayer = null;
                  temporaryOpponents = [];
                  scope.$emit("clickedPlayer", null)
                  d3.selectAll(".playerNode").style("stroke", "none");
                  console.log(temporaryPlayers)
                  d3.selectAll(".playerNode").style("display", function(d) {
                      var condition1 = scope.side == "Batting" && temporaryPlayers["batsmen"].includes(d.id);
                      var condition2 = scope.side == "Bowling" && temporaryPlayers["bowlers"].includes(d.id);
                      return (condition1 || condition2) ? "block": "none";
                  })

                  d3.selectAll(".playerName").style("display", function(d) {
                      var condition1 = scope.side == "Batting" && temporaryPlayers["batsmen"].includes(d.id);
                      var condition2 = scope.side == "Bowling" && temporaryPlayers["bowlers"].includes(d.id);
                      return (condition1 || condition2) ? "block": "none";
                  })
                } else {
                  temporaryPlayers = null;
                  d3.selectAll(".playerNode").style("display", "block")

                  d3.selectAll(".playerName").style("display", "block")
                }

            })

            scope.$watch('side', function(newVal, oldVal) {
              if (temporaryPlayers != null) {
                d3.selectAll(".playerNode").style("display", function(d) {
                    var condition1 = newVal == "Batting" && temporaryPlayers["batsmen"].includes(d.id);
                    var condition2 = newVal == "Bowling" && temporaryPlayers["bowlers"].includes(d.id);
                    return (condition1 || condition2) ? "block": "none";
                })

                d3.selectAll(".playerName").style("display", function(d) {
                    var condition1 = newVal == "Batting" && temporaryPlayers["batsmen"].includes(d.id);
                    var condition2 = newVal == "Bowling" && temporaryPlayers["bowlers"].includes(d.id);
                    return (condition1 || condition2) ? "block": "none";
                })
              }
              if (selectedPlayer != null) {
                selectedTeam = null;
                d3.select(".xAxis").selectAll("text")
                    .style("fill", "black")
                relevantOpponents = [];
                scope.graph.edges.forEach(function(edge) {
                  var relevantSide = (newVal == "Batting") ? edge.batsman : edge.bowler;
                  var opponentSide = (newVal == "Batting") ? edge.bowler : edge.batsman;
                  if (selectedPlayer == relevantSide) {
                      relevantOpponents.push(opponentSide);
                  }
                })

                edges.style("display", "none")

                /*edges.style("display", function(edge) {
                        var relevantSide = (newVal == "Batting") ? edge.batsman : edge.bowler;
                        var opponentSide = (newVal == "Batting") ? edge.bowler : edge.batsman;
                        if (selectedPlayer == relevantSide) {
                            relevantOpponents.push(opponentSide);
                        }
                        return (selectedPlayer == relevantSide) ? 'block' : 'none';
                    })*/



              playerNodes.style("display", function(d) {
                        return (d.id == selectedPlayer || relevantOpponents.includes(d.id)) ? "block" : "none";
                    })
                    .style("stroke", function(d) {
                        return d.id == selectedPlayer ? "orange": "none"
                    })


              playerNames.style("display", function(d) {
                        return (d.id == selectedPlayer || relevantOpponents.includes(d.id)) ? "block" : "none";
                    })
              }
            })

        }
    }
})
