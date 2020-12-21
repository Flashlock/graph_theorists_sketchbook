// eslint-disable-next-line no-undef
class GraphData extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
    this.vertexCount=graphVertices.length;
    this.edgeCount=graphEdges.length;
    this.isBP=false;
    setInterval(this.update.bind(this), 33);
  }

  render() {
    const vertexCount='v = '+ graphVertices.length.toString();
    const edgeCount = 'e = '+graphEdges.length.toString();
    this.determineBipartite();
    const components=this.findComponents();

    // eslint-disable-next-line no-undef
    return e(
        'div',
        {
          key: 'graph_data'
        },
        'Graph Data',
        [
            e(
                'h1',
                {
                  key: 'vertex_count'
                },
                vertexCount
            ),
            e(
                'h1',
                {
                  key: 'edge_count'
                },
                edgeCount
            ),
            e(
                'h1',
                {
                  key: 'is_bp'
                },
                'BP = '+this.isBP
            ),
            e(
                'h1',
                {
                  key: 'component_count'
                },
                'Components = '+components.length
            )
        ]
    );
  }

  update(){
    if(graphVertices.length!==this.vertexCount || graphEdges.length!==this.edgeCount){
      this.vertexCount=graphVertices.length;
      this.edgeCount=graphEdges.length;
      this.setState(this.state);
    }
  }

  determineBipartite = () => {
    let visitedVertices=[];
    this.isBP=true;
    while(visitedVertices.length<graphVertices.length){
      const unseenVertices=this.findUnseenVertices(visitedVertices);
      this.bpHelper(unseenVertices[0], visitedVertices, 1);
      if(!this.isBP)
        break;
    }
  }

  bpHelper = (currentVertex, visitedVertices, mColor) =>{
    //if I've been here before, I must be trying to color it the same else bad
    if(visitedVertices.find((vertex)=>vertex.id===currentVertex.id)){
      if(currentVertex.mColor===mColor){
        return;
      }
      else{
        this.isBP=false;
        return;
      }
    }

    visitedVertices.push(currentVertex);
    currentVertex.mColor=mColor;
    mColor=mColor===1?0:1;

    for(let i=0;i<currentVertex.edges.length;i++){
      const edge=currentVertex.edges[i];
      const adj=this.determineAdjVertex(currentVertex, edge.vertex1, edge.vertex2);
      this.bpHelper(adj, visitedVertices, mColor);
    }

  }

  determineAdjVertex(currentVertex, v1, v2) {
    return v1.id === currentVertex.id ? v2 : v1;
  }

  findUnseenVertices = (vistedVertices) => {
    return graphVertices.filter((vertex) => !vistedVertices.find((v) => v.id === vertex.id));
  }

  //returns an array of arrays for vertices that make up each component
  findComponents = () => {
    let components = [];
    let visitedVertices = [];
    //start at some vertex, collect all visited vertices
    while (visitedVertices.length < graphVertices.length) {
      let componentVertices = [];
      const unseenVertices = this.findUnseenVertices(visitedVertices);
      this.findComponentHelper(unseenVertices[0], visitedVertices, componentVertices);
      components.push(componentVertices);
    }
    return components;
  }

  findComponentHelper = (currentVertex, visitedVertices, componentVertices) => {
    if (visitedVertices.find((vertex) => vertex.id === currentVertex.id))
      return;
    componentVertices.push(currentVertex);
    visitedVertices.push(currentVertex);
    for (let i = 0; i < currentVertex.edges.length; i++) {
      const edge = currentVertex.edges[i];
      const adj = this.determineAdjVertex(currentVertex, edge.vertex1, edge.vertex2);
      this.findComponentHelper(adj, visitedVertices, componentVertices);
    }
  }
}

const  domContainerData = document.querySelector('#data_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(GraphData), domContainerData);
