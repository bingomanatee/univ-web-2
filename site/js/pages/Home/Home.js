import React, { Component } from 'react';
import { Box } from 'grommet';
import styled from 'styled-components';
import homeStore from './home.store-diamond';
import Controls from './ControlsSingular';
import GalaxySector from './GalaxySector';
import Galaxy from './Galaxy';
import { Main } from '../../views/Main';

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
justify-content: center;
`;

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
      sector, arrows, speed, centerHex, galaxy, firstLoad,
    } = this.state;
    return (
      <Frame>
        <FrameItem>
          <Main id="galaxy-display" ref={this._ref} />
        </FrameItem>
        {firstLoad
          ? (
            <FrameItem>
              {sector ? (
                <GalaxySector
                  size={this.props.size}
                  galaxy={galaxy}
                  sector={sector}
                  centerHex={centerHex}
                  onGalaxy={this.stream.do.chooseGalaxy}
                  onClose={this.stream.do.closeSector}
                />
              ) : (
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
            </FrameItem>
          ) : ''}
        { galaxy ? (
          <FrameItem>
            <Galaxy
              size={this.props.size}
              sector={sector}
              galaxy={galaxy}
              onClose={this.stream.do.closeGalaxy}
            />
          </FrameItem>
        ) : ''}
      </Frame>
    );
  }
}
