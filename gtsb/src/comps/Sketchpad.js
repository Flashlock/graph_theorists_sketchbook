// eslint-disable-next-line no-unused-expressions
'use strict';

// eslint-disable-next-line no-undef
const e = React.createElement;

//vertex element
function VertexRenderer(vertex) {
  const vertexDiameter=25;
  const style = {
    position: 'absolute',
    top: vertex.y-vertexDiameter/2,
    left: vertex.x-vertexDiameter/2,
    background: 'blue',
    borderRadius: '50%',
    width: vertexDiameter+'px',
    height: vertexDiameter+'px'
  }
  const id = 'v' + vertex.id.toString();
  return e(
      'div',
      {
        style: style,
        id: id,
        key: id
      }
  );
}

//edge element
const EdgeRenderer = (props) =>{
  return null;
}

// eslint-disable-next-line no-undef
class Sketchpad extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
    this.vertices = [];
    this.edges = [];
    this.vertexIDCount = 0;
    this.edgeIDCount = 0;
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
            return VertexRenderer(vertex);
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

  drawVertex = (e) =>{
    const vertex={
      id: this.vertexIDCount++,
      x: e.clientX,
      y: e.clientY
    }
    this.vertices.push(vertex);
    this.setState(this.state);
  }
}

const domContainer = document.querySelector('#sketchpad_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(Sketchpad), domContainer);