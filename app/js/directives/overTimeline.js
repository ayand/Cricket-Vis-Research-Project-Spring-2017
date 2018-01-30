angular.module('myApp').directive('overTimeline', function() {
  var height = 450;
  var width = 720;
  var margin = 60;

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
          balls: "="
      },
      link: function(scope, element, attrs) {
        var vis = d3.select(element[0])
          .append("svg")
            .attr("width", width)
            .attr("height", height);

        var maxScore = d3.max(scope.balls, function(d) { return d.cumul_runs; })

        var runScale = d3.scaleLinear().domain([0, maxScore]).range([height - margin, margin]);
        var overScale = d3.scaleLinear().domain([1, 50]).range([margin, width - 225]);

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
                  "team": leaves[0].batting_team
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

        console.log("Data:");
        console.log(data);

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

        var overs = inning.selectAll(".over")
            .data(function(d) { return d.values; })
            .enter().append("circle")
            .attr("class", "over")
            .attr("cx", function(d) { return overScale(d.key); })
            .attr("cy", function(d) { return runScale(d.value.maxScore); })
            .attr("r", 3);

        var teamNames = data.map(function(d) { return d.key; });

        var legend = vis.selectAll(".legend")
            .data(teamNames)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate("+[width - 220, margin + (i * 50)]+")" })
            .on("mouseover", function(d) {
                inning.style("opacity", function(i) {
                    return i.key == d ? 1 : 0.1;
                })
            })
            .on("mouseout", function() {
                inning.style("opacity", 1);
            })
            .style("cursor", "pointer");

        /*legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", (width / 2))
            .attr("height", 40)
            .attr("fill", "white")
            .style("stroke", "black")*/

        legend.append("circle")
            .attr("cx", 50)
            .attr("cy", 22)
            .attr("r", 10)
            .attr("fill", function(d) { return teamColors[d]; })

        legend.append("text")
            .attr("x", 70)
            .attr("y", 27)
            .text(function(d) { return d; })
            .style("font-size", 15)

        vis.append("text")
            .attr("x", 30)
            .attr("y", 45)
            .text("Score");

        vis.append("text")
            .attr("x", width - 225)
            .attr("y", height - 20)
            .text("Over")
            .style("text-anchor", "end");

        console.log("Successful");

      }
  }

})
