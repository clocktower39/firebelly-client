import React from 'react'
import { Button, Container, Grid, TextField } from '@material-ui/core';

export default function SignUp() {
    return (
        <Container maxWidth="sm">
            <Grid spacing={2}>
                <Grid container item xs={12} justifyContent="center">
                    <TextField 
                        label="Email"
                    />
                </Grid>
                <Grid container item xs={12} justifyContent="center">
                    <TextField
                        label="Password"
                    />
                </Grid>
                <Grid container item xs={12} justifyContent="center">
                    <Button>Sign up</Button>
                </Grid>
            </Grid>
        </Container>
    )
}
