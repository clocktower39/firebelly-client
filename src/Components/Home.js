import React from 'react'
import About from '../img/about.jpg';
import { Grid, Paper, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
    root: {
        marginTop: '250px',
    },
    aboutImg: {
        width: '125px',
        height: '125px',
    },
});

export default function Home() {
    const classes = useStyles();

    return (
        <Grid container className={classes.root} >
            <Grid container item xs={12} >
                <Grid xs={12} sm={6}>
                    <img className={classes.aboutImg} src={About} alt="about me" /></Grid>
                <Grid xs={12} sm={6}><div>About</div></Grid>

            </Grid>
            <Grid container item xs={12} >
                <Grid xs={12} sm={6}>
                    <img className={classes.aboutImg} src={About} alt="about me" /></Grid>
                <Grid xs={12} sm={6}><div>Fitness</div></Grid>

            </Grid>
            <Grid container item xs={12} >
                <Grid xs={12} sm={6}>
                    <img className={classes.aboutImg} src={About} alt="about me" /></Grid>
                <Grid xs={12} sm={6}><div>Nutrition</div></Grid>

            </Grid>
            <Grid container item xs={12} >
                <Grid xs={12} sm={6}>
                    <img className={classes.aboutImg} src={About} alt="about me" /></Grid>
                <Grid xs={12} sm={6}><div>Workshops</div></Grid>

            </Grid>
            <Grid container item xs={12} >
                <Grid xs={12} sm={6}>
                    <img className={classes.aboutImg} src={About} alt="about me" /></Grid>
                <Grid xs={12} sm={6}><div>Personal Training</div></Grid>

            </Grid>
        </Grid>
    )
}
