import React from 'react';
import ReactDom from 'react-dom';

const e=React.createElement;

class App extends React.Component {
  render() {
    return null;
  }
}

const domContainer = document.querySelector('#root');
ReactDom.render(e(App), domContainer);