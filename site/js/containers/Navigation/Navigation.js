import React, { PureComponent } from 'react';
import {
  Button, DropButton, ResponsiveContext, Box,
} from 'grommet';
import styled from 'styled-components';
import NavGrid from './NavGrid';

const NavItem = styled.div`
margin-top: 1rem;
margin-right: 1rem;
margin-left: -1px;
`;

const NavItemSmall = styled.div`
margin: 2px;
height: 2rem;
`;
const NavButtonInner = styled(Button)`
text-align: center;
`;

const NavButton = (props) => (
  <ResponsiveContext.Consumer>
    {(size) => {
      const Container = NavItemSmall; //  (size === 'small') ? NavItemSmall : NavItem;
      return (
        <Container>
          <NavButtonInner {...props} plain={false} fill={true}>
            {props.children}
          </NavButtonInner>
        </Container>
      );
    }}
  </ResponsiveContext.Consumer>
);

export default class Navigation extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { history } = this.props;
    return (
      <NavGrid>
        <NavButton onClick={() => history.push('/')}>
          Home
        </NavButton>
        <NavButton onClick={() => history.push('/beta')}>
          Beta
        </NavButton>
      </NavGrid>
    );
  }
}
