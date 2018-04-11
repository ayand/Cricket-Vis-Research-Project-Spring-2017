angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'partials/system-home.html',
      controller: function($scope, $state) {
          $scope.atHome = true;

          $scope.$on("match", function(event, id) {
              console.log(id);
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
          }]
      },
      url: '/tournament',
      templateUrl: 'partials/tournament-view.html',
      controller: function($scope, $state, teams) {
          $scope.teams = [];
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

          //console.log($scope.teams);
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
              console.log(data);
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
        }]
      },
      url: '/matches',
      templateUrl: 'partials/home.html',
      controller: function($scope, $http, $state, games) {
          $scope.team1 = null;
          $scope.team2 = null;
          $scope.date = null;
          $scope.ground = null;
          $scope.games = games;

          $scope.selectMatch = function(match) {
              $scope.team1 = match.team1_name;
              $scope.team2 = match.team2_name;
              $scope.date = match.date.split(" ")[0];
              $scope.ground = match.ground_name;
              $scope.result = match.result;
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
          }]
      },
      url: '/match/:id',
      templateUrl: 'partials/alternate-match-2.html',
      controller: function($scope, balls, players, flags, $state, $stateParams, GameService) {
          $scope.showLegend = true;
          $scope.hover = true;
          $scope.gameID = $stateParams.id;
          $scope.allBalls = balls;
          $scope.playerDict = players;
          $scope.flags = flags;
          $scope.showBalls = true;

          GameService.getGames().then(function(data) {
              var relevantGame = data.filter(function(d) { return d.match_id == $stateParams.id })[0];
              console.log(relevantGame);
              $scope.date = relevantGame.date.split(" ")[0];
              $scope.ground = relevantGame.ground_name;
              $scope.team1 = relevantGame.team1_name;
              $scope.team2 = relevantGame.team2_name;
              $scope.result = relevantGame.result;
          })

          $scope.$on("matchInfo", function(event, data) {
              console.log("Match info for: " + data);
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
              $scope.$watch('rangeSlider1.maximumOver', function(newMax, oldMax, scope) {
                  if (newMin == 1 && newMax >= $scope.maxOvers1) {
                      $scope.showLeftComparison = false;
                  } else {
                      $scope.showLeftComparison = true;
                  }
                  var beforeBalls = $scope.firstInning.filter(function(d) {
                      var over = Math.floor(d.ovr) + 1;
                      return over < newMin;
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
              });
          });

          $scope.$watch('rangeSlider2.minimumOver', function(newMin, oldMin, scope) {
              $scope.$watch('rangeSlider2.maximumOver', function(newMax, oldMax, scope) {
                  if (newMin == 1 && newMax >= $scope.maxOvers2) {
                      $scope.showRightComparison = false;
                  } else {
                      $scope.showRightComparison = true;
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
          });

          $scope.seeInning = function(inning) {
              if (inning == 1) {
                $scope.showSlider1 = true;
                $scope.showSlider2 = false;
                $scope.rangeSlider2.minimumOver = 1;
                $scope.rangeSlider2.maximumOver = 50;
              } else {
                $scope.showSlider1 = false;
                $scope.showSlider2 = true;
                $scope.rangeSlider1.minimumOver = 1;
                $scope.rangeSlider1.maximumOver = 50;
              }
              $scope.showLegend = false;
              $scope.hover = false;
              $state.go('home.matches.match.innings', { number: inning });
          }

          $scope.seeBalls = function() {
              $scope.showBalls = true;
          }

          $scope.seeOvers = function() {
              $scope.showBalls = false;
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
          $scope.inning = parseInt($stateParams.number);
          $scope.maxOvers = ($scope.inning == 1) ? $scope.$parent.maxOvers1 : $scope.$parent.maxOvers2;
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
          $scope.batsmen = $scope.batsmanIDs.map(function(d) {
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
          $scope.bowlers = $scope.bowlerIDs.map(function(d) {

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

          $scope.battingTeam = $scope.inningBalls[0].batting_team;
          $scope.bowlingTeam = $scope.inningBalls[1].bowling_team;

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

          $scope.currentBatsmen = [];
          $scope.currentBowlers = [];

          $scope.activeBatsmen = $scope.batsmanIDs;
          $scope.correctHandBatsmen = $scope.activeBatsmen;
          $scope.activeBowlers = $scope.bowlerIDs;

          $scope.changeBatsmen = function(batsman) {
              if ($scope.activeBatsmen.includes(batsman.id) && $scope.correctHandBatsmen.includes(batsman.id)) {
                if ($scope.currentBatsmen.includes(batsman.id)) {
                    var index = $scope.currentBatsmen.indexOf(batsman.id);
                    $scope.currentBatsmen.splice(index, 1);
                } else {
                    $scope.currentBatsmen.push(batsman.id);
                }
              }
          }

          $scope.changeBowlers = function(bowler) {
              if ($scope.activeBowlers.includes(bowler.id)) {
                if ($scope.currentBowlers.includes(bowler.id)) {
                    var index = $scope.currentBowlers.indexOf(bowler.id);
                    $scope.currentBowlers.splice(index, 1);
                } else {
                    $scope.currentBowlers.push(bowler.id);
                }
              }
          }

          $scope.selectedBatsmanKey = "Batting Order";
          $scope.selectedBowlerKey = "Bowling Order";

          $scope.isWicket = function(d) {
              return d.wicket == true && d.extras_type != "Nb" && d.wicket_method != "run out";
          };

          $scope.$watchGroup(['slider.minimumOver', 'slider.maximumOver'], function(newValues, oldValues, scope) {
              var newMax = newValues[1];
              var newMin = newValues[0];
              var activeBalls = $scope.inningBalls.filter(function(d) {
                  var over = Math.floor(d.ovr) + 1;
                  return over >= newMin && over <= newMax;
              });
              $scope.activeBatsmen = Array.from(new Set(activeBalls.map(function(d) {
                  return d.batsman;
              })));

              $scope.activeBowlers = Array.from(new Set(activeBalls.map(function(d) {
                  return d.bowler;
              })));

              $scope.currentBatsmen.length = 0;
              $scope.currentBowlers.length = 0;

              for (var i = 0; i < $scope.batsmen.length; i++) {
                  if ($scope.activeBatsmen.includes($scope.batsmen[i].id)) {
                    var batsmanBalls = activeBalls.filter(function(d) {
                        return d.batsman == $scope.batsmen[i].id;
                    });

                    var runsScored = batsmanBalls.map(function(d) {
                        return d.runs_batter;
                    }).reduce((a, b) => a + b, 0);
                    $scope.batsmen[i].runs_scored = runsScored;

                    var ballsFaced = batsmanBalls.filter(function(d) {
                        return d.extras_type != "Wd" && d.extras_type != "Nb";
                    })
                    var bf = ballsFaced.length;
                    $scope.batsmen[i].balls_faced = bf;

                    var strikeRate = (runsScored * 100) / bf;
                    $scope.batsmen[i].strike_rate = strikeRate;

                    var form = ballsFaced.filter(function(d) { return d.control == 1 }).length / bf;
                    $scope.batsmen[i].form = form;
                  } else {
                      $scope.batsmen[i].runs_scored = -1;
                      $scope.batsmen[i].balls_faced = -1;
                      $scope.batsmen[i].strike_rate = -1;
                      $scope.batsmen[i].form = -1;
                  }

              }

              for (var i = 0; i < $scope.bowlers.length; i++) {
                  if ($scope.activeBowlers.includes($scope.bowlers[i].id)) {
                      var bowlerBalls = activeBalls.filter(function(d) {
                          return d.bowler == $scope.bowlers[i].id;
                      });

                      var runsConceded = bowlerBalls.map(function(d) {
                          var considered = d.extras_type != "Lb" && d.extras_type == "B";
                          return (considered ? d.runs_w_extras : d.runs_batter);
                      }).reduce((a, b) => a + b, 0);
                      $scope.bowlers[i].runs_conceded = runsConceded;

                      var ballsFaced = bowlerBalls.filter(function(d) {
                          return d.extras_type != "Wd" && d.extras_type != "Nb";
                      }).length;

                      var oversBowled = Math.floor(ballsFaced / 6) + ((ballsFaced % 6) * 0.1);
                      $scope.bowlers[i].overs_bowled = oversBowled;

                      var extrasConceded = bowlerBalls.filter(function(d) {
                          return d.extras_type != "";
                      }).length;
                      $scope.bowlers[i].extras_conceded = extrasConceded;

                      var wicketsTaken = bowlerBalls.filter(function(d) {
                          return $scope.isWicket(d);
                      }).length;
                      $scope.bowlers[i].wickets_taken = wicketsTaken;
                  } else {
                      $scope.bowlers[i].runs_conceded = -1;
                      $scope.bowlers[i].wickets_taken = -1;
                      $scope.bowlers[i].overs_bowled = -1;
                      $scope.extras_conceded = -1;
                  }
              }

              $scope.sortPlayers($scope.selectedBatsmanKey, $scope.batsmen);
              $scope.sortPlayers($scope.selectedBowlerKey, $scope.bowlers);
          });

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
              $scope.correctHandBatsmen = Array.from(batsmen);
              console.log("Batsmen: ");
              console.log($scope.correctHandBatsmen)
              $scope.$digest()
          })

          $scope.getClass = function(id) {
              if ($scope.activeBatsmen.includes(id) && $scope.correctHandBatsmen.includes(id)) {
                  console.log("True")
                  return 'check';
              }
              console.log("False")
              return 'active';
          }

        }
    });
});
