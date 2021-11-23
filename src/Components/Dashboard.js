import React from 'react'
import { Link } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(theme => ({
    root: {
        paddingTop: '25px', 
    },
    PageLink: {
        color: 'white',
        textDecoration: 'none',
    },
}))

export default function Dashboard() {
    const classes = useStyles();
    return (
        <Container maxWidth="md" className={classes.root}>
                    <Typography variant="h4" display="block" align="center">Dashboard</Typography>
                    <Typography variant="h5" component={Link} to="/day" display="block" className={classes.PageLink}>Daily</Typography>
                    <Typography variant="h5" component={Link} to="/week" display="block" className={classes.PageLink}>Weekly View</Typography>
                    <Typography variant="h5" component={Link} to="/month" display="block" className={classes.PageLink}>Month View</Typography>
                    <Typography variant="h5" component={Link} to="/exerciselibrary" display="block" className={classes.PageLink}>Exercise Library</Typography>
                    <Typography variant="h5" component={Link} to="/workouts" display="block" className={classes.PageLink}>Basic Workouts</Typography>
                    <Typography variant="h5" component={Link} to="/information" display="block" className={classes.PageLink}>Need to Know Information</Typography>
        </Container>
    )
}
