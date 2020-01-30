import React from 'react';
import { withSize } from 'react-sizeme';
import { hoc } from '../../util/reactHOC';
import Home from './Home';
import siteStore from '../../store/site.store';

export default withSize({
  monitorHeight: true,
  monitorWidth: true,
  refreshRate: 200,
})(hoc(Home, { stream: siteStore, streamToProps: (stream) => stream.view }));
