import React from 'react';
import {Grid, ResponsiveContext} from 'grommet';

export default ({children}) => {
  return <ResponsiveContext.Consumer>
    {(size) => {
      switch (size) {
        case 'small':
        case 'medium':
        case 'large':
          return <Grid
            rows={['5rem', '3rem', 'auto']}
            columns={['auto']}
            gap="none"
            pad="none"
            fill={true}
            areas={[
              {name: 'header', start: [0, 0], end: [0, 0]},
              {name: 'nav', start: [0, 1], end: [0, 1]},
              {name: 'main', start: [0, 2], end: [0, 2]},
            ]}
            className="site-frame"
          >{children}</Grid>
          break;

        default:
          return <Grid
            rows={['5rem', 'auto']}
            columns={['10rem', 'auto']}
            gap="none"
            pad="none"
            fill={true}
            areas={[
              {name: 'header', start: [0, 0], end: [1, 0]},
              {name: 'nav', start: [0, 1], end: [0, 1]},
              {name: 'main', start: [1, 1], end: [1, 1]},
            ]}
            className="site-frame"
          >{children}</Grid>
      }
    }}
  </ResponsiveContext.Consumer>
}
