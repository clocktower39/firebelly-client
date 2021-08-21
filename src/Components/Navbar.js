import React, { useEffect, useState } from 'react';
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
        maxHeight: '139px',
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
    const [pageWidth, setPageWidth] = useState(window.innerWidth);

    useEffect(()=>{

        window.addEventListener('resize', setPageWidth(window.innerWidth))
    },[])
    return (
        <AppBar position='fixed' >
            <Toolbar className={classes.Toolbar} >
                <IconButton color="inherit" component={Link} to="/"><Avatar className={classes.logoImg} src={Logo} alt="Logo" /></IconButton>
                <div style={pageWidth < 800? {display: 'none'}:{display: 'block'}}>
                    <Button className={classes.NavLink} >About</Button>
                    <Button className={classes.NavLink} >Fitness</Button>
                    <Button className={classes.NavLink} >Nutrition</Button>
                    <Button className={classes.NavLink} >Workshops</Button>
                    <Button className={classes.NavLink} >Training</Button>
                </div>
                <div className={classes.NavAccountContainer}>
                    <Button className={classes.NavAccountOptions} style={{color: '#ee2726',}} component={Link} to="/login">Login</Button>
                    <Button className={classes.NavAccountOptions} component={Link} to="/signup">Sign up</Button>
                </div>
            </Toolbar>
        </AppBar>
    )
}
