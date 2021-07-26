import React, { Component, Fragment } from 'react';
import './index.scss';
import Header from '../Header'
import { createTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import Tabs from '../Tabs'

const theme = createTheme({
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



