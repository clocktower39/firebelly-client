import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { AddCircle, ExpandMore } from "@mui/icons-material";
import {
  requestDailyTasks,
  checkToggleDailyTask,
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
  const dailyTasks = useSelector(
    (state) => state.calander.dailyView.dailyTasks
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
    dailyTasks.tasks.length > 0
      ? dailyTasks.tasks.reduce((a, b) => ({ achieved: a.achieved + b.achieved }))
        .achieved
      : 0;
  const dailyTasksGoal =
    dailyTasks.tasks.length > 0
      ? dailyTasks.tasks.reduce((a, b) => ({ goal: a.goal + b.goal })).goal
      : 1;

  useEffect(() => {
    if (selectedDate !== null) {
      dispatch(
        requestDailyTasks(
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
        <Accordion defaultExpanded >
          <AccordionSummary expandIcon={<ExpandMore />}>
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
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} style={{ justifyContent: "center" }} >
              {dailyTasks.tasks.sort((a, b) => a.title > b.title).map((task) => {
                const handleCheckChange = (e, title) => {
                  const newTasks = dailyTasks.tasks.map(task => {
                    if (task.title === title) {
                      task.achieved === 0 ? task.achieved = 1 : task.achieved = 0;
                    }
                    return task;
                  });
                  const newDailyTask = {
                    ...dailyTasks,
                    tasks: newTasks
                  }
                  dispatch(checkToggleDailyTask(dailyTasks._id, newDailyTask));
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
          </AccordionDetails>
        </Accordion>
      </Container>
      <AuthNavbar />
    </>
  );
}
