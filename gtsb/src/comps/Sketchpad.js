// eslint-disable-next-line no-unused-expressions
'use strict';

// eslint-disable-next-line no-undef
const e = React.createElement;

let commandMode = 'drawVertex';

// eslint-disable-next-line no-undef
class Sketchpad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.vertices = [];
    this.edges = [];
    this.selectedVertices = [];
    this.vertexIDCount = 0;
    this.edgeIDCount = 0;
    this.canDrawVertex = true;
    this.selectionBorderRadius=4;
    this.vertexDiameter = 25;
    this.edgeWidth=5;
  }

  render() {
    return e(
        'div',
        {
          id: 'Sketchpad',
          onClick: this.drawVertex
        },
        [
          //map each vertex to its dom equivalent
          this.vertices.map((vertex) => {
            return this.VertexRenderer(vertex);
              }
          ),

          //map each edge to its dom equivalent
          this.edges.map((edge) => {
                return this.EdgeRenderer(edge);
              }
          )
        ]
    );
  }

  //vertex element
  VertexRenderer = (vertex) => {
    const x = vertex.isSelected ? vertex.x - this.vertexDiameter / 2 - this.selectionBorderRadius : vertex.x - this.vertexDiameter / 2;
    const y = vertex.isSelected ? vertex.y - this.vertexDiameter / 2 - this.selectionBorderRadius : vertex.y - this.vertexDiameter / 2;
    const style = {
      position: 'absolute',
      top: y,
      left: x,
      background: vertex.isHovering ? 'pink' : 'blue',
      borderRadius: '50%',
      border: vertex.isSelected ? this.selectionBorderRadius + 'px solid pink' : null,
      width: this.vertexDiameter + 'px',
      height: this.vertexDiameter + 'px',
      zIndex: 9999
    }
    const id = 'v' + vertex.id.toString();

    return e(
        'div',
        {
          style: style,
          id: id,
          key: id,
          onClick: this.selectElement.bind(this, true, vertex),
          onMouseEnter: this.mouseEnterElement.bind(this, true, vertex),
          onMouseLeave: this.mouseExitElement.bind(this, true, vertex)
        }
    );
  }

//edge element
  EdgeRenderer = (edge) => {
    this.positionEdge(edge);
    const style={
      position: 'absolute',
      top: edge.y,
      left: edge.x,
      background: edge.isHovering? 'pink': 'black',
      border: edge.isSelected ? this.selectionBorderRadius + 'px solid pink' : null,
      width: this.edgeWidth,
      height: edge.height,
      transform: 'rotate(' + edge.theta.toString() + 'rad)',
    }
    const id='e'+edge.id.toString();

    return e(
        'div',
        {
          style: style,
          id: id,
          key: id,
          onClick: this.selectElement.bind(this, false, edge),
          onMouseEnter: this.mouseEnterElement.bind(this, false, edge),
          onMouseLeave: this.mouseExitElement.bind(this, false, edge)
        }
    )
  }

  drawVertex = (e) => {
    if (!this.canDrawVertex || commandMode !== 'drawVertex')
      return;
    const vertex = {
      id: this.vertexIDCount++,
      x: e.clientX,
      y: e.clientY,
      edges: []
    }
    this.vertices.push(vertex);
    this.setState(this.state);
  }

  selectElement=(isVertex, element)=> {
    if(commandMode==='drawVertex')
      return;
    element.isSelected = true;
    if (isVertex) {
      this.selectedVertices.push(element);
      if (this.selectedVertices.length === 2) {
        // check command mode => draw edge, arc
        switch (commandMode) {
          case 'drawEdge':
            const edge = {
              id: this.edgeIDCount++,
              vertex1: this.selectedVertices[0],
              vertex2: this.selectedVertices[1],
              offsetX: 0,
              offsetY: 0
            }
            this.selectedVertices[0].edges.push(edge);
            this.selectedVertices[1].edges.push(edge);
            this.edges.push(edge);
            break;
          default:
            console.log("Error, Unknown command mode");
            break;
        }
        this.deselectVertices();
      }
    }
    this.setState(this.state);
  }

  deselectVertices=()=> {
    for (let i = 0; i < this.selectedVertices.length; i++) {
      this.selectedVertices[i].isSelected = false;
    }
    this.selectedVertices = [];
  }

  positionEdge=(edge)=>{
    //math time
    let x1 = edge.vertex1.x;
    let x2 = edge.vertex2.x;
    let y1 = edge.vertex1.y;
    let y2 = edge.vertex2.y;

    //first, find the height
    let dx = x1 - x2;
    let dy = y2 - y1;
    let height = Math.sqrt((dx * dx) + (dy * dy));

    //second, find the angle
    let theta = Math.atan2(dx, dy);

    //third, find the position
    let x = ((x1 + x2) / 2) + edge.offsetX;
    let y = ((y1 + y2) / 2) + edge.offsetY;

    edge.height = height;
    edge.y = y - (height / 2);
    edge.x = x - (this.edgeWidth / 2);
    edge.theta = theta;
  }

  mouseEnterElement=(isVertex, element)=> {
    this.canDrawVertex = false;
    element.isHovering = true;
    this.setState(this.state);
  }

  mouseExitElement=(isVertex, element)=> {
    this.canDrawVertex = true;
    element.isHovering = false;
    this.setState(this.state);
  }
}

const domContainer = document.querySelector('#sketchpad_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(Sketchpad), domContainer);