angular.module('myApp').directive('overSummaryChart', function() {
  var margin = 20;
  var height = 450;
  var width = 610;

  return {
    restrict: 'E',
    scope: {
      val: '=',
      team: '=',
      min: '=',
      max: '='
    },
    link: function (scope, element, attrs) {
      var vis = d3.select(element[0])
        .append("svg")
          .attr("width", width)
          .attr("height", height);

      var overNumbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
          21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,
          44,45,46,47,48,49,50];

      var overs = d3.scaleBand().range([margin, (width - margin)]);
      overs.domain(overNumbers);

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

      var barHeight = function(d) {
          //console.log(d);
          if (d.key == "wicket") {
              return 7;
          } else {
              return 12;
          }
      }

      scope.$watch('team', function(newTeam, oldTeam) {
          if (!newTeam) {
              return;
          }
          scope.$watch('val', function(newVal, oldVal) {
              vis.selectAll("*").remove();

              if (!newVal) {
                  return;
              }

              var stack = d3.stack()
                  .keys(["runs", "wickets"])
                  .order(d3.stackOrderNone)
                  .offset(d3.stackOffsetNone);

              var series = stack(newVal);
              //console.log(series);

              var bars = vis.selectAll('g')
                  .data(series)
                  .enter().append("g")
                      .attr('class', 'summary-bar')
                      .attr("fill", function(d, i) {
                        if (d.key == "runs") {
                            return teamColors[newTeam];
                        } else {
                            return "#FF6600"
                        }
                      })
                  .selectAll("rect")
                  .data(function(d) { return d; })
                  .enter().append("rect")
                      .attr("x", function(d, i) {
                          return overs(i + 1);
                      })
                      .attr("y", function(d) {
                          return height - margin - (10 * d[1])
                      })
                      .attr("height", function(d) {
                          return (10 * (d[1] - d[0]))
                      })
                      .attr("width", overs.bandwidth())


              var overAxis = d3.axisBottom(overs);
              overAxis.tickValues([5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
              vis.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0, " + (height - margin) + ")")
                  .call(overAxis)
          });

      });

      scope.$watch('min', function(newMin, oldMin) {
          scope.$watch('max', function(newMax, oldMax) {
              /*console.log("min: " + newMin);
              console.log("max: " + newMax);*/
              vis.selectAll('.summary-bar')
                  .selectAll('rect')
                  .style("opacity", function(d, i) {
                      //console.log('i: ' + i);
                      //console.log('changing');
                      var over = i + 1;
                      if (over >= newMin && over <= newMax) {
                          //console.log('not fading');
                          return 1;
                      } else {
                          //console.log('fading');
                          return 0.2;
                      }
                  })
          })
      })
    }
  }
})
