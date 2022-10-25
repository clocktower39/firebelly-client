import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, IconButton, TextField, Tooltip, Grid, InputAdornment } from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import { editDefaultDailyTask } from "../../Redux/actions";

export default function DefaultTasks(props) {
  const dispatch = useDispatch();
  const { defaultTasks } = props;
  const [tempDefaultTasks, setTempDefaultTasks] = useState(defaultTasks || []);

  const [newTask, setNewTask] = useState("");
  const submitNewTask = () => {
    if (newTask !== "") {
      setTempDefaultTasks((prev) => [...prev, { title: newTask, goal: 1, achieved: 0 }]);
      setNewTask("");
    }
  };

  const handleChange = (value, setter) => setter(value);
  const handleCancel = () => setTempDefaultTasks([...defaultTasks]);

  const removeTask = (removeTask) =>
    setTempDefaultTasks((prev) => prev.filter((task) => task !== removeTask));

  const saveTasks = () => dispatch(editDefaultDailyTask([...tempDefaultTasks]));

  const TaskTextField = (props) => {
    const { task, index } = props;
    const [taskTitle, setTaskTitle] = useState(task.title);

    return (
      <TextField
        disabled
        label={`Task ${index + 1}`}
        value={taskTitle}
        onChange={(e) => handleChange(e.target.value, setTaskTitle)}
        fullWidth
        sx={{
          "& .Mui-disabled": {
            color: "white",
            WebkitTextFillColor: "white",
            borderColor: "white",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "white",
            },
          },
          "& .MuiSvgIcon-root": {
            color: "white",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "& .MuiOutlinedInput-notchedOutline:hover": {
            borderColor: "white",
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Remove">
                <IconButton onClick={() => removeTask(task)}>
                  <RemoveCircle />
                </IconButton>
              </ Tooltip>
            </InputAdornment>
          ),
        }}
      />
    );
  };

  useEffect(() => {
    setTempDefaultTasks(defaultTasks || []);
  }, [defaultTasks]);

  return (
    <>
      <Grid
        container
        spacing={1}
        sx={{
          paddingTop: "7.5px",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
        }}
      >
        {tempDefaultTasks &&
          tempDefaultTasks.map((task, index) => {
            return (
              <Grid item xs={12} key={`defaultTask-${task.taskTitle}-${index}`}>
                <TaskTextField task={task} index={index} />
              </Grid>
            );
          })}
        <Grid item xs={12}>
          <TextField
            label="Add a new default task"
            value={newTask}
            onChange={(e) => handleChange(e.target.value, setNewTask)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-input": {
                color: "text.primary",
              },
              borderBottomColor: "white",
              "& input": {
                color: "white",
              },
              "& label": {
                color: "white",
              },
              "& label.Mui-focused": {
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                "&:hover": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },

                "& .MuiInputBase-root-MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "white",
                },
              },
              "& .MuiSvgIcon-root": {
                color: "white",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "& .MuiOutlinedInput-notchedOutline:hover": {
                borderColor: "white",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Add">
                    <IconButton onClick={submitNewTask}>
                      <AddCircle />
                    </IconButton>
                  </ Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid container sx={{ justifyContent: "center" }} item xs={12} spacing={2}>
          <Grid item>
            <Button variant="contained" onClick={handleCancel}>
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={saveTasks}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
