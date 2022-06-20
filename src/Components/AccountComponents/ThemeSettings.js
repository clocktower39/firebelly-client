import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateThemeMode } from '../../Redux/actions';
import {
    Autocomplete,
    Button,
    Container,
    Grid,
    Paper,
    TextField,
    Typography
} from "@mui/material";

export default function AccountSettings() {
    const dispatch = useDispatch();
    const userThemeMode = useSelector(state => state.user.themeMode);
    const options = [{ label: 'Light', value: 'light', }, { label: 'Dark', value: 'dark', }, { label: 'Custom', value: 'custom', disabled: true },]
    const [themeSelection, setThemeSelection] = useState(options.filter(option => option.value === userThemeMode)[0]);

    const handleChange = (e, selection) => {
        setThemeSelection(selection);
    }

    const saveTheme = () => dispatch(updateThemeMode(themeSelection.value));

    return (
        <Container maxWidth="md" sx={{ height: "100%" }}>
            <Grid container item xs={12} sx={{ padding: "15px" }}>
                <Typography color="primary.contrastText" variant="h5" gutterBottom >
                    Theme
                </Typography>
            </Grid>
            <Paper >
                <Grid container spacing={2} sx={{ padding: "15px" }}>
                    <Grid container item xs={12} sx={{ justifyContent: 'center' }}>
                        <Autocomplete
                            fullWidth
                            value={themeSelection}
                            options={options}
                            onChange={handleChange}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            renderInput={(params) => <TextField {...params} label="Theme" />}
                            getOptionDisabled={(option) => option.value === 'custom'}
                        />
                    </Grid>
                    <Grid container item xs={12} sx={{ justifyContent: 'center' }} spacing={1}>
                        <Grid item >
                            <Button variant="contained" onClick={() => null}>Cancel</Button>
                        </Grid>
                        <Grid item >
                            <Button variant="contained" onClick={saveTheme}>Save</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    )
}
