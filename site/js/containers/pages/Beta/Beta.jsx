import {
  Text, TextInput, Box, Button,
} from 'grommet';
import React, { Component } from 'react';
import betaStore from './beta.store';
import PageFrame from '../../../views/PageFrame';

export default class Beta extends Component {
  constructor(props) {
    // const { match } = props;
    super(props);

    this.store = betaStore(props);

    this.state = { ...this.store.state };
  }

  componentWillUnmount() {
    if (this._sub) this._sub.unsubscribe();
  }

  componentDidMount() {
    this._sub = this.store.subscribe(({ state }) => {
      this.setState(state);
    }, (err) => {
      console.log('beta store error: ', err);
    });
  }

  render() {
    return (
      <PageFrame>
        <h1>Beta Page</h1>
      </PageFrame>
    );
  }
}
