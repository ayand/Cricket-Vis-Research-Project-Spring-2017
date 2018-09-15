angular.module('myApp').directive('partnershipMatrix', function() {
    var height = 315;

    var convertDimension = function(d) {
        return ((d * height) / 350);
    }

    var width = convertDimension(560);
    var margin = convertDimension(80);

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
            var canvas = d3.select(element[0])
                .append("svg")
                .attr("width", width)
                .attr("height", height)

            canvas.append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "white")

            canvas.append("rect")
                .attr("width", convertDimension(380))
                .attr("height", convertDimension(240))
                .attr("x", convertDimension(90))
                .attr("y", convertDimension(55))
                .attr("fill", "#BBBBBB")
                .style("stroke", "#BBBBBB")

            var tooltipText = function(d) {
                var line1 = "<strong>" + d.batsman_1 + " and " + d.batsman_2 + "</strong><br>";
                var line2 = "<strong>" + d.score + " runs</strong>";
                return line1 + line2;
            }

            var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return tooltipText(d); });
            canvas.call(tip);

            var batsmanYScale = d3.scaleBand().domain(scope.batsmen).range([convertDimension(55), height - convertDimension(55)])
            var batsmanXScale = d3.scaleBand().domain(scope.batsmen).range([convertDimension(90), width - convertDimension(90)])

            var xShift = batsmanXScale.bandwidth() / 2

            var scoreRange = d3.extent(scope.partnerships.map(function(d) {
                return d.score;
            }))

            var colorScale = d3.scaleQuantile().domain(scoreRange).range(["#ADCCFF", "#97BAF1", "#82AAE3", "#6B99D5", "#5287C7", "#3777B9", "#0868AC"])

            var invalidPartnerships = canvas.selectAll(".invalidPartnership")
                .data(scope.batsmen)
                .enter().append("rect")
                .attr("class", "invalidPartnership")
                .attr("width", batsmanXScale.bandwidth())
                .attr("height", batsmanYScale.bandwidth())
                .attr("fill", "#555555")
                .style("stroke", "black")
                .style("stroke-width", "1px")
                .attr("x", function(d) {
                    return batsmanXScale(d);
                })
                .attr("y", function(d) {
                    return batsmanYScale(d);
                })

            var partnerships = canvas.selectAll(".partnership")
                .data(scope.partnerships)
                .enter().append("rect")
                .attr("class", "partnership")
                .attr("width", batsmanXScale.bandwidth())
                .attr("height", batsmanYScale.bandwidth())
                .attr("x", function(d) {
                    return batsmanXScale(d.batsman_1);
                })
                .attr("y", function(d) {
                    return batsmanYScale(d.batsman_2);
                })
                .attr("fill", function(d) {
                    return colorScale(d.score);
                })
                .style("stroke", "black")
                .style("stroke-width", "1px")
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide)
                .style("cursor", "pointer")

            canvas.append("g")
                .attr("class", "yAxis")
                .attr("transform", "translate(" + convertDimension(90) + ", 0)")
                .call(d3.axisLeft(batsmanYScale))

            canvas.select(".yAxis")
                .selectAll("text")
                .text(function(d) {
                    var names = d.split(" ")
                    var firstName = names[0].charAt(0)
                    var lastName = names[names.length - 1]
                    return firstName + ". " + lastName
                })
                .style("font-size", "10px")

                canvas.append("g")
                    .attr("class", "xAxis")
                    .attr("transform", "translate(0, " + convertDimension(55) + ")")
                    .call(d3.axisTop(batsmanXScale))

                canvas.select(".xAxis")
                    .selectAll("text")
                    .text(function(d) {
                        var names = d.split(" ")
                        var firstName = names[0].charAt(0)
                        var lastName = names[names.length - 1]
                        return firstName + ". " + lastName
                    })
                    .style("font-size", "10px")
                    .attr("transform", "translate(" + (xShift - 5) + ", -20) rotate(-40)")

                canvas.select(".xAxis").selectAll("path").style("opacity", 0)
                canvas.select(".yAxis").selectAll("path").style("opacity", 0)

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
