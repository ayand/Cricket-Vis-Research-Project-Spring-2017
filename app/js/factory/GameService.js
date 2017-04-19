angular.module('myApp').factory('GameService', ['$http', '$q', function($http, $q) {
    var getGameInfo = function(id) {
      var deferred = $q.defer();
      $http.get('/data/games/' + id + ".json").success(function(data, status, headers, config) {
          //console.log("Number of balls: " + data.length);
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
          console.log("Error: " + JSON.stringify(data));
          deferred.reject();
      });
      return deferred.promise;
    };

    var getPlayers = function() {
      var deferred = $q.defer();
      $http.get('/data/cleaned_info/players.json').success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
        console.log("Error: " + JSON.stringify(data));
        deferred.rejct();
      });
      return deferred.promise;
    };

    var getPlayerImages = function() {
      var deferred = $q.defer();
      $http.get('/data/cleaned_info/playerImages.json').success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
        console.log("Error: " + JSON.stringify(data));
        deferred.rejct();
      });
      return deferred.promise;
    };

    var getFlagImages = function() {
      var deferred = $q.defer();
      $http.get('/data/cleaned_info/flags.json').success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
        console.log("Error: " + JSON.stringify(data));
        deferred.rejct();
      });
      return deferred.promise;
    };


    return {
        getGameInfo: getGameInfo,
        getPlayers: getPlayers,
        getPlayerImages: getPlayerImages,
        getFlagImages: getFlagImages
    }
}]);
