import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Button, Typography, IconButton, MobileStepper, } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight, AddCircle, RemoveCircle } from '@mui/icons-material';
import SwipeableViews from 'react-swipeable-views';
import Exercise from "./Exercise";

function SwipeableSet(props) {
    const {
        localTraining,
        removeSet,
        removeExercise,
        setLocalTraining,
        newExercise,
        toggleNewSet,
        toggleRemoveSet,
        maxSteps,
    } = props;
    const [activeStep, setActiveStep] = useState(0);
    const [heightToggle, setHeightToggle] = useState(true);
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
    }, [localTraining, heightToggle])

    useEffect(() => {
        if(activeStep >= maxSteps -1){
            handleStepChange(maxSteps -2)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleRemoveSet])
    
    useEffect(() => {
        handleStepChange(maxSteps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleNewSet])


    return (
        <Box sx={{ maxWidth: '100%', minHeight: '100%', flexGrow: 1 }}>
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
                                    <IconButton onClick={() => removeSet(index)}>
                                        <RemoveCircle />
                                    </IconButton>
                                </Grid>
                            </Grid>
                            {group.length > 0 && group.map((exercise, exerciseIndex) => (
                                <Exercise
                                    key={`exercise-${exercise._id}-${exerciseIndex}`}
                                    exercise={exercise}
                                    setIndex={index}
                                    exerciseIndex={exerciseIndex}
                                    removeExercise={removeExercise}
                                    localTraining={localTraining}
                                    setLocalTraining={setLocalTraining}
                                    setHeightToggle={setHeightToggle}
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