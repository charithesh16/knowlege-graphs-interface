import { useEffect, useRef } from "react";

import cytoscape from "cytoscape";
import { LAYOUT_OPTIONS, PANZOOM_OPTIONS } from "./constants";
import dagre from "cytoscape-dagre";
import fcose from "cytoscape-fcose";
import avsdf from "cytoscape-avsdf";
import panzoom from "cytoscape-panzoom";
import edgehandles from 'cytoscape-edgehandles';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import "./panzoom.css";
import "cytoscape-panzoom/font-awesome-4.0.3/css/font-awesome.min.css";
import styles from "./styles";
try {
  cytoscape.use(dagre);
  cytoscape.use(fcose);
  cytoscape.use(avsdf);
  cytoscape.use(edgehandles);
  panzoom(cytoscape);
  cytoscape.use(contextMenus);
} catch (e) {
  // eslint-disable-next-line
  console.warn("Warning: ", e);
}

// the default values of each option are outlined below:
let tempdefaults = {
  canConnect: function( sourceNode, targetNode ){
    // whether an edge can be created between source and target
    return !sourceNode.same(targetNode); // e.g. disallow loops
  },
  edgeParams: function( sourceNode, targetNode ){
    // for edges between the specified source and target
    // return element object to be passed to cy.add() for edge
    return {};
  },
  hoverDelay: 150, // time spent hovering over a target node before it is considered selected
  snap: true, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
  snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
  snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
  noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
  disableBrowserGestures: true // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
};



let eh;
let instance;

export const Graph = ({ data, updateGraphState,addNodeToData, layout }) => {
  const networkRef = useRef(null);
  const cyRef = useRef(null);
  let cy;
  const createNetwork = () => {
    cy = new cytoscape({
      layout: LAYOUT_OPTIONS[layout] ?? LAYOUT_OPTIONS.FCOSE,
      container: networkRef.current,
      maxZoom: 1e1,
      elements: { nodes: data.nodes, edges: data.edges },
      style: styles,
    });
    cy.panzoom(PANZOOM_OPTIONS);
    cyRef.current = cy;
    cy.on('click','node',function(event){
      console.log("CLicked :" + this.id())
      var temp = "#"+this.id();
      console.log(cy.$(temp).json());
    });
    eh = cy.edgehandles( tempdefaults );
    instance = cy.contextMenus(contextMenu);
    cy.on('ehcomplete', (event, sourceNode, targetNode, addedEdge) => {
      console.log("added edge "+addedEdge);
      let edgename = prompt("Enter edge name","default");
      console.log("edgename := "+edgename);
      if(!isNaN(edgename) || edgename===null || edgename===""){
        // updateNetwork(data);
        console.log("edgename is null");
      }else{
        edgename = edgename.replace(" ","_");
      updateGraphState(sourceNode,targetNode,addedEdge,edgename);
      disableDrawMode();
      }
      
      });
  };

var temp = (nodes,edges) => {
  addNodeToData(nodes,edges);
}

  var contextMenu = {
    evtType: 'cxttap',
    menuItems: [
      {
        id: 'remove', 
        content: 'remove',
        tooltipText: 'remove',
        image: {src : "remove.svg", width : 12, height : 12, x : 6, y : 4},
        selector: 'node, edge', 
        onClickFunction: function (event) {
          var target = event.target || event.cyTarget;
          // console.log(event);
          let removedID = event.target._private.data.id;
          var removed = target.remove();
          const afterRemovedData = data.nodes.filter((node)=> {if(node.id === removedID){return false;}else{return true;}})
          // console.log("nodes ",cy.nodes());
          // console.log("edges ",cy.edges());
          const newNodes = cy.nodes().map((node)=> { 
            return {
              data:node._private.data
         }; });
          const newEdges = cy.edges().map((edge)=> {
            return {
              data:edge._private.data
         };
          });
          temp(newNodes,newEdges);
  
        }
      },
      {
        id: 'add-node',
        content: 'add node',
        tooltipText: 'add node',
        image: {src : "add.svg", width : 12, height : 12, x : 6, y : 4},
        selector: 'node',
        coreAsWell: true,
        onClickFunction: function (event) {
          let name = prompt("Enter Node name");
          console.log("name ",name);
          var pos = event.position || event.cyPosition;
          var data = {
            id:name,
            name:name,
            group: 'nodes'
          };
          cy.add({
            data: data,
            position: {
              x: pos.x,
              y: pos.y
            }
          });
          const newNodes = cy.nodes().map((node)=> { 
            return {
              data:node._private.data
         }; });
          const newEdges = cy.edges().map((edge)=> {
            return {
              data:edge._private.data
         }});
          temp(newNodes,newEdges);

 
  
          
        }
      }
    ],
    // css classes that menu items will have
    menuItemClasses: [
      // add class names to this list
    ],
    // css classes that context menu will have
    contextMenuClasses: [
      // add class names to this list
    ],
    // Indicates that the menu item has a submenu. If not provided default one will be used
    submenuIndicator: { src: 'assets/submenu-indicator-default.svg', width: 12, height: 12 }
  };
  const updateNetwork = (data) => {
    cyRef.current.json({ elements: { nodes: data.nodes, edges: data.edges } });
    cyRef.current
      .layout({ ...(LAYOUT_OPTIONS[layout] ?? LAYOUT_OPTIONS.FCOSE) })
      .run();
  };

  useEffect(() => {
    createNetwork();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    updateNetwork(data);
    console.log("new data : ",data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, layout]);

  return (
    <div
      className="graphContainer"
      style={{
        height: "90vh",
        width: "90%",
        border: "0.01px solid #ccc",
        marginLeft: "5%",
        backgroundColor: "#fff",
      }}
      ref={networkRef}
    ></div>
  );
};

export const enableDrawMode = () => {
  eh.enableDrawMode();
  console.log(eh);
  console.log("Enabled drawing mode");
}

export const disableDrawMode = () => {
  eh.disableDrawMode();
  console.log(eh);
  console.log("Disabling drawing mode");
}