angular.module('myApp').directive('partnershipBars', function() {
  var height = 315;

  var convertDimension = function(d) {
      return ((d * height) / 350);
  }

  var width = convertDimension(560);
  var margin = convertDimension(10);

  return {
      restrict: 'E',
      scope: {
          partnerships: '=',
          batsmen: '=',
          balls: '=',
          min: '=',
          max: '='
      },
      link: function(scope, element, attrs) {


        scope.partnerships.sort(function(a, b) {
          return a.position - b.position
        })

        console.log(scope.partnerships)

        var primaryTeamColors = {};
        primaryTeamColors["India"] = "#0080FF";
        primaryTeamColors["Bangladesh"] = "#5AAB54";
        primaryTeamColors["United Arab Emirates"] = "#003366";
        primaryTeamColors["Scotland"] = "#66B2FF";
        primaryTeamColors["Ireland"] = "#80FF00";
        primaryTeamColors["Afghanistan"] = "#0066CC";
        primaryTeamColors["England"] = "#004C99";
        primaryTeamColors["South Africa"] = "#006633";
        primaryTeamColors["Australia"] = "gold";
        primaryTeamColors["New Zealand"] = "#000000";
        primaryTeamColors["West Indies"] = "#660000";
        primaryTeamColors["Pakistan"] = "#00CC00";
        primaryTeamColors["Zimbabwe"] = "#CC0000";
        primaryTeamColors["Sri Lanka"] = "#000099";

        var secondaryTeamColors = {};
        secondaryTeamColors["India"] = "#82C0FF";
        secondaryTeamColors["Bangladesh"] = "#9CC999";
        secondaryTeamColors["United Arab Emirates"] = "#9AA3AD";
        secondaryTeamColors["Scotland"] = "#C6E2FF";
        secondaryTeamColors["Ireland"] = "#CEFF9E";
        secondaryTeamColors["Afghanistan"] = "#9DB3C9";
        secondaryTeamColors["England"] = "#798B9E";
        secondaryTeamColors["South Africa"] = "#8ECEAE";
        secondaryTeamColors["Australia"] = "#FFF2AA";
        secondaryTeamColors["New Zealand"] = "#E0E0E0";
        secondaryTeamColors["West Indies"] = "#AA7575";
        secondaryTeamColors["Pakistan"] = "#A0BFA0";
        secondaryTeamColors["Zimbabwe"] = "#CC8282";
        secondaryTeamColors["Sri Lanka"] = "#5D5D8C";


        var canvas = d3.select(element[0])
            .append("svg")
            .attr("width", width)
            .attr("height", height)

        canvas.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "white")
            .style("stroke", "black")

        /*canvas.append("rect")
            .attr("x", margin)
            .attr("y", margin)
            .attr("width", width - (2 * margin))
            .attr("height", height - (2 * margin))
            .attr("fill", "white")
            .style("stroke", "black")*/

        var rowHeight = (height - (2 * margin)) / scope.partnerships.length
        var barHeight = rowHeight / 2;

        var max1 = d3.max(scope.partnerships.map(d => d.batsman_1_score))
        var max2 = d3.max(scope.partnerships.map(d => d.batsman_2_score))
        var max = (max1 > max2) ? max1 : max2;

        var leftScale = d3.scaleLinear().domain([max, 0]).range([margin + 145, (width / 2)])
        var rightScale = d3.scaleLinear().domain([0, max]).range([(width / 2), width - margin - 145])

        var partnerships = canvas.selectAll(".partnershipBar")
            .data(scope.partnerships)
            .enter()
            .append("g")
            .attr("class", "partnershipBar")
            .attr("transform", (d, i) => "translate(0," + (margin + (i * rowHeight)) + ")")
            .on("mouseover", console.log)
            .style("cursor", "pointer")

        partnerships.append("text")
            .attr("x", width / 2)
            .attr("y", (rowHeight / 4) + 5)
            .text(d => d.score)
            .style("text-anchor", "middle")
            .style("font-size", "13px");

        partnerships.append("rect")
            .attr("x", d => leftScale(d.batsman_1_score))
            .attr("y", barHeight)
            .attr("height", barHeight)
            .attr("width", d => leftScale(0) - leftScale(d.batsman_1_score))
            .attr("fill", d => primaryTeamColors[d["team"]])
            .style("stroke", "none")

        partnerships.append("rect")
            .attr("x", width / 2)
            .attr("y", barHeight)
            .attr("height", barHeight)
            .attr("width", d => rightScale(d.batsman_2_score) - rightScale(0))
            .attr("fill", d => secondaryTeamColors[d["team"]])
            .style("stroke", "none")

        partnerships.append("text")
            .attr("x", margin)
            .attr("y", margin + barHeight)
            .text(function(d) {
              var names = d.batsman_1.split(" ")
              var firstName = names[0].charAt(0)
              var lastName = names[names.length - 1]
              return firstName + ". " + lastName + " (" + d.batsman_1_score + ")"
            })
            .style("text-anchor", "start")
            .style("font-weight", "bold")

        partnerships.append("text")
            .attr("x", width - margin)
            .attr("y", margin + barHeight)
            .text(function(d) {
              var names = d.batsman_2.split(" ")
              var firstName = names[0].charAt(0)
              var lastName = names[names.length - 1]
              return "(" + d.batsman_2_score + ") " + firstName + ". " + lastName
            })
            .style("text-anchor", "end")
            .style("font-weight", "bold")

            scope.$watch("min", function(newMin, oldMin) {
                scope.$watch("max", function(newMax, oldMax) {
                    var validBalls = scope.balls.filter(function(d) {
                        var over = Math.ceil(d.ovr);
                        return over >= newMin && over <= newMax;
                    })

                    var currentBatsmen = Array.from(new Set(
                        validBalls.map(function(d) {
                            return d.batsman_name;
                        })
                    ));

                    var currentSeconds = Array.from(new Set(
                        validBalls.map(function(d) {
                            return d.non_striker;
                        })
                    ));

                    var activePlayers = currentBatsmen.concat(currentSeconds);

                    partnerships.style("display", function(d) {
                        return activePlayers.includes(d.batsman_1) && activePlayers.includes(d.batsman_2) ? "block" : "none"
                    })
                })
            })

      }
  }
})
