angular.module('myApp').directive('tournamentBracket', function() {
    var width = 1000;
    var height = 700;

    return {
        restrict: 'E',
        scope: {
            stageInformation: '=',
            stage: '='
        },
        link: function(scope, element, attrs) {
          var canvas = d3.select(element[0])
              .append("svg")
              .attr("width", width)
              .attr("height", height)

          canvas.append("rect")
              .attr("width", width)
              .attr("height", height)
              .attr("fill", "#EEEEEE")
              .style("stroke", "black")

          var pool_a = ["New Zealand", "Australia", "Sri Lanka", "Bangladesh", "England", "Afghanistan", "Scotland"];
          var a_qualifiers = ["New Zealand", "Australia", "Sri Lanka", "Bangladesh"];
          var pool_b = ["India", "South Africa", "Pakistan", "West Indies", "Ireland", "Zimbabwe", "United Arab Emirates"];
          var b_qualifiers = ["India", "South Africa", "Pakistan", "West Indies"];

          var semi_finalists = ["New Zealand", "South Africa", "Australia", "India"];
          var finalists = ["Australia", "New Zealand"];
          var winner = "Australia";

          var poolAScale = d3.scaleBand().domain(pool_a).range([100, 600]);
          var poolBScale = d3.scaleBand().domain(pool_b).range([100, 600]);

          var stageScale = d3.scaleBand().domain(["QF", "SF", "F"]).range([100, 900]);

          var qf1 = d3.scaleBand().domain(["New Zealand", "West Indies"]).range([40, 180]);
          var qf2 = d3.scaleBand().domain(["Sri Lanka", "South Africa"]).range([200, 340]);
          var qf3 = d3.scaleBand().domain(["Pakistan", "Australia"]).range([360, 500]);
          var qf4 = d3.scaleBand().domain(["India", "Bangladesh"]).range([520, 660]);

          var sf1 = d3.scaleBand().domain(["South Africa", "New Zealand"]).range([120, 260]);
          var sf2 = d3.scaleBand().domain(["Australia", "India"]).range([440, 580]);

          var final = d3.scaleBand().domain(["New Zealand", "Australia"]).range([280, 420]);

          var findQFPosition = function(team) {
              if (team == "New Zealand" || team == "West Indies") {
                  return qf1(team);
              } else if (team == "Sri Lanka" || team == "South Africa") {
                  return qf2(team);
              } else if (team == "Pakistan" || team == "Australia") {
                  return qf3(team);
              } else {
                  return qf4(team);
              }
          }

          var findSFPosition = function(team) {
              if (team == "South Africa" || team == "New Zealand") {
                  return sf1(team);
              } else {
                  return sf2(team);
              }
          }

          var drawGroupInfo = function() {
              var groupInfo = scope.stageInformation.filter(function(d) {
                  return d.stage == "group";
              });

              var g = canvas.append("g").attr("class", "groupInfo");

              var teamInfo = g.selectAll(".group_team")
                  .data(groupInfo)
                  .enter().append("g")
                  .attr("class", "group_team")
                  .attr("fill", function(d) {
                      return a_qualifiers.includes(d.team) || b_qualifiers.includes(d.team) ? "#90F9C1" : "#EEEEEE";
                  })
                  .style("cursor", "pointer")
                  .on("mouseover", function(d) {
                      d3.select(this).selectAll("rect")
                          .style("stroke", "gold")
                          .style("stroke-width", "3px");
                  })
                  .on("mouseout", function(d) {
                      d3.select(this).selectAll("rect")
                          .style("stroke", "#AAAAAA")
                          .style("stroke-width", "1px");
                  })
                  .on("click", function(d) {
                      scope.$emit("team", d.team);
                  })
                  .attr("transform", function(d) {
                      var x = d.group == "A" ? 50 : 650;
                      var y = d.group == "A" ? poolAScale(d.team) : poolBScale(d.team);
                      return "translate(" + [x, y] + ")";
                  })

              g.append("text")
                  .attr("x", 200)
                  .attr("y", 75)
                  .text("Group A")
                  .style("text-anchor", "middle")
                  .style("fill", "#2764C6")
                  .style("font-weight", "bold")
                  .style("font-size", "18px");

              g.append("text")
                  .attr("x", 800)
                  .attr("y", 75)
                  .text("Group B")
                  .style("text-anchor", "middle")
                  .style("fill", "#2764C6")
                  .style("font-weight", "bold")
                  .style("font-size", "18px");

              teamInfo.append("rect")
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("width", 230)
                  .attr("height", poolAScale.bandwidth())
                  .style("stroke", "#AAAAAA")

              teamInfo.append("text")
                  .attr("x", 115)
                  .attr("y", 40)
                  .text(function(d) { return d.team; })
                  .style("text-anchor", "middle")
                  .style("fill", "black")
                  .style("font-weight", "bold")
                  .style("font-size", "18px");

              teamInfo.append("rect")
                  .attr("x", 230)
                  .attr("y", 0)
                  .attr("width", 70)
                  .attr("height", poolAScale.bandwidth())
                  .style("stroke", "#AAAAAA")

              teamInfo.append("text")
                  .attr("x", 265)
                  .attr("y", 40)
                  .text(function(d) { return d.group_score; })
                  .style("text-anchor", "middle")
                  .style("fill", "black")
                  .style("font-weight", "bold")
                  .style("font-size", "18px");
          }

          var drawKnockoutInfo = function() {
            var knockoutInfo = scope.stageInformation.filter(function(d) {
                return d.stage != "group";
            });

            var k = canvas.append("g").attr("class", "knockoutInfo");

            k.append("text")
                .attr("x", stageScale("QF") + (stageScale.bandwidth() / 2))
                .attr("y", 30)
                .text("Quarter-Final")
                .style("text-anchor", "middle")
                .style("fill", "#2764C6")
                .style("font-weight", "bold")
                .style("font-size", "18px");

            k.append("text")
                .attr("x", stageScale("SF") + (stageScale.bandwidth() / 2))
                .attr("y", 30)
                .text("Semi-Final")
                .style("text-anchor", "middle")
                .style("fill", "#2764C6")
                .style("font-weight", "bold")
                .style("font-size", "18px");

            k.append("text")
                .attr("x", stageScale("F") + (stageScale.bandwidth() / 2))
                .attr("y", 30)
                .text("Final")
                .style("text-anchor", "middle")
                .style("fill", "#2764C6")
                .style("font-weight", "bold")
                .style("font-size", "18px");

            var teamInfo = k.selectAll(".knockout_team")
                .data(knockoutInfo)
                .enter().append("g")
                .attr("class", "knockout_team")
                .style("cursor", "pointer")
                .on("mouseover", function(d) {
                    d3.select(this).selectAll("rect")
                        .style("stroke", "gold")
                        .style("stroke-width", "3px");
                })
                .on("mouseout", function(d) {
                    d3.select(this).selectAll("rect")
                        .style("stroke", "#AAAAAA")
                        .style("stroke-width", "1px");
                })
                .on("click", function(d) {
                    scope.$emit("team", d.team);
                })
                .attr("transform", function(d) {
                    var y = 0;
                    if (d.stage == "QF") {
                        y = findQFPosition(d.team);
                    } else if (d.stage == "SF") {
                        y = findSFPosition(d.team);
                    } else {
                        y = final(d.team);
                    }
                    return "translate(" + [stageScale(d.stage), y] + ")"
                })
                .attr("fill", function(d) {
                    var condition1 = semi_finalists.includes(d.team) && d.stage == "QF";
                    var condition2 = finalists.includes(d.team) && d.stage == "SF";
                    var condition3 = winner == d.team && d.stage == "F";
                    return (condition1 || condition2 || condition3) ? "#90F9C1" : "#EEEEEE"
                    //return (semi_finalists.includes(d.team) || finalists.includes(d.team) || d.team == winner) ? "#90F9C1" : "#EEEEEE"
                })

            teamInfo.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 120)
                .attr("height", 70)
                .style("stroke", "#AAAAAA")

            teamInfo.append("rect")
                .attr("x", 120)
                .attr("y", 0)
                .attr("width", 80)
                .attr("height", 70)
                .style("stroke", "#AAAAAA")

            teamInfo.append("text")
                .attr("x", 160)
                .attr("y", 40)
                .text(function(d) {
                    return d.match_score + "-" + d.wickets;
                })
                .style("text-anchor", "middle")
                .style("fill", "black")
                .style("font-weight", "bold")
                .style("font-size", "18px");

            teamInfo.append("text")
                .attr("x", 60)
                .attr("y", 40)
                .text(function(d) { return d.team; })
                .style("text-anchor", "middle")
                .style("fill", "black")
                .style("font-weight", "bold")
                .style("font-size", "18px");
          }

          drawGroupInfo();
          drawKnockoutInfo();

          scope.$watch('stage', function(newVal, oldVal) {
              if (newVal == "Group") {
                  canvas.selectAll(".groupInfo").style("display", "block");
                  canvas.selectAll(".knockoutInfo").style("display", "none");
              } else {
                  canvas.selectAll(".groupInfo").style("display", "none");
                  canvas.selectAll(".knockoutInfo").style("display", "block");
              }
          })
        }
    }
})
