angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'partials/home.html',
      controller: function($scope, $http, $state) {
          $scope.team1 = null;
          $scope.team2 = null;
          $scope.date = null;
          $scope.ground = null;
          $scope.games = [];
          $http.get('/data/cleaned_info/games.json')
              .then(function(result) {
                  $scope.games = result.data;
                  //console.log($scope.games);
              });

          $scope.selectMatch = function(match) {
              $scope.team1 = match.team1_name;
              $scope.team2 = match.team2_name;
              $scope.date = match.date.split(" ")[0];
              $scope.ground = match.ground_name;
              $state.go('home.match', { id: match.match_id });
              //$state.go('home.tabs.match')
          }
      }
    })
    .state('home.match', {
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
      templateUrl: 'partials/alternate-match.html',
      controller: function($scope, balls, players, flags, $state, $stateParams) {
          $scope.gameID = $stateParams.id;
          $scope.allBalls = balls;
          $scope.playerDict = players;
          $scope.flags = flags;
          $scope.showBalls = true;

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
              return d.wicket == true && d.extras_type != "Nb";
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
              return d.wicket == true && d.extras_type != "Nb";
          })
          $scope.secondWickets = $scope.sWickets.length;

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
              $state.go('home.match.innings', { number: inning });
          }

          $scope.seeBalls = function() {
              $scope.showBalls = true;
          }

          $scope.seeOvers = function() {
              $scope.showBalls = false;
          }
      }
    })
    .state('home.match.innings', {
      resolve: {
        images: ['GameService', function(GameService) {
            return GameService.getPlayerImages();
        }]
      },
      url: '/innings/:number',
      templateUrl: 'partials/alternate-innings.html',
      controller: function($scope, players, $stateParams, images, $uibModal) {
          $scope.imageDict = images;
          $scope.matchID = $scope.$parent.gameID;
          $scope.inning = parseInt($stateParams.number);
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

          $scope.batsmen = $scope.batsmanIDs.map(function(d) {
              return {
                id: d,
                name: $scope.$parent.playerDict[d.toString()]["name"]
              };
          });

          $scope.bowlerIDs = Array.from(new Set($scope.inningBalls.map(function(d) {
              return d.bowler;
          })));

          $scope.bowlers = $scope.bowlerIDs.map(function(d) {
              return {
                id: d,
                name: $scope.$parent.playerDict[d.toString()]["name"]
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
              "background-color": "#aaaaaa",
              "opacity": 0.5
          };

          $scope.batsmanStyling = {
              "color": "white",
              "background-color": $scope.teamColors[$scope.battingTeam],
              "font-weight": "bold",
              "opacity": 1
          }

          $scope.bowlerStyling = {
              "color": "white",
              "background-color": $scope.teamColors[$scope.bowlingTeam],
              "font-weight": "bold",
              "opacity": 1
          }

          $scope.currentBatsmen = [];
          $scope.currentBowlers = [];

          $scope.changeBatsmen = function(batsman/*, dictionary, imageDict, gameID*/) {
              if ($scope.currentBatsmen.includes(batsman.id)) {
                  var index = $scope.currentBatsmen.indexOf(batsman.id);
                  $scope.currentBatsmen.splice(index, 1);
              } else {
                  $scope.currentBatsmen.push(batsman.id);
              }
              $scope.currentBatsmen = $scope.currentBatsmen.slice();
              console.log("Current batsmen: ", $scope.currentBatsmen.length);

          }

          $scope.showBatsman = function(batsman, dictionary, imageDict, gameID) {
            $uibModal.open({
                "animation": true,
                "ariaLabelledBy": "modal-title-bottom",
                "ariaDescribedBy": "modal-body-bottom",
                "templateUrl": "partials/batsmanInfo.html",
                "size": "sm",
                controller: function($scope, $uibModalInstance) {
                    $scope.displayedPlayer = batsman;
                    $scope.imageURL = imageDict[batsman.name];
                    $scope.statistics = dictionary[batsman.id]["games"][gameID]["batting_inning"];
                    $scope.close = function() {
                        $uibModalInstance.close(batsman);
                    }
                }
            });
          }

          $scope.changeBowlers = function(bowler/*, dictionary, imageDict, gameID*/) {
              if ($scope.currentBowlers.includes(bowler.id)) {
                  var index = $scope.currentBowlers.indexOf(bowler.id);
                  $scope.currentBowlers.splice(index, 1);
              } else {
                  $scope.currentBowlers.push(bowler.id);
              }
              $scope.currentBowlers = $scope.currentBowlers.slice();
              console.log("Current bowlers: ", $scope.currentBowlers.length);
          }

          $scope.showBowler = function(bowler, dictionary, imageDict, gameID) {
              $uibModal.open({
                  "animation": true,
                  "ariaLabelledBy": "modal-title-bottom",
                  "ariaDescribedBy": "modal-body-bottom",
                  "templateUrl": "partials/bowlerInfo.html",
                  "size": "sm",
                  controller: function($scope, $uibModalInstance) {
                      $scope.displayedPlayer = bowler;
                      $scope.imageURL = imageDict[bowler.name];
                      $scope.statistics = dictionary[bowler.id]["games"][gameID]["bowling_inning"];
                      $scope.close = function() {
                          $uibModalInstance.close(bowler);
                      }
                  }
              });
          }

          $scope.decideSlider = function() {
              if ($scope.inning == 1) {
                  return $scope.$parent.rangeSlider1;
              } else {
                  return $scope.$parent.rangeSlider2;
              }
          }

        }
    });
});
