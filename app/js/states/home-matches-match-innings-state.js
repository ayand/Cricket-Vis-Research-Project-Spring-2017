angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home.matches.match.innings', {
    resolve: {
      images: ['GameService', function(GameService) {
          return GameService.getPlayerImages();
      }]
    },
    url: '/innings/:number',
    templateUrl: 'partials/alternate-innings-4.html',
    controller: function($scope, players, $stateParams, images, $uibModal,
        $anchorScroll, $location, $timeout) {
        $scope.glued = true;
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
        $scope.showOverFilter = false;
        $scope.showBatsmanFilter = false;
        $scope.showBowlerFilter = false;
        $scope.showPartnershipFilter = false;
        $scope.showPitchFilter = false;
        $scope.showStumpFilter = false;
        $scope.showGroundFilter = false;
        $scope.showBatFilter = false;
        $scope.showZoneFilter = false;

        $scope.$on("batsmanFilter", function(event, data) {
            $scope.showBatsmanFilter = data;
        })

        $scope.$on("bowlerFilter", function(event, data) {
            $scope.showBowlerFilter = data;
        })

        $scope.$on("partnerFilter", function(event, data) {
            $scope.showPartnershipFilter = data;
            $scope.$digest();
        })

        $scope.$on("stumpFilter", function(event, data) {
            $scope.showStumpFilter = data;
            $scope.$digest();
        })

        $scope.$on("pitchFilter", function(event, data) {
            $scope.showPitchFilter = data;
            $scope.$digest();
        })

        $scope.$on("groundFilter", function(event, data) {
            $scope.showGroundFilter = data;
            $scope.$digest();
        })

        $scope.$on("batFilter", function(event, data) {
            console.log("receiving BAT signal")
            $scope.showBatFilter = data;
            $scope.$digest();
        })

        $scope.$on("zoneFilter", function(event, data) {
            $scope.showZoneFilter = data;
            $scope.$digest();
        })

        $scope.mapViews = ["Balls", "Heatmap - Balls", "Heatmap - Runs"];

        $scope.mapView = "Balls";

        $scope.changeView = function(view) {
            $scope.mapView = view;
        }

        $scope.$on("overFilter", function(event, data) {
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

        $scope.battingOrder = $scope.$parent.inning == 1 ? $scope.$parent.firstBatsmenAlphabetical : $scope.$parent.secondBatsmenAlphabetical;

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
              batting_order: $scope.battingOrder.indexOf($scope.$parent.playerDict[d.toString()]["name"]),
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
            $scope.handFilter = false;
            $scope.$broadcast("handFilter", "off");
        }


        $scope.selectedBatsmanKey = "Batting Order";
        $scope.selectedBowlerKey = "Bowling Order";

        $scope.isWicket = function(d) {
            return d.wicket == true && d.extras_type != "Nb" && d.wicket_method != "run out";
        };

        $scope.$watch('slider.minimumOver', function(newMin, oldMin, scope) {
          $scope.showPartnershipFilter = false;
          $scope.showBatFilter = false;
          var newMax = $scope.slider.maximumOver;
          if (newMin == 1 && newMax == 50) {
              $scope.showOverFilter = false;
          } else {
              $scope.showOverFilter = true;
          }

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
          $scope.showPartnershipFilter = false;
          $scope.showBatFilter = false;
          var newMin = $scope.slider.minimumOver;
          if (newMin == 1 && newMax == 50) {
              $scope.showOverFilter = false;
          } else {
              $scope.showOverFilter = true;
          }
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
            $scope.zoneFilter = data;
            $scope.$digest();
        })

        $scope.removeOverFilter = function() {
            console.log("Removed over filter")
            $scope.slider.minimumOver = 1;
            $scope.slider.maximumOver = 50;
            $scope.showOverFilter = false;
            console.log("Removed over filter")
        }

        $scope.removeBatsmanFilter = function() {
            $scope.showBatsmanFilter = false;
            $scope.$emit("battingFilter", true);
        }

        $scope.removeBowlerFilter = function() {
            $scope.showBowlerFilter = false;
            $scope.$emit("bowlingFilter", true);
        }

        $scope.removePartnershipFilter = function() {
            $scope.showPartnershipFilter = false;
            $scope.$broadcast("partnerFilter2", true);
            //$scope.$digest()
        }

        $scope.removePitchFilter = function() {
            $scope.showPitchFilter = false;
            $scope.$broadcast("pitchFilter3", true);
        }

        $scope.removeStumpFilter = function() {
            $scope.showStumpFilter = false;
            $scope.$broadcast("stumpFilter3", true);
        }

        $scope.removeGroundFilter = function() {
            $scope.showGroundFilter = false;
            $scope.$broadcast("groundFilter3", true);
        }

        $scope.removeBatFilter = function() {
            $scope.showBatFilter = false;
            $scope.$broadcast("batFilter3", true);
        }

        $scope.removeZoneFilter = function() {
            $scope.showZoneFilter = false;
            $scope.$broadcast("zoneFilter3", true);
        }
        $timeout(function() {
            var scroller = document.getElementById("maps");
            scroller.scrollTop = scroller.scrollHeight;
            console.log(scroller.scrollTop)
        }, 0, false);
      }
  });
})
