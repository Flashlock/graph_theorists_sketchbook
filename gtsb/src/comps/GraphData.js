// eslint-disable-next-line no-undef
class GraphData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.isBP = false;
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
                // Display vertex data
                // eslint-disable-next-line no-undef
                e(
                    'button',
                    {
                      onClick: this.receiveAction.bind(this, 'Display Vertex Data'),
                      className: 'command_button',
                      id: 'vertex_data',
                      key: 'vertex_data'
                    },
                    'Vertex Data'
                ),
                e(
                    'button',
                    {
                      onClick: this.receiveAction.bind(this, 'Reset IDs'),
                      className: 'command_button',
                      id: 'reset_id',
                      key: 'reset_id'
                    },
                    'Reset IDs'
                ),
                e(
                    'button',
                    {
                      onClick: this.receiveAction.bind(this, 'Bridge ID'),
                      className: 'command_button',
                      id: 'bridge_ID',
                      key: 'bridge_ID'
                    },
                    'Locate Bridges'
                )
              ]
          ),
          this.showSelectedVertex(),
          e(
              'h3',
              {
                key: 'vertex_count',
                className: 'graph_data',
                id: 'vertex_count',
              },
              vertexCount,
          ),
          e(
              'h3',
              {
                key: 'edge_count',
                className: 'graph_data'
              },
              edgeCount
          ),
          e(
              'h3',
              {
                key: 'is_bp',
                className: 'graph_data'
              },
              'BP = ' + this.isBP
          ),
          e(
              'h3',
              {
                key: 'component_count',
                className: 'graph_data'
              },
              'Components = ' + components.length
          )
        ]
    );
  }

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
      selectedVertices[i].customID = ev.target.value;
    }
    updateCall = true;
  }

  update() {
    if (updateCall && !updateCallers[0]) {
      updateCallers[0] = true;
      this.setState(this.state);
    }
  }

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

    console.log(currentVertex.id, currentVertex.mColor);

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

  receiveAction = (action) => {
    actionCommand = action;
    updateCall = true;
  }
}

const  domContainerData = document.querySelector('#data_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(GraphData), domContainerData);
