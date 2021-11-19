import React from "react";
import { Button, Divider, Grid, IconButton, Typography } from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import Exercise from "./Exercise";

export default function Set(props) {
  return props.localTraining.length > 0 ? (
    props.localTraining.map((group, index) =>
      props.editMode ? (
        <Grid item xs={12} key={index}>
          <Grid container item xs={12}>
            <Grid item container xs={12} alignContent="center">
              <Typography variant="h5" gutterBottom>
                Set {index + 1}{" "}
                <IconButton onClick={() => props.removeSet(index)}>
                  <RemoveCircle />
                </IconButton>
              </Typography>
            </Grid>
          </Grid>
          {group.length > 0 ? group.map((exercise, exerciseIndex) => (
            <Exercise
              key={exercise._id}
              editMode={props.editMode}
              exercise={exercise}
              setIndex={index}
              exerciseIndex={exerciseIndex}
              removeExercise={props.removeExercise}
              localTraining={props.localTraining}
              setLocalTraining={props.setLocalTraining}
            />
          )):<></>}
          <Grid container item xs={12}>
            <Grid container item xs={12} style={{ justifyContent: "center" }}>
              <IconButton onClick={() => props.newExercise(index)}>
                <AddCircle />
              </IconButton>
            </Grid>
          </Grid>
          {index + 1 !== props.localTraining.length ? (
            <Grid item xs={12}>
              <Divider style={{ margin: "25px 0px" }} />
            </Grid>
          ) : (
            <></>
          )}
        </Grid>
      ) : (
        <Grid item xs={12} key={index}>
          <Grid container item xs={12}>
            <Grid item container xs={12} alignContent="center">
              <Typography variant="h5" gutterBottom>
                Set {index + 1}
              </Typography>
            </Grid>
          </Grid>
          {group.length > 0 ? group.map((exercise, exerciseIndex) => (
            <Exercise
              key={exercise._id}
              editMode={props.editMode}
              exercise={exercise}
              setIndex={index}
              exerciseIndex={exerciseIndex}
              removeExercise={props.removeExercise}
              localTraining={props.localTraining}
              setLocalTraining={props.setLocalTraining}
            />
          )):<></>}
          {index + 1 !== props.localTraining.length ? (
            <Grid container style={{alignContent: "center"}}>
              <Grid item xs={10}>
                <Divider style={{ margin: "25px 0px" }} />
              </Grid>
              <Grid item xs={2}>
                <Button variant="contained" onClick={props.save}>
                  Save
                </Button>
              </Grid>
            </Grid>
          ) : (
            <></>
          )}
        </Grid>
      )
    )
  ) : (
    <></>
  );
}
