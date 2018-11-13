angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
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
              "border-left": "1px solid white",
              "border-right": "1px solid white"
          };

          $scope.playerStyling = {
              "color": "white",
              "background-color": $scope.teamColors[$scope.teamName],
              "font-weight": "bold",
              "border-left": "1px solid white",
              "border-right": "1px solid white"
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
})
