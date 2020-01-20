import React, {PureComponent} from 'react';
import {Switch, Route} from 'react-router-dom';
import {Grommet, Grid, Box} from 'grommet';

import SiteHeader from '../SiteHeader';
import Content from '../../views/Content';
import Navigation from '../Navigation';

import MainGrid from './MainGrid';

// pages

import Home from '../pages/Home';
import theme from '../../theme';

export default class Main extends PureComponent {

  render() {
    return (
      <main>
        <Grommet theme={theme} full>
          <Content>
            <Switch>
              <Route path="/" exact component={Home}/>
              <Route component={Home}/>
            </Switch>
          </Content>
        </Grommet>
      </main>
    );
  }
}
