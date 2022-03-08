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
  LinearProgress,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { requestTasks, checkToggleTask, addDateToTaskHistory } from "../../Redux/actions";
import SelectedDate from "./SelectedDate";
import DefaultTasks from "./DefaultTasks";

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
  const defaultTasks = tasks.defaultTasks;
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalNewTaskTitle, setModalNewTaskTitle] = useState("");
  const cancelNewTask = () => {
    setIsModalOpen(false);
    setModalNewTaskTitle("");
  };

  const compareWithSelectedDate = (date) => date.substr(0, 10) === selectedDate;

  const filteredHistory = useSelector(
    (state) => state.tasks.history.filter((day) => compareWithSelectedDate(day.date)) || []
  );


  const dailyTasksAchieved =
    filteredHistory[0] && filteredHistory[0].tasks.length > 0
      ? filteredHistory[0].tasks.reduce((a, b) => ({ achieved: a.achieved + b.achieved })).achieved
      : 0;
  const dailyTasksGoal =
  filteredHistory[0] && filteredHistory[0].tasks.length > 0
      ? filteredHistory[0].tasks.reduce((a, b) => ({ goal: a.goal + b.goal })).goal
      : 1;

  useEffect(() => {
    dispatch(requestTasks());
  }, [dispatch]);

  return (
    <>
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
          <Grid container alignItems="center">
            <SelectedDate setParentSelectedDate={setSelectedDate} />
            <Grid container item xs={12} sx={{padding: '7.5px 0px'}}>
              <Accordion sx={{ width: "100%", boxShadow: "none", backgroundColor: (theme) => `#282828`, }}>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: (theme) => `${theme.palette.primary.contrastText}`, }} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  sx={{ padding: '0px', justifyContent: "center",
                  backgroundColor: (theme) => `${theme.palette.primary.main}`,
                  color: (theme) => `${theme.palette.primary.contrastText}`,
                  '& .MuiAccordionSummary-content': {
                    flexGrow: 0,
                  },
                }}
                >
                  <Typography sx={{justifyContent: "center"}}>Default Tasks</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <DefaultTasks defaultTasks={defaultTasks} />
                </AccordionDetails>
              </Accordion>
            </Grid>
            <Grid container item xs={3}>
              <Typography className={classes.heading}>Daily Tasks</Typography>
            </Grid>
            <Grid item xs={9}>
              <LinearProgress
                variant="determinate"
                value={(dailyTasksAchieved / dailyTasksGoal) * 100}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            sx={{ justifyContent: "center", alignContent: "center", flexGrow: 1 }}
          >
            {tasks.history && filteredHistory.length > 0 ? (
              filteredHistory.map((day, dayIndex, dayArray) =>
                day.tasks
                  .sort((a, b) => a.title > b.title)
                  .map((task, taskIndex, taskArray) => {
                    const handleCheckChange = (e, title) => {
                      let taskHistoryDateObject = { tasks: [...tasks.defaultTasks] };
                      const newHistory = tasks.history.map((day) => {
                        if (compareWithSelectedDate(day.date)) {
                          day.tasks.map((item) => {
                            if (item.title === title) {
                              item.achieved === 0 ? (item.achieved = 1) : (item.achieved = 0);
                            }
                            return item;
                          });
                          taskHistoryDateObject.tasks = day.tasks;
                        }
                        return day;
                      });
                      dispatch(checkToggleTask(selectedDate, taskHistoryDateObject, newHistory));
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
              <Grid
                container
                item
                xs={12}
                sx={{
                  justifyContent: "center",
                  alignContent: "center",
                  flexGrow: 1,
                  height: "100%",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() =>
                    dispatch(
                      addDateToTaskHistory({ date: selectedDate, tasks: [...tasks.defaultTasks] })
                    )
                  }
                >
                  Create Daily Tracking List
                </Button>
              </Grid>
            )}
          </Grid>
    </>
  );
}
