import React, { useState, useEffect } from 'react'
import { Container, Grid, Paper, TextField } from '@mui/material'

export default function Progress() {
    const [searchValue, setSearchValue] = useState('');
    const [exerciseList, setExerciseList] = useState([]);
    
    useEffect(()=>{},[searchValue])
    useEffect(()=>{},[exerciseList])

    return (
        <Container maxWidth="lg">
            <Grid container component={Paper} style={{justifyContent: "center", marginTop: '25px', padding: '7.5px 0', }} >
                <Grid item xs={12} sm={8} container >
                    <TextField
                        label="Exercise"
                        onChangeCapture={(e)=>setSearchValue(e.target.value)}
                        value={searchValue}
                        fullWidth
                    />
                </Grid>
                {exerciseList.map(exercise => new RegExp(searchValue).test(exercise)?<Grid xs={12} >{exercise}</Grid>:null)}
            </Grid>
        </Container>
    )
}
