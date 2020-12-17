'use strict';

// eslint-disable-next-line no-undef
const e = React.createElement;

// eslint-disable-next-line no-undef
class LikeButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return e(
        'div',
        { id: 'banana',
        onClick: () => this.setState({ liked: true }) },
        'Like'
    );
  }
}

const domContainer = document.querySelector('#like_button_container');
// eslint-disable-next-line no-undef
ReactDOM.render(e(LikeButton), domContainer);