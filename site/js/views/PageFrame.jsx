import { Box } from 'grommet';
import React from 'react';

export default ({ children }) => (
  <Box pad={({ vertical: 'medium', horizontal: 'large' })} direction="column" alignContent="stretch" fill="vertical" style={({ overflowY: 'auto' })}>
    {children}
  </Box>
);
