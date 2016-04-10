import * as React from 'react';
import {render} from 'react-dom';
import Another from "./another";

export default class App extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <h1>Hello world 12</h1>
        <Another />
      </div>
    );
  }
}

render(
  <App />,
  document.getElementById('app')
);