import React, { Component } from 'react';
import styled from 'styled-components';
import { Box, Button, Stack } from 'grommet';

import galaxyStore from './galaxy.store';
import { Main } from '../../../views/Main';
import SvgOut from '../../../views/icons/Out';

const ButtonWrapper = styled.div`
position: absolute;
left: 0;
top: 0;
`;

export default class Galaxy extends Component {
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
      <Stack active={1} anchor="center" fill id="galaxy-stack">
        <Main transparent>
          <Main transparent ref={this._ref} />
          <ButtonWrapper>
            <SvgOut onClick={this.stream.do.close} />
          </ButtonWrapper>
        </Main>
      </Stack>
    );
  }
}
