import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
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
  makeStyles,
} from "@material-ui/core";
import { AddCircle, ExpandMore } from "@material-ui/icons";
import {
  requestDailyTasks,
  checkToggleDailyTask,
  addDailyTask,
} from "../../Redux/actions";

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
  const user = useSelector((state) => state.user);
  const dailyTasks = useSelector(
    (state) => state.calander.dailyView.dailyTasks
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => setIsModalOpen(!isModalOpen);

  const [modalNewTaskTitle, setModalNewTaskTitle] = useState("");
  const submitDailyTask = () => {
    if (modalNewTaskTitle !== "") {
      dispatch(
        addDailyTask({
          title: modalNewTaskTitle,
          goal: 1,
          achieved: 0,
          date: props.selectedDate,
          accountId: user._id,
        })
      )
        .then(() => handleModalToggle())
        .then(() => setModalNewTaskTitle(""));
    }
  };
  const cancelNewTask = () => {
    setIsModalOpen(false);
    setModalNewTaskTitle("");
  };

  const dailyTasksAchieved =
    dailyTasks.length > 0
      ? dailyTasks.reduce((a, b) => ({ achieved: a.achieved + b.achieved }))
          .achieved
      : 0;
  const dailyTasksGoal =
    dailyTasks.length > 0
      ? dailyTasks.reduce((a, b) => ({ goal: a.goal + b.goal })).goal
      : 1;

  useEffect(() => {
    dispatch(
      requestDailyTasks(
        user["_id"],
        props.selectedDate
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Modal open={isModalOpen}>
        <Paper className={classes.ModalPaper}>
          <Grid container spacing={3} alignContent="center" style={{height: '100%'}}>
            <Grid item xs={12} container justifyContent="center">
              <TextField
                label="New Task Title"
                value={modalNewTaskTitle}
                onChange={(e) => setModalNewTaskTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} container justifyContent="center">
              <Button variant="outlined" onClick={cancelNewTask}>
                Cancel
              </Button>
              <Button variant="outlined" onClick={submitDailyTask}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Modal>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Grid container alignItems="center">
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
          <Grid container spacing={2} justifyContent="center">
            {dailyTasks.map((task) => {
              const handleCheckChange = (e) => {
                dispatch(checkToggleDailyTask(task._id));
              };

              return (
                <FormControl component="fieldset" key={task._id}>
                  <FormGroup aria-label="position" row>
                    <FormControlLabel
                      value={task.achieved}
                      control={<Checkbox color="primary" />}
                      label={task.title}
                      labelPlacement="top"
                      onChange={handleCheckChange}
                      checked={task.achieved > 0 ? true : false}
                    />
                  </FormGroup>
                </FormControl>
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
                  labelPlacement="top"
                />
              </FormGroup>
            </FormControl>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
