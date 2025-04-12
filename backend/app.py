from flask import Flask
from flask import request
from flask_cors import CORS,cross_origin
import gpt
import db

app = Flask(__name__)
CORS(app)

@app.route('/getGraph',methods=['POST','GET'])
@cross_origin(origin='*')
def generateGraph():
    print("hello")
    data = request.get_json()
    # gets list of dictionaries of the form {source:$source,label:$label,target:$target}
    relations = gpt.getRelations(data["prompt"])

    # save the relations to neo4j database.

    #return the relations.

    print(relations)

    db.save_relations(relations)
    result = {}
    # result["nodes"] = relations
    nodeWeitghMap = {}
    nodes = set()
    for relation in relations:
        source = relation["source"]
        target = relation["target"]
        nodes.add(source)
        nodes.add(target)
        if source not in nodeWeitghMap.keys():
            nodeWeitghMap[source] = 1
        else:
            nodeWeitghMap[source]+=1
        if target not in nodeWeitghMap.keys():
            nodeWeitghMap[target]=1
        else:
            nodeWeitghMap[target]+=1
    # return {"edges":relations,"nodeWeightMap":nodeWeitghMap,"nodes":list(nodes)}
    return getExistingGraph()

@app.route('/getexistinggraph',methods=['GET'])
@cross_origin(origin='*')
def  getExistingGraph():
    result = {}
    result["nodes"] = db.get_nodes()
    result["edges"] = db.get_relations()
    result["nodeWeightMap"] = construct_node_weights(result["edges"])
    return result

def construct_node_weights(relations):
    nodeWeitghMap = {}
    for relation in relations:
        source = relation["source"]
        target = relation["target"]
        if source not in nodeWeitghMap.keys():
            nodeWeitghMap[source] = 1
        else:
            nodeWeitghMap[source]+=1
        if target not in nodeWeitghMap.keys():
            nodeWeitghMap[target]=1
        else:
            nodeWeitghMap[target]+=1
    return nodeWeitghMap
@app.route('/deletedata')
@cross_origin(origin='*')
def deleteGraph():
    db.delete_graph()
    return "Data Deleted"

@app.route('/addEdge',methods=['POST','GET'])
@cross_origin(origin='*')
def addEdge():
    print("Add edge")
    data = request.get_json()
    edges = data["edges"]
    nodes = data["nodes"]
    override = data["override"]
    if(override):
        print("deleting graph")
        deleteGraph()
    for node in nodes:
        db.create_node(db.get_driver(),node["data"]["id"])
    for edge in edges:

        db.create_relationship(db.get_driver(),edge["data"]["source"],edge["data"]["target"],edge["data"]["label"])
    return getExistingGraph()
