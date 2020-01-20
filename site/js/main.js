import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Main from './containers/Main';

const root = document.getElementById('root');

// @TODO: paranoid code for validating root.

const load = () => render(
  <BrowserRouter>
    <Main />
  </BrowserRouter>,
  root,
);

// why the indirect load? because if the user isn't logged in we chuck them without engaging any render actions.

load();
