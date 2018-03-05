angular.module('myApp').directive('playerGraph', function() {
    return {
        restrict: 'EA',
        scope: {
            graph: '=',
            playerDict: '=',
            imageDict: '=',
            side: '='
        },
        link: function(scope, element, attrs) {
            var svg = d3.select(element[0])
                .append("svg")
                .attr("width", 1500)
                .attr("height", 370);

            console.log(scope.graph.edges.length);

            var nodeTipText = function(d) {
                /*var table = "<table>\
                                <tr>\
                                    <td><img height='50' src=" + scope.imageDict[scope.playerDict[d.id.toString()]["name"]] + "></td> \
                                </tr>\
                                <p>" + d.name + "</p>\
                                <p>" + d.team + "</p>\
                             </table>"*/

                return "<img align='center' class='center-block' height='50' src=" + scope.imageDict[scope.playerDict[d.id.toString()]["name"]] + ">\
                    <hr>\
                    <p align='center'>" + d.name + "</p>\
                    <p align='center'>" + d.team + "</p>";
            }

            var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return nodeTipText(d); });
            svg.call(tip);

            var teams = Array.from(new Set(scope.graph.nodes.map(function(d) {
                return d.team;
            })));

            teams.sort();

            var teamScale = d3.scaleBand().domain(teams).range([0, 1450]);

            svg.append("g")
                .attr("class", "xAxis")
                .attr("transform", "translate(0, 20)")
                .call(d3.axisTop(teamScale));

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
                    coordinateDict[d.key]["lastPosition"] += 18;
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
            var relevantOpponents = [];

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
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide)
                .on("click", function(d) {
                    if (selectedPlayer != d.id) {
                      selectedPlayer = d.id;

                      relevantOpponents = [];
                      d3.selectAll(".edge")
                          .style("display", function(edge) {
                              var relevantSide = (scope.side == "Batting") ? edge.batsman : edge.bowler;
                              var opponentSide = (scope.side == "Batting") ? edge.bowler : edge.batsman;
                              if (d.id == relevantSide) {
                                  relevantOpponents.push(opponentSide);
                              }
                              return (d.id == relevantSide) ? 'block' : 'none';
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
                    } else {
                        selectedPlayer = null;
                        relevantOpponents = [];
                        d3.selectAll(".edge").style("display", "none")
                        d3.selectAll(".playerName").style("display", "block");
                        d3.selectAll(".playerNode").style("display", "block")
                            .style("stroke", "none");
                    }
                })
                .style("cursor", "pointer")
                .style("stroke-width", 3);

            var playerNames = svg.selectAll(".playerName")
                .data(scope.graph.nodes)
                .enter().append("text")
                .attr("class", "playerName")
                .attr("x", function(d) { return teamScale(d.team) + (teamScale.bandwidth() / 2) + 11; })
                .attr("y", function(d) { return coordinateDict[d.team]["playerDict"][d.id.toString()] + 3 })
                .text(function(d) {
                    var names = d.name.split(" ");
                    var lastName = names[names.length - 1]
                    var firstInitial = names[0].charAt(0)
                    return firstInitial + ". " + lastName;
                })
                .style("font-weight", "bold")
                .style("font-size", "10px")

            scope.$watch('side', function(newVal, oldVal) {
              if (selectedPlayer != null) {
                relevantOpponents = [];
                edges.style("display", function(edge) {
                        var relevantSide = (newVal == "Batting") ? edge.batsman : edge.bowler;
                        var opponentSide = (newVal == "Batting") ? edge.bowler : edge.batsman;
                        if (selectedPlayer == relevantSide) {
                            relevantOpponents.push(opponentSide);
                        }
                        return (selectedPlayer == relevantSide) ? 'block' : 'none';
                    })


              playerNodes.style("display", function(d) {
                        return (d.id == selectedPlayer || relevantOpponents.includes(d.id)) ? "block" : "none";
                    })


              playerNames.style("display", function(d) {
                        return (d.id == selectedPlayer || relevantOpponents.includes(d.id)) ? "block" : "none";
                    })
              }
            })

        }
    }
})
