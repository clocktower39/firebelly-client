import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Grid,
    LinearProgress,
    TextField,
    Typography,
    makeStyles,
    Button
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

    const [trainingCategory, setTrainingCategory] = useState("");
    const handleTrainingCategoryChange = (e) => setTrainingCategory(e.target.value);

    let allTraining = [];
    today.dailyTraining.training.forEach(set => {
        set.forEach(task => {
            allTraining.push({
                goal: task.goals.sets,
                achieved: task.achieved.sets,
            })
        })
    })

    let dailyTrainingAchieved = 0; 
    let dailyTrainingGoal = 1;

    if(today.dailyTraining.training.length > 0){
        dailyTrainingAchieved = allTraining.reduce((a, b) => ({ achieved: a.achieved + b.achieved }) ).achieved;
        dailyTrainingGoal = allTraining.reduce((a, b) => ({ goal: a.goal + b.goal }) ).goal;
    }

    useEffect(()=>{
        setTrainingCategory(today.dailyTraining.trainingCategory);
    },[today])

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
                        <Grid item xs={12}><TextField label="Training Category" onChange={handleTrainingCategoryChange} value={trainingCategory} fullWidth/></Grid>
                        {today.dailyTraining.training.length > 0 ? today.dailyTraining.training.map((group, index) => (
                            <Grid item xs={12} key={index}>
                                <Typography variant="h5">Set {index+1}</Typography>
                                {group.map(exercise => (
                                    <Grid container>
                                        {/* <TextField key={exercise.exercise} fullWidth variant="outlined" label={exercise.exercise} /> */}
                                        <Grid item xs={6} sm={3}><TextField label="Exercise Title" /></Grid>
                                        <Grid item xs={6} sm={3}><TextField label="Sets" /></Grid>
                                        <Grid item xs={6} sm={3}><TextField label="Min Reps" /></Grid>
                                        <Grid item xs={6} sm={3}><TextField label="Max Reps" /></Grid>
                                    </Grid>
                                ))}
                                <Grid item xs={12}>
                                    <Button variant="contained">New Exercise</Button>
                                </Grid>
                            </Grid>
                        )):<></>}
                        <Grid item xs={12}>
                            <Button variant="contained">New Set</Button>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
    )
}
