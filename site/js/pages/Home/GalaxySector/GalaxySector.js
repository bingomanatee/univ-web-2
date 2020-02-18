import React, { Component } from 'react';
import styled from 'styled-components';
import { Box, Button, Stack } from 'grommet';

import galaxyStore from './galaxySector.store';
import { Main } from '../../../views/Main';
import SvgOut from '../../../views/icons/Out';

const ButtonWrapper = styled.div`
position: absolute;
left: 0;
top: 0;
width: 200px;
height: 200px;
`;

const Frame = styled.section`
width: 100%;
height: 100%;
position: relative;
`;

const FrameItem = styled.div`
position: absolute;
width: 100%;
height: 100%;
display: flex;
flex-direction: row;
align-content: center;
align-items: center;
`;

export default class GalaxySector extends Component {
  constructor(p) {
    super(p);
    this._ref = React.createRef();
    this.stream = galaxyStore(p);
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
    this.stream.do.setStopped(true);
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
    return (
      <Frame active={1} anchor="center" fill id="galaxy-stack">
        <FrameItem>
          <Main transparent ref={this._ref} />
        </FrameItem>
        <ButtonWrapper>
          <SvgOut onClick={this.stream.do.close} />
        </ButtonWrapper>
      </Frame>
    );
  }
}
