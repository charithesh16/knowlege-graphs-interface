from openai import OpenAI
import os

# os.environ["OPENAI_API_KEY"] = "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"
os.environ["OPENAI_API_KEY"] = "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"

prompt = """You are given a prompt. Extrapolate as many relationships as you can from the prompt and generate tuples like (source, relation, target). Make sure there are always source, relation and target in the tuple.
Example:
prompt: John knows React, Golang, and Python. John is good at Software Engineering and Leadership
tuple: 
(John, knows, React); (John, knows, Golang); (John, knows, Python); (John, good_at, Software_Engineering); (John, good_at, Leadership);
prompt: Bob is Alice's father. Alice has one brother John. 
tuple: 
(Bob, father_of, Alice); (John, brother_of, Alice)
Only include ASCII characters in the response.
prompt: {prompt}
tuple:
"""



def getRelations(input_txt):
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {"role":"system","content":"You are a helpful assistant that extracts the relationships in the input and returns tuples in format (source,relation,target)"},
            {"role":"user","content":prompt.format(prompt = input_txt)}
        ]
    )
    response = response.choices[0].message.content
    print(response)
    cleaned_relations = []
    for tuple in response.split(";"):
        if len(tuple.strip()) ==0:
            continue
        tuple_elements = tuple.strip()[1:-1].split(",")
        # print(tuple)
        if len(tuple_elements) ==3:
            temp = {}
            temp["source"] = tuple_elements[0]
            temp["label"] = tuple_elements[1]
            temp["target"] = tuple_elements[2]
            cleaned_relations.append(temp)
    # print("Before ",len(response.strip().split(";")))
    # print("After ",len(cleaned_relations))
    # call process relations and return the response in the form {source:$source,label:$label,target:$target}
    return cleaned_relations


# converts list of tuples to list of dictionaries of the form {source:$source,label:$label,target:$target}
def processRelations(tuples):

    return 



