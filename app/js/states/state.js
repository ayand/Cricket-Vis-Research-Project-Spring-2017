angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'partials/system-home.html',
      controller: function($scope, $state) {
          $scope.atHome = true;

          $scope.$on("match", function(event, id) {
              $state.go('home.matches.match', { "id": id });
          })

          $scope.selectView = function(view) {
              $scope.atHome = false;
              $state.go(view);
          }
      }
    })
    .state('home.tournament', {
      resolve: {
          teams: ['GameService', function(GameService) {
              return GameService.getFlagImages();
          }],
          bracketInfo: ['GameService', function(GameService) {
              return GameService.getBracketInfo();
          }]
      },
      url: '/tournament',
      templateUrl: 'partials/tournament-view.html',
      controller: function($scope, $state, teams, bracketInfo) {
          $scope.teams = [];
          $scope.bracketInfo = bracketInfo;
          $scope.stages = ["Group", "Knockout"];
          $scope.selectedStage = "Group";

          $scope.selectStage = function(stage) {
              $scope.selectedStage = stage;
              console.log("Switched to " + stage);
          }

          for (team in teams) {
              $scope.teams.push({
                  "name": team,
                  "image": teams[team]
              })
          }
          $scope.teams.sort(function(a, b) {
              return a["name"] > b["name"] ? 1 : (a["name"] < b["name"] ? -1 : 0)
          })

          $scope.teamName = {
            "Afghanistan": "afghanistan",
            "Australia": "australia",
            "Bangladesh": "bangladesh",
            "England": "england",
            "India": "india",
            "Ireland": "ireland",
            "New Zealand": "nz",
            "Pakistan": "pakistan",
            "Scotland": "scotland",
            "South Africa": "sa",
            "Sri Lanka": "sl",
            "United Arab Emirates": "uae",
            "West Indies": "wi",
            "Zimbabwe": "zimbabwe"
          }

          $scope.normalStyling = {
              "color": "black",
              "background-color": "#AAAAAA"
          }

          $scope.selectedStyling = {
              "color": "white",
              "background-color": "black",
              "font-weight": "bold"
          }

          $scope.selectedTeam = null;

          $scope.selectTeam = function(team) {
              $scope.selectedTeam = team.name;
              $state.go('home.tournament.team', { team: $scope.teamName[team.name] })
          }

          $scope.$on("team", function(event, data) {
              console.log("TEAM: " + data);
              $state.go('home.tournament.team', { team: $scope.teamName[data] })
          })

      }
    })
    .state('home.tournament.team', {
        resolve: {
            matches: ['GameService', '$stateParams', function(GameService, $stateParams) {
                return GameService.getMatchesByTeam($stateParams.team);
            }],
            players: ['GameService', '$stateParams', function(GameService, $stateParams) {
                return GameService.getPlayersByTeam($stateParams.team);
            }],
            playerImages: ['GameService', '$stateParams', function(GameService, $stateParams) {
                return GameService.getPlayerImages();
            }]
        },
        url: '/team/:team',
        templateUrl: "partials/tournament-display.html",
        controller: function($scope, $state, matches, players, playerImages, $stateParams) {
          $scope.teamNameDict = {
            "afghanistan": "Afghanistan",
            "australia": "Australia",
            "bangladesh": "Bangladesh",
            "england": "England",
            "india": "India",
            "ireland": "Ireland",
            "nz": "New Zealand",
            "pakistan": "Pakistan",
            "scotland": "Scotland",
            "sa": "South Africa",
            "sl": "Sri Lanka",
            "uae": "United Arab Emirates",
            "wi": "West Indies",
            "zimbabwe": "Zimbabwe"
          }
          $scope.teamName = $scope.teamNameDict[$stateParams.team]
          $scope.teamData = matches;
          $scope.selectedSide = "Batting";
          $scope.sides = ["Batting", "Bowling"];

          $scope.players = players;
          $scope.imageDict = playerImages;

          $scope.selected = [];

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
              "border-left": "1px solid #bbbbbb",
              "border-right": "1px solid #bbbbbb"
          };

          $scope.playerStyling = {
              "color": "white",
              "background-color": $scope.teamColors[$scope.teamName],
              "font-weight": "bold",
              "border-left": "1px solid #bbbbbb",
              "border-right": "1px solid #bbbbbb"
          }

          $scope.clickPlayer = function(id) {
              if ($scope.selected.includes(id)) {
                  var index = $scope.selected.indexOf(id);
                  $scope.selected.splice(index, 1);
              }  else {
                  $scope.selected.push(id);
              }
          }

          $scope.view = "allBalls";

          $scope.changeView = function(view) {
              $scope.view = view;
          }

          $scope.selectSide = function(side) {
              $scope.selectedSide = side;
          }

          $scope.selectedPlayer = null;

          $scope.selectPlayer = function(player) {
              $scope.selectedPlayer = player;
          }
        }
    })
    .state('home.matchup', {
      resolve: {
          players: ['GameService', function(GameService) {
              return GameService.getPlayerList();
          }],
          playerDict: ['GameService', function(GameService) {
              return GameService.getPlayers();
          }],
          images: ['GameService', function(GameService) {
              return GameService.getPlayerImages();
          }],
          games: ['GameService', function(GameService) {
              return GameService.getGames();
          }],
          playerGraph: ['GameService', function(GameService) {
              return GameService.getPlayerGraph();
          }]
      },
      url: '/matchups',
      templateUrl: 'partials/matchup.html',
      controller: function($scope, $state, players, playerDict, images,
          GameService, games, playerGraph, $location, $anchorScroll) {

          $scope.seePlayer = false;
          $scope.currentPlayer = null;
          $scope.previousPlayer = null;

          $scope.runsScored = null;
          $scope.ballsFaced = null;
          $scope.strikeRate = null;
          $scope.oversBowled = null;
          $scope.runsConceded = null;
          $scope.wicketsTaken = null;

          $scope.$on("playerStats", function(event, data) {
              if (data != null) {
                  console.log("SELECTING PLAYER")
                  $scope.seePlayer = true;
                  $scope.currentPlayer = data;
                  $scope.runsScored = data.runs_scored;
                  $scope.ballsFaced = data.balls_faced;
                  $scope.strikeRate = data.strike_rate != -1 ? data.strike_rate.toFixed(3) : "N/A";
                  $scope.oversBowled = data.overs_bowled;
                  $scope.runsConceded = data.runs_conceded;
                  $scope.wicketsTaken = data.wickets_taken;

              } else {
                  //$scope.seePlayer = false;
                  if ($scope.previousPlayer != null) {
                      $scope.currentPlayer = $scope.previousPlayer;
                      $scope.runsScored = $scope.previousPlayer.runs_scored;
                      $scope.ballsFaced = $scope.previousPlayer.balls_faced;
                      $scope.strikeRate = $scope.previousPlayer.strike_rate != -1 ? $scope.previousPlayer.strike_rate.toFixed(3) : "N/A";
                      $scope.oversBowled = $scope.previousPlayer.overs_bowled;
                      $scope.runsConceded = $scope.previousPlayer.runs_conceded;
                      $scope.wicketsTaken = $scope.previousPlayer.wickets_taken;
                  } else {
                      $scope.seePlayer = false;
                  }
              }
              $scope.$digest()
          })

          $scope.$on("clickedPlayer", function(event, data) {
              if (data != null) {
                //$scope.seePlayer = true;
                $scope.currentPlayer = data;
                $scope.previousPlayer = data;
                $scope.runsScored = data.runs_scored;
                $scope.ballsFaced = data.balls_faced;
                $scope.strikeRate = data.strike_rate != -1 ? data.strike_rate.toFixed(3) : "N/A";
                $scope.oversBowled = data.overs_bowled;
                $scope.runsConceded = data.runs_conceded;
                $scope.wicketsTaken = data.wickets_taken;
              } else {
                $scope.previousPlayer = null;
              }
          })

          $scope.playerGraph = playerGraph;
          $scope.images = images;
          $scope.playerDict = playerDict;

          $scope.sides = ["Batting", "Bowling"];
          $scope.selectedSide = "Batting";
          $scope.sortKey = "Alphabetical Order";

          $scope.battingSortKeys = ["Alphabetical Order", "Runs Scored", "Balls Faced",
              "Strike Rate"]

          $scope.bowlingSortKeys = ["Alphabetical Order", "Runs Conceded",
              "Overs Bowled", "Wickets Taken"]

          $scope.sortKeys = $scope.battingSortKeys;

          $scope.selectSide = function(side) {
              $scope.selectedSide = side;
              $scope.sortKey = "Alphabetical Order";
              if (side == "Batting") {
                  $scope.sortKeys = $scope.battingSortKeys;
              } else {
                  $scope.sortKeys = $scope.bowlingSortKeys;
              }
          }

          $scope.showVizes = false;
          $scope.displayedBalls = [];
          $scope.representedGames = [];
          $scope.selectedBatsman = null;
          $scope.selectedBowler = null;
          $scope.currentGame = null;

          $scope.seeGame = function(game) {
              $scope.currentGame = game;
          }

          $scope.$on("playerCombo", function(event, data) {
              $scope.selectedBatsman = data.batsman;
              $scope.selectedBowler = data.bowler;
              GameService.getBallsByBatsman($scope.selectedBatsman).then(function(result) {
                  $scope.displayedBalls = result.filter(function(d) {
                      return d.bowler == $scope.selectedBowler;
                  });
                  var displayedGames = Array.from(new Set($scope.displayedBalls.map(function(d) { return d.game; })));
                  $scope.representedGames = games.filter(function(d) { return displayedGames.includes(d.match_id) });
                  $scope.showVizes = true;
                  $location.hash('vizes');
                  $anchorScroll();
              })
          })

      }
    })
    .state('home.matches', {
      resolve: {
        games: ['GameService', function(GameService) {
            return GameService.getGames();
        }],
        players: ['GameService', function(GameService) {
            return GameService.getPlayerList();
        }],
      },
      url: '/matches',
      templateUrl: 'partials/home.html',
      controller: function($scope, $http, $state, games, players) {
          $scope.team1 = null;
          $scope.team2 = null;
          $scope.date = null;
          $scope.ground = null;
          $scope.games = games;
          $scope.players = players;

          $scope.currentId = null;

          $scope.selectMatch = function(match) {
              $scope.team1 = match.team1_name;
              $scope.team2 = match.team2_name;
              $scope.date = match.date.split(" ")[0];
              $scope.ground = match.ground_name;
              $scope.result = match.result;
              $scope.currentId = match.match_id;
              $state.go('home.matches.match', { id: match.match_id });
          }
      }
    })
    .state('home.matches.match', {
      resolve: {
          balls: ['GameService', '$stateParams', function(GameService, $stateParams) {
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
      controller: function($scope, balls, players, flags, partnerships, images, $state, $stateParams, GameService) {
          $scope.imageDict = images;
          $scope.showLegend = true;
          $scope.hover = true;
          $scope.gameID = $stateParams.id;
          $scope.allBalls = balls;
          $scope.firstBalls = $scope.allBalls.filter(d => d.inning == 1);
          $scope.playerDict = players;
          $scope.flags = flags;
          $scope.showBalls = true;
          $scope.partnerships = [];
          $scope.showTimeline = true;

          $scope.seeTimeline = function() {
              $scope.showTimeline = true;
          }

          $scope.seePartnerships = function() {
              $scope.showTimeline = false;
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

          $scope.firstInning = balls.filter(function(d) {
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

          $scope.secondInning = balls.filter(function(d) {
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

          /*$scope.$watch('rangeSlider1.minimumOver', function(newMin, oldMin, scope) {
              $scope.$watch('rangeSlider1.maximumOver', function(newMax, oldMax, scope) {

              });
          });*/

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
          /*$scope.$watch('rangeSlider2.minimumOver', function(newMin, oldMin, scope) {
              $scope.$watch('rangeSlider2.maximumOver', function(newMax, oldMax, scope) {
                  if (newMin == 1 && newMax >= $scope.maxOvers2) {
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
              });
          });*/

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
              $scope.showTimeline = true;
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
          $scope.firstPartnerships = $scope.partnerships.filter(function(d) {
              return d.team == $scope.firstBattingTeam;
          })

          $scope.secondPartnerships = $scope.partnerships.filter(function(d) {
              return d.team != $scope.firstBattingTeam;
          })

          $scope.firstBatsmen = Array.from(new Set(
              $scope.allBalls.filter(d => d.inning == 1)
                  .map(d => d.batsman_name)
              ))

          $scope.firstNonStrikers = Array.from(new Set(
              $scope.allBalls.filter(d => d.inning == 1)
                  .map(d => d.non_striker)
              ))

          $scope.firstBatsmenAlphabetical = $scope.firstBatsmen.concat($scope.firstNonStrikers)

          /*$scope.firstBatsmenAlphabetical.sort(function(a, b) {
            var letterOrder = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            var aName = a.split(" ");
            var aLastName = aName[aName.length - 1];
            var aFirst = aName[0].charAt(0);
            var bName = b.split(" ");
            var bLastName = bName[bName.length - 1];
            var bFirst = bName[0].charAt(0)
            if (bLastName == aLastName) {
                return letterOrder.indexOf(aFirst) - letterOrder.indexOf(bFirst);
            }
            return ((aLastName > bLastName) ? 1 : -1)

          })*/

          $scope.secondBatsmen = Array.from(new Set(
              $scope.allBalls.filter(d => d.inning == 2)
                  .map(d => d.batsman_name)
              ))

          $scope.secondNonStrikers = Array.from(new Set(
              $scope.allBalls.filter(d => d.inning == 2)
                  .map(d => d.non_striker)
              ))

          $scope.secondBatsmenAlphabetical = $scope.secondBatsmen.concat($scope.secondNonStrikers)

          /*$scope.secondBatsmenAlphabetical.sort(function(a, b) {
            var letterOrder = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            var aName = a.split(" ");
            var aLastName = aName[aName.length - 1];
            var aFirst = aName[0].charAt(0);
            var bName = b.split(" ");
            var bLastName = bName[bName.length - 1];
            var bFirst = bName[0].charAt(0)
            if (bLastName == aLastName) {
                return letterOrder.indexOf(aFirst) - letterOrder.indexOf(bFirst);
            }
            return ((aLastName > bLastName) ? 1 : -1)

          })*/

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
              console.log("New active Batsmen");
              console.log(batsmen);
              $scope.activeBatsmen = Array.from(batsmen);
              $scope.$digest()
          })

          $scope.getClass = function(id) {
              if ($scope.activeBatsmen.includes(id) && $scope.correctHandBatsmen.includes(id)) {
                  return 'check';
              }
              return 'active';
          }



      }
    })
    .state('home.matches.match.innings', {
      resolve: {
        images: ['GameService', function(GameService) {
            return GameService.getPlayerImages();
        }]
      },
      url: '/innings/:number',
      templateUrl: 'partials/alternate-innings-4.html',
      controller: function($scope, players, $stateParams, images, $uibModal,
          $anchorScroll, $location) {

          $scope.imageDict = images;
          $scope.playerViews = ["Player Stats", "Player Graph"]
          $scope.currentPlayerView = null;
          $scope.isCollapsed1 = true;
          $scope.isCollapsed2 = true;

          $scope.overFilter = false;
          $scope.batsmanFilter = false;
          $scope.bowlerFilter = false;
          $scope.handFilter = false;
          $scope.zoneFilter = false;

          $scope.mapViews = ["Balls", "Heatmap"];

          $scope.mapView = "Heatmap";

          $scope.changeView = function(view) {
              $scope.mapView = view;
          }

          $scope.$on("overFilter", function(event, data) {
              //console.log("Over filter: " + data);
              $scope.overFilter = data;
          })



          $scope.$on("partnership", function(event, data) {
          })

          $scope.changeCollapse = function(view) {
              if (view == "Player Stats") {
                  $scope.isCollapsed1 = !$scope.isCollapsed1;
                  $scope.isCollapsed2 = true;
                  if (!$scope.isCollapsed1) {
                      $location.hash('playerStats');
                      $anchorScroll();
                  } else {
                      $location.hash('top');
                      $anchorScroll();
                  }
              } else {
                  $scope.isCollapsed2 = !$scope.isCollapsed2;
                  $scope.isCollapsed1 = true;
                  if (!$scope.isCollapsed2) {
                      $location.hash('playerGraph');
                      $anchorScroll();
                  } else {
                      $location.hash('top');
                      $anchorScroll();
                  }
              }
              if (!$scope.isCollapsed1) {
                  $scope.currentPlayerView = "Player Stats";
              } else if (!$scope.isCollapsed2) {
                  $scope.currentPlayerView = "Player Graph";
              } else {
                  $scope.currentPlayerView = null;
              }

          }

          $scope.matchID = $scope.$parent.gameID;
          $scope.$parent.inning = parseInt($stateParams.number);
          $scope.$parent.maxOvers = ($scope.inning == 1) ? $scope.$parent.maxOvers1 : $scope.$parent.maxOvers2;
          $scope.slider = null;
          if ($scope.inning == 1) {
              $scope.slider = $scope.$parent.rangeSlider1;
          } else {
              $scope.slider = $scope.$parent.rangeSlider2;
          }
          $scope.inningBalls = $scope.$parent.allBalls.filter(function(d) {
              return d.inning == $scope.inning;
          });

          $scope.batsmanIDs = Array.from(new Set($scope.inningBalls.map(function(d) {
              return d.batsman;
          })));

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

          var batOrder = 1;
          $scope.$parent.batsmen = $scope.batsmanIDs.map(function(d) {
              return {
                id: d,
                name: $scope.$parent.playerDict[d.toString()]["name"],
                batting_order: batOrder++,
                runs_scored: $scope.$parent.playerDict[d.toString()]["games"][$scope.matchID.toString()]["batting_inning"]["runs_scored"],
                balls_faced: $scope.$parent.playerDict[d.toString()]["games"][$scope.matchID.toString()]["batting_inning"]["balls_faced"],
                strike_rate: ($scope.$parent.playerDict[d.toString()]["games"][$scope.matchID.toString()]["batting_inning"]["runs_scored"] * 100) / $scope.$parent.playerDict[d.toString()]["games"][$scope.matchID.toString()]["batting_inning"]["balls_faced"],
                form: ($scope.inningBalls.filter(function(ball) {
                    return ball.batsman == d && ball.control == 1 && ball.extras_type != "Wd" && ball.extras_type != "Nb";
                }).length) / $scope.$parent.playerDict[d.toString()]["games"][$scope.matchID.toString()]["batting_inning"]["balls_faced"]
              };
          });

          $scope.bowlerIDs = Array.from(new Set($scope.inningBalls.map(function(d) {
              return d.bowler;
          })));

          var bowlOrder = 1;
          $scope.$parent.bowlers = $scope.bowlerIDs.map(function(d) {

              var overs = Math.floor(($scope.$parent.playerDict[d.toString()]["games"][$scope.matchID.toString()]["bowling_inning"]["balls_bowled"] / 6)) + (($scope.$parent.playerDict[d.toString()]["games"][$scope.matchID.toString()]["bowling_inning"]["balls_bowled"] % 6) * 0.1);

              var extrasNum = $scope.inningBalls.filter(function(ball) {
                  return ball.bowler == d && ball.extras_type != "";
              }).length;
              return {
                id: d,
                name: $scope.$parent.playerDict[d.toString()]["name"],
                bowling_order: bowlOrder++,
                runs_conceded: $scope.$parent.playerDict[d.toString()]["games"][$scope.matchID.toString()]["bowling_inning"]["runs_conceded"],
                wickets_taken: $scope.$parent.playerDict[d.toString()]["games"][$scope.matchID.toString()]["bowling_inning"]["wickets_taken"],
                overs_bowled: overs,
                extras_conceded: extrasNum
              };
          });

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

          $scope.$parent.battingTeam = $scope.inningBalls[0].batting_team;
          $scope.$parent.bowlingTeam = $scope.inningBalls[1].bowling_team;
          $scope.$parent.batsmanStyling["background-color"] = $scope.teamColors[$scope.$parent.battingTeam]
          $scope.$parent.bowlerStyling["background-color"] = $scope.teamColors[$scope.$parent.bowlingTeam];

          $scope.normalStyling = {
              "color": "black",
              "background-color": "#ffffff",
              "border-left": "1px solid #bbbbbb",
              "border-right": "1px solid #bbbbbb"
          };

          $scope.batsmanStyling = {
              "color": "white",
              "background-color": $scope.teamColors[$scope.battingTeam],
              "font-weight": "bold",
              "border-left": "1px solid #bbbbbb",
              "border-right": "1px solid #bbbbbb"
          }

          $scope.bowlerStyling = {
              "color": "white",
              "background-color": $scope.teamColors[$scope.bowlingTeam],
              "font-weight": "bold",
              "border-left": "1px solid #bbbbbb",
              "border-right": "1px solid #bbbbbb"
          }

          $scope.$parent.currentBatsmen = [];
          $scope.$parent.currentBowlers = [];

          $scope.$parent.activeBatsmen = $scope.batsmanIDs;
          $scope.$parent.correctHandBatsmen = $scope.activeBatsmen;
          $scope.$parent.activeBowlers = $scope.bowlerIDs;

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

          $scope.$on("handFilter", function(event, data) {
              $scope.handFilter = data;
          })

          $scope.removeOverFilter = function() {
              $scope.overFilter = false;
              $scope.slider.minimumOver = 1;
              $scope.slider.maximumOver = 50;
          }

          $scope.removeBatsmanFilter = function() {
              $scope.batsmanFilter = false;
              $scope.currentBatsmen = [];
          }

          $scope.removeBowlerFilter = function() {
              $scope.bowlerFilter = false;
              $scope.currentBowlers = [];
          }

          $scope.removeHandFilter = function() {
              console.log("REMOVING HAND FILTER");
              $scope.handFilter = false;
              $scope.$broadcast("handFilter", "off");
          }

          $scope.removeZoneFilter = function() {
              $scope.zoneFilter = false;
              d3.select("#zoneFilter").style("visibility", "hidden")
              $scope.$broadcast("zoneFilter", "off");
          }

          $scope.selectedBatsmanKey = "Batting Order";
          $scope.selectedBowlerKey = "Bowling Order";

          $scope.isWicket = function(d) {
              return d.wicket == true && d.extras_type != "Nb" && d.wicket_method != "run out";
          };

          $scope.$watch('slider.minimumOver', function(newMin, oldMin, scope) {
            var newMax = $scope.slider.maximumOver;

            var activeBalls = $scope.inningBalls.filter(function(d) {
                var over = Math.floor(d.ovr) + 1;
                return over >= newMin && over <= newMax;
            });
            $scope.$parent.activeBatsmen = Array.from(new Set(activeBalls.map(function(d) {
                return d.batsman;
            })));

            $scope.$parent.activeBowlers = Array.from(new Set(activeBalls.map(function(d) {
                return d.bowler;
            })));

            $scope.$parent.currentBatsmen.length = 0;
            $scope.$parent.currentBowlers.length = 0;
            $scope.batsmanFilter = false;
            $scope.bowlerFilter = false;
            $scope.handFilter = false;
            d3.select("#zoneFilter").style("visibility", "hidden");

            for (var i = 0; i < $scope.$parent.batsmen.length; i++) {
                if ($scope.$parent.activeBatsmen.includes($scope.$parent.batsmen[i].id)) {
                  var batsmanBalls = activeBalls.filter(function(d) {
                      return d.batsman == $scope.$parent.batsmen[i].id;
                  });

                  var runsScored = batsmanBalls.map(function(d) {
                      return d.runs_batter;
                  }).reduce((a, b) => a + b, 0);
                  $scope.$parent.batsmen[i].runs_scored = runsScored;

                  var ballsFaced = batsmanBalls.filter(function(d) {
                      return d.extras_type != "Wd" && d.extras_type != "Nb";
                  })
                  var bf = ballsFaced.length;
                  $scope.$parent.batsmen[i].balls_faced = bf;

                  var strikeRate = (runsScored * 100) / bf;
                  $scope.$parent.batsmen[i].strike_rate = strikeRate;

                  var form = ballsFaced.filter(function(d) { return d.control == 1 }).length / bf;
                  $scope.$parent.batsmen[i].form = form;
                } else {
                    $scope.$parent.batsmen[i].runs_scored = -1;
                    $scope.$parent.batsmen[i].balls_faced = -1;
                    $scope.$parent.batsmen[i].strike_rate = -1;
                    $scope.$parent.batsmen[i].form = -1;
                }

            }

            for (var i = 0; i < $scope.$parent.bowlers.length; i++) {
                if ($scope.$parent.activeBowlers.includes($scope.bowlers[i].id)) {
                    var bowlerBalls = activeBalls.filter(function(d) {
                        return d.bowler == $scope.$parent.bowlers[i].id;
                    });

                    var runsConceded = bowlerBalls.map(function(d) {
                        var considered = d.extras_type != "Lb" && d.extras_type == "B";
                        return (considered ? d.runs_w_extras : d.runs_batter);
                    }).reduce((a, b) => a + b, 0);
                    $scope.$parent.bowlers[i].runs_conceded = runsConceded;

                    var ballsFaced = bowlerBalls.filter(function(d) {
                        return d.extras_type != "Wd" && d.extras_type != "Nb";
                    }).length;

                    var oversBowled = Math.floor(ballsFaced / 6) + ((ballsFaced % 6) * 0.1);
                    $scope.$parent.bowlers[i].overs_bowled = oversBowled;

                    var extrasConceded = bowlerBalls.filter(function(d) {
                        return d.extras_type != "";
                    }).length;
                    $scope.$parent.bowlers[i].extras_conceded = extrasConceded;

                    var wicketsTaken = bowlerBalls.filter(function(d) {
                        return $scope.isWicket(d);
                    }).length;
                    $scope.$parent.bowlers[i].wickets_taken = wicketsTaken;
                } else {
                    $scope.$parent.bowlers[i].runs_conceded = -1;
                    $scope.$parent.bowlers[i].wickets_taken = -1;
                    $scope.$parent.bowlers[i].overs_bowled = -1;
                    $scope.$parent.bowlers[i].extras_conceded = -1;
                }
            }

            $scope.$parent.sortPlayers($scope.$parent.selectedBatsmanKey, $scope.$parent.batsmen);
            $scope.$parent.sortPlayers($scope.$parent.selectedBowlerKey, $scope.$parent.bowlers);
          })

          $scope.$watch('slider.maximumOver', function(newMax, oldMax, scope) {

            var newMin = $scope.slider.minimumOver;
            var activeBalls = $scope.inningBalls.filter(function(d) {
                var over = Math.floor(d.ovr) + 1;
                return over >= newMin && over <= newMax;
            });
            $scope.$parent.activeBatsmen = Array.from(new Set(activeBalls.map(function(d) {
                return d.batsman;
            })));

            $scope.$parent.activeBowlers = Array.from(new Set(activeBalls.map(function(d) {
                return d.bowler;
            })));

            $scope.$parent.currentBatsmen.length = 0;
            $scope.$parent.currentBowlers.length = 0;
            $scope.batsmanFilter = false;
            $scope.bowlerFilter = false;
            $scope.handFilter = false;
            d3.select("#zoneFilter").style("visibility", "hidden");

            for (var i = 0; i < $scope.$parent.batsmen.length; i++) {
                if ($scope.$parent.activeBatsmen.includes($scope.$parent.batsmen[i].id)) {
                  var batsmanBalls = activeBalls.filter(function(d) {
                      return d.batsman == $scope.$parent.batsmen[i].id;
                  });

                  var runsScored = batsmanBalls.map(function(d) {
                      return d.runs_batter;
                  }).reduce((a, b) => a + b, 0);
                  $scope.$parent.batsmen[i].runs_scored = runsScored;

                  var ballsFaced = batsmanBalls.filter(function(d) {
                      return d.extras_type != "Wd" && d.extras_type != "Nb";
                  })
                  var bf = ballsFaced.length;
                  $scope.$parent.batsmen[i].balls_faced = bf;

                  var strikeRate = (runsScored * 100) / bf;
                  $scope.$parent.batsmen[i].strike_rate = strikeRate;

                  var form = ballsFaced.filter(function(d) { return d.control == 1 }).length / bf;
                  $scope.$parent.batsmen[i].form = form;
                } else {
                    $scope.$parent.batsmen[i].runs_scored = -1;
                    $scope.$parent.batsmen[i].balls_faced = -1;
                    $scope.$parent.batsmen[i].strike_rate = -1;
                    $scope.$parent.batsmen[i].form = -1;
                }

            }

            for (var i = 0; i < $scope.$parent.bowlers.length; i++) {
                if ($scope.$parent.activeBowlers.includes($scope.bowlers[i].id)) {
                    var bowlerBalls = activeBalls.filter(function(d) {
                        return d.bowler == $scope.$parent.bowlers[i].id;
                    });

                    var runsConceded = bowlerBalls.map(function(d) {
                        var considered = d.extras_type != "Lb" && d.extras_type == "B";
                        return (considered ? d.runs_w_extras : d.runs_batter);
                    }).reduce((a, b) => a + b, 0);
                    $scope.$parent.bowlers[i].runs_conceded = runsConceded;

                    var ballsFaced = bowlerBalls.filter(function(d) {
                        return d.extras_type != "Wd" && d.extras_type != "Nb";
                    }).length;

                    var oversBowled = Math.floor(ballsFaced / 6) + ((ballsFaced % 6) * 0.1);
                    $scope.$parent.bowlers[i].overs_bowled = oversBowled;

                    var extrasConceded = bowlerBalls.filter(function(d) {
                        return d.extras_type != "";
                    }).length;
                    $scope.$parent.bowlers[i].extras_conceded = extrasConceded;

                    var wicketsTaken = bowlerBalls.filter(function(d) {
                        return $scope.isWicket(d);
                    }).length;
                    $scope.$parent.bowlers[i].wickets_taken = wicketsTaken;
                } else {
                    $scope.$parent.bowlers[i].runs_conceded = -1;
                    $scope.$parent.bowlers[i].wickets_taken = -1;
                    $scope.$parent.bowlers[i].overs_bowled = -1;
                    $scope.$parent.bowlers[i].extras_conceded = -1;
                }
            }

            $scope.$parent.sortPlayers($scope.$parent.selectedBatsmanKey, $scope.$parent.batsmen);
            $scope.$parent.sortPlayers($scope.$parent.selectedBowlerKey, $scope.$parent.bowlers);
          })

          /*$scope.$watchGroup(['slider.minimumOver', 'slider.maximumOver'], function(newValues, oldValues, scope) {
              var newMax = newValues[1];
              var newMin = newValues[0];
              var activeBalls = $scope.inningBalls.filter(function(d) {
                  var over = Math.floor(d.ovr) + 1;
                  return over >= newMin && over <= newMax;
              });
              $scope.$parent.activeBatsmen = Array.from(new Set(activeBalls.map(function(d) {
                  return d.batsman;
              })));

              $scope.$parent.activeBowlers = Array.from(new Set(activeBalls.map(function(d) {
                  return d.bowler;
              })));

              $scope.$parent.currentBatsmen.length = 0;
              $scope.$parent.currentBowlers.length = 0;
              $scope.batsmanFilter = false;
              $scope.bowlerFilter = false;
              $scope.handFilter = false;
              d3.select("#zoneFilter").style("visibility", "hidden");

              for (var i = 0; i < $scope.$parent.batsmen.length; i++) {
                  if ($scope.$parent.activeBatsmen.includes($scope.$parent.batsmen[i].id)) {
                    var batsmanBalls = activeBalls.filter(function(d) {
                        return d.batsman == $scope.$parent.batsmen[i].id;
                    });

                    var runsScored = batsmanBalls.map(function(d) {
                        return d.runs_batter;
                    }).reduce((a, b) => a + b, 0);
                    $scope.$parent.batsmen[i].runs_scored = runsScored;

                    var ballsFaced = batsmanBalls.filter(function(d) {
                        return d.extras_type != "Wd" && d.extras_type != "Nb";
                    })
                    var bf = ballsFaced.length;
                    $scope.$parent.batsmen[i].balls_faced = bf;

                    var strikeRate = (runsScored * 100) / bf;
                    $scope.$parent.batsmen[i].strike_rate = strikeRate;

                    var form = ballsFaced.filter(function(d) { return d.control == 1 }).length / bf;
                    $scope.$parent.batsmen[i].form = form;
                  } else {
                      $scope.$parent.batsmen[i].runs_scored = -1;
                      $scope.$parent.batsmen[i].balls_faced = -1;
                      $scope.$parent.batsmen[i].strike_rate = -1;
                      $scope.$parent.batsmen[i].form = -1;
                  }

              }

              for (var i = 0; i < $scope.$parent.bowlers.length; i++) {
                  if ($scope.$parent.activeBowlers.includes($scope.bowlers[i].id)) {
                      var bowlerBalls = activeBalls.filter(function(d) {
                          return d.bowler == $scope.$parent.bowlers[i].id;
                      });

                      var runsConceded = bowlerBalls.map(function(d) {
                          var considered = d.extras_type != "Lb" && d.extras_type == "B";
                          return (considered ? d.runs_w_extras : d.runs_batter);
                      }).reduce((a, b) => a + b, 0);
                      $scope.$parent.bowlers[i].runs_conceded = runsConceded;

                      var ballsFaced = bowlerBalls.filter(function(d) {
                          return d.extras_type != "Wd" && d.extras_type != "Nb";
                      }).length;

                      var oversBowled = Math.floor(ballsFaced / 6) + ((ballsFaced % 6) * 0.1);
                      $scope.$parent.bowlers[i].overs_bowled = oversBowled;

                      var extrasConceded = bowlerBalls.filter(function(d) {
                          return d.extras_type != "";
                      }).length;
                      $scope.$parent.bowlers[i].extras_conceded = extrasConceded;

                      var wicketsTaken = bowlerBalls.filter(function(d) {
                          return $scope.isWicket(d);
                      }).length;
                      $scope.$parent.bowlers[i].wickets_taken = wicketsTaken;
                  } else {
                      $scope.$parent.bowlers[i].runs_conceded = -1;
                      $scope.$parent.bowlers[i].wickets_taken = -1;
                      $scope.$parent.bowlers[i].overs_bowled = -1;
                      $scope.$parent.bowlers[i].extras_conceded = -1;
                  }
              }

              $scope.$parent.sortPlayers($scope.$parent.selectedBatsmanKey, $scope.$parent.batsmen);
              $scope.$parent.sortPlayers($scope.$parent.selectedBowlerKey, $scope.$parent.bowlers);
          });*/

          $scope.$watch('selectedBatsmanKey', function(newVal, oldVal, scope) {
              if (newVal == "") {
                  $scope.sortPlayers("Batting Order", $scope.$parent.batsmen);
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
              console.log("New active Batsmen");
              console.log(batsmen);
              $scope.activeBatsmen = Array.from(batsmen);
              $scope.$digest()
          })

          $scope.getClass = function(id) {
              if ($scope.activeBatsmen.includes(id) && $scope.correctHandBatsmen.includes(id)) {
                  return 'check';
              }
              return 'active';
          }

          $scope.$on("zoneFilter", function(event, data) {
              console.log("Zone Filter: " + data);
              $scope.zoneFilter = data;
              $scope.$digest();
          })

        }
    });
});
