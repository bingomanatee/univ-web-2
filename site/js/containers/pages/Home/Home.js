import React, { Component } from 'react';
import styled from 'styled-components';
import { Box, Button, Stack } from 'grommet';

import homeStore from './home.store-diamond';
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
        console.log('----------------- resizing');
        this.stream.do.resizeApp(this.size);
      }
    }
  }

  render() {
    return (
      <Stack active={1}>
        <Main ref={this._ref} />
        <Box direction="column" fill>

          <Box direction="row">
            <Button primary plain={false} onClick={() => this.stream.do.move('x', 200)}>Left</Button>
            <Button primary plain={false} onClick={() => this.stream.do.move('x', -200)}>Right</Button>
            <Button primary plain={false} onClick={() => this.stream.do.move('y', -200)}>Up</Button>
            <Button primary plain={false} onClick={() => this.stream.do.move('y', 200)}>Down</Button>
          </Box>
        </Box>
      </Stack>
    );
  }
}
