import React, { useState, useEffect } from "react";
import { Button, Container, Grid, TextField, Divider } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const useStyles = makeStyles((theme) => ({
  ModalPaper: {
    position: "absolute",
    padding: "17.5px",
    width: "65%",
    backgroundColor: "#fcfcfc",
    left: "50%",
    transform: "translate(-50%, 50%)",
  },
  ArrowIcons: {
    color: theme.palette.primary.dark,
  },
}));

export default function SelectedDate(props) {
  const classes = useStyles();
  const { setParentSelectedDate } = props;

  // format a Date object like ISO
  const dateToISOLikeButLocal = (date) => {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const msLocal = date.getTime() - offsetMs;
    const dateLocal = new Date(msLocal);
    const iso = dateLocal.toISOString();
    const isoLocal = iso.slice(0, 19);
    return isoLocal;
  };

  const [selectedDate, setSelectedDate] = useState(dateToISOLikeButLocal(new Date()).substr(0, 10));

  // handles when arrow buttons are clicked
  const changeDate = (change) => {
    let newDate = new Date(selectedDate).setDate(new Date(selectedDate).getDate() + change);
    setSelectedDate(new Date(newDate).toISOString().substr(0, 10));
  };

  useEffect(() => {
    setParentSelectedDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <Container maxWidth="md" style={{ height: "100%", paddingTop: "25px" }}>
      <Grid item xs={12} container style={{ justifyContent: "center" }}>
        {/* Go back one day */}
        <Button onClick={() => changeDate(-1)} className={classes.ArrowButton}>
          <ArrowBack className={classes.ArrowIcons} />
        </Button>

        {/* Select a date from a calander input */}
        <TextField
          focused
          id="date"
          label="Date"
          type="date"
          color="primary"
          value={selectedDate}
          className={classes.TextField}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            "& .MuiOutlinedInput-input": {
              color: "secondary.contrastText",
            },
          }}
        />

        {/* Go forward one day */}
        <Button onClick={() => changeDate(1)} className={classes.ArrowButton}>
          <ArrowForward className={classes.ArrowIcons} />
        </Button>
      </Grid>
      <Divider style={{ margin: "15px" }} />
    </Container>
  );
}
