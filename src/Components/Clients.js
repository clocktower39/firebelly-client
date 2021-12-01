import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography } from '@mui/material';

export default function Clients() {
  const user = useSelector(state => state.user);
  
  return user.isTrainer? (
    <Container>
      <Typography variant="h5" textAlign="center" >Training Clients</Typography>
    </Container>
  )
  :<></>
}
