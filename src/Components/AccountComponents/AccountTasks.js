import React from 'react'
import { Button, Container, Paper, Typography, Grid } from '@material-ui/core';

export default function AccountTasks() {
    return (
        <Container maxWidth="md" style={{ height: '100%', }}>
            <Typography variant="h5" gutterBottom style={{color: '#fff'}}>Account Default Daily Tasks</Typography>
            <Grid container component={Paper} spacing={2}>
                <Grid item xs={12}><Typography variant="body1" >tasks</Typography></Grid>
                <Grid container justifyContent="center" item xs={12}><Button variant="contained">Edit</Button></Grid>
            </Grid>
        </Container>
    )
}
