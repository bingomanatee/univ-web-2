import React, { PureComponent } from 'react';
import { Box, Text, Button } from 'grommet';

export default class SiteHeader extends PureComponent {
  render() {
    return (
      <Box direction="row" background="brand" gap="medium" pad="none" align="center"
           alignContent="stretch'"
           as="header"
           fill="vertical"
           className="SiteHeaderContainer">
        <Box basis="300px" direction="column" className="logo" align="center">
          <img src="/img/logo.svg" />
          <Text
            as="div"
            size="1.25rem"
            color="accent-3"
            style={({ fontFamily: 'LotaGrotesqueAlt2-Black' })}
          >
SITE NAME
          </Text>
        </Box>
        <Box direction="row-reverse" fill align="center" className="nav">
          <div style={({ padding: '1rem' })}>
            <Button plain href="/logout">User "Fred Smith"</Button>
          </div>
        </Box>
      </Box>
    );
  }
}
