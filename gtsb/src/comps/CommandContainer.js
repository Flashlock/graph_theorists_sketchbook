// eslint-disable-next-line no-undef
class CommandContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.commandMode = 'Draw Vertex';
    this.nonComands = ['Clear Pad', 'Delete', 'Vertex Data'];

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
              this.commandMode
          ),
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
                )
              ]
          )
        ]
    );
  }

  update() {
    if (this.commandMode !== commandMode && !this.nonComands.find((command) => command === commandMode)) {
      this.commandMode = commandMode;
      this.setState(this.state);
    }
  }

  toggleCommandMode = (command) => {
    // eslint-disable-next-line no-undef
    prevCommandMode = commandMode;
    // eslint-disable-next-line no-undef
    commandMode = command;
    this.setState(this.state);
  }
}

const  domContainerCommands = document.querySelector('#command_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(CommandContainer), domContainerCommands);