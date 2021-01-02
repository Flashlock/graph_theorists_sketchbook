let selectedColor;
//arrow color starts as blue
let arrowColor = '#0000ff';
// eslint-disable-next-line no-undef
class CommandContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.commandMode = 'Draw Vertex';
    this.customColors = []
    for (let i = 0; i < 15; i++) {
      this.customColors.push({
        color: 'white',
        id: i,
        palette: 'custom'
      });
    }
    this.defaultColors = [{ color: 'red', id: 0, palette: 'default' }, { color: 'black', id: 1, palette: 'default' },
      { color: 'blue', id: 2, palette: 'default' }];

    setInterval(this.update.bind(this), 33);
  }

  componentDidMount() {
    this.edges = graphEdges;
  }

  render() {
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
                    ]
                ),
                e(
                    'div',
                    {
                      key: 'colors',
                      id: 'colors'
                    },
                    [
                      //color picker header
                      e(
                          'h3',
                          {
                            key: 'color_picker_header',
                            className: 'color_header'
                          },
                          'Color Picker'
                      ),
                      //color picker
                      e(
                          'input',
                          {
                            key: 'color_picker',
                            className: 'color_picker',
                            id: 'custom_picker',
                            type: 'color',
                            onChange: this.changeColor,
                            value: arrowColor
                          }
                      ),
                      //default color palette header
                      e(
                          'h3',
                          {
                            key: 'default_palette_header',
                            className: 'color_header'
                          },
                          'Default Palette'
                      ),
                      //default color palette
                      this.defaultColors.map((color) => {
                        return this.ColorRenderer(color);
                      }),
                      //custom color palette header
                      e(
                          'h3',
                          {
                            key: 'custom_palette_header',
                            className: 'color_header'
                          },
                          'Custom Palette'
                      ),
                      //custom color palette
                      this.customColors.map((color) => {
                        return this.ColorRenderer(color);
                      }),
                        //selected color hex code
                        e(
                            'h3',
                            {
                              key: 'palette_hex_code',
                              className: 'color_header',
                              id: 'palette_hex_code'
                            },
                            selectedColor? selectedColor.color: '#------'
                        )
                    ]
                )
              ]
          ),
          e(
              'div',
              {
                key: 'arrow_color',
                id: 'arrow_color'
              },
              [
                e(
                    'label',
                    {
                      key: 'arrow_color_header',
                      htmlFor: 'arrow_color_picker'
                    },
                    'Arrow Color Picker'
                ),
                e(
                    'input',
                    {
                      key: 'arrow_color_picker',
                      type: 'color',
                      className: 'color_picker',
                      id: 'arrow_color_picker',
                      value: arrowColor,
                      onChange: this.changeArrowColor
                    }
                ),
                  e(
                      'label',
                      {
                        key: 'arrow_color_hex_code',
                        htmlFor: 'arrow_color_picker'
                      },
                      arrowColor
                  )
              ]
          )
        ]
    );
  }

  update() {
    if (this.commandMode !== commandMode && !nonCommands.find((command) => command === commandMode)) {
      this.commandMode = commandMode;
      this.setState(this.state);
    }
  }

  ColorRenderer = (color) => {
    const isSelected = selectedColor && selectedColor.palette === color.palette && selectedColor.id === color.id;
    const style = {
      background: color.color,
      border: isSelected ? '2px solid pink' : '2px solid black'
    }
    return e(
        'div',
        {
          key: color.palette + color.id.toString(),
          className: 'color_palette',
          style: style,
          onClick: this.selectColor.bind(this, color)
        }
    )
  }

  selectColor(color) {
    //second click deselects the color
    if (selectedColor && selectedColor.palette === color.palette && selectedColor.id === color.id) {
      selectedColor = null;
    } else
      selectedColor = color;
    this.setState(this.state);
  }

  toggleCommandMode = (command) => {
    // eslint-disable-next-line no-undef
    prevCommandMode = commandMode;
    // eslint-disable-next-line no-undef
    commandMode = command;
    this.setState(this.state);
  }

  changeColor = () => {
    if (selectedColor && selectedColor.palette === 'custom') {
      selectedColor.color = document.getElementById('custom_picker').value;
    }
    this.setState(this.state);
  }

  changeArrowColor = () => {
    arrowColor = document.getElementById('arrow_color_picker').value;
    this.setState(this.state);
  }
}

const  domContainerCommands = document.querySelector('#command_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(CommandContainer), domContainerCommands);