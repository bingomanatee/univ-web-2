import React, { Component } from 'react';
import { Box, Stack } from 'grommet';

import homeStore from './home.store-diamond';
import Controls from './ControlsUnified';
import Galaxy from './Galaxy/Galaxy';
import { Main } from '../../views/Main';

export default class Home extends Component {
  constructor(p) {
    super(p);
    this._ref = React.createRef();
    this.stream = homeStore(p);
    /*    Object.assign(this, injectLocalState({
      streamFactory: galaxyStore,
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
    this.stream.do.setSpeed(0);
    this.stream.do.closeGalaxy();
    this._sub.unsubscribe();
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.size.width !== this.props.size.width)
      || (prevProps.size.height !== this.props.size.height)
    ) {
      if (this.stream) {
        this.stream.do.resizeApp(this.props.size);
      }
    }
  }

  render() {
    const {
      galaxy, arrows, speed, centerHex,
    } = this.state;
    return (
      <Stack active={1} anchor="center">
        <Main ref={this._ref} />
        <Box direction="column" fill height="20rem" align="center">
          {galaxy ? <Galaxy size={this.props.size} galaxy={galaxy} centerHex={centerHex} onClick={this.stream.do.closeGalaxy} /> : (
            <Controls
              arrows={arrows}
              speed={speed}
              onArrowOut={this.stream.do.onArrowOut}
              onArrowOver={this.stream.do.onArrowOver}
              onArrowDown={this.stream.do.onArrowDown}
              setSpeed={this.stream.do.updateSpeed}
              zoom={this.stream.do.zoom}
              stream={this.stream}
            />
          )}
        </Box>
      </Stack>
    );
  }
}
