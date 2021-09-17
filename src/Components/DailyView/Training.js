import React from 'react';
import { useSelector } from 'react-redux';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Grid,
    LinearProgress,
    TextField,
    Typography,
    makeStyles
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    heading: {},
    ModalPaper: {
        position: 'absolute',
        padding: '17.5px',
        width: '65%',
        backgroundColor: '#fcfcfc',
        left: '50%',
        transform: 'translate(-50%, 50%)',
    },
}))

export default function Training() {
    const classes = useStyles();
    const today = useSelector(state => state.calander.dailyView );

    let allTraining = [];
    today.dailyTraining.training.forEach(set => {
        set.forEach(task => {
            allTraining.push({
                goal: task.goals.sets,
                achieved: task.achieved.sets,
            })
        })
    })

    const dailyTrainingAchieved = allTraining.reduce((a, b) => ({ achieved: a.achieved + b.achieved }) ).achieved;
    const dailyTrainingGoal = allTraining.reduce((a, b) => ({ goal: a.goal + b.goal }) ).goal;

    return (
        <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={3}><Typography className={classes.heading}>Training</Typography></Grid>
                        <Grid item xs={9} ><LinearProgress variant="determinate" value={(dailyTrainingAchieved/dailyTrainingGoal)*100} /></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {today.dailyTraining.training.map((group, index) => (
                            <Grid item xs={12} key={index}>
                                <Typography variant="h5">Set {index+1}</Typography>
                                {group.map(exercise => (
                                    <TextField key={exercise.exercise} fullWidth variant="outlined" label={exercise.exercise} />
                                ))}
                            </Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>
    )
}
