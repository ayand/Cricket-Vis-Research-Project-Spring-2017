import json

f = open('games.json', 'r')
data = json.load(f)


gameDict = {}

for game in data:
    match_id = str(game["match_id"])
    gameDict[match_id] = game

'''jsonData = json.dumps(gameDict)
print(jsonData)'''
with open('matches.json', 'w') as g:
     json.dump(gameDict, g, indent=1)
print('Mission accomplished')
f.close()

'''f = open('matches.json', 'r')
data = json.load(f)
for key in data:
    print(data[key])
    print("\n\n")
f.close()'''
