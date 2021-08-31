import React from 'react'
import { useSelector } from 'react-redux';
import { Accordion, AccordionDetails, AccordionSummary, Container, Grid, LinearProgress, Typography, makeStyles } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    heading: {
        fontWeight: 600,
    },
}))

export default function Week() {
    const classes = useStyles();
    const weeklyView = useSelector(state => state.calander.weeklyView);

    const dayOfWeek = (index) => {
        switch(index){
            case 0:
                return "Sunday";
            case 1:
                return "Monday";
            case 2:
                return "Tuesday";
            case 3:
                return "Wednesday";
            case 4:
                return "Thursday";
            case 5:
                return "Friday";
            case 6:
                return "Saturday";
            default:
                return "Error"
        }
    }

    return (
        <Container maxWidth="md" style={{ height: '100%', }}>
            <Typography variant="h5" gutterBottom style={{color: '#fff'}}>Weekly View</Typography>
            {weeklyView.weeklyTraining.map((day,index) => (
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                    >
                        <Grid container alignItems="center">
                            <Grid item xs={3}><Typography variant="h5" className={classes.heading}>{dayOfWeek(index)}</Typography></Grid>
                            <Grid item xs={9} ><LinearProgress variant="determinate" value={50} /></Grid>
                        </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="h6">Training Category: <Typography variant="body1" display="inline">{day.trainingCategory}</Typography></Typography>
                    </AccordionDetails>
                    <AccordionDetails>
                    <Typography variant="h6">Daily Tasks Status: <Typography variant="body1" display="inline"></Typography></Typography>
                    </AccordionDetails>
                    <AccordionDetails>
                        <Typography variant="h6">Nutrition: <Typography variant="body1" display="inline"></Typography></Typography>
                    </AccordionDetails>
                </Accordion>    
            ))}
            
        </Container>
    )
}
