import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Button, Typography, IconButton, MobileStepper, } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight, AddCircle } from '@mui/icons-material';
import SwipeableViews from 'react-swipeable-views';
import Exercise from "./Exercise";

function SwipeableSet(props) {
    const {
        localTraining,
        editMode,
        removeExercise,
        setLocalTraining,
        newExercise,
    } = props;
    const [activeStep, setActiveStep] = useState(0);
    const maxSteps = localTraining.length;
    const ref = useRef(null);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStepChange = (step) => {
        setActiveStep(step);
    };

    useEffect(() => {
        ref.current.updateHeight()
    }, [localTraining, editMode])

    return (
        <Box sx={{ maxWidth: '100%', flexGrow: 1 }}>
            <SwipeableViews
                axis="x"
                index={activeStep}
                onChangeIndex={handleStepChange}
                enableMouseEvents
                animateHeight
                ref={ref}
            >
                {localTraining.map((group, index) => (
                    <div key={`training-indexes-${index}/${localTraining.length}`}>
                        <Grid item xs={12} >
                            <Grid container item xs={12}>
                                <Grid item container xs={12} alignContent="center">
                                    <Typography variant="h5" gutterBottom>
                                        Set {index + 1}
                                    </Typography>
                                </Grid>
                            </Grid>
                            {group.length > 0 && group.map((exercise, exerciseIndex) => (
                                <Exercise
                                    key={`exercise-${exercise._id}-${exerciseIndex}`}
                                    editMode={editMode}
                                    exercise={exercise}
                                    setIndex={index}
                                    exerciseIndex={exerciseIndex}
                                    removeExercise={removeExercise}
                                    localTraining={localTraining}
                                    setLocalTraining={setLocalTraining}
                                />
                            ))}
                            <Grid container item xs={12}>
                                <Grid container item xs={12} style={{ justifyContent: "center" }}>
                                    <IconButton onClick={() => newExercise(index)}>
                                        <AddCircle />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>
                ))}
            </SwipeableViews>
            <MobileStepper
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                nextButton={
                    <Button
                        size="small"
                        onClick={handleNext}
                        disabled={activeStep === maxSteps - 1}
                    >
                        Next
                        <KeyboardArrowRight />
                    </Button>
                }
                backButton={
                    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                        <KeyboardArrowLeft />
                        Back
                    </Button>
                }
            />
        </Box>
    );
}

export default SwipeableSet;