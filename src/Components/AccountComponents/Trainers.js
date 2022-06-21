import React from "react";
import {
    Container,
    Grid,
    IconButton,
    Paper,
    Typography
} from "@mui/material";
import { Add, Edit } from '@mui/icons-material';

export default function Trainers() {

    return (
        <Container maxWidth="md" sx={{ height: "100%" }}>
            <Grid container item xs={12} sx={{ padding: "15px" }}>
                <Typography color="primary.contrastText" variant="h5" gutterBottom >
                    Trainers
                </Typography>
            </Grid>
            <Paper >
                <Grid container spacing={2} sx={{ padding: "15px" }}>
                    <Grid container sx={{justifyContent: 'flex-end'}}>
                        <Grid item ><IconButton><Edit /></IconButton></Grid>
                        <Grid item ><IconButton><Add /></IconButton></Grid>
                    </Grid>
                    <Grid container item xs={12} sx={{ justifyContent: 'center' }}>
                        No trainers
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    )
}
