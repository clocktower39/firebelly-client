import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';
import AuthRoute from './Components/AuthRoute';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Nutrition from './Components/Nutrition';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import Dashboard from './Components/Dashboard';
import Day from './Components/DailyView/Day';
import Week from './Components/Week';
import Account from './Components/AccountComponents/Account';
import Clients from './Components/Clients';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Switch>
          {/* Default website pages, anyone can access */}
          <Route exact path='/' component={Home} />
          <Route exact path='/nutrition' component={Nutrition} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/signup' component={SignUp} />
          
          {/* Must be logged in and have JWT token to authenticate */}
          <AuthRoute exact path='/dashboard' component={Dashboard} />
          <AuthRoute exact path='/day' component={Day} />
          <AuthRoute exact path='/week' component={Week} />
          <AuthRoute path='/account' component={Account} />
          <AuthRoute path='/clients' component={Clients} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
