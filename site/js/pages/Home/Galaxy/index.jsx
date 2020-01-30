import React from 'react';
import { withSize } from 'react-sizeme';
import { withRouter } from 'react-router-dom';
import { hoc } from '../../../util/reactHOC';
import Galaxy from './Galaxy';
import siteStore from '../../../store/site.store';

export default withRouter(withSize({
  monitorHeight: true,
  monitorWidth: true,
  refreshRate: 200,
})(hoc(Galaxy, { stream: siteStore, streamToProps: (stream) => stream.view })));
