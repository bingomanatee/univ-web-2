import React, { Component } from 'react';
import styled from 'styled-components';

import homeStore from './home.store';
import { injectLocalState } from '../../../util/reactHOC';

const Main = styled.main`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
`;

export default class Home extends Component {
  constructor(p) {
    super(p);
    this._ref = React.createRef();
    Object.assign(this, injectLocalState({ streamFactory: homeStore, initialProps: p, target: this }));
  }

  componentDidMount() {
    console.log('componentDidMount --- local');
    const ele = this._ref.current;
    console.log('component did mount: ele', ele);
    this.stream.do.tryInit(ele, this.props.size);
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.size.width !== this.props.size.width)
      || (prevProps.size.height !== this.props.size.height)
    ) {
      if (this.stream) {
        this.stream.do.resizeApp(this.size);
      }
    }
  }

  render() {
    console.log('home state: ', this.state);
    return (
      <Main ref={this._ref} />
    );
  }
}
