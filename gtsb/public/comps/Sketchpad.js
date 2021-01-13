// eslint-disable-next-line no-unused-expressions
'use strict';

// eslint-disable-next-line no-undef
const e = React.createElement;

//basically the state the user's in, allowing for multiple actions
let commandMode = 'Draw Vertex';
//one time actions
let actionCommand;
let updateCall = false;
let updateCallers = [false, false, false];

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

    this.mousePrevPos = [0, 0];

    //fundamental constants
    this.selectionBorderRadius = 4;
    this.vertexDiameter = 25;
    this.edgeWidth = 5;
    this.edgeSpacing = 18;
    this.loopSpacing = 12;
    this.loopDiameter = 50;
    this.arrowSize = 16;
    this.grabberPadding = 10;
    //ID Counts
    this.vertexIDCount = 0;
    this.edgeIDCount = 0;
    //switches
    this.canDrawVertex = true;

    this.defaultVertexColor = '#007CC7';
    this.defaultEdgeColor = 'black';

    window.addEventListener('resize', this.resizeWindow);

    //33 ms = ~30fps
    setInterval(this.update, 33);
  }

  render() {
    //this needs to be here I guess, componentDidMount wasn't working
    this.findPadAndRect();
    return e(
        'div',
        {
          id: 'sketchpad',
          onClick: this.drawVertex,
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
    //perform command, grabbing can take place outside of group updates
    //move Vertex
    if (commandMode === 'Grabber' && this.movingVertex) {
      const dX = mouseMoveCTX.clientX - this.mousePrevPos[0];
      const dY = mouseMoveCTX.clientY - this.mousePrevPos[1];

      //make sure not to move it outside the pad space
      const inBounds = this.inBounds(this.movingVertex.x + dX, this.movingVertex.y + dY);
      if (inBounds[0])
        this.movingVertex.x += dX;
      if (inBounds[1])
        this.movingVertex.y += dY;

      //take care of parallel edges
      for (let i = 0; i < this.movingVertex.edges.length; i++) {
        const edge = this.movingVertex.edges[i];
        this.applyParallelEdges(edge.vertex1, edge.vertex2);
      }

      this.mousePrevPos = [mouseMoveCTX.clientX, mouseMoveCTX.clientY];
      this.setState(this.state);
    }

    if (updateCall && !updateCallers[1]) {
      //perform action
      if (actionCommand) {
        switch (actionCommand) {
          case 'Save Graph':
            this.saveGraph();
            break;
          case 'Delete':
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
            break;
          case 'Clear Pad':
            //delete all
            selectedVertices = graphVertices;
            selectedEdges = graphEdges;

            this.deleteEdges();
            this.deleteVertices();

            //set mode to draw Vertex after clear
            commandMode = 'Draw Vertex';
            break;
          case 'Display Vertex Data':
            switch (displayVertexData) {
              case 'Data':
                displayVertexData = 'ID';
                break;
              case 'ID':
                displayVertexData = 'Deg';
                break;
              case 'Deg':
                displayVertexData = 'ID/Deg';
                break;
              case 'ID/Deg':
                displayVertexData = 'Data';
                break;
              default:
                break;
            }
            for (let i = 0; i < graphVertices.length; i++) {
              graphVertices[i].displayVertexData = this.displayVertexData;
            }
            break;
          case 'Reset IDs':
            this.vertexIDCount = graphVertices.length;
            this.edgeIDCount = graphEdges.length;
            for (let i = 0; i < graphVertices.length; i++) {
              graphVertices[i].id = i;
              graphVertices[i].customID = null;
            }
            for (let i = 0; i < graphEdges.length; i++) {
              graphEdges[i].id = i;
            }
            break;
          case 'Bridge ID':
            bridgeID = !bridgeID;
            if (bridgeID) {
              this.locateBridges();
            } else {
              //toggle all bridges off
              for (let i = 0; i < graphEdges.length; i++) {
                graphEdges[i].isBridge = false;
              }
            }
            break;
          case 'InOut Degree':
            usingInDegree = !usingInDegree;
            break;
          case 'Deselect':
            selectedVertices = this.deselectElements(selectedVertices);
            selectedEdges = this.deselectElements(selectedEdges);
            break;
          default:
            break;
        }

        actionCommand = null;
      }

      //coloring?
      if (commandMode === 'Selector' && selectedColor && (selectedVertices.length > 0 || selectedEdges.length > 0)) {
        for (let i = 0; i < selectedVertices.length; i++) {
          selectedVertices[i].color = selectedColor.color;
        }
        for (let i = 0; i < selectedEdges.length; i++) {
          selectedEdges[i].color = selectedColor.color;
        }
      }

      //update arrow color?
      if (this.arrowColor !== arrowColor) {
        this.arrowColor = arrowColor;
      }

      //selector to draw edges/arcs?
      if (selectedVertices.length > 1) {
        if (commandMode === 'Draw Edge') {
          //make a complete graph
          let seenPairs = [];
          for (let i = 0; i < selectedVertices.length; i++) {
            for (let j = 0; j < selectedVertices.length; j++) {
              //no loops
              if (i === j)
                continue;

              const ij = i.toString() + ' ' + j.toString();
              const ji = j.toString() + ' ' + i.toString();
              //have I already seen this pair?
              if (seenPairs.find((pair) => pair === ij || pair === ji))
                continue;

              //make a connection between [i] and [j]
              this.drawEdge(selectedVertices[i], selectedVertices[j]);

              //add the pair to the list
              seenPairs.push(ij);
            }
          }
        } else
          if (commandMode === 'Draw Arc') {
            //make a path
          }
      }
      if (commandMode === 'Draw Edge' || commandMode === 'Draw Arc') {
        selectedVertices = this.deselectElements(selectedVertices);
      }

      updateCallers[1] = true;
      this.setState(this.state);
    } else
        //if the call hasn't been completed yet, check on the others
      if (updateCall) {
        let callComplete = true;
        for (let i = 0; i < updateCallers.length; i++) {
          if (!updateCallers[i]) {
            callComplete = false;
            break;
          }
        }
        //if the call is complete, reset
        if (callComplete) {
          updateCall = false;
          for (let i = 0; i < updateCallers.length; i++) {
            updateCallers[i] = false;
          }
        }
      }
  }

  saveGraph = () => {
    //render to canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d');
    canvas.width = this.padRect.width;
    canvas.height = this.padRect.height;
    const padOrigin = [this.padRect.left, this.padRect.top];

    ctx.lineWidth=this.edgeWidth;
    //render edges
    for (let i = 0; i < graphEdges.length; i++) {
      if(graphEdges[i].isLoop){
        this.canvasLoop(graphEdges[i], ctx, padOrigin);
      }
      else{
        this.canvasEdge(graphEdges[i], ctx, padOrigin);
        if(graphEdges[i].isArc){
          this.canvasEdgArrow(graphEdges[i], ctx, padOrigin);
        }
      }
    }

    ctx.lineWidth=1;
    //Render Vertices
    for(let i=0;i<graphVertices.length;i++) {
      this.canvasVertex(graphVertices[i], ctx, padOrigin);
    }

    canvas.toBlob((blob) => {
      const timeStamp = Date.now().toString();
      const a = document.createElement('a');
      document.body.append(a);
      a.download = 'sketch_' + timeStamp + '.png';
      a.href = URL.createObjectURL(blob);
      a.click();
      a.remove();
    });
  }

  canvasVertex(vertex, ctx, padOrigin){
    const x = vertex.x - padOrigin[0];
    const y = vertex.y - padOrigin[1];
    ctx.strokeStyle = vertex.color;
    ctx.fillStyle = vertex.color;
    ctx.beginPath();
    ctx.arc(x, y, this.vertexDiameter / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  }

  canvasEdge(edge, ctx, padOrigin) {
    const x1 = edge.vertex1.x - padOrigin[0];
    const y1 = edge.vertex1.y - padOrigin[1];
    const x2 = edge.vertex2.x - padOrigin[0];
    const y2 = edge.vertex2.y - padOrigin[1];
    ctx.strokeStyle = edge.color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  canvasLoop(loop, ctx, padOrigin) {
    //just like a vertex without the filling
    const r = loop.loopDiameter / 2;
    const offset = r * Math.sqrt(2) / 2;
    const x = loop.vertex1.x - padOrigin[0] + offset;
    const y = loop.vertex1.y - padOrigin[1] + offset;
    ctx.strokeStyle = loop.color;
    ctx.beginPath();
    ctx.arc(x, y, loop.loopDiameter / 2, 0, 2 * Math.PI);
    ctx.stroke();
  }

  canvasEdgArrow(arc, ctx, padOrigin) {
    const vertex1 = arc.targetVertex;
    const vertex2 = arc.vertex1.id === vertex1.id ? arc.vertex2 : arc.vertex1;
    const x1 = vertex1.x - padOrigin[0];
    const x2 = vertex2.x - padOrigin[0];
    const y1 = vertex1.y - padOrigin[1];
    const y2 = vertex2.y - padOrigin[1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    //find unit vector length h * sqrt(2) away from target vector
    const hVector = [dx / Math.sqrt(dx * dx + dy * dy), dy / Math.sqrt(dx * dx + dy * dy)];
    //stick it at midpoint
    const xm = (x1 + x2) / 2;
    const ym = (y1 + y2) / 2;
    hVector[0] += xm;
    hVector[1] += ym;
    //rotate it +-45 degrees
    const point1 = this.rotateVector(hVector, Math.PI / 4);
    const point2 = this.rotateVector(hVector, -Math.PI / 4);
    //draw the triangle
    ctx.strokeStyle = arrowColor;
    ctx.fillStyle = arrowColor;
    ctx.beginPath();
    ctx.moveTo(xm, ym);
    ctx.lineTo(point1[0], point1[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.fill();
  }

  rotateVector(vector, theta) {
    const r1 = [Math.cos(theta), -Math.sin(theta)];
    const r2 = [Math.sin(theta), Math.cos(theta)];
    const x = r1[0] * vector[0] + r1[1] * vector[1];
    const y = r2[0] * vector[0] + r2[1] * vector[1];
    return [x, y];
  }

  //------------Element Renderers---------------------//
  VertexRenderer = (vertex) => {
    const x = vertex.isSelected ? vertex.x - this.vertexDiameter / 2 - this.selectionBorderRadius : vertex.x - this.vertexDiameter / 2;
    const y = vertex.isSelected ? vertex.y - this.vertexDiameter / 2 - this.selectionBorderRadius : vertex.y - this.vertexDiameter / 2;
    const style = {
      position: 'absolute',
      top: y,
      left: x,
      background: vertex.isHovering || (this.movingVertex && this.movingVertex.id === vertex.id) ? 'pink' : vertex.color,
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
          className: 'vertex',
          onMouseEnter: this.mouseEnterElement.bind(this, true, vertex),
          onMouseLeave: this.mouseExitElement.bind(this, true, vertex),
          onMouseDown: this.assignVertex.bind(this, vertex),
          onMouseUp: this.assignVertex.bind(this, null)
        },
        [
            this.VertexIDRenderer(vertex, id),
            this.VertexDegRenderer(vertex, id)
        ]
    );
  }

  VertexIDRenderer = (vertex, id) => {
    if (displayVertexData === 'ID' || displayVertexData === 'ID/Deg') {
      const style = displayVertexData === 'ID' ? {
        top: '-1.4em'
      } : {
        top: '-.8em'
      }
      return e(
          'div',
          {
            className: 'vertex_id',
            key: 'idDisplay' + id,
            style: style
          },
          vertex.customID ? vertex.customID.toString() : vertex.id.toString()
      );
    }
  }

  VertexDegRenderer = (vertex, id) => {
    if (displayVertexData === 'Deg' || displayVertexData === 'ID/Deg') {
      const style = displayVertexData === 'Deg' ? {
        top: '-1.4em'
      } : {
        top: '1em'
      }
      return e(
          'div',
          {
            className: 'vertex_deg',
            key: 'degDisplay' + id,
            style: style
          },
          usingInDegree ? vertex.inDegree.toString() : vertex.outDegree.toString()
      );
    }
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
      background: edge.isHovering ? 'pink' : edge.color,
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
      border: (loop.isSelected || loop.isHovering) ? this.edgeWidth + 'px solid pink' : this.edgeWidth + 'px solid ' + loop.color,
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
      left: arc.isLoop ? arc.loopDiameter - this.arrowSize / 2 - this.edgeWidth : -(this.arrowSize/2) - this.edgeWidth,
      width: 0,
      height: 0,
      borderLeft: this.arrowSize + 'px solid transparent',
      borderRight: this.arrowSize + 'px solid transparent',
      // eslint-disable-next-line no-undef
      borderBottom: arc.isHovering ? this.arrowSize + 'px solid pink' : this.arrowSize + 'px solid' + arrowColor
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
  drawVertex = (ev) => {
    this.findPadAndRect();
    const inBounds = this.inBounds(ev.clientX, ev.clientY);
    if (!this.canDrawVertex || commandMode !== 'Draw Vertex' || !inBounds[0] || !inBounds[1])
      return;
    const vertex = {
      id: this.vertexIDCount++,
      x: ev.clientX,
      y: ev.clientY,
      xRatio: ev.clientX / this.padRect.width,
      yRatio: ev.clientY / this.padRect.height,
      edges: [],
      displayVertexData: this.displayVertexData,
      color: selectedColor ? selectedColor.color : this.defaultVertexColor,
      inDegree: 0,
      outDegree: 0
    }

    graphVertices.push(vertex);

    updateCall = true;

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

  setCustomID = (ev) => {
    const vertex = graphVertices.find((v) => v.id === parseInt(ev.target.parentElement.id.substring(1)));
    vertex.customID = ev.target.value;
  }

  inBounds(x, y) {
    const radius = this.vertexDiameter / 2 + this.grabberPadding;
    const lateralCheck = x - radius > this.padRect.left && x + radius < this.padRect.right;
    const verticalCheck = y - radius > this.padRect.top && y + radius < this.padRect.bottom;
    return [lateralCheck, verticalCheck];
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
      isLoop: vertex1.id === vertex2.id,
      color: selectedColor ? selectedColor.color : this.defaultEdgeColor
    }
    vertex1.edges.push(edge);
    graphEdges.push(edge);

    if (!edge.isLoop) {
      vertex2.edges.push(edge);
    }
    if (bridgeID) {
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

  pathFinderHelper(currentVertex, path, paths, finish) {
    path.push(currentVertex);
    if (currentVertex.id === finish.id) {
      paths.push(path);
      return;
    }
    for (let i = 0; i < currentVertex.edges.length; i++) {
      let searchVertex;
      if (!path.find(v => v.id === currentVertex.edges[i].vertex1.id)) {
        //continue search on vertex1
        searchVertex = currentVertex.edges[i].vertex1;
      } else
        if (!path.find(v => v.id === currentVertex.edges[i].vertex2.id)) {
          //continue search on vertex2
          searchVertex = currentVertex.edges[i].vertex2;
        }

      if (searchVertex && ((currentVertex.edges[i].isArc && currentVertex.edges[i].targetVertex.id === searchVertex.id)
          || !currentVertex.edges[i].isArc))
        this.pathFinderHelper(searchVertex, path, paths, finish);
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
            selectedVertices[0].inDegree++;
            selectedVertices[0].outDegree++;
            selectedVertices[1].inDegree++;
            selectedVertices[1].outDegree++;
          } else
            if (commandMode === 'Draw Arc') {
              const arc = this.drawEdge(selectedVertices[1], selectedVertices[0]);
              arc.isArc = true;
              arc.targetVertex = selectedVertices[1];
              selectedVertices[1].inDegree++;
              selectedVertices[0].outDegree++;
            } else {
              console.log("Whoopsie. Selecting an element in: ", commandMode);
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
    updateCall = true;
  }

  deselectElements = (selectedList) => {
    for (let i = 0; i < selectedList.length; i++) {
      selectedList[i].isSelected = false;
    }
    updateCall = true;
    return [];
  }

  deselectElement = (selectedList, element) => {
    element.isSelected = false;
    selectedList = selectedList.filter((emt) => emt.id !== element.id);
    updateCall = true;
    return selectedList;
  }

  //-----------------Deletion----------------------------//
  deleteVertices = () => {
    for (let i = 0; i < selectedVertices.length; i++) {
     graphVertices = graphVertices.filter((vertex) => vertex.id !== selectedVertices[i].id);
    }
    selectedVertices = [];
  }

  deleteEdges = () => {
    for (let i = 0; i < selectedEdges.length; i++) {
      graphEdges = graphEdges.filter((edge) => edge.id !== selectedEdges[i].id);
      const edge = selectedEdges[i];
      const v1 = edge.vertex1;
      const v2 = edge.vertex2;
      v1.edges = v1.edges.filter((e) => e.id !== edge.id);
      v2.edges = v2.edges.filter((e) => e.id !== edge.id);
      if (edge.isArc) {
        if (v1.id === edge.targetVertex.id) {
          v1.inDegree--;
          v2.outDegree--;
        } else {
          v1.outDegree--;
          v2.inDegree--;
        }
      } else {
        v1.inDegree--;
        v1.outDegree--;
        v2.inDegree--;
        v2.outDegree--;
      }
    }
    selectedEdges = [];
    if (bridgeID)
      this.locateBridges();

    //loop through remaining edges and reset parallel edges
    let visitedVertexPairs = [];
    for (let i = 0; i < graphEdges.length; i++) {
      const v1 = graphEdges[i].vertex1;
      const v2 = graphEdges[i].vertex2;
      //don't care if I've already been there
      if (visitedVertexPairs.find((pair) => pair === [v1.id, v2.id] || pair === [v2.id, v1.id]))
        continue;
      this.applyParallelEdges(v1, v2);
    }
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

  //---------------------Keyboard Input------------------------//
  keyPress = (ev) =>{
    console.log('here');
  }

  //---------------------Window Management---------------------//
  resizeWindow = () => {
    //loop through vertices, recalculate their x, y based on aspects, reposition all edges
    this.findPadAndRect();
    for (let i = 0; i < graphVertices.length; i++) {
      graphVertices[i].x = graphVertices[i].xRatio * this.padRect.width;
      graphVertices[i].y = graphVertices[i].yRatio * this.padRect.height;
    }

    for (let i = 0; i < graphEdges.length; i++) {
      this.positionEdge(graphEdges[i]);
    }
    this.setState(this.state);
  }

  findPadAndRect() {
    if (!this.sketchPad) {
      this.sketchPad = document.getElementById('sketchpad');
    }
    if (this.sketchPad) {
      this.padRect = this.sketchPad.getBoundingClientRect();
      //fix the sketchpad containers height
      document.getElementById('sketchpad_container').style.height = this.padRect.height.toString() + 'px';
    }
  }
}

const domContainerSketchpad = document.querySelector('#sketchpad_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(Sketchpad), domContainerSketchpad);
