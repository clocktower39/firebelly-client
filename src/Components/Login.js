import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Button, TextField, Grid, Paper, makeStyles } from '@material-ui/core';
import { loginUser } from '../Redux/actions';

const useStyles = makeStyles({
    root: {
        padding: '125px 0',
        textAlign: 'center',
    },
    textField: {
        margin: '12px',
    },
    button: {
    },

});

export const Login = (props) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [error, setError] = useState(false);
    const [email, setEmail] = useState((localStorage.getItem('email')) ? localStorage.getItem('email') : '');
    const [password, setPassword] = useState('');
    const [disableButtonDuringLogin, setDisableButtonDuringLogin] = useState(false);
    const user = useSelector(state => state.user);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLoginAttempt(e);
        }
    }
    const handleLoginAttempt = (e) => {
        if (email && password) {
            setDisableButtonDuringLogin(true);
            dispatch(loginUser(JSON.stringify({ email: email, password: password }))).then(res => {
                if (res.error) {
                    setError(true);
                }
                setDisableButtonDuringLogin(false);
            });
            localStorage.setItem('email', email);
        }
        else {
            setDisableButtonDuringLogin(false);
            setError(true);
        }
    }

    if (user.email) {
        return (<Redirect to={{ pathname: '/' }} />)
    }
    return (
        <Grid container className={classes.root}>
            <Grid item xs={12}>
                <Paper>
                    <TextField
                        error={error === true ? true : false}
                        helperText={error === true ? "Please enter your email" : false}
                        className={classes.textField}
                        label="Email"
                        value={email}
                        onKeyDown={(e) => handleKeyDown(e)}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Paper>
            </Grid>
            <Grid item xs={12}>
                <Paper>
                    <TextField
                        error={error === true ? true : false}
                        helperText={(error === true) ? "Please enter your password" : false}
                        className={classes.textField}
                        label="Password"
                        value={password}
                        type="password"
                        onKeyDown={(e) => handleKeyDown(e)}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            (e.target.value === '') ? setError(true) : setError(false);
                        }}
                    />
                </Paper>
            </Grid>
            <Grid item xs={12}>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={(e) => handleLoginAttempt(e)}
                    disabled={disableButtonDuringLogin}
                >
                    Login
                </Button>
            </Grid>
        </Grid>
    )
}

export default Login