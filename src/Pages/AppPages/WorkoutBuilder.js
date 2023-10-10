import React, { useState } from "react";
import { IconButton, TextField } from "@mui/material";
import { AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon } from "@mui/icons-material";

export default function WorkoutBuilder() {
  const [numberOfCurcuits, setNumberOfCurcuits] = useState(4);

  const handleNumberOfCircuitChange = (e) => {
    setNumberOfCurcuits(Number(e.target.value) || 0);
  };
  const handleNumberOfCurcuitSubtractChange = (e) => {
    setNumberOfCurcuits((prev) => prev > 0 ? prev - 1 : prev);
  };
  const handleNumberOfCurcuitAddChange = (e) => {
    setNumberOfCurcuits((prev) => (prev + 1 < 100 ? prev + 1 : prev));
  };

  return (
    <>
      <div>WorkoutBuilder</div>

      <div>
        <TextField
          label="Circuits"
          value={numberOfCurcuits}
          onChange={handleNumberOfCircuitChange}
          
        />
        <IconButton onClick={handleNumberOfCurcuitSubtractChange}>
          <RemoveCircleIcon />
        </IconButton>

        <IconButton onClick={handleNumberOfCurcuitAddChange}>
          <AddCircleIcon />
        </IconButton>
      </div>

      {Array.from(Array(numberOfCurcuits).keys()).map((circuit) => (
        <CircuitView />
      ))}
    </>
  );
}

const CircuitView = () => {
  const [numberOfExercises, setNumberOfExercises] = useState(2);
  const [setsPerExercise, setSetsPerExercise] = useState(4);

  const handleNumberOfExercisesChange = (e) => {
    setNumberOfExercises(Number(e.target.value) || 0);
  };

  const handleSetsPerExerciseChange = (e) => {
    setSetsPerExercise(Number(e.target.value) || 0);
  };

  const handleNumberOfExercisesSubtractChange = (e) => {
    setNumberOfExercises((prev) => prev > 0 ? prev - 1 : prev);
  };
  const handleNumberOfExercisesAddChange = (e) => {
    setNumberOfExercises((prev) => (prev + 1 < 100 ? prev + 1 : prev));
  };

  const handleSetsPerExerciseSubtractChange = (e) => {
    setSetsPerExercise((prev) => prev > 0 ? prev - 1 : prev);
  };
  const handleSetsPerExerciseAddChange = (e) => {
    setSetsPerExercise((prev) => (prev + 1 < 100 ? prev + 1 : prev));
  };

  return (
    <>
      <div>
        <TextField label="numberOfExercises" value={numberOfExercises} onChange={handleNumberOfExercisesChange} />
        <IconButton onClick={handleNumberOfExercisesSubtractChange} >
          <RemoveCircleIcon />
        </IconButton>

        <IconButton onClick={handleNumberOfExercisesAddChange} >
          <AddCircleIcon />
        </IconButton>
      </div>

      <div>
        <TextField label="setsPerExercise" value={setsPerExercise} onChange={handleSetsPerExerciseChange}/>
        <IconButton onClick={handleSetsPerExerciseSubtractChange}>
          <RemoveCircleIcon />
        </IconButton>

        <IconButton onClick={handleSetsPerExerciseAddChange}>
          <AddCircleIcon />
        </IconButton>
      </div>
      
      {Array.from(Array(numberOfExercises).keys()).map((circuit) => (
        <ExerciseView setsPerExercise={setsPerExercise} />
      ))}
    </>
  );
};

const ExerciseView = ({ setsPerExercise }) => {
  return (
    <>
      <TextField label="Exercise" />
      <div>
        <p>Rep Scheme: </p>
      </div>
      <div>
        <p>Expected Weight: </p>
      </div>
    </>
  );
};
