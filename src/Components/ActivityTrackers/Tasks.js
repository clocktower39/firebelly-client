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
  IconButton,
  LinearProgress,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import { AddCircle } from "@mui/icons-material";
import {
  requestTasks,
  checkToggleTask,
} from "../../Redux/actions";
import SelectedDate from "./SelectedDate";
import AuthNavbar from '../AuthNavbar';

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
  const tasks = useSelector(
    (state) => state.tasks
  );
  const [selectedDate, setSelectedDate] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => setIsModalOpen(!isModalOpen);

  const [modalNewTaskTitle, setModalNewTaskTitle] = useState("");
  // const submitDailyTask = () => {
  //   if (modalNewTaskTitle !== "") {
  //     dispatch(
  //       addDailyTask({
  //         title: modalNewTaskTitle,
  //         goal: 1,
  //         achieved: 0,
  //         date: selectedDate,
  //         accountId: user._id,
  //       })
  //     )
  //       .then(() => handleModalToggle())
  //       .then(() => setModalNewTaskTitle(""));
  //   }
  // };
  const cancelNewTask = () => {
    setIsModalOpen(false);
    setModalNewTaskTitle("");
  };

  const dailyTasksAchieved =
    tasks.tasks && tasks.tasks.length > 0
      ? tasks.tasks.reduce((a, b) => ({ achieved: a.achieved + b.achieved }))
        .achieved
      : 0;
  const dailyTasksGoal =
    tasks.tasks && tasks.tasks.length > 0
      ? tasks.tasks.reduce((a, b) => ({ goal: a.goal + b.goal })).goal
      : 1;

  useEffect(() => {
    if (selectedDate !== null) {
      dispatch(
        requestTasks(
          selectedDate
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", paddingTop: "15px", paddingBottom: '75px', }}>
        <Modal open={isModalOpen}>
          <Paper className={classes.ModalPaper}>
            <Grid container spacing={3} alignContent="center" style={{ height: '100%' }}>
              <Grid item xs={12} container style={{ justifyContent: "center" }} >
                <TextField
                  label="New Task Title"
                  value={modalNewTaskTitle}
                  onChange={(e) => setModalNewTaskTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} container style={{ justifyContent: "center" }} >
                <Button variant="outlined" onClick={cancelNewTask}>
                  Cancel
                </Button>
                <Button variant="outlined" >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Modal>
        <Paper sx={{ padding: '15px', borderRadius: '15px', }}>
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
          <Grid container spacing={2} style={{ justifyContent: "center" }} >
            {tasks.tasks.sort((a, b) => a.title > b.title).map((task) => {
              const handleCheckChange = (e, title) => {
                const newTasks = tasks.tasks.map(task => {
                  if (task.title === title) {
                    task.achieved === 0 ? task.achieved = 1 : task.achieved = 0;
                  }
                  return task;
                });
                const newDailyTask = {
                  ...tasks,
                  tasks: newTasks
                }
                dispatch(checkToggleTask(tasks._id, newDailyTask));
              }

              return (
                <Grid key={task._id} container item xs={12} sx={{ justifyContent: 'center', }}>
                  <FormControl component="fieldset" >
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
            })}
            <FormControl component="fieldset">
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  control={
                    <IconButton onClick={handleModalToggle}>
                      <AddCircle />
                    </IconButton>
                  }
                  label="Add Task"
                  labelPlacement="end"
                />
              </FormGroup>
            </FormControl>
          </Grid>
        </Paper>
      </Container>
      <AuthNavbar />
    </>
  );
}
