import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Avatar, Button, IconButton, makeStyles, Toolbar } from '@material-ui/core';
import Logo from '../img/logo.png';

const useStyles = makeStyles({
    Toolbar:{
        margin: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#000000',
        flexWrap: 'nowrap',
        minHeight: '58px',
    },
    logoImg: {
        width: '115px',
        height: '115px',
    },
    NavLink:{
        color: '#FEFFFF',
        padding: '20px',
        fontFamily: 'Cabin',
        fontWeight: 500,
        fontSize: '12px',
        letterSpacing: '0.143em',
        textTransform: 'uppercase',
    },
    NavAccountContainer:{
        display: 'flex',
        flexDirection: 'column',
    },
    NavAccountOptions:{
        color: '#FEFFFF',
        fontFamily: 'Cabin',
        fontWeight: 500,
        fontSize: '12px',
        letterSpacing: '0.143em',
        textTransform: 'uppercase',
    },
});

export default function Navbar() {
    const classes = useStyles();
    return (
        <AppBar position='fixed' >
            <Toolbar className={classes.Toolbar} >
                <IconButton color="inherit" component={Link} to="/"><Avatar className={classes.logoImg} src={Logo} alt="Logo" /></IconButton>
                <div>
                    <Button className={classes.NavLink} >About</Button>
                    <Button className={classes.NavLink} >Fitness</Button>
                    <Button className={classes.NavLink} >Nutrition</Button>
                    <Button className={classes.NavLink} >Workshops</Button>
                    <Button className={classes.NavLink} >Training</Button>
                </div>
                <div className={classes.NavAccountContainer}>
                    <Button className={classes.NavAccountOptions} style={{color: '#ee2726',}}>Login</Button>
                    <Button className={classes.NavAccountOptions} >Sign up</Button>
                </div>
            </Toolbar>
        </AppBar>
    )
}
