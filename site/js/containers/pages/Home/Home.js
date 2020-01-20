import React, { Component } from 'react';
import styled from 'styled-components';

import siteStore from '../../../store/site.store';
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
    const ele = this._ref.current;
    this.state.do.tryInit(ele, this.props.size);
  }

  render() {
    return (
      <Main ref={this._ref} />
    );
  }
}
