import React, { useState } from "react";
import { useSelector } from "react-redux";
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

export default function AccountTasks() {
  const user = useSelector((state) => state.user);
  const [defaultTasks, setDefaultTasks] = useState(user.defaultTasks);

  const [newTask, setNewTask] = useState("");

  const handleChange = (value, setter) => setter(value);
  const handleCancel = () => setDefaultTasks(user.defaultTasks);

  return (
    <Container maxWidth="md" style={{ height: "100%" }}>
      <Typography variant="h5" gutterBottom style={{ color: "#fff" }}>
        Default Tasks
      </Typography>
      <Grid container component={Paper} spacing={2} style={{ padding: "15px" }}>
        {defaultTasks.map((task) => {
          return (
            <>
              <Grid item xs={10}>
                <TextField label={task.title} value={task.title} fullWidth />
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
        <IconButton>
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
