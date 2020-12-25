let bridges=[];
// eslint-disable-next-line no-undef
class CommandContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.commandMode = 'Draw Vertex';
    this.nonComands = ['Clear Pad', 'Delete', 'Vertex Data, Bridges'];
    this.customColors = []
    for (let i = 0; i < 16; i++) {
      this.customColors.push('white');
    }
    this.defaultColors = ['red', 'blue', 'yellow'];
    this.idBridge = false;

    setInterval(this.update.bind(this), 33);
  }

  componentDidMount() {
    this.edges = graphEdges;
  }

  render() {
    this.customColorCount = 0;
    this.defaultColorCount = 0;
    // eslint-disable-next-line no-undef
    return e(
        'div',
        {
          id: 'commands_comp',
          key: 'commands_comp'
        },
        [
          e(
              'h1',
              {
                className: 'component_header',
                key: 'commands_comp_header'
              },
              this.commandMode
          ),
          e(
              'div',
              {
                key: 'commands_and_colors',
                id: 'commands_and_colors'
              },
              [
                e(
                    'div',
                    {
                      id: 'commands',
                      key: 'commands'
                    },
                    [
                      //draw Vertex button
                      // eslint-disable-next-line no-undef
                      e(
                          'button',
                          {
                            onClick: this.toggleCommandMode.bind(this, 'Draw Vertex'),
                            className: 'command_button',
                            id: 'draw_vertex',
                            key: 'draw_vertex'
                          },
                          'Draw Vertex'
                      ),
                      //draw Edge button
                      // eslint-disable-next-line no-undef
                      e(
                          'button',
                          {
                            onClick: this.toggleCommandMode.bind(this, 'Draw Edge'),
                            className: 'command_button',
                            id: 'draw_edge',
                            key: 'draw_edge'
                          },
                          'Draw Edge'
                      ),
                      //draw Arc Button
                      // eslint-disable-next-line no-undef
                      e(
                          'button',
                          {
                            onClick: this.toggleCommandMode.bind(this, 'Draw Arc'),
                            className: 'command_button',
                            id: 'draw_arc',
                            key: 'draw_arc'
                          },
                          'Draw Arc'
                      ),
                      //Grabber Button
                      // eslint-disable-next-line no-undef
                      e(
                          'button',
                          {
                            onClick: this.toggleCommandMode.bind(this, 'Grabber'),
                            className: 'command_button',
                            id: 'grabber',
                            key: 'grabber'
                          },
                          'Grabber'
                      ),
                      //Delete Button
                      // eslint-disable-next-line no-undef
                      e(
                          'button',
                          {
                            onClick: this.toggleCommandMode.bind(this, 'Delete'),
                            className: 'command_button',
                            id: 'delete',
                            key: 'delete'
                          },
                          'Delete'
                      ),
                      //Clear Pad Button
                      // eslint-disable-next-line no-undef
                      e(
                          'button',
                          {
                            onClick: this.toggleCommandMode.bind(this, 'Clear Pad'),
                            className: 'command_button',
                            id: 'clearPad',
                            key: 'clearPad'
                          },
                          'Clear Pad'
                      ),
                      //selector Button
                      // eslint-disable-next-line no-undef
                      e(
                          'button',
                          {
                            onClick: this.toggleCommandMode.bind(this, 'Selector'),
                            className: 'command_button',
                            id: 'selector',
                            key: 'selector'
                          },
                          'Selector'
                      ),
                      // Display vertex data
                      // eslint-disable-next-line no-undef
                      e(
                          'button',
                          {
                            onClick: this.toggleCommandMode.bind(this, 'Vertex Data'),
                            className: 'command_button',
                            id: 'vertexData',
                            key: 'vertexData'
                          },
                          'Vertex Data'
                      ),
                      e(
                          'button',
                          {
                            onClick: this.toggleBridgeID.bind(this),
                            className: 'command_button',
                            id: 'bridgeID',
                            key: 'bridgeID'
                          },
                          'Locate Bridges'
                      )
                    ]
                ),
                e(
                    'div',
                    {
                      key: 'colors',
                      id: 'colors'
                    },
                    [
                      e(
                          'h3',
                          {
                            key: 'color_picker_header',
                            id: 'color_picker_header',
                            className: 'color_header'
                          },
                          'Color Picker'
                      ),
                      e(
                          'input',
                          {
                            type: 'color',
                            key: 'color_picker',
                            id: 'color_picker'
                          }
                      ),
                      e(
                          'h3',
                          {
                            key: 'default_palette_header',
                            id: 'default_palette_header',
                            className: 'color_header'
                          },
                          'Default Palette'
                      ),
                      e(
                          'div',
                          {
                            key: 'default_color_palette_wrapper',
                            id: 'default_color_palette_wrapper'
                          },
                          [
                            this.defaultColors.map((color) => {
                              return this.DefaultColorRenderer(color);
                            })
                          ]
                      ),
                      e(
                          'h3',
                          {
                            key: 'custom_palette_header',
                            id: 'custom_palette_header',
                            className: 'color_header'
                          },
                          'Custom Palette'
                      ),
                      e(
                          'div',
                          {
                            key: 'custom_color_palette_wrapper',
                            id: 'custom_color_palette_wrapper'
                          },
                          [
                            this.customColors.map((color) => {
                              return this.CustomColorRenderer(color);
                            })
                          ]
                      )
                    ]
                )
              ]
          ),
            e(
                'h3',
                {
                  key: 'arrow_color_header',
                  //probably put something
                },
                'Arrow Color Picker'
            ),
            e(
                'input',
                {
                  key: 'arrow_color_picker',
                  type: 'color'
                }
            )
        ]
    );
  }

  update() {
    if (this.commandMode !== commandMode && !this.nonComands.find((command) => command === commandMode)) {
      this.commandMode = commandMode;
      this.setState(this.state);
    }
    if (this.idBridge && graphEdges.length !== this.edges.length) {
      this.edges = graphEdges;
      this.idBridges();
      this.setState(this.state);
    }
  }

  DefaultColorRenderer = (color) => {
    const style = {
      background: color
    }
    return e(
        'div',
        {
          key: 'd' + this.defaultColorCount++,
          className: 'default_color_palette',
          style: style
        }
    )
  }

  CustomColorRenderer = (color) => {
    const style = {
      background: color
    }
    return e(
        'div',
        {
          key: 'c' + this.customColorCount++,
          className: 'custom_color_palette',
          style: style
        }
    )
  }

  toggleCommandMode = (command) => {
    // eslint-disable-next-line no-undef
    prevCommandMode = commandMode;
    // eslint-disable-next-line no-undef
    commandMode = command;
    if (command === 'Bridges')
      this.toggleBridgeID();
    this.setState(this.state);
  }

  toggleBridgeID = () => {
    this.idBridge = !this.idBridge
    if (!this.idBridge) {
      //turn off bridges
      bridges = [];
    } else {
      //turn on bridges
      this.idBridges();
    }
    this.setState(this.state);
  }

  idBridges() {
    bridges = [];
    for (let i = 0; i < graphEdges.length; i++) {
      if (graphEdges[i].isLoop)
        continue;
      let vertex1 = graphEdges[i].vertex1;
      let vertex2 = graphEdges[i].vertex2;
      //if it's an arc, need to find the direction
      if (graphEdges[i].isArc) {
        vertex1 = this.determineAdjVertex(graphEdges[i].targetVertex, vertex1, vertex2);
        vertex2 = graphEdges[i].targetVertex;
      }
      let path = [];

      //remove the edge from its vertices
      vertex1.edges = vertex1.edges.filter((edge) => edge.id !== graphEdges[i].id);
      vertex2.edges = vertex2.edges.filter((edge) => edge.id !== graphEdges[i].id);

      this.pathFound = false;
      this.pathFinder(vertex1, vertex2, path);
      if (!this.pathFound)
        bridges.push(graphEdges[i].id);

      //add the edge back in
      vertex1.edges.push(graphEdges[i]);
      vertex2.edges.push(graphEdges[i]);
    }
  }

  pathFinder(currentVertex, targetVertex, path) {
    if (path.find((vertex) => vertex.id === currentVertex.id) || this.pathFound)
      return;

    //if not seen before, is this the goal?
    if (currentVertex.id === targetVertex.id) {
      this.pathFound = true;
      return;
    }

    path.push(currentVertex);
    for (let i = 0; i < currentVertex.edges.length; i++) {
      const edge = currentVertex.edges[i];
      if (!edge.isArc || (edge.isArc && edge.targetVertex.id !== currentVertex.id)) {
        const adj = this.determineAdjVertex(currentVertex, edge.vertex1, edge.vertex2);
        this.pathFinder(adj, targetVertex, path);
      }
    }
  }

  determineAdjVertex(currentVertex, v1, v2) {
    return v1.id === currentVertex.id ? v2 : v1;
  }
}

const  domContainerCommands = document.querySelector('#command_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(CommandContainer), domContainerCommands);