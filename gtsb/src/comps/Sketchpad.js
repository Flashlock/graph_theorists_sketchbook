// eslint-disable-next-line no-unused-expressions
'use strict';

// eslint-disable-next-line no-undef
const e = React.createElement;

let commandMode = 'Draw Vertex';
// eslint-disable-next-line no-unused-vars
const nonCommands = ['Clear Pad', 'Delete', 'Display Vertex Data', 'Reset IDs', 'Bridge ID'];
let prevCommandMode = commandMode;
let mouseMoveCTX;
document.getElementById('pad_wrapper').addEventListener('mousemove', (event)=> {
  mouseMoveCTX = event;
});

let graphVertices = [];
let graphEdges = [];
let selectedVertices = [];
let selectedEdges = [];

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
    this.edgeSpacing = 18;
    this.loopSpacing = 12;
    this.loopDiameter = 50;
    this.arrowSize = 10;
    //ID Counts
    this.vertexIDCount = 0;
    this.edgeIDCount = 0;
    //switches
    this.canDrawVertex = true;
    this.displayVertexData = false;
    this.bridgeID=false;

    //33 ms = ~30fps
    setInterval(this.update, 33);
  }

  componentDidMount() {
    this.sketchpad = document.getElementById('sketchpad');
    const rect = this.sketchpad.getBoundingClientRect();
    this.origin = [rect.left, rect.top];
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
          graphVertices.map((vertex) => {
            return this.VertexRenderer(vertex);
              }
          ),

          //map each edge to its dom equivalent
          graphEdges.map((edge) => {
                return this.EdgeRenderer(edge);
              }
          )
        ]
    );
  }

  update = () => {
    //move Vertex
    if (commandMode === 'Grabber' && this.movingVertex) {
      const dX = mouseMoveCTX.clientX - this.mousePrevPos[0];
      const dY = mouseMoveCTX.clientY - this.mousePrevPos[1];

      this.movingVertex.x += dX;
      this.movingVertex.y += dY;

      //take care of parallel edges
      for (let i = 0; i < this.movingVertex.edges.length; i++) {
        const edge = this.movingVertex.edges[i];
        this.applyParallelEdges(edge.vertex1, edge.vertex2);
      }

      this.mousePrevPos = [mouseMoveCTX.clientX, mouseMoveCTX.clientY];
      this.setState(this.state);
    }

    //was delete pressed?
    if (commandMode === 'Delete') {
      //select all edges attached to vertices
      for (let i = 0; i < selectedVertices.length; i++) {
        const v = selectedVertices[i];
        for (let j = 0; j < v.edges.length; j++) {
          selectedEdges.push(v.edges[j]);
        }
      }

      //delete all selected vertices and edges
      this.deleteVertices();
      this.deleteEdges();

      //set mode to previous after deletion
      commandMode = prevCommandMode;
    }

    //was clear pad pressed?
    if (commandMode === 'Clear Pad') {
      //delete all
      selectedVertices = graphVertices;
      selectedEdges = graphEdges;

      this.deleteEdges();
      this.deleteVertices();

      //set mode to draw Vertex after clear
      commandMode = 'Draw Vertex';
    }

    //vertex data display?
    if (commandMode === 'Display Vertex Data') {
      this.displayVertexData = !this.displayVertexData;
      for (let i = 0; i < graphVertices.length; i++) {
        graphVertices[i].displayVertexData = this.displayVertexData;
      }
      commandMode = prevCommandMode;
      this.setState(this.state);
    }

    //rest ids?
    if (commandMode === 'Reset IDs') {
      commandMode = prevCommandMode;
      this.vertexIDCount = graphVertices.length;
      this.edgeIDCount = graphEdges.length;
      for (let i = 0; i < graphVertices.length; i++) {
        graphVertices[i].id = i;
      }
      for (let i = 0; i < graphEdges.length; i++) {
        graphEdges[i].id = i;
      }
      this.setState(this.state);
    }

    //locate bridges?
    if (commandMode === 'Bridge ID') {
      commandMode = prevCommandMode;
      this.bridgeID = !this.bridgeID;
      if (this.bridgeID) {
        this.locateBridges();
      } else {
        //toggle all bridges off
        for (let i = 0; i < graphEdges.length; i++) {
          graphEdges[i].isBridge = false;
        }
      }
      this.setState(this.state);
    }
  }

  //------------Element Renderers---------------------//
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

    if (vertex.displayVertexData) {
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
          },
          [
            e(
                'input',
                {
                  className: 'vertex_id',
                  key: 'idDisplay' + id,
                  type: 'text',
                  placeholder: vertex.id.toString()
                }
            ),
            e(
                'div',
                {
                  className: 'vertex_deg',
                  key: 'degDisplay' + id
                },
                vertex.edges.length.toString()
            )
          ]
      );
    }
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

  EdgeRenderer = (edge) => {
    if (edge.isLoop) {
      return this.LoopRenderer(edge);
    }

    this.positionEdge(edge);
    let border = null;
    if (edge.isSelected) {
      border = this.selectionBorderRadius + 'px solid pink';
    } else
      if (edge.isBridge) {
        border = this.selectionBorderRadius + 'px solid red';
      }
    const style = {
      position: 'absolute',
      top: edge.isSelected || edge.isBridge ? edge.y - this.selectionBorderRadius : edge.y,
      left: edge.isSelected || edge.isBridge ? edge.x - this.selectionBorderRadius : edge.x,
      background: edge.isHovering ? 'pink' : 'black',
      border: border,
      width: this.edgeWidth,
      height: edge.height,
      transform: 'rotate(' + edge.theta.toString() + 'rad)',
    }
    const id = 'e' + edge.id.toString();
    if (edge.isArc) {
      return this.ArcRenderer(edge, id, style);
    }

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
    );
  }

  LoopRenderer = (loop) => {
    const r = loop.loopDiameter / 2;
    const offset = -(r - r * Math.sqrt(2) / 2 + this.edgeWidth/2);
    const style = {
      position: 'absolute',
      top: loop.vertex1.y + offset,
      left: loop.vertex1.x + offset,
      borderRadius: '50%',
      border: (loop.isSelected || loop.isHovering) ? this.edgeWidth + 'px solid pink' : this.edgeWidth + 'px solid black',
      height: loop.loopDiameter,
      width: loop.loopDiameter,
      zIndex: loop.zIndex
    }
    const id = 'e' + loop.id.toString();
    if(loop.isArc){
      return this.ArcRenderer(loop, id, style);
    }

    return e(
        'div',
        {
          style: style,
          id: id,
          key: id,
          onClick: this.selectElement.bind(this, false, loop),
          onMouseEnter: this.mouseEnterElement.bind(this, false, loop),
          onMouseLeave: this.mouseExitElement.bind(this, false, loop)
        }
    );
  }

  ArcRenderer = (arc, id, style) => {
    if (!arc.isLoop && arc.vertex1.id !== arc.targetVertex.id) {
      //switcharoo
      const temp = arc.vertex1;
      arc.vertex1 = arc.vertex2;
      arc.vertex2 = temp;
      this.positionEdge(arc);
    }

    const arrowStyle = {
      position: 'relative',
      top: arc.isLoop ? arc.loopDiameter / 2 - this.arrowSize / 2 : arc.height / 2,
      left: arc.isLoop ? arc.loopDiameter - this.arrowSize / 2 - this.edgeWidth/2 : -(this.arrowSize + this.edgeWidth) / 2,
      border: arc.isSelected ? this.selectionBorderRadius + 'px solid pink' : null,
      width: 0,
      height: 0,
      borderLeft: this.arrowSize + 'px solid transparent',
      borderRight: this.arrowSize + 'px solid transparent',
      borderBottom: arc.isHovering ? this.arrowSize + 'px solid pink' : this.arrowSize + 'px solid blue'
    }
    return e(
        'div',
        {
          style: style,
          id: id,
          key: id,
          onClick: this.selectElement.bind(this, false, arc),
          onMouseEnter: this.mouseEnterElement.bind(this, false, arc),
          onMouseLeave: this.mouseExitElement.bind(this, false, arc)
        },
        [
          e(
              'div',
              {
                style: arrowStyle,
                className: 'arrow',
                key: 'a' + id,
                onClick: this.selectElement.bind(this, false, arc),
                onMouseEnter: this.mouseEnterElement.bind(this, false, arc),
                onMouseLeave: this.mouseExitElement.bind(this, false, arc)
              }
          )
        ]
    );
  }

  //----------------Vertex Manipulation-------------------//
  drawVertex = (e) => {
    if (!this.canDrawVertex || commandMode !== 'Draw Vertex')
      return;
    const vertex = {
      id: this.vertexIDCount++,
      x: e.clientX,
      y: e.clientY - this.origin[1]+this.vertexDiameter/2,
      edges: [],
      displayVertexData: this.displayVertexData
    }
    graphVertices.push(vertex);
    this.setState(this.state);
    return vertex;
  }

  //when a vertex is clicked, it's assigned as the moving vertex.
  //vertex selection and deselection are routed through here first
  assignVertex = (vertex) => {
    //start with the mode
    switch(commandMode){
      case 'Grabber':
        if(vertex) {
          if (!vertex.isSelected)
            this.selectElement(true, vertex);
        }
        else{
          selectedVertices=this.deselectElement(selectedVertices, this.movingVertex);
        }
        break;
      case 'Selector':
        if(vertex) {
          if (vertex.isSelected)
            selectedVertices = this.deselectElement(selectedVertices, vertex);
          else
            this.selectElement(true, vertex);
        }
        break;
      case 'Draw Edge':
      case 'Draw Arc':
        if(vertex)
          this.selectElement(true, vertex);
        break;
      default:
        break;
    }
    this.mousePrevPos = [mouseMoveCTX.clientX, mouseMoveCTX.clientY];
    this.movingVertex = vertex;
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

  drawEdge = (vertex1, vertex2) => {
    const edge = {
      id: this.edgeIDCount++,
      vertex1: vertex1,
      vertex2: vertex2,
      offsetX: 0,
      offsetY: 0,
      isLoop: vertex1.id === vertex2.id
    }
    vertex1.edges.push(edge);
    graphEdges.push(edge);

    if (!edge.isLoop) {
      vertex2.edges.push(edge);
    }
    if (this.bridgeID) {
      //if I'm looking for bridges, did I just draw one?
      this.locateBridges();
    }
    this.applyParallelEdges(vertex1, vertex2);
    return edge;
  }

  applyParallelEdges = (vertex1, vertex2) => {
    //find parallel edges between these two vertices and calculate offsets
    const parallelEdges = vertex1.edges.filter((edge) => {
      if ((vertex1.id === edge.vertex1.id && vertex2.id === edge.vertex2.id)
          || (vertex1.id === edge.vertex2.id && vertex2.id === edge.vertex1.id))
        return edge;
    });

    this.edgeOffsetCalculator(parallelEdges, vertex1, vertex2);
  }

  edgeOffsetCalculator = (parallelEdges, vertex1, vertex2) =>{
    //loop check
    if (vertex1.id === vertex2.id) {
      let loopDiameter = this.loopDiameter;
      for (let i = 0; i < parallelEdges.length; i++) {
        parallelEdges[i].loopDiameter = loopDiameter;
        loopDiameter += this.edgeWidth + this.loopSpacing;
        parallelEdges[i].zIndex = 9998 - i;
      }
    } else {
      let slope = (vertex2.y - vertex1.y) / (vertex2.x - vertex1.x);
      slope = -1 / slope;
      //check parity
      const isOdd = parallelEdges.length % 2 === 1;
      let distance = isOdd ? 0 : this.edgeSpacing / 2;
      for (let i = 0; i < parallelEdges.length; i++) {
        //calculate the offsets
        const x = (distance / Math.sqrt(1 + (slope * slope)));
        const y = slope * x;
        
        //apply the offsets
        parallelEdges[i].offsetX = x;
        parallelEdges[i].offsetY = y;

        //increment the magnitude of distance?
        if ((isOdd && i % 2 === 0) || (!isOdd && i % 2 === 1)) {
          //increment odd sets on even i's and even sets on odd i's
          let val = Math.abs(distance) + this.edgeSpacing;
          distance = distance < 0 ? -val : val;
        }

        distance *= -1;
      }
    }
  }

  locateBridges() {
    for (let i = 0; i < graphEdges.length; i++) {
      graphEdges[i].isBridge = this.isBridge(graphEdges[i]);
    }
  }

  isBridge = (edge) => {
    if (edge.isLoop) return false;
    //remove the edge
    const edgeIndex = graphEdges.findIndex((e) => e.id === edge.id);
    graphEdges = graphEdges.filter((e) => e.id !== edge.id);
    edge.vertex1.edges = edge.vertex1.edges.filter((e) => e.id !== edge.id);
    edge.vertex2.edges = edge.vertex2.edges.filter((e) => e.id !== edge.id);
    //find the path
    const path = this.pathFinder(edge.vertex1, edge.vertex2);
    //put the edge back
    graphEdges.splice(edgeIndex, 0, edge);
    edge.vertex1.edges.push(edge);
    edge.vertex2.edges.push(edge);
    return path.length === 0;
  }

  pathFinder(start, finish) {
    //returns the shortest list of vertices connecting start to finish
    let paths = [];
    this.pathFinderHelper(start, [], paths, finish);

    //return the shortest path in paths
    if (paths.length === 0) return paths;
    let shortestPath = paths[0];
    for (let i = 0; i < paths.length; i++) {
      if (paths[i].length < shortestPath.length) {
        shortestPath = paths[i];
      }
    }
    return shortestPath;
  }

  pathFinderHelper(currentVertex, path, paths, finish){
    path.push(currentVertex);
    if(currentVertex.id===finish.id){
      paths.push(path);
      return;
    }
    for(let i=0;i<currentVertex.edges.length;i++){
      if(!path.find(v=>v.id===currentVertex.edges[i].vertex1.id)){
        //continue search on vertex1
        this.pathFinderHelper(currentVertex.edges[i].vertex1, path, paths, finish);
      }
      else if(!path.find(v=>v.id===currentVertex.edges[i].vertex2.id)){
        //continue search on vertex2
        this.pathFinderHelper(currentVertex.edges[i].vertex2, path, paths, finish);
      }
      //else do nothing for this edge
    }
  }

  //---------------Selection/DeSelection----------------//
  selectElement = (isVertex, element) => {
    //can't select anything in vertex mode
    if (commandMode === 'Draw Vertex')
      return;

    if (isVertex) {
      //attempt to draw an edge
      if (commandMode !== 'Selector') {
        //select the element
        element.isSelected = true;
        selectedVertices.push(element);

        if (selectedVertices.length === 2) {
          // check command mode => draw edge, arc
          if (commandMode === 'Draw Edge') {
            this.drawEdge(selectedVertices[0], selectedVertices[1]);
          } else
            if (commandMode === 'Draw Arc') {
              const arc = this.drawEdge(selectedVertices[1], selectedVertices[0]);
              arc.isArc = true;
              arc.targetVertex = selectedVertices[1];
            } else {
              console.log("Whoopsie");
            }
          selectedVertices = this.deselectElements(selectedVertices);
        }
      }
      //selection and deselection with selector
      else {
        if (element.isSelected) {
          this.deselectElement(selectedVertices, element);
        } else {
          element.isSelected = true;
          selectedVertices.push(element);
        }
      }
    } else
      if (commandMode === 'Selector') {
        //should I deselect the edge?
        if (element.isSelected) {
          selectedEdges = this.deselectElement(selectedEdges, element);
        } else {
          element.isSelected = true;
          selectedEdges.push(element);
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
    for (let i = 0; i < selectedVertices.length; i++) {
     graphVertices = graphVertices.filter((vertex) => vertex.id !== selectedVertices[i].id);
    }
    selectedVertices = [];
    this.setState(this.state);
  }

  deleteEdges = () => {
    for (let i = 0; i < selectedEdges.length; i++) {
      graphEdges = graphEdges.filter((edge) => edge.id !== selectedEdges[i].id);
      const edge = selectedEdges[i];
      const v1 = edge.vertex1;
      const v2 = edge.vertex2;
      v1.edges = v1.edges.filter((e) => e.id !== edge.id);
      v2.edges = v2.edges.filter((e) => e.id !== edge.id);
    }
    selectedEdges = [];
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
