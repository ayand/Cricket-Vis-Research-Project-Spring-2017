angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
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

        $scope.showVizes = false;
        $scope.showCombo = false;
        $scope.showBatBalls = false;
        $scope.showBowlBalls = false;
        $scope.displayedPlayer = null;

        $scope.$on("clickedPlayer", function(event, data) {
            if (data != null) {
              //$scope.seePlayer = true;
              $scope.currentPlayer = data;
              $scope.displayedPlayer = data;
              $scope.previousPlayer = data;
              $scope.runsScored = data.runs_scored;
              $scope.ballsFaced = data.balls_faced;
              $scope.strikeRate = data.strike_rate != -1 ? data.strike_rate.toFixed(3) : "N/A";
              $scope.oversBowled = data.overs_bowled;
              $scope.runsConceded = data.runs_conceded;
              $scope.wicketsTaken = data.wickets_taken;
              if ($scope.selectedSide == "Batting") {

                  GameService.getBallsByBatsman($scope.displayedPlayer.id).then(function(result) {
                      $scope.displayedBalls = result;
                      var displayedGames = Array.from(new Set($scope.displayedBalls.map(function(d) { return d.game; })));
                      $scope.representedGames = games.filter(function(d) { return displayedGames.includes(d.match_id) });
                      $scope.showVizes = true;
                      $scope.showCombo = false;
                      $scope.showBatBalls = true;
                      $scope.showBowlBalls = false;
                      $location.hash('vizes');
                      $anchorScroll();
                  })
              } else {
                  GameService.getBallsByBowler($scope.displayedPlayer.id).then(function(result) {
                      $scope.displayedBalls = result;
                      var displayedGames = Array.from(new Set($scope.displayedBalls.map(function(d) { return d.game; })));
                      $scope.representedGames = games.filter(function(d) { return displayedGames.includes(d.match_id) });
                      $scope.showVizes = true;
                      $scope.showCombo = false;
                      $scope.showBatBalls = false;
                      $scope.showBowlBalls = true;
                      $location.hash('vizes');
                      $anchorScroll();
                  })
              }
            } else {
              $scope.previousPlayer = null;
              //$scope.showVizes = false;
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
                $scope.showCombo = true;
                $scope.showBatBalls = false;
                $scope.showBowlBalls = false;
                $location.hash('vizes');
                $anchorScroll();
            })
        });

        $scope.$watch("selectedSide", function(newVal, oldVal) {
            if ($scope.displayedPlayer != null && $scope.previousPlayer != null && $scope.previousPlayer == $scope.displayedPlayer) {
              if (newVal == "Batting") {

                  GameService.getBallsByBatsman($scope.displayedPlayer.id).then(function(result) {
                      $scope.displayedBalls = result;
                      var displayedGames = Array.from(new Set($scope.displayedBalls.map(function(d) { return d.game; })));
                      $scope.representedGames = games.filter(function(d) { return displayedGames.includes(d.match_id) });
                      $scope.showVizes = true;
                      $scope.showCombo = false;
                      $scope.showBatBalls = true;
                      $scope.showBowlBalls = false;
                      $location.hash('vizes');
                      $anchorScroll();
                  })
              } else {
                  GameService.getBallsByBowler($scope.displayedPlayer.id).then(function(result) {
                      $scope.displayedBalls = result;
                      var displayedGames = Array.from(new Set($scope.displayedBalls.map(function(d) { return d.game; })));
                      $scope.representedGames = games.filter(function(d) { return displayedGames.includes(d.match_id) });
                      $scope.showVizes = true;
                      $scope.showCombo = false;
                      $scope.showBatBalls = false;
                      $scope.showBowlBalls = true;
                      $location.hash('vizes');
                      $anchorScroll();
                  })
              }
            }
        })

    }
  })
})
