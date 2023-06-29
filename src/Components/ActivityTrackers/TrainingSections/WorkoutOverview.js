import React from 'react'
import { Button, Grid, Paper, Typography } from '@mui/material';

const WorkoutSet = (props) => {
    const { set } = props;
    return (
        <>
            <Paper sx={{ padding: '0 5px'}}>
                <Typography variant='h5' >Set {set.index++}</Typography>
                {set.workoutSet.map(workoutSetExercise => {
                    return (
                        <Grid container sx={{ margin: '5px 0'}}>
                            <Grid container item xs={5} >{workoutSetExercise.exercise}</Grid>
                            <Grid container item xs={7} >{workoutSetExercise.goals.exactReps.length} sets: {workoutSetExercise.goals.exactReps.join(', ')} reps</Grid>
                        </Grid>
                    )
                })}
            </Paper>
        </>
    )
}

export default function WorkoutOverview({ workout }) {

    return workout.training.length > 0 ?
        (
            <Paper>
                <Typography variant='h5' >{workout.title}</Typography>
                <Typography variant='h6' >{workout.category.join(', ')}</Typography>
                {workout.training.map((workoutSet, index) => {
                    const set = { workoutSet, index }
                    return <Paper><WorkoutSet key={index} set={set} /></Paper>
                })}
                <Grid container item xs={12} sx={{ justifyContent: 'center', padding: '5px'}}><Button variant='contained'>Start</Button></Grid>
            </Paper>
        ) : null;
}
