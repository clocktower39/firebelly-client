import React from 'react'
import About from '../img/about.jpg';
import { Grid, Slide, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
    root: {
        marginTop: '125px',
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
                    <Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <img className={classes.aboutImg} src={About} alt="about me" />
                    </Slide>
                </Grid>
                <Grid xs={12} sm={6}><Slide direction="left" in={true} mountOnEnter unmountOnExit><div>About</div></Slide></Grid>

            </Grid>
            <Grid container item xs={12} >
                <Grid xs={12} sm={6}>
                    <Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <img className={classes.aboutImg} src={About} alt="about me" />
                    </Slide>
                </Grid>
                <Grid xs={12} sm={6}><Slide direction="left" in={true} mountOnEnter unmountOnExit><div>Fitness</div></Slide></Grid>

            </Grid>
            <Grid container item xs={12} >
                <Grid xs={12} sm={6}>
                    <Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <img className={classes.aboutImg} src={About} alt="about me" />
                    </Slide>
                </Grid>
                <Grid xs={12} sm={6}><Slide direction="left" in={true} mountOnEnter unmountOnExit><div>Nutrition</div></Slide></Grid>

            </Grid>
            <Grid container item xs={12} >
                <Grid xs={12} sm={6}>
                    <Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <img className={classes.aboutImg} src={About} alt="about me" />
                    </Slide>
                </Grid>
                <Grid xs={12} sm={6}><Slide direction="left" in={true} mountOnEnter unmountOnExit><div>Workshops</div></Slide></Grid>

            </Grid>
            <Grid container item xs={12} >
                <Grid xs={12} sm={6}>
                    <Slide direction="right" in={true} mountOnEnter unmountOnExit>
                        <img className={classes.aboutImg} src={About} alt="about me" />
                    </Slide>
                </Grid>
                <Grid xs={12} sm={6}>
                    <Slide direction="left" in={true} mountOnEnter unmountOnExit><div>Personal Training</div></Slide></Grid>

            </Grid>
        </Grid>
    )
}
