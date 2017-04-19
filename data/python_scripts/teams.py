import json

f = open('games.json', 'r')
data = json.load(f)

teamDict = {}

for game in data:
    team1ID = str(game["team1_id"])
    team2ID = str(game["team2_id"])
    team1Name = game["team1_name"]
    team2Name = game["team2_name"]
    teamDict[team1ID] = team1Name
    teamDict[team2ID] = team2Name

'''jsonData = json.dumps(teamDict)
print(jsonData)'''
with open('teams.json', 'w') as g:
     json.dump(teamDict, g, indent=1)
print('Mission accomplished')
f.close()


'''f = open('teams.json', 'r')
data = json.load(f)
for key in data:
    print(data[key])
    print("\n\n")
f.close()
'''
