angular.module('myApp').directive('zoneDonut', function() {
    var svgDimension = 580;

    var decideColors = function(i) {
      var colors = ["#550000", "#770000", "#990000", "#CC0000", "#FF0000",
          "#FF5500", "#FF7700", "#FF9900"];

      return colors[i];
    }

    return {
        restrict: 'EA',
        scope: {
          batsmen: '=',
          bowlers: '=',
          min: '=',
          max: '=',
        },
        link: function(scope, element, attrs) {
          var vis = d3.select(element[0])
            .append("svg")
              .attr("width", svgDimension)
              .attr("height", svgDimension);

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
            .outerRadius((svgDimension / 2) - 10)
            .innerRadius((svgDimension / 2) - 50);

          var arcs1 = vis.selectAll("g.arc")
            .data(zoneDonut(zones))
            .enter()
            .append("g")
            .attr("transform", "translate(" + (svgDimension / 2) + ", "
                + (svgDimension / 2) + ")");

          arcs1.append("path")
            .attr("class", "zone-path")
            .attr("fill", function(d, i) {
                //console.log("Index: " + i);
                return decideColors(i);
            })
            .style("stroke", "white")
            .attr("d", arc1);

          arcs1.append("text")
              .attr("transform", function(d) { return "translate(" + arc1.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .attr("font-family", "sans-serif")
              .attr("fill", "white")
              .text(function(d) { return d.data.zone; });

          var selectedZone = 0;

          /*arcs1.on("click", function(d) {
            var colors = ["#550000", "#770000", "#990000", "#CC0000", "#FF0000",
                "#FF5500", "#FF7700", "#FF9900"];

              if (selectedZone == d.data.zone) {
                  selectedZone = 0;
                  d3.selectAll(".zone-path")
                      .attr("fill", function(path, i) {
                          //console.log(colors)
                          //return "green";
                          switch (path.data.zone) {
                              case 1:
                                  return "#550000";
                              case 2:
                                  return "#770000";
                              case 3:
                                  return "#990000";
                              case 4:
                                  return "#CC0000";
                              case 5:
                                  return "#FF0000";
                              case 6:
                                  return "#FF5500";
                              case 7:
                                  return "#FF7700";
                              case 8:
                                  return "#FF9900";
                          }
                  });
                  d3.selectAll(".dot")
                      .style("display", function(dot) {
                          var batsmanCondition = true;
                          if (scope.batsmen.length != 0) {
                              batsmanCondition = scope.batsmen.includes(dot.batsman);
                          }
                          var bowlerCondition = true;
                          if (scope.bowlers.length != 0) {
                              bowlerCondition = scope.bowlers.includes(dot.bowler);
                          }
                          var over = Math.floor(dot.ovr) + 1;
                          var overCondition = ((over >= scope.min) && (over <= scope.max));
                          //var zoneCondition = (selectedZone == 0 || selectedZone == d.z);
                          if (batsmanCondition && bowlerCondition && overCondition) {
                              return 'block';
                          } else {
                              return 'none';
                          }
                  });
              } else {
                  selectedZone = d.data.zone;
                  d3.selectAll(".zone-path")
                      .attr("fill", function(path, i) {
                          if (selectedZone == path.data.zone) {
                            switch (path.data.zone) {
                                case 1:
                                    return "#550000";
                                case 2:
                                    return "#770000";
                                case 3:
                                    return "#990000";
                                case 4:
                                    return "#CC0000";
                                case 5:
                                    return "#FF0000";
                                case 6:
                                    return "#FF5500";
                                case 7:
                                    return "#FF7700";
                                case 8:
                                    return "#FF9900";
                            }
                          } else {
                              return 'gray';
                          }
                  });
                  d3.selectAll(".dot")
                  .style("display",function(d){
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
                      var zoneCondition = (selectedZone == 0 || selectedZone == d.z);
                      if (batsmanCondition && bowlerCondition && overCondition && zoneCondition) {
                          return 'block';
                      } else {
                          return 'none';
                      }
                  });
              }
          });*/
        }
    }
})
