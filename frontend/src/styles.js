const nodeStyles = [
  {
    selector: "node",
    style: {
      content: "data(id)",
      "text-valign": "bottom",
      "text-halign": "center",
      "text-wrap": "wrap",
      "background-color": "data(color)",
      "text-overflow-wrap": "whitespace",
      "font-size": "0.5em",
      "font-family": "Roboto",
    },
  },
  // {
  //   selector: "node:selected",
  //   style:{
  //     "border-color":"red",
  //     "backgroud-color":"#FFFFFF"
  //   }
  // },
  {
    selector: "node[label]",
    style: {
      label: "data(label)",
      "font-size": "0.5em",
      "font-family": "Roboto",
    },
  },
  {
    selector: "edge[label]",
    style: {
      label: "data(label)",
      width: 1,
      "edge-text-rotation": "autorotate",
      "font-size": "0.5em",
      "font-family": "Roboto",
    },
  },
  // *************************** Adding edge styles ***************************
  {
    selector: '.eh-handle',
    style: {
      'background-color': 'red',
      'width': 12,
      'height': 12,
      'shape': 'ellipse',
      'overlay-opacity': 0,
      'border-width': 12, // makes the handle easier to hit
      'border-opacity': 0
    }
  },

  {
    selector: '.eh-hover',
    style: {
      'background-color': 'red'
    }
  },

  {
    selector: '.eh-source',
    style: {
      'border-width': 2,
      'border-color': 'red'
    }
  },

  {
    selector: '.eh-target',
    style: {
      'border-width': 2,
      'border-color': 'red'
    }
  },

  {
    selector: '.eh-preview, .eh-ghost-edge',
    style: {
      'background-color': 'red',
      'line-color': 'red',
      'target-arrow-color': 'red',
      'source-arrow-color': 'red'
    }
  },

  {
    selector: '.eh-ghost-edge.eh-preview-active',
    style: {
      'opacity': 0
    }
  }
];
const edgeStyles = [
  {
    selector: "edge",
    style: {
      "curve-style": "bezier",
      "target-arrow-shape": "triangle",
      "arrow-scale": 0.5,
      width: 1,
      content: "data(label)",
      "line-color": "#E0E0E0",
      "target-arrow-color": "#E0E0E0",
      "font-family": "Roboto",
    },
  },
];

const styles = [...nodeStyles, ...edgeStyles];

export default styles;
