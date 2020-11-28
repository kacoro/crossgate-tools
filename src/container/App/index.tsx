import React, { Component, Fragment } from 'react';
import './index.scss';
import Header from '../Header'
import Container from '@material-ui/core/Container';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import Tabs from '../Tabs'
const fs = require('fs')
import Box from '@material-ui/core/Box';
import { flexbox } from '@material-ui/system';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    type: 'dark'
  },
});

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
      <Fragment>
        <div id="header">
          <Header></Header>
          </div>
          <div id="main">
          <Tabs  />
          </div>
       
      </Fragment>
      </ThemeProvider>
    )
  }
}

export default App;



