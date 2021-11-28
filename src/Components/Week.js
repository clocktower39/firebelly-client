import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Container,
  Grid,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ExpandMore } from "@mui/icons-material";
import {
  requestNutritionWeek,
} from "../Redux/actions";

const useStyles = makeStyles((theme) => ({
  heading: {
    fontWeight: 600,
  },
}));

export default function Week() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const weeklyView = useSelector((state) => state.calander.weeklyView);
  const [note, setNote] = useState("");

  const handleChange = (e) => {
    setNote(e.value);
  };
  const dayOfWeek = (index) => {
    switch (index) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      default:
        return "Error";
    }
  };

  // format a Date object like ISO
  const dateToISOLikeButLocal = (date) => {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const msLocal = date.getTime() - offsetMs;
    const dateLocal = new Date(msLocal);
    const iso = dateLocal.toISOString();
    const isoLocal = iso.slice(0, 19);
    return isoLocal;
  };

  const [selectedStartDate, setSelectedStartDate] = useState(
    dateToISOLikeButLocal(new Date(new Date().getTime() - 6 * (24 * 60 * 60 * 1000))).substr(0, 10)
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    dateToISOLikeButLocal(new Date()).substr(0, 10)
  );

  const handleDatePick = (e, type) => {
    if (type === "start") {
      setSelectedStartDate(e.target.value);
      setSelectedEndDate(
        dateToISOLikeButLocal(new Date(new Date(e.target.value).getTime() + 7 * (24 * 60 * 60 * 1000))).substr(0, 10)
      )
    }
    if (type === "end") {
      setSelectedEndDate(e.target.value);
      setSelectedStartDate(
        dateToISOLikeButLocal(new Date(new Date(e.target.value).getTime() - 5 * (24 * 60 * 60 * 1000))).substr(0, 10)
      );
    }
  }

  useEffect(() => {
    dispatch(requestNutritionWeek(user["_id"], selectedStartDate, selectedEndDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStartDate, selectedEndDate]);

  return (
    <Container maxWidth="md" style={{ height: "100%", paddingTop: "25px" }}>
      <Typography variant="h5" gutterBottom style={{ color: "#fff" }}>
        Weekly View
      </Typography>
      <Grid container xs={12} style={{ justifyContent: 'center', }}>
        {/* Select start and end dates from a calander input */}
        <Grid container xs={3}>
          <TextField
            focused
            id="startDate"
            label="Start Date"
            type="date"
            color="primary"
            value={selectedStartDate}
            className={classes.TextField}
            onChange={(e) => handleDatePick(e, "start")}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid container xs={3}>
          <TextField
            focused
            id="endDate"
            label="End Date"
            type="date"
            color="primary"
            value={selectedEndDate}
            className={classes.TextField}
            onChange={(e) => handleDatePick(e, "end")}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
      {Array.isArray(weeklyView) ? weeklyView.map(day => (
        <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Grid container alignItems="center">
            <Grid item xs={3}>
              <Typography variant="h5" className={classes.heading}>
                {dayOfWeek(new Date(day.date).getDay())}
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <LinearProgress
                variant="determinate"
                value={(0 / 1) * 100}
              />
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6">
            Training Category:{" "}
            <Typography variant="body1" display="inline">
              day.trainingCategory{0}/{1}
            </Typography>
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography variant="h6">
            Daily Tasks Status:
            <Typography variant="body1" display="inline">
              {0}/{1}
            </Typography>
          </Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography variant="h6">
            Nutrition:
            <Typography variant="body1" display="inline">
              {0}/{1}
            </Typography>
          </Typography>
        </AccordionDetails>
      </Accordion>
      )) : <></>}
      


      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Grid container alignItems="center">
            <Grid item xs={3}>
              <Typography variant="h5" className={classes.heading}>
                Notes
              </Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                value={note}
                onChange={(e) => handleChange(e)}
                label="Please provide feedback on your day; what was difficult and what went well?"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined">Save</Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}
