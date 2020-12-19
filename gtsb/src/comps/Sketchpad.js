// eslint-disable-next-line no-unused-expressions
'use strict';

// eslint-disable-next-line no-undef
const e = React.createElement;

let commandMode = 'drawVertex';
let mouseMoveCTX;
document.getElementById('pad_wrapper').addEventListener('mousemove', (event)=> {
  mouseMoveCTX = event;
});

// eslint-disable-next-line no-undef
class Sketchpad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.mousePrevPos=[0, 0];

    //fundamental constants
    this.selectionBorderRadius = 4;
    this.vertexDiameter = 25;
    this.edgeWidth = 5;
    //element lists
    this.vertices = [];
    this.edges = [];
    this.selectedVertices = [];
    this.selectedEdges = [];
    //ID Counts
    this.vertexIDCount = 0;
    this.edgeIDCount = 0;
    //switches
    this.canDrawVertex = true;

    //33 ms = ~30fps
    setInterval(this.update, 33);
  }

  render() {
    return e(
        'div',
        {
          id: 'sketchpad',
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

  //------------Element Renderers---------------------//
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
          onMouseEnter: this.mouseEnterElement.bind(this, true, vertex),
          onMouseLeave: this.mouseExitElement.bind(this, true, vertex),
          onMouseDown: this.assignVertex.bind(this, vertex),
          onMouseUp: this.assignVertex.bind(this, null)
        }
    );
  }

  //edge element
  EdgeRenderer = (edge) => {
    this.positionEdge(edge);
    const style = {
      position: 'absolute',
      top: edge.isSelected ? edge.y - this.selectionBorderRadius : edge.y,
      left: edge.isSelected ? edge.x - this.selectionBorderRadius : edge.x,
      background: edge.isHovering ? 'pink' : 'black',
      border: edge.isSelected ? this.selectionBorderRadius + 'px solid pink' : null,
      width: this.edgeWidth,
      height: edge.height,
      transform: 'rotate(' + edge.theta.toString() + 'rad)',
    }
    const id = 'e' + edge.id.toString();

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

  //----------------Vertex Manipulation-------------------//
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

  assignVertex = (vertex) => {
    //start with the mode
    switch(commandMode){
      case 'grabber':
        if(vertex) {
          if (!vertex.isSelected)
            this.selectElement(true, vertex);
        }
        else{
          this.selectedVertices=this.deselectElement(this.selectedVertices, this.movingVertex);
        }
        break;
      case 'manipulator':
        if(vertex) {
          if (vertex.isSelected)
            this.selectedVertices = this.deselectElement(this.selectedVertices, vertex);
          else
            this.selectElement(true, vertex);
        }
        break;
      case 'drawEdge':
      case 'drawArc':
        if(vertex)
          this.selectElement(true, vertex);
        break;
      default:
        break;
    }
    this.mousePrevPos = [mouseMoveCTX.clientX, mouseMoveCTX.clientY];
    this.movingVertex = vertex;
  }

  update = () => {
    //move Vertex
    if (commandMode === 'grabber' && this.movingVertex) {
      const dX = mouseMoveCTX.clientX - this.mousePrevPos[0];
      const dY = mouseMoveCTX.clientY - this.mousePrevPos[1];

      this.movingVertex.x += dX;
      this.movingVertex.y += dY;

      this.mousePrevPos = [mouseMoveCTX.clientX, mouseMoveCTX.clientY];
      this.setState(this.state);
    }

    //was delete pressed?
    if (commandMode === 'delete') {
      //select all edges attached to vertices
      for (let i = 0; i < this.selectedVertices.length; i++) {
        const v = this.selectedVertices[i];
        for (let j = 0; j < v.edges.length; j++) {
          this.selectedEdges.push(v.edges[j]);
        }
      }

      //delete all selected vertices and edges
      this.deleteVertices();
      this.deleteEdges();

      //auto set mode to drawVertex after deletion
      commandMode = 'drawVertex';
    }
  }

  //-------------------Edge Manipulation----------------//
  positionEdge = (edge) =>{
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

  drawEdge = (vertex1, vertex2) =>{
    const edge = {
      id: this.edgeIDCount++,
      vertex1: vertex1,
      vertex2: vertex2,
      offsetX: 0,
      offsetY: 0
    }
    vertex1.edges.push(edge);
    vertex2.edges.push(edge);
    this.edges.push(edge);
  }

  //---------------Selection/DeSelection----------------//
  selectElement = (isVertex, element) => {
    if (commandMode === 'drawVertex')
      return;

    if (isVertex) {
      // should I deselect the vertex?
      // this won't work once loops are incorporated. Need a deselect all button perhaps
      if (!element.isSelected) {
        element.isSelected = true;
        this.selectedVertices.push(element);
      }

        //attempt to draw an edge
        if (commandMode !== 'manipulator') {
          if (this.selectedVertices.length === 2) {
            // check command mode => draw edge, arc
            if (commandMode === 'drawEdge')
              this.drawEdge(this.selectedVertices[0], this.selectedVertices[1]);
            this.selectedVertices = this.deselectElements(this.selectedVertices);
          }
        }
    } else
      if (commandMode === 'manipulator') {
        //should I deselect the edge?
        if (element.isSelected) {
          this.selectedEdges = this.deselectElement(this.selectedEdges, element);
        } else {
          element.isSelected = true;
          this.selectedEdges.push(element);
        }
      }
    this.setState(this.state);
  }

  deselectElements = (selectedList) => {
    for (let i = 0; i < selectedList.length; i++) {
      selectedList[i].isSelected = false;
    }
    this.setState(this.state);
    return [];
  }

  deselectElement = (selectedList, element) => {
    element.isSelected = false;
    selectedList = selectedList.filter((emt) => emt.id !== element.id);
    this.setState(this.state);
    return selectedList;
  }

  //-----------------Deletion----------------------------//
  deleteVertices = () => {
    for (let i = 0; i < this.selectedVertices.length; i++) {
      this.vertices = this.vertices.filter((vertex) => vertex.id !== this.selectedVertices[i].id);
    }
    this.selectedVertices = [];
    this.setState(this.state);
  }

  deleteEdges = () => {
    for (let i = 0; i < this.selectedEdges.length; i++) {
      this.edges = this.edges.filter((edge) => edge.id !== this.selectedEdges[i].id);
    }
    this.selectedEdges = [];
    this.setState(this.state);
  }

  //-------------------Element Hovering------------------------//
  mouseEnterElement = (isVertex, element) => {
    this.canDrawVertex = false;
    element.isHovering = true;
    this.setState(this.state);
  }

  mouseExitElement = (isVertex, element) => {
    this.canDrawVertex = true;
    element.isHovering = false;
    this.setState(this.state);
  }
}

const domContainerSketchpad = document.querySelector('#sketchpad_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(Sketchpad), domContainerSketchpad);
