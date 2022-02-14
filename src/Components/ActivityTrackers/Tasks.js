import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Checkbox,
  Container,
  FormGroup,
  FormControlLabel,
  FormControl,
  Grid,
  LinearProgress,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { requestTasks, checkToggleTask, addDateToTaskHistory } from "../../Redux/actions";
import SelectedDate from "./SelectedDate";
import AuthNavbar from "../AuthNavbar";

const useStyles = makeStyles((theme) => ({
  heading: {},
  ModalPaper: {
    position: "absolute",
    padding: "17.5px",
    width: "65%",
    backgroundColor: "#fcfcfc",
    left: "50%",
    transform: "translate(-50%, 50%)",
    height: "50%",
  },
}));

export default function Tasks(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalNewTaskTitle, setModalNewTaskTitle] = useState("");
  const cancelNewTask = () => {
    setIsModalOpen(false);
    setModalNewTaskTitle("");
  };

  const compareWithSelectedDate = (date) => {
    let dayDate = new Date(date).toString().substr(0, 15);
    let compareSelectedDate = new Date(selectedDate);
    compareSelectedDate = new Date(
      compareSelectedDate.getTime() + Math.abs(compareSelectedDate.getTimezoneOffset() * 60000)
    )
      .toString()
      .substr(0, 15);

    return dayDate === compareSelectedDate;
  };

  const filteredHistory = useSelector(
    (state) => state.tasks.history.filter((day) => compareWithSelectedDate(day.date)) || []
  );

  const dailyTasksAchieved =
    tasks.tasks && tasks.tasks.length > 0
      ? tasks.tasks.reduce((a, b) => ({ achieved: a.achieved + b.achieved })).achieved
      : 0;
  const dailyTasksGoal =
    tasks.tasks && tasks.tasks.length > 0
      ? tasks.tasks.reduce((a, b) => ({ goal: a.goal + b.goal })).goal
      : 1;

  useEffect(() => {
    dispatch(requestTasks());
  }, [dispatch]);

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", paddingTop: "15px", paddingBottom: "75px" }}>
        <Modal open={isModalOpen}>
          <Paper className={classes.ModalPaper}>
            <Grid container spacing={3} alignContent="center" style={{ height: "100%" }}>
              <Grid item xs={12} container style={{ justifyContent: "center" }}>
                <TextField
                  label="New Task Title"
                  value={modalNewTaskTitle}
                  onChange={(e) => setModalNewTaskTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} container style={{ justifyContent: "center" }}>
                <Button variant="outlined" onClick={cancelNewTask}>
                  Cancel
                </Button>
                <Button variant="outlined">Submit</Button>
              </Grid>
            </Grid>
          </Paper>
        </Modal>
        <Paper sx={{ padding: "0px 15px", borderRadius: "15px", minHeight: "100%" }}>
          <Grid container alignItems="center">
            <SelectedDate setParentSelectedDate={setSelectedDate} />
            <Grid item xs={3}>
              <Typography className={classes.heading}>Daily Tasks</Typography>
            </Grid>
            <Grid item xs={9}>
              <LinearProgress
                variant="determinate"
                value={(dailyTasksAchieved / dailyTasksGoal) * 100}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ justifyContent: "center" }}>
            {tasks.history && filteredHistory.length > 0 ? (
              filteredHistory.map((day, dayIndex, dayArray) =>
                day.tasks
                  .sort((a, b) => a.title > b.title)
                  .map((task, taskIndex, taskArray) => {
                    const handleCheckChange = (e, title) => {
                      const newHistory = tasks.history.map((day) => {
                        if (compareWithSelectedDate(day.date)) {
                          day.tasks.map((item) => {
                            if (item.title === title) {
                              item.achieved === 0 ? (item.achieved = 1) : (item.achieved = 0);
                            }
                            return item;
                          });
                        }
                        return day;
                      });
                      dispatch(checkToggleTask(selectedDate, newHistory));
                    };

                    return (
                      <Grid
                        key={`historyItem-${dayIndex}-${task.title}`}
                        container
                        item
                        xs={12}
                        sx={{ justifyContent: "center" }}
                      >
                        <FormControl component="fieldset">
                          <FormGroup aria-label="position" row>
                            <FormControlLabel
                              value={task.achieved}
                              control={<Checkbox color="primary" />}
                              label={task.title}
                              labelPlacement="end"
                              onClick={(e) => handleCheckChange(e, task.title)}
                              checked={task.achieved > 0 ? true : false}
                            />
                          </FormGroup>
                        </FormControl>
                      </Grid>
                    );
                  })
              )
            ) : (
              <Grid container item xs={12} sx={{ justifyContent: 'center'}}>
                <Button
                  variant="contained"
                  onClick={() => {
                    let formattedDate = new Date(selectedDate);
                    formattedDate = new Date(
                      formattedDate.getTime() + Math.abs(formattedDate.getTimezoneOffset() * 60000)
                    ).toString();
                    dispatch(
                      addDateToTaskHistory({ date: formattedDate, tasks: [...tasks.defaultTasks] })
                    );
                  }}
                >
                  Start Tracking Today
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Container>
      <AuthNavbar />
    </>
  );
}
