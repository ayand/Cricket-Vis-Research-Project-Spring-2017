angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home', {
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
})
