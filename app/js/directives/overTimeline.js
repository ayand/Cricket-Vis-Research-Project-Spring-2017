angular.module('myApp').directive('overTimeline', function() {
  var height = 250;

  var convertDimension = function(d) {
      return ((d * height) / 475)
  }

  var width = convertDimension(720);
  var margin = convertDimension(60);

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
      restrict: "E",
      scope: {
          balls: "=",
          min: '=',
          max: '='
      },
      link: function(scope, element, attrs) {
        var vis = d3.select(element[0])
          .append("svg")
            .attr("width", width)
            .attr("height", height);

        var maxScore = d3.max(scope.balls, function(d) { return d.cumul_runs; })

        var runScale = d3.scaleLinear().domain([0, maxScore]).range([height - margin, margin]);
        var overScale = d3.scaleLinear().domain([1, 50]).range([margin, width - convertDimension(225)]);

        vis.append("g")
            .attr("class", "yAxis")
            .attr("transform", "translate("+[margin,0]+")")
            .call(d3.axisLeft(runScale))

        vis.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate("+[0,height - margin]+")")
            .call(d3.axisBottom(overScale));

        var data = d3.nest()
            .key(function(d) { return d.batting_team; })
            .key(function(d) { return Math.ceil(d.ovr); })
            .rollup(function(leaves) { return {
                  "maxScore": d3.max(leaves, function(d) { return d.cumul_runs; }),
                  "team": leaves[0].batting_team,
                  "wickets": leaves.filter(function(d) { return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd" })
              } })
            .entries(scope.balls);


        for (var i = 0; i < data.length; i++) {
            var lineSegments = [];
            for (var j = 0; j < data[i].values.length - 1; j++) {
                var line = {
                    "over1": data[i].values[j].key,
                    "score1": data[i].values[j].value.maxScore,
                    "over2": data[i].values[j + 1].key,
                    "score2": data[i].values[j + 1].value.maxScore
                }
                lineSegments.push(line);
            }
            data[i].lines = lineSegments;
        }

        var inning = vis.selectAll(".innings")
            .data(data)
            .enter().append("g")
            .attr("class", "innings")
            .attr("fill", function(d) { return teamColors[d.key] })
            .style("stroke", function(d) { return teamColors[d.key] });

        var lines = inning.selectAll(".segment")
            .data(function(d) { return d.lines; })
            .enter().append("line")
            .attr("class", "segment")
            .attr("x1", function(d) { return overScale(d.over1); })
            .attr("y1", function(d) { return runScale(d.score1); })
            .attr("x2", function(d) { return overScale(d.over2); })
            .attr("y2", function(d) { return runScale(d.score2); })
            .style("stroke-width", 2);

        var wicket = inning.selectAll(".wicket")
            .data(function(d) { return d.values; })
            .enter().append("g")
            .attr("class", "wicket")
            .attr("transform", function(d) {
                return "translate("+[overScale(d.key), runScale(d.value.maxScore)]+")"
            });

        var wicketBall = wicket.selectAll(".wicketBall")
            .data(function(d) { return d.value.wickets; })
            .enter().append("circle")
            .attr("class", "wicketBall")
            .attr("r", convertDimension(3))
            .attr("transform", function(d, i) {
                var direction = d.inning == 1 ? -1 : 1;
                var y = direction * i * convertDimension(7);
                return "translate("+[0,y]+")";
            })
            .attr("fill", "#F45333")
            .style("stroke", "#F45333");


        var teamNames = data.map(function(d) { return d.key; });

        var legend = vis.selectAll(".legend")
            .data(teamNames)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate("+[width - convertDimension(220), margin + (i * convertDimension(50))]+")" })
            .on("mouseover", function(d) {
                inning.style("opacity", function(i) {
                    return i.key == d ? 1 : 0.1;
                })
            })
            .on("mouseout", function() {
                inning.style("opacity", 1);
            })
            .style("cursor", "pointer");

        legend.append("circle")
            .attr("cx", convertDimension(50))
            .attr("cy", convertDimension(22))
            .attr("r", convertDimension(10))
            .attr("fill", function(d) { return teamColors[d]; })

        legend.append("text")
            .attr("x", convertDimension(70))
            .attr("y", convertDimension(27))
            .text(function(d) { return d; })
            .style("font-size", convertDimension(15))

        vis.append("text")
            .attr("x", convertDimension(30))
            .attr("y", convertDimension(45))
            .text("Score");

        vis.append("text")
            .attr("x", width - convertDimension(225))
            .attr("y", height - convertDimension(20) + 10)
            .text("Over")
            .style("text-anchor", "end");

        scope.$watch('min', function(newMin, oldMin) {
            scope.$watch('max', function(newMax, oldMax) {

                lines.style("opacity", function(d) {
                    var greaterThan = d.over1 >= newMin;
                    var lessThan = d.over2 <= newMax;
                    return greaterThan && lessThan ? 1 : 0.1;
                })

                wicketBall.style("opacity", function(d) {
                    var o = Math.ceil(d.ovr);
                    return (o >= newMin && o <= newMax) ? 1 : 0.1;
                })
            })
        })

      }
  }

})
