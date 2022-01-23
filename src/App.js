import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import Progress from './Components/Progress';
import MyAccount from "./Components/AccountComponents/MyAccount";
import AccountTasks from "./Components/AccountComponents/AccountTasks";
import Biometrics from "./Components/AccountComponents/Biometrics";
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          {/* Default website pages, anyone can access */}
          <Route exact path='/' element={<Home />} />
          <Route exact path='/nutrition' element={<Nutrition />} />
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/signup' element={<SignUp />} />

          {/* Must be logged in and have JWT token to authenticate */}
          <Route exact path="/dashboard" element={<AuthRoute />} >
            <Route exact path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route exact path="/day" element={<AuthRoute />} >
            <Route exact path="/day" element={<Day />} />
          </Route>

          <Route exact path="/week" element={<AuthRoute />} >
            <Route exact path="/week" element={<Week />} />
          </Route>

          <Route exact path="/account/*" element={<AuthRoute />} >
            <Route exact path="/account/*/*" element={<Account />}>
            <Route index={true} exact path="" element={<MyAccount />} />
            <Route index={false} exact path="tasks" element={<AccountTasks />} />
            <Route index={false} exact path="biometrics" element={<Biometrics />} />
            </Route>
          </Route>

          <Route exact path="/clients" element={<AuthRoute />} >
            <Route exact path="/clients" element={<Clients />} />
          </Route>

          <Route exact path="/progress" element={<AuthRoute />} >
            <Route exact path="/progress" element={<Progress />} />
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
