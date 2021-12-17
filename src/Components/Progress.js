import React, { useState, useEffect } from 'react';
import { Box, Modal, Button, Container, Grid, Paper, TextField, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { requestExerciseList, requestExerciseProgess } from "../Redux/actions";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
  } from "recharts";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

const renderLineChart = (targetExerciseHistory) => {
  let totalMaxWeight = 0;
  let totalMaxReps = 0;
  let exerciseTitle = '';

  let exercise = targetExerciseHistory.map(e => {
    const sortedReps = e.achieved.reps.sort((a,b)=>a-b);
    const sortedWeight = e.achieved.weight.sort((a,b)=>a-b);

    let minReps = parseInt(sortedReps[0]);
    let maxReps = parseInt(sortedReps[sortedReps.length-1]);
    let minWeight = parseInt(sortedWeight[0]);
    let maxWeight = parseInt(sortedWeight[sortedWeight.length-1]);

    if(totalMaxWeight < maxWeight){
      totalMaxWeight = maxWeight;
    }
    if(totalMaxReps < maxReps) {
      totalMaxReps = maxReps;
    }
    if(exerciseTitle === ""){
      exerciseTitle = e.exercise;
    }

    let newE = {
      date: e.date,
      reps: [minReps, maxReps],
      weight: [minWeight, maxWeight],
    }
    return newE;
  })
  
return (
  <>
  <Typography variant="h4" style={{ textAlign: 'center', }} >{exerciseTitle}</Typography>
  <BarChart width={window.innerWidth * 0.75} height={window.innerWidth * 0.25} data={exercise}>
    <Bar dataKey="weight" fill="#8884d8" />
    <XAxis dataKey="date" />
    <YAxis domain={[0, totalMaxWeight]} label={{ value: 'Weight', angle: -90, position: 'insideLeft' }} />
  </BarChart>
  <BarChart width={window.innerWidth * 0.75} height={window.innerWidth * 0.25} data={exercise}>
    <Bar dataKey="reps" fill="#4d8888" />
    <XAxis dataKey="date" />
    <YAxis domain={[0, totalMaxReps]} label={{ value: 'Reps', angle: -90, position: 'insideLeft' }} />
  </BarChart>
  </>
)};

export default function Progress() {
    const dispatch = useDispatch();
    const [searchValue, setSearchValue] = useState('');
    const exerciseList = useSelector(state => state.progress.exerciseList);
    const targetExerciseHistory = useSelector(state => state.progress.targetExerciseHistory);
    
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const loadExerciseProgress = (exercise) => {
    dispatch(requestExerciseProgess(exercise))
    handleOpen(true);
  }

    useEffect(()=>{
        dispatch(requestExerciseList())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return (
        <Container maxWidth="lg">
            <Modal
            keepMounted
            open={open}
            onClose={handleClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
            >
            <Box sx={modalStyle}>
                {renderLineChart(targetExerciseHistory)}
            </Box>
            </Modal>
            <Grid container component={Paper} style={{justifyContent: "center", marginTop: '25px', padding: '7.5px', }} >
                <Grid item xs={12} sm={8} container >
                    <TextField
                        label="Exercise"
                        onChangeCapture={(e)=>setSearchValue(e.target.value)}
                        value={searchValue}
                        fullWidth
                    />
                </Grid>
                {/* Remove empty strings and sort alphabetically from exercise list then filter by turning searchValue into a case-insensitive RegExp test */}
                {exerciseList.filter(x=>x!=="").sort((a,b)=>a>b).map(exercise => new RegExp(searchValue,'i').test(exercise)?
                <Grid component={Button} item xs={12} container key={exercise} onClick={(e) => loadExerciseProgress(exercise)}>
                    <Typography variant="p" >{exercise}</Typography>
                </Grid>:
                null)}
            </Grid>
        </Container>
    )
}
