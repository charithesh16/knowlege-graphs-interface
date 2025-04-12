import { useReducer, useState } from "react";
import Chatbot from 'react-chatbot-kit';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import config from './config';
import {Graph,enableDrawMode,disableDrawMode} from "./Graph";
import main from "./prompt/prompt.txt";
import { graphReducer, initialState } from "./graphReducer";
import { ACTIONS } from "./actions";
import {

  exportData,
  exportCSV,
  restructureGraph,
  constructEdge,
} from "./util";
import "./App.css";
import {  LAYOUTS } from "./constants";
import LayoutSelector from "./LayoutSelector";

function App() {
  const [prompt, setPrompt] = useState("");
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const [graphState, dispatch] = useReducer(graphReducer, initialState);

  const [option, setOptions] = useState(LAYOUTS.FCOSE);

  const [loading, setLoading] = useState(false);

  const [addingEdge, setaddingEdge] = useState(false);

  const [override,setOverride] = useState(false);

  const [key, setKey] = useState("key");
  const handleKeyChange = (e) => {
    setKey(e.target.value);
  };

  // const [file, setFile] = useState("");

  // const handleJSONImport = (e) => {
  //   const fileReader = new FileReader();
  //   fileReader.readAsText(e.target.files[0], "UTF-8");
  //   fileReader.onload = (e) => {
  //     let data;
  //     try {
  //       data = JSON.parse(e.target.result);
  //     } catch (err) {
  //       console.info(err);
  //     }
  //     setFile(null);
  //     const result = restructureGraph(tuplesToGraph(cleanJSONTuples(data)));

  //     dispatch({ type: ACTIONS.ADD_NODES_AND_EDGES, payload: result });
  //   };
  // };

  const deletedata = (e) => {
    setLoading(true);
    disableDrawMode();
    dispatch({ type: ACTIONS.CLEAR_GRAPH });
    fetch("http://localhost:5000/deletedata")
    .then(response => {
      console.log(response)
      window.alert("Data Deleted");
    })
    setLoading(false);
    setaddingEdge(false);
  };

  const getexistinggraph = (e) => {
    setLoading(true);
    disableDrawMode();
    dispatch({ type: ACTIONS.CLEAR_GRAPH })
    fetch("http://127.0.0.1:5000/getexistinggraph")
    .then((response)=> response.json())
    .then((data) => {
      setLoading(false);
       if(data===NaN || data===null || data.edges.length < 1){
        window.alert("No data found.");
       }
      const result = restructureGraph(data);
      dispatch({ type: ACTIONS.ADD_NODES_AND_EDGES, payload: result });
      console.log("after fetching data: ",graphState);
    }).catch((error) => {
      setLoading(false);
      console.log(error);
    })
    setaddingEdge(false);
  };

  const fetchGraph = (query) => {
    setLoading(true);
    disableDrawMode();
        fetch("http://127.0.0.1:5000/getGraph", {
          method: "POST",
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "prompt":prompt
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            
            const result = restructureGraph(data);
            dispatch({ type: ACTIONS.ADD_NODES_AND_EDGES, payload: result });
           
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            console.log(error);
          });
          setaddingEdge(false);
  };

  const handleSubmit = () => {
    fetchGraph(prompt);
  };

const updateGraphState = (sourceNode, targetNode, added_edge, edge_label) => {
  console.log("before graph state : ",graphState);
  const source = sourceNode._private.data.name;
  const target = targetNode._private.data.name;
  const edge = constructEdge(source,target,edge_label);
  const load = {nodes:[],edges:[edge]};
  dispatch({type: ACTIONS.ADD_NODES_AND_EDGES, payload: load});
  console.log("after graph state",graphState);
  disableDrawMode();
  setaddingEdge(false);
}

const addNodeToData = (nodesList,edgesList) => {
const load = {nodes:nodesList,edges:edgesList,check:true};
dispatch({type:ACTIONS.ADD_NODES_AND_EDGES,payload:load});
setOverride(true);
}

const handleAddEdge = () => {
  if(!addingEdge){
    enableDrawMode();
    setaddingEdge(true);
  }else{
    disableDrawMode();
    setaddingEdge(false);
  }
  
  console.log("In handleAddEdge()");
};
const handleNeo4JUpdate = () =>{
  setLoading(true);
  disableDrawMode();
  fetch("http://127.0.0.1:5000/addEdge", {
          method: "POST",
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "edges":graphState.edges,
            "nodes":graphState.nodes,
            "override":override
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            
            const result = restructureGraph(data);
            dispatch({ type: ACTIONS.ADD_NODES_AND_EDGES, payload: result });
           
            setLoading(false);
          })
          .catch((error) => {
            setLoading(false);
            console.log(error);
          });
          setaddingEdge(false);
};
  return (
    <div className="App">
      <div className="mainContainer">
          <textarea
          name="prompt"
          rows="5"
          cols="10"
          onChange={(e) => handlePromptChange(e)}
          value={prompt}
          className="promptInput"
          placeholder="Enter your text"
        ></textarea>
          {/* <textarea
          name="prompt"
          rows="5"
          cols="10"
          onChange={(e) => handlePromptChange(e)}
          value={prompt}
          className="promptInput"
          placeholder="Enter your question"
        ></textarea> */}
        <div >
          <button
            onClick={handleSubmit}
            className="submitButton"
            disabled={loading || key.length < 1}
          >
            {loading ? "Loading" : "Generate"}
          </button>
          <button
            className="submitButton"
            style={{ marginLeft: 5,marginRight:5 }}
            onClick={() => getexistinggraph()}
            disabled={loading || key.length < 1}
          >
            Get Existing Graph
          </button>
          <button
            className="submitButton"
            style={{ marginLeft: 5,marginRight:5 }}
            onClick={() => deletedata()}
            // disabled={graphState?.edges?.length < 1}
          >
            Delete Data in Neo4J Database
          </button>
          {/* <button
            className="submitButton"
            style={{ marginLeft: 5,marginRight:5 }}
            onClick={() => getexistinggraph()}
            // disabled={graphState?.edges?.length < 1}
          >
            Get Answer
          </button> */}
          <br />

        </div>
        <div className="buttonContainer">
          <button
            className="submitButton"
            style={{ marginLeft: 5 }}
            onClick={() => dispatch({ type: ACTIONS.CLEAR_GRAPH })}
          >
            Clear
          </button>
          <button
            className="submitButton"
            style={{ marginLeft: 5 }}
            onClick={() => exportData(graphState?.edges)}
            disabled={graphState?.edges?.length < 1}
          >
            Export JSON
          </button>
          <button
            className="submitButton"
            style={{ marginLeft: 5 }}
            onClick={() => exportCSV(graphState?.edges)}
            disabled={graphState?.edges?.length < 1}
          >
            Export CSV
          </button>
          <button
          className="submitButton"
          style={{marginLeft: 5}}
          onClick={()=> handleAddEdge()}
          disabled={graphState?.edges?.length < 1}
          >
            {
              addingEdge ? <p>Cancel Adding Edge</p>:<p>Add Edge</p>
            }   
          </button>
          <button
          className="submitButton"
          style={{marginLeft: 5}}
          onClick={()=> handleNeo4JUpdate()}
          disabled={graphState?.edges?.length < 1}
          >
          Update Neo4J Graph            
          </button>
          
          <LayoutSelector option={option} setOptions={setOptions} />
        </div>
      </div>
      <Graph data={graphState} updateGraphState={updateGraphState} addNodeToData={addNodeToData} layout={option} />
      {/* <Chatbot config={config} actionProvider={ActionProvider} 	    messageParser={MessageParser} /> */}
    </div>
    
  );
}

export default App;
