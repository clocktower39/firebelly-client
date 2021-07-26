import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Avatar, Button, IconButton, makeStyles, Toolbar } from '@material-ui/core';
import { Home, Search, Create } from '@material-ui/icons';
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
    },
});

export default function Navbar() {
    const classes = useStyles();
    return (
        <AppBar position='fixed' >
            <Toolbar className={classes.Toolbar} >
                <div style={{height: '0px',marginTop: '25px',}}><IconButton color="inherit" component={Link} to="/"><Avatar className={classes.logoImg} src={Logo} alt="Logo" /></IconButton></div>
                <Button className={classes.NavLink} >About</Button>
                <Button className={classes.NavLink} >Fitness</Button>
                <Button className={classes.NavLink} >Nutrition</Button>
                <Button className={classes.NavLink} >Workshops</Button>
                <Button className={classes.NavLink} >Personal Training</Button>
            </Toolbar>
        </AppBar>
    )
}
