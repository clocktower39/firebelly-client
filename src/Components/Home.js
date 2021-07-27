import React from 'react'
import AboutImg from '../img/about.jpg';
import FitnessImg from '../img/fitness.jpg';
import DeadliftImg from '../img/deadlift.jpg';
import NutritionImg from '../img/nutrition2.jpg';
import WorkshopImg from '../img/workshop.jpg';
import { Container, Grid, Paper, Slide, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
    root: {
        marginTop: '125px',
    },
    Paper: {
        margin: '25px 0'
    },
    sectionImg: {
        width: '100%',
        height: '100%',
    },
});

export default function Home() {
    const classes = useStyles();

    return (
        <Container maxWidth="md">
            <Grid container className={classes.root} spacing={3} >

                <Grid container item xs={12} >
                </Grid>

                <Paper className={classes.Paper}>
                    <Grid container item xs={12} >
                        <Grid xs={12} sm={6}>
                            <Slide timeout={1000} direction="right" in={true} mountOnEnter unmountOnExit>
                                <img className={classes.sectionImg} src={AboutImg} alt="about me" />
                            </Slide>
                        </Grid>
                        <Grid xs={12} sm={6}><Slide timeout={1000} direction="left" in={true} mountOnEnter unmountOnExit><div><Typography align="center" variant="h3">About</Typography><Typography align="center" variant="body1"> Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple </Typography></div></Slide></Grid>
                    </Grid>
                </Paper>
                <Paper className={classes.Paper}>
                    <Grid container item xs={12} >
                        <Grid xs={12} sm={6}>
                            <Slide timeout={1000} direction="right" in={true} mountOnEnter unmountOnExit>
                                <img className={classes.sectionImg} src={FitnessImg} alt="" />
                            </Slide>
                        </Grid>
                        <Grid xs={12} sm={6}><Slide timeout={1000} direction="left" in={true} mountOnEnter unmountOnExit><div><Typography align="center" variant="h3">Fitness</Typography><Typography align="center" variant="body1"> Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple </Typography></div></Slide></Grid>
                    </Grid>
                </Paper>
                <Paper className={classes.Paper}>
                    <Grid container item xs={12} >
                        <Grid xs={12} sm={6}>
                            <Slide timeout={1000} direction="right" in={true} mountOnEnter unmountOnExit>
                                <img className={classes.sectionImg} src={NutritionImg} alt="" />
                            </Slide>
                        </Grid>
                        <Grid xs={12} sm={6}><Slide timeout={1000} direction="left" in={true} mountOnEnter unmountOnExit><div><Typography align="center" variant="h3">Nutrition</Typography><Typography align="center" variant="body1"> Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple </Typography></div></Slide></Grid>
                    </Grid>
                </Paper>
                <Paper className={classes.Paper}>
                    <Grid container item xs={12} >
                        <Grid xs={12} sm={6}>
                            <Slide timeout={1000} direction="right" in={true} mountOnEnter unmountOnExit>
                                <img className={classes.sectionImg} src={WorkshopImg} alt="" />
                            </Slide>
                        </Grid>
                        <Grid xs={12} sm={6}><Slide timeout={1000} direction="left" in={true} mountOnEnter unmountOnExit><div><Typography align="center" variant="h3">Workshops</Typography><Typography align="center" variant="body1"> Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple </Typography></div></Slide></Grid>
                    </Grid>
                </Paper>
                <Paper className={classes.Paper}>
                    <Grid container item xs={12} >
                        <Grid xs={12} sm={6}>
                            <Slide timeout={1000} direction="right" in={true} mountOnEnter unmountOnExit>
                                <img className={classes.sectionImg} src={DeadliftImg} alt="" />
                            </Slide>
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <Slide timeout={1000} direction="left" in={true} mountOnEnter unmountOnExit><div><Typography align="center" variant="h3">Training</Typography><Typography align="center" variant="body1"> Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple Lorem Ipsum Crap tango alpha orange pineapple </Typography></div></Slide></Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Container>
    )
}
