import React from 'react';
import { withSize } from 'react-sizeme';
import Home from './Home';

export default withSize({
  monitorHeight: true,
  monitorWidth: true,
  refreshRate: 200,
})(Home);
