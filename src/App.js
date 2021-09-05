import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import { theme } from './theme';
import AuthRoute from './Components/AuthRoute';
import Navbar from './Components/Navbar';
// import Home from './Components/Home';
import AltHome from './Components/AltHome';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import Dashboard from './Components/Dashboard';
import Today from './Components/Today';
import Week from './Components/Week';
import Account from './Components/AccountComponents/Account';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <div style={{ marginTop: '150px' }}></div>
        <Switch>
          <Route exact path='/' component={AltHome} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/signup' component={SignUp} />
          <AuthRoute exact path='/dashboard' component={Dashboard} />
          <AuthRoute exact path='/today' component={Today} />
          <AuthRoute exact path='/week' component={Week} />
          <AuthRoute exact path='/account' component={Account} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
