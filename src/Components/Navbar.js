import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/actions';
import { Link } from 'react-router-dom';
import { AppBar, Avatar, Button, IconButton, List, ListItem, ListItemText, Collapse, makeStyles, Toolbar } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import Logo from '../img/logo.png';

const useStyles = makeStyles(theme=>({
    Toolbar: {
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
    NavLink: {
        color: '#FEFFFF',
        padding: '20px',
        fontFamily: 'Cabin',
        fontWeight: 500,
        fontSize: '12px',
        letterSpacing: '0.143em',
        textTransform: 'uppercase',
    },
    NavAccountContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    NavAccountOptions: {
        color: '#FEFFFF',
        fontFamily: 'Cabin',
        fontWeight: 500,
        fontSize: '12px',
        letterSpacing: '0.143em',
        textTransform: 'uppercase',
    },
    nested: {
      paddingLeft: theme.spacing(4),
      backgroundColor: '#000000',
      '&:hover': {
          backgroundColor: '#222222',
      }
    },
}));

export default function Navbar() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [pageWidth, setPageWidth] = useState(window.innerWidth);
    const user = useSelector(state => state.user);
    const [isListOpen, setIsListOpen] = useState(false);

    useEffect(() => {

        window.addEventListener('resize', setPageWidth(window.innerWidth))
    }, [])
    return (
        <AppBar position='fixed' >
            <Toolbar className={classes.Toolbar} >
                <IconButton color="inherit" component={Link} to="/"><Avatar className={classes.logoImg} src={Logo} alt="Logo" /></IconButton>
                <div style={pageWidth < 800 ? { display: 'none' } : { display: 'block' }}>
                    <Button className={classes.NavLink} >About</Button>
                    <Button className={classes.NavLink} >Fitness</Button>
                    <Button className={classes.NavLink} >Nutrition</Button>
                    <Button className={classes.NavLink} >Workshops</Button>
                    <Button className={classes.NavLink} >Training</Button>
                </div>
                <div className={classes.NavAccountContainer}>
                    {user.email ?
                        (<List component="nav" aria-labelledby="nested-list-subheader">
                            <ListItem button onClick={()=>setIsListOpen(!isListOpen)}>
                                <ListItemText>{user.firstName} {user.lastName}</ListItemText>
                                {isListOpen ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                            <Collapse in={isListOpen} timeout="auto" unmountOnExit style={{position: 'absolute'}}>
                                <List component="div" disablePadding>
                                    <ListItem button component={Link} to="/dashboard" className={classes.nested}>
                                        <ListItemText>Dashboard</ListItemText>
                                    </ListItem>
                                    <ListItem button  onClick={()=>dispatch(logoutUser())} className={classes.nested}>
                                        <ListItemText>Logout</ListItemText>
                                    </ListItem>
                                </List>
                            </Collapse>
                        </List>) :
                        (
                            <>
                                <Button className={classes.NavAccountOptions} style={{ color: '#ee2726', }} component={Link} to="/login">Login</Button>
                                <Button className={classes.NavAccountOptions} component={Link} to="/signup">Sign up</Button>
                            </>
                        )
                    }
                </div>
            </Toolbar>
        </AppBar>
    )
}
