import { Divider, Grid } from "@mui/material";
import SwipeableSet from "../../../Components/TrainingComponents/SwipeableSet";

export default function StrengthWorkoutEditor({
  activeStep,
  activeWorkoutWeightUnit,
  localTraining,
  newExercise,
  newSet,
  onToggleWeightUnit,
  removeExercise,
  removeSet,
  save,
  selectedDate,
  setActiveStep,
  setLocalTraining,
  setWorkoutCompleteStatus,
  setWorkoutFeedback,
  showSets,
  size,
  toggleNewSet,
  toggleRemoveSet,
  workoutCompleteStatus,
  workoutFeedback,
  workoutUser,
}) {
  return (
    <>
      <Grid size={12}>
        <Divider sx={{ margin: "25px 0px" }} />
      </Grid>
      {showSets && (
        <SwipeableSet
          workoutUser={workoutUser}
          newExercise={newExercise}
          newSet={newSet}
          removeSet={removeSet}
          removeExercise={removeExercise}
          localTraining={localTraining}
          setLocalTraining={setLocalTraining}
          save={save}
          toggleNewSet={toggleNewSet}
          toggleRemoveSet={toggleRemoveSet}
          maxSteps={localTraining.length + 1}
          selectedDate={selectedDate}
          size={size}
          workoutCompleteStatus={workoutCompleteStatus}
          setWorkoutCompleteStatus={setWorkoutCompleteStatus}
          workoutFeedback={workoutFeedback}
          setWorkoutFeedback={setWorkoutFeedback}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          weightUnit={activeWorkoutWeightUnit}
          onToggleWeightUnit={onToggleWeightUnit}
        />
      )}
    </>
  );
}
