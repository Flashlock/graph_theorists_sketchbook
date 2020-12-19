// eslint-disable-next-line no-undef
class CommandContainer extends React.Component{
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