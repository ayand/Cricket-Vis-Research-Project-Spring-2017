import json

gameNums = [656399,656401,656403,656405,656407,656409,656411,656413,656415,
    656417,656421,656423,656425,656427,656429,656431,656433,656435,656437,
    656439,656441,656443,656445,656447,656449,656451,656453,656455,656457,
    656459,656461,656463,656465,656467,656469,656471,656473,656475,656477,
    656479,656481,656483,656485,656487,656489,656491,656493,656495]

playerDict = {}

for gameID in gameNums:
    stringGame = str(gameID)
    fileName = str(gameID) + ".json"
    f = open(fileName, "r")
    game = json.load(f)
    for ball in game:
        batsmanID = str(ball["batsman"])
        bowlerID = str(ball["bowler"])
        if batsmanID not in playerDict:
            playerDict[batsmanID] = {}
            playerDict[batsmanID]["team"] = ball["batting_team"]
            playerDict[batsmanID]["name"] = ball["batsman_name"]
            playerDict[batsmanID]["games"] = {}
            playerDict[batsmanID]["hand"] = None
        if bowlerID not in playerDict:
            playerDict[bowlerID] = {}
            playerDict[bowlerID]["team"] = ball["bowling_team"]
            playerDict[bowlerID]["name"] = ball["bowler_name"]
            playerDict[bowlerID]["games"] = {}
            playerDict[bowlerID]["hand"] = None
        if stringGame not in playerDict[batsmanID]["games"]:
            playerDict[batsmanID]["games"][stringGame] = {}
            playerDict[batsmanID]["games"][stringGame]["batting_inning"] = {}
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"] = {}
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"]["runs_conceded"] = 0
            playerDict[batsmanID]["games"][stringGame]["batting_inning"]["runs_scored"] = 0
            playerDict[batsmanID]["games"][stringGame]["batting_inning"]["balls_faced"] = 0
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"]["balls_bowled"] = 0
            playerDict[batsmanID]["games"][stringGame]["batting_inning"]["4s_scored"] = 0
            playerDict[batsmanID]["games"][stringGame]["batting_inning"]["6s_scored"] = 0
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"]["4s_conceded"] = 0
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"]["6s_conceded"] = 0
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"]["wickets_taken"] = 0
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"]["dot_balls_bowled"] = 0
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"]["wides_bowled"] = 0
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"]["no_balls_bowled"] = 0
            playerDict[batsmanID]["games"][stringGame]["bowling_inning"]["extras_conceded"] = 0

        if stringGame not in playerDict[bowlerID]["games"]:
            playerDict[bowlerID]["games"][stringGame] = {}
            playerDict[bowlerID]["games"][stringGame]["batting_inning"] = {}
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"] = {}
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["runs_conceded"] = 0
            playerDict[bowlerID]["games"][stringGame]["batting_inning"]["runs_scored"] = 0
            playerDict[bowlerID]["games"][stringGame]["batting_inning"]["balls_faced"] = 0
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["balls_bowled"] = 0
            playerDict[bowlerID]["games"][stringGame]["batting_inning"]["4s_scored"] = 0
            playerDict[bowlerID]["games"][stringGame]["batting_inning"]["6s_scored"] = 0
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["4s_conceded"] = 0
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["6s_conceded"] = 0
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["wickets_taken"] = 0
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["dot_balls_bowled"] = 0
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["wides_bowled"] = 0
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["no_balls_bowled"] = 0
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["extras_conceded"] = 0

        playerDict[batsmanID]["games"][stringGame]["batting_inning"]["runs_scored"] += ball["runs_batter"]
        playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["runs_conceded"] += ball["runs_batter"]
        if playerDict[batsmanID]["hand"] == None:
            playerDict[batsmanID]["hand"] = "Right" if ball["bat_right_handed"] == "y" else "Left"
        if ball["extras_type"] not in ["Lb", "B"]:
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["runs_conceded"] += ball["extras"]
        else:
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["extras_conceded"] += ball["extras"]
        if ball["extras_type"] not in ["Wd", "Nb"]:
            playerDict[batsmanID]["games"][stringGame]["batting_inning"]["balls_faced"] += 1
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["balls_bowled"] += 1
        if ball["runs_batter"] == 4:
            playerDict[batsmanID]["games"][stringGame]["batting_inning"]["4s_scored"] += 1
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["4s_conceded"] += 1
        if ball["runs_batter"] == 6:
            playerDict[batsmanID]["games"][stringGame]["batting_inning"]["6s_scored"] += 1
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["6s_conceded"] += 1
        if  (ball["runs_batter"] == 0 and ball["extras_type"] not in ["Wd", "Nb"]):
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["dot_balls_bowled"] += 1
        if ball["wicket"] == True and ball["wicket"] != "Nb" and ball["wicket_method"] != "run out":
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["wickets_taken"] += 1
        if ball["extras_type"] == "Wd":
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["wides_bowled"] += 1
        if ball["extras_type"] == "Nb":
            playerDict[bowlerID]["games"][stringGame]["bowling_inning"]["no_balls_bowled"] += 1

    f.close()

#jsonData = json.dumps(playerDict)
#print(jsonData)
with open('players.json', 'w') as g:
     json.dump(playerDict, g, indent=1)
print('Mission accomplished')

'''f = open('players.json', 'r')
data = json.load(f)
for key in data:
    print("Name: " + data[key]["name"])
    print("Team: " + data[key]["team"])
    print("Performance in games: ")
    for game in data[key]["games"]:
        print(game + ":")
        print("Runs conceded: " + str(data[key]["games"][game]["runs_conceded"]))
        print("Runs scored: " + str(data[key]["games"][game]["runs_scored"]))
        print("Balls faced: " + str(data[key]["games"][game]["balls_faced"]))
        print("Balls bowled: " + str(data[key]["games"][game]["balls_bowled"]))
        print("4's scored: " + str(data[key]["games"][game]["4s_scored"]))
        print("4's conceded: " + str(data[key]["games"][game]["4s_conceded"]))
        print("6's scored: " + str(data[key]["games"][game]["6s_scored"]))
        print("6's conceded: " + str(data[key]["games"][game]["6s_conceded"]))
        print("Wickets taken: " + str(data[key]["games"][game]["wickets_taken"]))
        print("Dot balls bowled: " + str(data[key]["games"][game]["dot_balls_bowled"]))
        print("\n")
    print("\n")
f.close()
'''
