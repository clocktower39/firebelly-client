import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, FormatListBulleted, FitnessCenter, Assessment, Settings } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';


export default function Navbar() {
  const location = useLocation();
  const [value, setValue] = useState(location.pathname);
  const [disableNav, setDisableNav] = useState(false);

  const handleChange = (event, newValue) => {
    setDisableNav(true);
    setValue(newValue);
    setDisableNav(false);
  };


  useEffect(() => {
    handleChange(null, location.pathname);
  }, [location.pathname])

  return (
    <BottomNavigation value={value} onChange={handleChange} sx={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      backgroundColor: '#232323',
      color: 'white',
    }} >
      <BottomNavigationAction sx={{ color: 'white', }} disabled={disableNav} label="Progress" value="/progress" to='/progress' icon={<Assessment />} component={Link} />
      <BottomNavigationAction sx={{ color: 'white', }} disabled={disableNav} label="Tasks" value="/tasks" to='/tasks' icon={<FormatListBulleted />} component={Link} />
      <BottomNavigationAction sx={{ color: 'white', }} disabled={disableNav} label="Dashboard" value="/" to='/' icon={<Home />} component={Link} />
      <BottomNavigationAction sx={{ color: 'white', }} disabled={disableNav} label="Training" value="/training" to='/training' icon={<FitnessCenter />} component={Link} />
      <BottomNavigationAction sx={{ color: 'white', }} disabled={disableNav} label="Settings" value="/account" to='/account' icon={<Settings />} component={Link} />
    </BottomNavigation>
  );
}