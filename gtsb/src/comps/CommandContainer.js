let selectedColor;
//arrow color starts as blue
let arrowColor = '#007CC7';

// eslint-disable-next-line no-undef
class CommandContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.customColors = [];
    this.displayPickedColor = '#007CC7';
    for (let i = 0; i < 9; i++) {
      this.customColors.push({
        color: '#FFFFFF',
        id: i,
        palette: 'custom'
      });
    }
    this.defaultColors = [{ color: '#FF0000', id: 0, palette: 'default' }, { color: '#000000', id: 1, palette: 'default' },
      { color: '#007CC7', id: 2, palette: 'default' }];

    setInterval(this.update.bind(this), 33);
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
              commandMode
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
                            onClick: this.receiveCommand.bind(this, 'Draw Vertex'),
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
                            onClick: this.receiveCommand.bind(this, 'Draw Edge'),
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
                            onClick: this.receiveCommand.bind(this, 'Draw Arc'),
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
                            onClick: this.receiveCommand.bind(this, 'Selector'),
                            className: 'command_button',
                            id: 'selector',
                            key: 'selector'
                          },
                          'Selector'
                      ),
                      e(
                          'button',
                          {
                            onClick: this.receiveAction.bind(this, 'Deselect'),
                            className: 'command_button',
                            id: 'deselect',
                            key: 'deselect'
                          },
                          'Deselect All'
                      ),
                      //Grabber Button
                      // eslint-disable-next-line no-undef
                      e(
                          'button',
                          {
                            onClick: this.receiveCommand.bind(this, 'Grabber'),
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
                            onClick: this.receiveAction.bind(this, 'Delete'),
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
                            onClick: this.receiveAction.bind(this, 'Clear Pad'),
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
                            value: this.displayPickedColor
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
                            id: 'palette_hex_code',
                          },
                          selectedColor ? selectedColor.color : '#------'
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
    //if there was an update call I need to check in
    if (updateCall && !updateCallers[2] && updateCallers[1]) {
      updateCallers[2] = true;
      this.setState(this.state);
    }
  }

  receiveAction = (action) => {
    actionCommand = action;
    updateCall = true;
  }

  receiveCommand = (command) => {
    commandMode = command;
    updateCall = true;
  }

  ColorRenderer = (color) => {
    const isSelected = selectedColor && selectedColor.palette === color.palette && selectedColor.id === color.id;
    const style = {
      background: color.color
    }
    return e(
        'button',
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
    } else {
      selectedColor = color;
      this.displayPickedColor = color.color;
    }
    updateCall = true;
  }

  changeColor = () => {
    if (selectedColor && selectedColor.palette === 'custom') {
      selectedColor.color = document.getElementById('custom_picker').value;
      this.displayPickedColor = selectedColor.color;
    }
    updateCall = true;
  }

  changeArrowColor = () => {
    arrowColor = document.getElementById('arrow_color_picker').value;
    updateCall = true;
  }
}

const  domContainerCommands = document.querySelector('#command_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(CommandContainer), domContainerCommands);