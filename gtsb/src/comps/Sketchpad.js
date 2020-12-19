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

          // //map each edge to its dom equivalent
          // this.edges.map((edge) => {
          //       return e(EdgeRenderer, { edge: edge, key: 'e' + edge.id.toString() });
          //     }
          // )
        ]
    );
  }

  //vertex element
  VertexRenderer = (vertex) => {
    const vertexDiameter = 25;
    const x = vertex.isSelected ? vertex.x - vertexDiameter / 2 - this.selectionBorderRadius : vertex.x - vertexDiameter / 2;
    const y = vertex.isSelected ? vertex.y - vertexDiameter / 2 - this.selectionBorderRadius : vertex.y - vertexDiameter / 2;
    const style = {
      position: 'absolute',
      top: y,
      left: x,
      background: vertex.isHovering ? 'pink' : 'blue',
      borderRadius: '50%',
      border: vertex.isSelected ? this.selectionBorderRadius + 'px solid pink' : null,
      width: vertexDiameter + 'px',
      height: vertexDiameter + 'px'
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
  EdgeRenderer = (props) =>{
    return null;
  }

  drawVertex = (e) => {
    if (!this.canDrawVertex || commandMode !== 'drawVertex')
      return;
    const vertex = {
      id: this.vertexIDCount++,
      x: e.clientX,
      y: e.clientY
    }
    this.vertices.push(vertex);
    this.setState(this.state);
  }

  selectElement=(isVertex, element)=> {
    if (isVertex) {
      if (!this.selectedVertices.find((vertex) => vertex.id === element.id)) {
        this.selectedVertices.push(element);
        element.isSelected = true;
      }
    }
    this.setState(this.state);
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