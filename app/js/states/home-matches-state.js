angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
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
})
