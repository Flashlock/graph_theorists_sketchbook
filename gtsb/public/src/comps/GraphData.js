let usingInDegree = true;
let bridgeID = false;
let displayVertexData = 'Data';

// eslint-disable-next-line no-undef
class GraphData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.isBP = false;
    this.matrixDisplay = 'Matrix Off';
    this.maxLengthCustomID = 30;
    setInterval(this.update.bind(this), 33);
  }

  componentDidMount() {
    const idInput = document.getElementById('custom_id_input');
    idInput.addEventListener('keypress', (ev => {
      if (ev.defaultPrevented)
        return;
      if (document.activeElement === idInput && ev.code === 'Enter') {
        idInput.blur();
      }
    }));
  }

  render() {
    const vertexCount = 'v = ' + graphVertices.length.toString();
    const edgeCount = 'e = ' + graphEdges.length.toString();
    this.determineBipartite();
    const components = this.findComponents();

    // eslint-disable-next-line no-undef
    return e(
        'div',
        {
          key: 'graph_data_comp',
          id: 'graph_data_comp'
        },
        [
          e(
              'h1',
              {
                key: 'graph_data_header',
                className: 'component_header'
              },
              'Graph Data'
          ),
          e(
              'div',
              {
                key: 'data_toggles',
                id: 'data_toggles'
              },
              [
                  //save the graph
                  // e(
                  //   'button',
                  //     {
                  //       onClick: this.receiveAction.bind(this, 'Save Graph'),
                  //       className: 'data_button',
                  //       id: 'save_sketch',
                  //       key: 'save_sketch'
                  //     },
                  //     'Save Graph'
                  // ),
                // Display vertex data
                // eslint-disable-next-line no-undef
                e(
                    'button',
                    {
                      onClick: this.receiveAction.bind(this, 'Display Vertex Data'),
                      className: 'data_button',
                      id: 'vertex_data',
                      key: 'vertex_data'
                    },
                    'Vertex ' + displayVertexData
                ),
                e(
                    'button',
                    {
                      onClick: this.receiveAction.bind(this, 'Reset IDs'),
                      className: 'data_button',
                      id: 'reset_id',
                      key: 'reset_id'
                    },
                    'Reset IDs'
                ),
                e(
                    'button',
                    {
                      onClick: this.receiveAction.bind(this, 'Bridge ID'),
                      className: 'data_button',
                      id: 'bridge_ID',
                      key: 'bridge_ID'
                    },
                    bridgeID ? 'Bridges On' : 'Bridges Off'
                ),
                e(
                    'button',
                    {
                      onClick: this.receiveAction.bind(this, 'InOut Degree'),
                      className: 'data_button',
                      id: 'inout_degree',
                      key: 'inout_degree'
                    },
                    usingInDegree ? 'In Degree' : 'Out Degree'
                )
              ]
          ),
          this.showSelectedVertex(),
          e(
              'div',
              {
                key: 'graph_counts',
                id: 'graph_counts'
              },
              [
                e(
                    'p',
                    {
                      key: 'vertex_count',
                      className: 'graph_data',
                      id: 'vertex_count',
                    },
                    vertexCount,
                ),
                e(
                    'p',
                    {
                      key: 'edge_count',
                      className: 'graph_data'
                    },
                    edgeCount
                ),
                e(
                    'p',
                    {
                      key: 'is_bp',
                      className: 'graph_data'
                    },
                    'BP = ' + this.isBP
                ),
                e(
                    'p',
                    {
                      key: 'component_count',
                      className: 'graph_data'
                    },
                    'Comps = ' + components.length
                )
              ]
          ),
          e(
              'div',
              {
                key: 'matrix_data',
                id: 'matrix_data'
              },
              [
                e(
                    'button',
                    {
                      key: 'matrix_toggle',
                      id: 'matrix_toggle',
                      className: 'command_button',
                      onClick: this.switchMatrix.bind(this)
                    },
                    this.matrixDisplay
                ),
                this.renderMatrix()
              ]
          )
        ]
    );
  }

  update() {
    if (updateCall && !updateCallers[0] && updateCallers[1]) {
      updateCallers[0] = true;
      this.setState(this.state);
    }
  }

  receiveAction = (action) => {
    actionCommand = action;
    updateCall = true;
  }

  //-----------------Matrices------------------------//
  renderMatrix = () => {
    if (this.matrixDisplay === 'Adjacency')
      return this.adjMatrixRenderer();
    else
      if (this.matrixDisplay === 'Laplacian')
        return this.laplacianMatrixRenderer();
    return null;
  }

  matrixToDom(matrix, key){
    return e(
        'tbody',
        {
          key: key
        },
        [
          matrix.map((row)=>{
            return e(
                'tr',
                {
                  key: row.id.toString()
                },
                [
                  row.content.map((entry)=>{
                    return e(
                        'td',
                        {
                          key: entry.id.toString()
                        },
                        entry.content
                    )
                  })
                ]
            )
          })
        ]
    );
  }

  switchMatrix = () => {
    if (this.matrixDisplay === 'Matrix Off')
      this.matrixDisplay = 'Adjacency';
    else
      if (this.matrixDisplay === 'Adjacency')
        this.matrixDisplay = 'Laplacian';
      else
        this.matrixDisplay = 'Matrix Off';
    this.setState(this.state);
  }

  //Laplacian Matrix
  laplacianMatrixRenderer() {
    const laplacian = this.findLaplacianMatrix();
    if (laplacian.length === 0) return null;
    return e(
        'table',
        {
          key: 'laplacian_matrix'
        },
        [
          this.matrixToDom(laplacian, 'laplacian_matrix')
        ]
    );
  }

  findLaplacianMatrix() {
    const adjMatrix = this.findAdjMatrix();
    const diagDegMatrix = this.findDiagDegMatrix();
    //L = D - A
    let laplacian = this.makeZeroMatrix(adjMatrix.length);
    for (let i = 0; i < adjMatrix.length; i++) {
      for (let j = 0; j < adjMatrix.length; j++) {
        laplacian[i].content[j].content = diagDegMatrix[i].content[j].content - adjMatrix[i].content[j].content;
      }
    }
    return laplacian;
  }

  findDiagDegMatrix() {
    let diagDegMatrix = this.makeZeroMatrix(graphVertices.length);
    for (let i = 0; i < graphVertices.length; i++) {
      diagDegMatrix[i].content[i].content = usingInDegree ? graphVertices[i].inDegree : graphVertices[i].outDegree;
    }
    return diagDegMatrix;
  }

  //Adjacency Matrix
  adjMatrixRenderer() {
    const adjMatrix = this.findAdjMatrix();
    if (adjMatrix.length === 0) return null;
    return e(
        'table',
        {
          key: 'adj_matrix',
        },
        [
          this.matrixToDom(adjMatrix, 'adj_matrix')
        ]
    );
  }

  findAdjMatrix() {
    //instantiate blank matrix
    let adjMatrix = this.makeZeroMatrix(graphVertices.length);
    for (let i = 0; i < graphEdges.length; i++) {
      const v1Index = graphVertices.findIndex((vertex) => vertex.id === graphEdges[i].vertex1.id);
      const v2Index = graphVertices.findIndex((vertex) => vertex.id === graphEdges[i].vertex2.id);
      if (graphEdges[i].isArc) {
        //which vertex is the target?
        if (graphEdges[i].vertex1.id === graphEdges[i].targetVertex.id)
          adjMatrix[v2Index].content[v1Index].content = 1;
        else
          adjMatrix[v1Index].content[v2Index].content = 1;
      } else {
        adjMatrix[v1Index].content[v2Index].content = 1;
        adjMatrix[v2Index].content[v1Index].content = 1;
      }
    }
    return adjMatrix;
  }

  makeZeroMatrix(length) {
    let zMatrix = [];
    for (let i = 0; i < length; i++) {
      zMatrix[i] = { id: 'm_row' + i.toString(), content: [] };
      for (let j = 0; j < length; j++) {
        zMatrix[i].content.push({ id: 'm_entry' + i.toString() + ', ' + j.toString(), content: 0 });
      }
    }
    return zMatrix;
  }

  //----------------------Custom ID---------------------//
  showSelectedVertex = () => {
    let selectedVertex = '';
    if (commandMode === 'Selector') {
      for (let i = 0; i < selectedVertices.length; i++) {
        const id = selectedVertices[i].customID ? selectedVertices[i].customID : selectedVertices[i].id;
        selectedVertex += i === selectedVertices.length - 1 ? id : id + ', ';
      }
    }
    return (
        e(
            'div',
            {
              key: 'custom_id',
              id: 'custom_id'
            },
            [
              e(
                  'label',
                  {
                    key: 'custom_id_label',
                    id: 'custom_id_label',
                    htmlFor: 'custom_id_input'
                  },
                  'Selected Vertex: ' + selectedVertex,
              ),
              e(
                  'textarea',
                  {
                    type: 'text',
                    key: 'custom_id_input',
                    id: 'custom_id_input',
                    value: selectedVertices[0] ? selectedVertices[0].customID : '',
                    placeholder: 'Input Custom ID',
                    onInput: this.applyCustomVertexID,
                    onChange: this.applyCustomVertexID
                  }
              )
            ]
        )
    );
  }

  applyCustomVertexID = (ev) => {
    for (let i = 0; i < selectedVertices.length; i++) {
      if (ev.target.value.length <= this.maxLengthCustomID) {
        selectedVertices[i].customID = ev.target.value;
      }
    }
    updateCall = true;
  }

  //----------------------Bipartite----------------------//
  determineBipartite = () => {
    let visitedVertices = [];
    this.isBP = true;
    while (visitedVertices.length < graphVertices.length) {
      const unseenVertices = this.findUnseenVertices(visitedVertices);
      this.bpHelper(unseenVertices[0], visitedVertices, 1);
      if (!this.isBP)
        break;
    }
  }

  bpHelper = (currentVertex, visitedVertices, mColor) => {
    //if I've been here before, I must be trying to color it the same else bad
    if (visitedVertices.find((vertex) => vertex.id === currentVertex.id)) {
      if (currentVertex.mColor === mColor) {
        return;
      } else {
        this.isBP = false;
        return;
      }
    }

    visitedVertices.push(currentVertex);
    currentVertex.mColor = mColor;
    mColor = mColor === 1 ? 0 : 1;

    for (let i = 0; i < currentVertex.edges.length; i++) {
      const edge = currentVertex.edges[i];
      const adj = this.determineAdjVertex(currentVertex, edge.vertex1, edge.vertex2);
      if ((edge.isArc && adj.id === edge.targetVertex.id) || !edge.isArc) {
        this.bpHelper(adj, visitedVertices, mColor);
      }
    }
  }

  determineAdjVertex(currentVertex, v1, v2) {
    return v1.id === currentVertex.id ? v2 : v1;
  }

  findUnseenVertices = (vistedVertices) => {
    return graphVertices.filter((vertex) => !vistedVertices.find((v) => v.id === vertex.id));
  }

  //------------------------Component Finder--------------------//
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
