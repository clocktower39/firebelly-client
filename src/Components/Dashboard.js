import React from 'react'
import { Link } from 'react-router-dom';
import { Container, Typography, makeStyles} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    PageLink: {
        color: 'white',
        textDecoration: 'none',
    },
}))

export default function Dashboard() {
    const classes = useStyles();
    return (
        <Container maxWidth="md">
                    <Typography variant="h4" display="block" align="center">Dashboard</Typography>
                    <Typography variant="h5" component={Link} to="/" display="block" className={classes.PageLink}>Today</Typography>
                    <Typography variant="h5" component={Link} to="/" display="block" className={classes.PageLink}>Weekly View</Typography>
                    <Typography variant="h5" component={Link} to="/" display="block" className={classes.PageLink}>Month View</Typography>
                    <Typography variant="h5" component={Link} to="/" display="block" className={classes.PageLink}>Exervise Library</Typography>
                    <Typography variant="h5" component={Link} to="/" display="block" className={classes.PageLink}>Basic Workouts</Typography>
                    <Typography variant="h5" component={Link} to="/" display="block" className={classes.PageLink}>Need to Know Information</Typography>
        </Container>
    )
}
