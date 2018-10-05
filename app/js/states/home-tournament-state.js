angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
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

                  $state.go('home.tournament.team', { team: $scope.teamName[data] })
              })

          }
        })
})
