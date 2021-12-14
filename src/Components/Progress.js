import React, { useState, useEffect } from 'react';
import { Button, Container, Grid, Paper, TextField, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { requestExerciseList } from "../Redux/actions";

export default function Progress() {
    const dispatch = useDispatch();
    const [searchValue, setSearchValue] = useState('');
    const exerciseList = useSelector(state => state.progress.exerciseList);
    
    useEffect(()=>{
        dispatch(requestExerciseList())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return (
        <Container maxWidth="lg">
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
                <Grid component={Button} item xs={12} container key={exercise}>
                    <Typography variant="p" >{exercise}</Typography>
                </Grid>:
                null)}
            </Grid>
        </Container>
    )
}
