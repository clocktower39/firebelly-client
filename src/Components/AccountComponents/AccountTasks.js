import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Container,
  IconButton,
  Paper,
  TextField,
  Typography,
  Grid,
} from "@material-ui/core";
import { AddCircle, RemoveCircle } from "@material-ui/icons";
import { addDefaultDailyTask } from "../../Redux/actions";

export default function AccountTasks() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [defaultTasks, setDefaultTasks] = useState(user.defaultTasks);

  const [newTask, setNewTask] = useState("");
  const submitNewTask = () => {
    if (newTask !== "") {
      setDefaultTasks(prev => [...prev, {title:newTask, goal: 1, achieved: 0 }])
      setNewTask("")
    }
  };

  const handleChange = (value, setter) => setter(value);
  const handleCancel = () => setDefaultTasks([...user.defaultTasks]);

  const TaskTextField = (props) => {
    const [taskTitle, setTaskTitle] = useState(props.task.title);

    return (
      <TextField
        label={`Task ${props.index + 1}`}
        value={taskTitle}
        onChange={(e) => handleChange(e.target.value, setTaskTitle)}
        fullWidth
      />
    );
  };

  return (
    <Container maxWidth="md" style={{ height: "100%" }}>
      <Typography variant="h5" gutterBottom style={{ color: "#fff" }}>
        Default Tasks
      </Typography>
      <Grid container component={Paper} spacing={2} style={{ padding: "15px" }}>
        {defaultTasks.map((task, index) => {
          return (
            <>
              <Grid item xs={10}>
                <TaskTextField key={task.title} task={task} index={index} />
              </Grid>
              <Grid item xs={2}>
                <IconButton>
                  <RemoveCircle />
                </IconButton>
              </Grid>
            </>
          );
        })}
        <Grid item xs={10}>
          <TextField
            label="Add a new default task"
            value={newTask}
            onChange={(e) => handleChange(e.target.value, setNewTask)}
            fullWidth
          />
        </Grid>
        <Grid item xs={2}>
          <IconButton onClick={submitNewTask}>
            <AddCircle />
          </IconButton>
        </Grid>
        <Grid container justifyContent="center" item xs={12} spacing={2}>
          <Grid item>
            <Button variant="contained" onClick={handleCancel}>
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleCancel}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
