import React, { Component } from 'react';
import styled from 'styled-components';
import { Box, Button, Stack } from 'grommet';

import homeStore from './home.store-diamond';
import { injectLocalState } from '../../../util/reactHOC';
import Controls from './ControlsUnified';

const Main = styled.main`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: black;
`;

export default class Home extends Component {
  constructor(p) {
    super(p);
    this._ref = React.createRef();
    this.stream = homeStore(p);
    /*    Object.assign(this, injectLocalState({
      streamFactory: homeStore,
      initialProps: p,
      target: this,
      filter: ['speed', 'direction', 'arrows'],
    })); */
    this.state = this.stream.value;
  }

  componentDidMount() {
    this._sub = this.stream.subscribe((s) => {
      this.setState(s.toObject());
    }, (e) => {
      console.log('-stream error: ', e);
    });

    console.log('componentDidMount --- local');
    const ele = this._ref.current;
    console.log('component did mount: ele', ele);
    this.stream.do.tryInit(ele, this.props.size);
  }

  componentWillUnmount() {
    this._sub.unsubscribe();
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
    console.log('rendering home with speed ', this.stream.my.speed);
    return (
      <Stack active={1} anchor="center">
        <Main ref={this._ref} />
        <Box direction="column" fill height="20rem" align="center">
          <Controls
            arrows={this.state.arrows}
            speed={this.state.speed}
            onArrowOut={this.stream.do.onArrowOut}
            onArrowOver={this.stream.do.onArrowOver}
            onArrowDown={this.stream.do.onArrowDown}
            setSpeed={(speed) => {
              const t = Date.now();
              this.stream.do.updateSpeed(speed);
              console.log('dom setSpeed done in ', Date.now() - t);
            }}
            stream={this.stream}
          />
        </Box>
      </Stack>
    );
  }
}
