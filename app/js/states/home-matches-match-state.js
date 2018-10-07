angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home.matches.match', {
    resolve: {
        gameInfo: ['GameService', '$stateParams', function(GameService, $stateParams) {
            return GameService.getGameInfo($stateParams.id)
        }],

        players: ['GameService', function(GameService) {
            return GameService.getPlayers();
        }],

        flags: ['GameService', function(GameService) {
            return GameService.getFlagImages();
        }],

        partnerships: ['GameService', '$stateParams', function(GameService, $stateParams) {
            return GameService.getPartnerships($stateParams.id)
        }],
        images: ['GameService', function(GameService) {
            return GameService.getPlayerImages();
        }]
    },
    url: '/match/:id',
    templateUrl: 'partials/alternate-match-3.html',
    controller: function($scope, gameInfo, players, flags, partnerships, images, $state, $stateParams, GameService) {
        $scope.imageDict = images;
        $scope.showLegend = true;
        $scope.hover = true;
        $scope.gameID = $stateParams.id;
        $scope.allBalls = gameInfo.balls;
        $scope.firstBalls = $scope.allBalls.filter(d => d.inning == 1);
        $scope.playerDict = players;
        $scope.flags = flags;
        $scope.showBalls = true;
        $scope.partnerships = [];
        $scope.showTimeline = false;
        $scope.showPartnerMatrix = false;
        $scope.showPartnerBars = true;

        $scope.seeTimeline = function() {
            $scope.showTimeline = true;
            $scope.showPartnerMatrix = false;
            $scope.showPartnerBars = false;
        }

        $scope.seePartnershipMatrix = function() {
            $scope.showTimeline = false;
            $scope.showPartnerMatrix = true;
            $scope.showPartnerBars = false;
        }

        $scope.seePartnershipBars = function() {
            $scope.showTimeline = false;
            $scope.showPartnerMatrix = false;
            $scope.showPartnerBars = true;
        }

        GameService.getGames().then(function(data) {
            var relevantGame = data.filter(function(d) { return d.match_id == $stateParams.id })[0];
            $scope.date = relevantGame.date.split(" ")[0];
            $scope.ground = relevantGame.ground_name;
            $scope.team1 = relevantGame.team1_name;
            $scope.team2 = relevantGame.team2_name;
            $scope.result = relevantGame.result;
        })

        $scope.$on("matchInfo", function(event, data) {
        })

        $scope.firstInning = gameInfo.balls.filter(function(d) {
            return d.inning == 1;
        });
        var maxOvers = Math.floor($scope.firstInning[$scope.firstInning.length - 1].ovr) + 1;
        $scope.firstDivision = [];
        for (var i = 0; i < maxOvers; i+= 1) {
            $scope.firstDivision.push({
              "runs": 0,
              "wickets": 0
            });
        }
        for (var i = 0; i < $scope.firstInning.length; i += 1) {
            var over = Math.floor($scope.firstInning[i].ovr);
            var wicketAmount = ($scope.firstInning[i].wicket) ? 1 : 0;
            $scope.firstDivision[over]["runs"] += $scope.firstInning[i].runs_batter;
            $scope.firstDivision[over]["wickets"] += wicketAmount;
        }

        $scope.firstBattingTeam = $scope.firstInning[0].batting_team;
        $scope.firstTotalRuns = $scope.firstInning[$scope.firstInning.length - 1].cumul_runs;
        $scope.fWickets = $scope.firstInning.filter(function(d) {
            return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
        })
        $scope.firstWickets = $scope.fWickets.length;

        $scope.secondInning = gameInfo.balls.filter(function(d) {
            return d.inning == 2;
        });
        maxOvers = Math.floor($scope.secondInning[$scope.secondInning.length - 1].ovr) + 1;
        $scope.secondDivision = [];
        for (var i = 0; i < maxOvers; i+= 1) {
            $scope.secondDivision.push({
              "runs": 0,
              "wickets": 0
            });
        }
        for (var i = 0; i < $scope.secondInning.length; i += 1) {
            var over = Math.floor($scope.secondInning[i].ovr);
            var wicketAmount = ($scope.secondInning[i].wicket) ? 1 : 0;
            $scope.secondDivision[over]["runs"] += $scope.secondInning[i].runs_batter;
            $scope.secondDivision[over]["wickets"] += wicketAmount;
        }
        $scope.secondBattingTeam = $scope.secondInning[0].batting_team;
        $scope.secondTotalRuns = $scope.secondInning[$scope.secondInning.length - 1].cumul_runs;
        $scope.sWickets = $scope.secondInning.filter(function(d) {
            return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
        })
        $scope.secondWickets = $scope.sWickets.length;

        $scope.maxOvers1 = Math.floor($scope.firstInning[$scope.firstInning.length - 1].ovr) + 1;
        $scope.maxOvers2 = Math.floor($scope.secondInning[$scope.secondInning.length - 1].ovr) + 1;

        $scope.finalOver1 = $scope.maxOvers1;
        $scope.finalOver2 = $scope.maxOvers2;

        $scope.leftRuns1 = 0;
        $scope.leftWickets1 = 0;
        $scope.rightRuns1 = $scope.firstTotalRuns;
        $scope.rightWickets1 = $scope.firstWickets;

        $scope.leftRuns2 = 0;
        $scope.leftWickets2 = 0;
        $scope.rightRuns2 = $scope.secondTotalRuns;
        $scope.rightWickets2 = $scope.secondWickets;

        $scope.showLeftComparison = false;
        $scope.showRightComparison = false;

        $scope.showSlider1 = false;
        $scope.showSlider2 = false;

        $scope.rangeSlider1 = {
            minimumOver: 1,
            maximumOver: 50,
            options: {
                floor: 1,
                ceiling: 50,
                step: 1
            }
        }

        $scope.slider1Options = [ {value: 2}, {value: 30} ]

        $scope.rangeSlider2 = {
            minimumOver: 1,
            maximumOver: 50,
            options: {
                floor: 1,
                ceiling: 50,
                step: 1
            }
        }

        $scope.$watch('rangeSlider1.minimumOver', function(newMin, oldMin, scope) {
          if (newMin == 1 && $scope.rangeSlider1.maximumOver >= $scope.maxOvers1) {
              $scope.showLeftComparison = false;
              $scope.$broadcast("overFilter", false);
          } else {
              $scope.showLeftComparison = true;
              $scope.$broadcast("overFilter", true);
          }
          var beforeBalls = $scope.firstInning.filter(function(d) {
              var over = Math.floor(d.ovr) + 1;
              return over < newMin;
          });

          var afterBalls = $scope.firstInning.filter(function(d) {
              var over = Math.floor(d.ovr) + 1;
              return over <= $scope.rangeSlider1.maximumOver;
          });

          if (beforeBalls.length == 0) {
              $scope.leftRuns1 = 0;
              $scope.leftWickets1 = 0;
          } else {
              $scope.leftRuns1 = beforeBalls[beforeBalls.length - 1].cumul_runs;
              $scope.leftWickets1 = beforeBalls.filter(function(d) {
                  return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
              }).length;
          }
          $scope.rightRuns1 = afterBalls[afterBalls.length - 1].cumul_runs;
          $scope.rightWickets1 = afterBalls.filter(function(d) {
              return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
          }).length;
          $scope.finalOver1 = Math.floor(afterBalls[afterBalls.length - 1].ovr) + 1;
        })

        $scope.$watch('rangeSlider1.maximumOver', function(newMax, oldMax, scope) {
          if ($scope.rangeSlider1.minimumOver == 1 && newMax >= $scope.maxOvers1) {
              $scope.showLeftComparison = false;
              $scope.$broadcast("overFilter", false);
          } else {
              $scope.showLeftComparison = true;
              $scope.$broadcast("overFilter", true);
          }
          var beforeBalls = $scope.firstInning.filter(function(d) {
              var over = Math.floor(d.ovr) + 1;
              return over < $scope.rangeSlider1.minimumOver;
          });

          var afterBalls = $scope.firstInning.filter(function(d) {
              var over = Math.floor(d.ovr) + 1;
              return over <= newMax;
          });

          if (beforeBalls.length == 0) {
              $scope.leftRuns1 = 0;
              $scope.leftWickets1 = 0;
          } else {
              $scope.leftRuns1 = beforeBalls[beforeBalls.length - 1].cumul_runs;
              $scope.leftWickets1 = beforeBalls.filter(function(d) {
                  return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
              }).length;
          }
          $scope.rightRuns1 = afterBalls[afterBalls.length - 1].cumul_runs;
          $scope.rightWickets1 = afterBalls.filter(function(d) {
              return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
          }).length;
          $scope.finalOver1 = Math.floor(afterBalls[afterBalls.length - 1].ovr) + 1;
        })

        $scope.$watch('rangeSlider2.minimumOver', function(newMin, oldMin, scope) {
          if (newMin == 1 && $scope.rangeSlider2.maximumOver >= $scope.maxOvers2) {
              $scope.showRightComparison = false;
              $scope.$broadcast("overFilter", false);
          } else {
              $scope.showRightComparison = true;
              $scope.$broadcast("overFilter", true);
          }
          var beforeBalls = $scope.secondInning.filter(function(d) {
              var over = Math.floor(d.ovr) + 1;
              return over < newMin;
          });

          var afterBalls = $scope.secondInning.filter(function(d) {
              var over = Math.floor(d.ovr) + 1;
              return over <= $scope.rangeSlider2.maximumOver;
          });

          if (beforeBalls.length == 0) {
              $scope.leftRuns2 = 0;
              $scope.leftWickets2 = 0;
          } else {
              $scope.leftRuns2 = beforeBalls[beforeBalls.length - 1].cumul_runs;
              $scope.leftWickets2 = beforeBalls.filter(function(d) {
                  return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
              }).length;
          }
          $scope.rightRuns2 = afterBalls[afterBalls.length - 1].cumul_runs;
          $scope.rightWickets2 = afterBalls.filter(function(d) {
              return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
          }).length;
          $scope.finalOver2 = Math.floor(afterBalls[afterBalls.length - 1].ovr) + 1;
        })

        $scope.$watch('rangeSlider2.maximumOver', function(newMax, oldMax, scope) {
          if ($scope.rangeSlider2.minimumOver == 1 && newMax >= $scope.maxOvers2) {
              $scope.showRightComparison = false;
              $scope.$broadcast("overFilter", false);
          } else {
              $scope.showRightComparison = true;
              $scope.$broadcast("overFilter", true);
          }
          var beforeBalls = $scope.secondInning.filter(function(d) {
              var over = Math.floor(d.ovr) + 1;
              return over < $scope.rangeSlider2.minimumOver;
          });

          var afterBalls = $scope.secondInning.filter(function(d) {
              var over = Math.floor(d.ovr) + 1;
              return over <= newMax;
          });

          if (beforeBalls.length == 0) {
              $scope.leftRuns2 = 0;
              $scope.leftWickets2 = 0;
          } else {
              $scope.leftRuns2 = beforeBalls[beforeBalls.length - 1].cumul_runs;
              $scope.leftWickets2 = beforeBalls.filter(function(d) {
                  return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
              }).length;
          }
          $scope.rightRuns2 = afterBalls[afterBalls.length - 1].cumul_runs;
          $scope.rightWickets2 = afterBalls.filter(function(d) {
              return d.wicket == true && d.extras_type != "Nb" && d.extras_type != "Wd";
          }).length;
          $scope.finalOver2 = Math.floor(afterBalls[afterBalls.length - 1].ovr) + 1;
        })

        $scope.slider = $scope.rangeSlider1;
        $scope.seeInningData = false;
        $scope.seeInning = function(inning) {
            if (inning == 1) {
              $scope.showSlider1 = true;
              $scope.showSlider2 = false;
              $scope.rangeSlider2.minimumOver = 1;
              $scope.rangeSlider2.maximumOver = 50;
              $scope.slider = $scope.rangeSlider1;
            } else {
              $scope.showSlider1 = false;
              $scope.showSlider2 = true;
              $scope.rangeSlider1.minimumOver = 1;
              $scope.rangeSlider1.maximumOver = 50;
              $scope.slider = $scope.rangeSlider2;
            }
            $scope.showLegend = false;
            $scope.hover = false;
            $scope.showTimeline = false;
            $scope.showPartnerMatrix = false;
            $scope.showPartnerBars = true;
            $scope.seeInningData = true;
            $state.go('home.matches.match.innings', { number: inning });
        }

        $scope.seeBalls = function() {
            $scope.showBalls = true;
        }

        $scope.seeOvers = function() {
            $scope.showBalls = false;
        }

        $scope.partnerships = partnerships;

        $scope.firstBatsmenAlphabetical = gameInfo.first_batsmen;

        $scope.secondBatsmenAlphabetical = gameInfo.second_batsmen;

        $scope.firstPartnerships = $scope.partnerships.filter(function(d) {
            return d.team == $scope.firstBattingTeam;
        }).filter(function(d) {
            return $scope.firstBatsmenAlphabetical.indexOf(d.batsman_2) < $scope.firstBatsmenAlphabetical.indexOf(d.batsman_1)
        })

        $scope.firstPartnerships.sort(function(a, b) {
            var indexA1 = $scope.firstBatsmenAlphabetical.indexOf(a.batsman_1)
            var indexA2 = $scope.firstBatsmenAlphabetical.indexOf(a.batsman_2)
            var indexB1 = $scope.firstBatsmenAlphabetical.indexOf(b.batsman_1)
            var indexB2 = $scope.firstBatsmenAlphabetical.indexOf(b.batsman_2)
            if (indexA1 == indexA2) {
                return indexB1 - indexB2;
            }
            return indexA1 - indexA2;
        })

        $scope.secondPartnerships = $scope.partnerships.filter(function(d) {
            return d.team != $scope.firstBattingTeam;
        }).filter(function(d) {
            return $scope.secondBatsmenAlphabetical.indexOf(d.batsman_2) < $scope.secondBatsmenAlphabetical.indexOf(d.batsman_1)
        })

        $scope.secondPartnerships.sort(function(a, b) {
            var indexA1 = $scope.secondBatsmenAlphabetical.indexOf(a.batsman_1)
            var indexA2 = $scope.secondBatsmenAlphabetical.indexOf(a.batsman_2)
            var indexB1 = $scope.secondBatsmenAlphabetical.indexOf(b.batsman_1)
            var indexB2 = $scope.secondBatsmenAlphabetical.indexOf(b.batsman_2)
            if (indexA1 == indexA2) {
                return indexB1 - indexB2;
            }
            return indexA1 - indexA2;
        })

        $scope.inning = 0;
        $scope.battingTeam = "";
        $scope.bowlingTeam = "";
        $scope.selectedBatsmanKey = "Batting Order";
        $scope.selectedBowlerKey = "Bowling Order";
        $scope.batsmen = [];
        $scope.bowlers = [];
        $scope.currentBatsmen = [];
        $scope.activeBatsmen = [];
        $scope.activeBowlers = [];
        $scope.maxOvers = 50;

        $scope.sortKeyMap = {}
        $scope.sortKeyMap["Batting Order"] = "batting_order";
        $scope.sortKeyMap["Runs Scored"] = "runs_scored";
        $scope.sortKeyMap["Balls Faced"] = "balls_faced";
        $scope.sortKeyMap["Strike Rate"] = "strike_rate";
        $scope.sortKeyMap["Form"] = "form";
        $scope.sortKeyMap["Bowling Order"] = "bowling_order";
        $scope.sortKeyMap["Runs Conceded"] = "runs_conceded";
        $scope.sortKeyMap["Wickets Taken"] = "wickets_taken";
        $scope.sortKeyMap["Overs Bowled"] = "overs_bowled";
        $scope.sortKeyMap["Extras Conceded"] = "extras_conceded";

        $scope.sortPlayers = function(key, playerList) {
            var sortField = $scope.sortKeyMap[key];
            playerList.sort(function(a, b) {
                if (key == "" && playerList == $scope.batsmen) {
                    return a["batting_order"] - b["batting_order"];
                }
                if (key == "" && playerList == $scope.bowlers) {
                    return a["bowling_order"] - b["bowling_order"];
                }
                if (key == "Batting Order" || key == "Bowling Order") {
                    return a[sortField] - b[sortField];
                } else {
                    return b[sortField] - a[sortField];
                }
            })
        }

        $scope.teamColors = {};
        $scope.teamColors["India"] = "#0080FF";
        $scope.teamColors["Bangladesh"] = "#5AAB54";
        $scope.teamColors["United Arab Emirates"] = "#003366";
        $scope.teamColors["Scotland"] = "#66B2FF";
        $scope.teamColors["Ireland"] = "#80FF00";
        $scope.teamColors["Afghanistan"] = "#0066CC";
        $scope.teamColors["England"] = "#004C99";
        $scope.teamColors["South Africa"] = "#006633";
        $scope.teamColors["Australia"] = "gold";
        $scope.teamColors["New Zealand"] = "#000000";
        $scope.teamColors["West Indies"] = "#660000";
        $scope.teamColors["Pakistan"] = "#00CC00";
        $scope.teamColors["Zimbabwe"] = "#CC0000";
        $scope.teamColors["Sri Lanka"] = "#000099";

        $scope.normalStyling = {
            "color": "black",
            "background-color": "#ffffff",
            "border-left": "1px solid white",
            "border-right": "1px solid white",
            "padding-top": "7px",
            "padding-bottom": "7px"
        };

        $scope.batsmanStyling = {
            "color": "white",
            "background-color": $scope.teamColors[$scope.battingTeam],
            "font-weight": "bold",
            "border-left": "1px solid white",
            "border-right": "1px solid white",
            "padding-top": "7px",
            "padding-bottom": "7px"
        }

        $scope.bowlerStyling = {
            "color": "white",
            "background-color": $scope.teamColors[$scope.bowlingTeam],
            "font-weight": "bold",
            "border-left": "1px solid white",
            "border-right": "1px solid white",
            "padding-top": "7px",
            "padding-bottom": "7px"
        }

        $scope.changeBatsmen = function(batsman) {
            if ($scope.activeBatsmen.includes(batsman.id) && $scope.correctHandBatsmen.includes(batsman.id)) {
              if ($scope.currentBatsmen.includes(batsman.id)) {
                  var index = $scope.currentBatsmen.indexOf(batsman.id);
                  $scope.currentBatsmen.splice(index, 1);
                  if ($scope.currentBatsmen.length == 0) {
                      $scope.batsmanFilter = false;
                  }
              } else {
                  $scope.currentBatsmen.push(batsman.id);
                  $scope.batsmanFilter = true;
              }
            }
        }

        $scope.changeBowlers = function(bowler) {
            if ($scope.activeBowlers.includes(bowler.id)) {
              if ($scope.currentBowlers.includes(bowler.id)) {
                  var index = $scope.currentBowlers.indexOf(bowler.id);
                  $scope.currentBowlers.splice(index, 1);
                  if ($scope.currentBowlers.length == 0) {
                      $scope.bowlerFilter = false;
                  }
              } else {
                  $scope.currentBowlers.push(bowler.id);
                  $scope.bowlerFilter = true;
              }
            }
        }

        $scope.$watch('selectedBatsmanKey', function(newVal, oldVal, scope) {
            if (newVal == "") {
                $scope.sortPlayers("Batting Order", $scope.batsmen);
            } else {
                $scope.sortPlayers(newVal, $scope.batsmen);
            }
        });

        $scope.$watch('selectedBowlerKey', function(newVal, oldVal, scope) {
            if (newVal == "") {
                $scope.sortPlayers("Bowling Order", $scope.bowlers);
            } else {
                $scope.sortPlayers(newVal, $scope.bowlers);
            }
        });

        $scope.$on("batsmen", function(event, batsmen) {
            $scope.activeBatsmen = Array.from(batsmen);
            $scope.$digest()
        })

    }
  })
})
