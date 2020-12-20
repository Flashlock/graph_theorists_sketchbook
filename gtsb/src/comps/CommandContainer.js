// eslint-disable-next-line no-undef
class CommandContainer extends React.Component {
  render() {
    // eslint-disable-next-line no-undef
    return e(
        'div',
        {
          id: 'commandContainer'
        },
        [
          //draw Vertex button
          // eslint-disable-next-line no-undef
          e(
              'button',
              {
                onClick: this.toggleCommandMode.bind(this, 'drawVertex'),
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
                onClick: this.toggleCommandMode.bind(this, 'drawEdge'),
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
                onClick: this.toggleCommandMode.bind(this, 'drawArc'),
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
                onClick: this.toggleCommandMode.bind(this, 'grabber'),
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
                onClick: this.toggleCommandMode.bind(this, 'delete'),
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
                onClick: this.toggleCommandMode.bind(this, 'clearPad'),
                className: 'command_button',
                id: 'clearPad',
                key: 'clearPad'
              },
              'Clear Pad'
          ),
          //Manipulator Button
          // eslint-disable-next-line no-undef
          e(
              'button',
              {
                onClick: this.toggleCommandMode.bind(this, 'manipulator'),
                className: 'command_button',
                id: 'manipulator',
                key: 'manipulator'
              },
              'Manipulator'
          )
        ]
    );
  }

  toggleCommandMode = (command) => {
    // eslint-disable-next-line no-undef
    commandMode = command;
  }
}

const  domContainerCommands = document.querySelector('#command_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(CommandContainer), domContainerCommands);