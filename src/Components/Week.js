import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Grid,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ExpandMore } from "@mui/icons-material";
import { requestNutritionWeek, requestTrainingWeek } from "../Redux/actions";

const useStyles = makeStyles((theme) => ({
  heading: {
    fontWeight: 600,
  },
  TextField: {
    "& .css-1d3z3hw-MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.dark,
    },
    "& .MuiOutlinedInput-input": {
      color: "#ffffff",
    },
  },
}));

export default function Week() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const weeklyView = useSelector((state) => state.calander.weeklyView);

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
    dateToISOLikeButLocal(new Date(new Date().getTime() - 5 * (24 * 60 * 60 * 1000))).substr(0, 10)
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    dateToISOLikeButLocal(new Date(new Date().getTime() + 1 * (24 * 60 * 60 * 1000))).substr(0, 10)
  );

  const handleDatePick = (e, type) => {
    if (type === "start") {
      setSelectedStartDate(e.target.value);
      setSelectedEndDate(
        dateToISOLikeButLocal(
          new Date(new Date(e.target.value).getTime() + 7 * (24 * 60 * 60 * 1000))
        ).substr(0, 10)
      );
    }
    if (type === "end") {
      setSelectedEndDate(e.target.value);
      setSelectedStartDate(
        dateToISOLikeButLocal(
          new Date(new Date(e.target.value).getTime() - 5 * (24 * 60 * 60 * 1000))
        ).substr(0, 10)
      );
    }
  };

  useEffect(() => {
    dispatch(requestNutritionWeek(selectedStartDate, selectedEndDate));
    dispatch(requestTrainingWeek(selectedStartDate, selectedEndDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStartDate, selectedEndDate]);

  return (
    <Container maxWidth="md" style={{ height: "100%", paddingTop: "25px" }}>
      <Typography variant="h5" gutterBottom textAlign="center" style={{ color: "#fff" }}>
        Weekly View
      </Typography>
      <Grid container item xs={12} style={{ justifyContent: "center", marginBottom: "25px" }}>
        {/* Select start and end dates from a calander input */}
        <Grid container item xs={6} sm={6} style={{ justifyContent: "center" }}>
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
        <Grid container item xs={6} sm={6} style={{ justifyContent: "center" }}>
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
      {Array.isArray(weeklyView) && (
        weeklyView
          .sort((a, b) => (a.training ? a.training.date > b.training.date : a < b))
          .map((day, index) => {
            let NutritionAchieved = () => {
              let total = 0;
              for (const stat in day.nutrition.stats) {
                total += Number(day.nutrition.stats[stat].achieved);
              }
              return total;
            };
            let NutritionGoal = () => {
              let total = 0;
              for (const stat in day.nutrition.stats) {
                total += Number(day.nutrition.stats[stat].goal);
              }
              return total;
            };

            return (
              <Accordion key={`sorted-weeklyview-${index}`}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Grid container alignItems="center">
                    <Grid container item xs={12}>
                      <Grid item xs={6}>
                        <Typography variant="h6" textAlign="center" >
                          {day.training
                            ? `${
                                new Date(
                                  day.training.date.split("-").join("/").substr(0, 10)
                                ).getMonth() + 1
                              }/${new Date(
                                day.training.date.split("-").join("/").substr(0, 10)
                              ).getDate()}`
                            : "No Data"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h5" className={classes.heading} textAlign="center" >
                          {day.training
                            ? dayOfWeek(
                                new Date(
                                  day.training.date.split("-").join("/").substr(0, 10)
                                ).getDay()
                              )
                            : "No Data"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <Grid container style={{ justifyContent: "center" }}>
                  <Grid item xs={8}>
                    <Divider />
                  </Grid>
                </Grid>
                <Grid container style={{ textAlign: "center" }}>
                  <Grid item xs={12} sm={4}>
                    <AccordionDetails>
                      <Typography variant="h5">Daily Tasks</Typography>
                      <Typography variant="body1">{day.tasks ? `` : "No Data"}</Typography>
                    </AccordionDetails>
                    <Grid container style={{ justifyContent: "center" }}>
                      <Grid item xs={8}>
                        <Divider />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <AccordionDetails>
                      <Typography variant="h5">Training</Typography>
                      <Typography variant="body1">
                        {day.training
                          ? `Category: ${day.training.category}, Sets: ${day.training.training.length}` ||
                            "No Category Entered"
                          : "No Data"}
                      </Typography>
                    </AccordionDetails>
                    <Grid container style={{ justifyContent: "center" }}>
                      <Grid item xs={8}>
                        <Divider />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <AccordionDetails>
                      <Typography variant="h5">Nutrition</Typography>
                      <Typography variant="body1">
                        {day.nutrition ? `${NutritionAchieved()}/${NutritionGoal()}` : "No Data"}
                      </Typography>
                    </AccordionDetails>
                  </Grid>
                </Grid>
              </Accordion>
            );
          })
      )}
    </Container>
  );
}
