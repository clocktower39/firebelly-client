import React from "react";
import { Divider, Grid, IconButton, Typography } from "@mui/material";
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
          {group.map((exercise, exerciseIndex) => (
            <Exercise
              key={exercise._id}
              editMode={props.editMode}
              exercise={exercise}
              setIndex={index}
              exerciseIndex={exerciseIndex}
              removeExercise={props.removeExercise}
              saveExercise={props.saveExercise}
              localTraining={props.localTraining}
              setLocalTraining={props.setLocalTraining}
            />
          ))}
          <Grid container item xs={12}>
            <Grid container item xs={12} style={{ justifyContent: "center" }}>
              <IconButton onClick={() => props.newExercise(index)}>
                <AddCircle />
              </IconButton>
            </Grid>
          </Grid>
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
          {group.map((exercise, exerciseIndex) => (
            <Exercise
              key={exercise._id}
              editMode={props.editMode}
              exercise={exercise}
              setIndex={index}
              exerciseIndex={exerciseIndex}
              removeExercise={props.removeExercise}
              saveExerciseSet={props.saveExerciseSet}
              localTraining={props.localTraining}
              setLocalTraining={props.setLocalTraining}
            />
          ))}
          <Grid item xs={12}>
            <Divider style={{ margin: "25px 0px" }} />
          </Grid>
        </Grid>
      )
    )
  ) : (
    <></>
  );
}
