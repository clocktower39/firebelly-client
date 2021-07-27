import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { login } from "./Redux/actions";
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    dispatch(login()).then(setLoading(false));
  // eslint-disable-next-line
  },[])
  return loading?<Typography variant="h6" align="center" >Loading</Typography>:(
    <Router>
      <Navbar />
        <Switch>
          <Route exact path='/' component={Home} />
        </Switch>
    </Router>
  );
}

export default App;
