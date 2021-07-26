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
        position: 'fixed',
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
});

export default function Navbar() {
    const classes = useStyles();
    return (
        <AppBar position='fixed' >
            <Toolbar className={classes.Toolbar} >
                <div style={{height: '0px',marginTop: '25px',}}><IconButton color="inherit" component={Link} to="/"><Avatar className={classes.logoImg} src={Logo} alt="Logo" /></IconButton></div>
                <div>
                <Button className={classes.NavLink} >About</Button>
                <Button className={classes.NavLink} >Fitness</Button>
                <Button className={classes.NavLink} >Nutrition</Button>
                <Button className={classes.NavLink} >Workshops</Button>
                <Button className={classes.NavLink} >Personal Training</Button>
                </div>
                <div>Login<br />Sign up</div>
            </Toolbar>
        </AppBar>
    )
}
