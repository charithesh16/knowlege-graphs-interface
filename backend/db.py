from neo4j import GraphDatabase

URI = "neo4j+ssc://a65a3496.databases.neo4j.io"
# URI = "neo4j+ssc://c0680b05.databases.neo4j.io"
AUTH = ("neo4j","TmqG3MotfdfMAqy1DXYgqhlf6lhFnSG7PgWexPXc2gM")


def get_driver():
    with GraphDatabase.driver(URI,auth = AUTH) as driver:
        # driver.verify_connectivity
        return driver
    return None

def save_relations(relations):
    driver = get_driver()
    if driver == None:
        print("Error connecting to Database")
        return
    nodes = set()
    for relation in relations:
        source = str(relation["source"]).strip().replace(" ","_").replace("\"","'").replace("-","_").replace("'","").replace("--","_")
        target = str(relation["target"]).strip().replace(" ","_").replace("\"","'").replace("-","_").replace("'","").replace("--","_")
        label = str(relation["label"]).strip().replace(" ","_").replace("\"","'").replace("-","_").replace("'","").replace("--","_")
        # Create nodes
        create_node(driver,source)
        create_node(driver,target)
        create_relationship(driver,source,target,label)
    # for relation in relations:
    #     source = str(relation["source"]).strip().replace(" ","_").replace("\"","'").replace("-","_").replace("'","").replace("--","_")
    #     target = str(relation["target"]).strip().replace(" ","_").replace("\"","'").replace("-","_").replace("'","").replace("--","_")
    #     label = str(relation["label"]).strip().replace(" ","_").replace("\"","'").replace("-","_").replace("'","").replace("--","_")
    #     create_relationship(driver,source,target,label)
        # records,summary,keys = driver.execute_query("""MERGE (n:Node {name:$name})""",name=source,database_="neo4j")
    return

def create_node(driver,node_name):
    create_query = """ MERGE (n:Node {name:\"""" + node_name + """\"})"""
    print(create_query)
    records,summary,keys = driver.execute_query(create_query,database_="neo4j")
    print(summary.counters)
    return

def create_relationship(driver,source_name,target_name,label):
    create_query = """ MERGE (p:Node {name:\"""" + source_name + """\"})
                     MERGE (q:Node {name:\"""" + target_name + """\"})
                     MERGE (p)-[:""" + label + """]->(q)"""
    print(create_query)
    records,summary,keys = driver.execute_query(create_query,database_="neo4j") 
    print(summary.counters)
    return

def get_nodes():
    driver = get_driver()
    create_query = """ MATCH (n) RETURN n """
    records,summary,keys = driver.execute_query(create_query,database_="neo4j")
    nodes = set()
    for record in records:
        nodes.add(record[0]._properties["name"])
    # print(records)
    return list(nodes)

def get_relations():
    driver = get_driver()
    create_query = """ MATCH (n)-[r]->(m) RETURN n,r,m"""
    records,summary,keys = driver.execute_query(create_query,database_="neo4j")
    # print(records)
    relations = []
    for record in records:
        tmp = {}
        tmp["source"] = record[0]._properties["name"]
        tmp["label"] = record[1].type
        tmp["target"] = record[2]._properties["name"]
        relations.append(tmp)
    # print(records[0][0]._properties["name"])
    # print("hello")
    return relations

def delete_graph():
    driver = get_driver()
    query = """ MATCH (n) DETACH DELETE n"""
    records,summary,keys = driver.execute_query(query,database_="neo4j")
    print(records)
    return None