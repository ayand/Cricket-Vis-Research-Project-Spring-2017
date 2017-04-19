import json

f = open('games.json', 'r')
data = json.load(f)

groundsData = {}

for game in data:
    groundID = game[str("ground_id")]
    if groundID not in groundsData:
        groundsData[groundID] = {}
        groundsData[groundID]["name"] = game["ground_name"]
        groundsData[groundID]["games"] = []
        groundsData[groundID]["games"].append(game["match_id"])
    else:
        groundsData[groundID]["games"].append(game["match_id"])

'''jsonData = json.dumps(groundsData)
print(jsonData)'''
with open('grounds.json', 'w') as g:
     json.dump(groundsData, g, indent=1)
print('Mission accomplished')
f.close()

'''f = open('grounds.json', 'r')
data = json.load(f)
for key in data:
    print(data[key])
    print("\n")
f.close()'''
