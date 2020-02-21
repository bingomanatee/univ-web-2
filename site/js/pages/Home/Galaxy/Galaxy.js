import React, { Component } from 'react';
import styled from 'styled-components';
import { Box, Button, Stack } from 'grommet';

import galaxyStore from './galaxy.store';
import galaxyControlStore from './galaxy.control.store';
import { Main } from '../../../views/Main';
import SvgOut from '../../../views/icons/Out';
import PartControl from './PartControl';

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
  h2 {
  position: absolute;
  left: auto;
  right: auto;
  top: 1rem;
  font-size: 1rem;
  text-align: center;
  width: 100%;
  }
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

export default class Galaxy extends Component {
  constructor(p) {
    super(p);
    this._ref = React.createRef();
    this._overlayRef = React.createRef();
    this.stream = galaxyStore(p);
    this.controlStream = galaxyControlStore(this.stream, p.size);
    this.state = this.stream.value;
  }

  componentDidMount() {
    this.mounted = true;
    this._sub = this.stream.subscribe((s) => {
      if (this.mounted) {
        this.setState(s.value);
      }
    }, (e) => {
      console.log('-stream error: ', e);
    });

    const ele = this._ref.current;

    this.stream.do.tryInit(ele, this.props.size);
    this.controlStream.do.tryInit(this._overlayRef.current, this.props.size);
  }

  componentWillUnmount() {
    this.mounted = false;
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
      <Frame active={1} anchor="center" id="galaxy-stack">
        <h2>
          Galaxy sector
          {this.props.sector.toString()}
        </h2>
        <FrameItem>
          <Main transparent ref={this._ref} />
        </FrameItem>
        <FrameItem>
          <Main transparent ref={this._overlayRef} />
        </FrameItem>
        <ButtonWrapper>
          <SvgOut onClick={this.stream.do.close} />
        </ButtonWrapper>
      </Frame>
    );
  }
}
