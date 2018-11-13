angular.module('myApp').factory('GameService', ['$http', '$q', function($http, $q) {
    var getGameInfo = function(id) {
      var deferred = $q.defer();
      $http.get('https://serene-spire-90540.herokuapp.com/matches/' + id).success(function(data, status, headers, config) {
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
      $http.get('https://serene-spire-90540.herokuapp.com/players/').success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
        console.log("Error: " + JSON.stringify(data));
        deferred.reject();
      });
      return deferred.promise;
    };

    var getPlayerImages = function() {
      var deferred = $q.defer();
      $http.get('/data/cleaned_info/playerImages.json').success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
        console.log("Error: " + JSON.stringify(data));
        deferred.reject();
      });
      return deferred.promise;
    };

    var getFlagImages = function() {
      var deferred = $q.defer();
      $http.get('/data/cleaned_info/flags.json').success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
        console.log("Error: " + JSON.stringify(data));
        deferred.reject();
      });
      return deferred.promise;
    };

    var getGames = function() {
        var deferred = $q.defer();
        $http.get('https://serene-spire-90540.herokuapp.com/matches/').success(function(data, status, headers, config) {
            deferred.resolve(data);
        }).error(function(data, status, headers, config) {
          console.log("Error: " + JSON.stringify(data));
          deferred.reject();
        });
        return deferred.promise;
    }

    var getPlayerList = function() {
        var deferred = $q.defer();
        $http.get('https://serene-spire-90540.herokuapp.com/players/list').success(function(data, status, headers, config) {
            deferred.resolve(data);
        }).error(function(data, status, headers, config) {
            console.log("Error: " + JSON.stringify(data));
            deferred.reject();
        });
        return deferred.promise;
    }

    var getBallsByBatsman = function(batsman) {
      var deferred = $q.defer();
      $http.get('https://serene-spire-90540.herokuapp.com/matches/batsman/' + batsman).success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
          console.log("Error: " + JSON.stringify(data));
          deferred.reject();
      });
      return deferred.promise;
    }

    var getBallsByBowler = function(bowler) {
      var deferred = $q.defer();
      $http.get('https://serene-spire-90540.herokuapp.com/matches/bowler/' + bowler).success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
          console.log("Error: " + JSON.stringify(data));
          deferred.reject();
      });
      return deferred.promise;
    }

    var getMatchesByTeam = function(team) {
        var deferred = $q.defer();
        $http.get('https://serene-spire-90540.herokuapp.com/matches/team/' + team).success(function(data, status, headers, config) {
            deferred.resolve(data);
        }).error(function(data, status, headers, config) {
            console.log("Error: " + JSON.stringify(data));
            deferred.reject();
        });
        return deferred.promise;
    }

    var getPlayersByTeam = function(team) {
        var deferred = $q.defer();
        $http.get('https://serene-spire-90540.herokuapp.com/players/team/' + team).success(function(data, status, headers, config) {
            deferred.resolve(data);
        }).error(function(data, status, headers, config) {
            console.log("Error: " + JSON.stringify(data));
            deferred.reject();
        });
        return deferred.promise;
    }

    var getPlayerGraph = function() {
      var deferred = $q.defer();
      $http.get('https://serene-spire-90540.herokuapp.com/players/graph/').success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
          console.log("Error: " + JSON.stringify(data));
          deferred.reject();
      });
      return deferred.promise;
    }

    var getPartnerships = function(id) {
      var deferred = $q.defer();
      $http.get('https://serene-spire-90540.herokuapp.com/matches/' + id + "/partnerships").success(function(data, status, headers, config) {
          deferred.resolve(data);
      }).error(function(data, status, headers, config) {
          console.log("Error: " + JSON.stringify(data));
          deferred.reject();
      });
      return deferred.promise;
    }

    var getBracketInfo = function() {
        var deferred = $q.defer();
        $http.get('/data/cleaned_info/cricket_stages.json').success(function(data, status, headers, config) {
            deferred.resolve(data);
        }).error(function(data, status, headers, config) {
            console.log("Error: " + JSON.stringify(data));
            deferred.reject();
        });
        return deferred.promise;
    }

    var getBallsByRegion = function(params) {
        var deferred = $q.defer();
        var url = 'https://serene-spire-90540.herokuapp.com/balls/?'
            + 'leftX=' + params.leftX + "&"
            + 'rightX=' + params.rightX + "&"
            + 'topY=' + params.topY + "&"
            + 'bottomY=' + params.bottomY + "&"
            + 'xName=' + params.xName + "&"
            + 'yName=' + params.yName;

        $http.get(url).success(function(data, status, headers, config) {
            deferred.resolve(data);
        }).error(function(data, status, headers, config) {
            console.log("Error: " + JSON.stringify(data));
            deferred.reject();
        });
        return deferred.promise;
    }

    return {
        getGameInfo: getGameInfo,
        getPlayers: getPlayers,
        getPlayerImages: getPlayerImages,
        getFlagImages: getFlagImages,
        getGames: getGames,
        getPlayerList: getPlayerList,
        getBallsByBatsman: getBallsByBatsman,
        getBallsByBowler: getBallsByBowler,
        getMatchesByTeam: getMatchesByTeam,
        getPlayersByTeam: getPlayersByTeam,
        getPlayerGraph: getPlayerGraph,
        getPartnerships: getPartnerships,
        getBracketInfo: getBracketInfo,
        getBallsByRegion: getBallsByRegion
    }
}]);
