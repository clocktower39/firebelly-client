import React from 'react'
import Navbar from "./Navbar";
import { Container, Paper, Typography, } from '@mui/material'

export default function Fitness() {
  return (
    <>
      <Navbar />
      <Container >
        <Typography variant="h3" style={{ color: 'white', textAlign: 'center', }} gutterBottom >Fitness</Typography>
        <Paper elevation="6" style={{ padding: '5px 25px' }}>
          <Typography >
            Page coming soon.
          </Typography>
        </Paper>
      </Container>
    </>
  )
}
