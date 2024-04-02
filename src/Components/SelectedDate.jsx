import React, { useEffect } from "react";
import { Button, Container, Grid, TextField, Divider } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import dayjs from "dayjs";

const classes = {
  ArrowIcons: {
    color: 'primary.dark',
  },
};

const convertToReadableDateInput = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
}

export default function SelectedDate(props) {
  const { selectedDate, setSelectedDate } = props;
  // handles when arrow buttons are clicked
  const changeDate = (change) => {
    let newDate = dayjs(selectedDate).add(change, 'day');
    setSelectedDate(convertToReadableDateInput(newDate));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <Container maxWidth="md" sx={{ height: "100%", paddingTop: "25px", maxWidth: "100%" }}>
      <Grid item xs={12} container sx={{ justifyContent: "center", flexWrap: "nowrap" }}>
        {/* Go back one day */}
        <Button onClick={() => changeDate(-1)} sx={classes.ArrowButton}>
          <ArrowBack sx={classes.ArrowIcons} />
        </Button>

        {/* Select a date from a calander input */}
        <TextField
          focused
          id="date"
          label="Date"
          type="date"
          color="primary"
          value={selectedDate}
          onChange={(e) => setSelectedDate(convertToReadableDateInput(e.target.value))}
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Go forward one day */}
        <Button onClick={() => changeDate(1)} sx={classes.ArrowButton}>
          <ArrowForward sx={classes.ArrowIcons} />
        </Button>
      </Grid>
      <Divider sx={{ margin: "15px" }} />
    </Container>
  );
}
