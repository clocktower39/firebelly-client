import { useCallback, useState, useEffect, useMemo } from "react";
import { getAccessToken, getDelegatedReturnAccessToken } from "../../api/client";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useOutletContext, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  Divider,
  Grid,
  Snackbar,
  TextField,
} from "@mui/material";
import SwipeableSet from "../../Components/TrainingComponents/SwipeableSet";
import WorkoutTrainerSessionDialog from "../../Components/TrainingComponents/WorkoutTrainerSessionDialog";
import { WorkoutOptionModalView } from "../../Components/WorkoutOptionModal";
import AddExercisesDialog from "../../features/workout/components/AddExercisesDialog";
import { requestTraining, updateTraining, getExerciseList } from "../../Redux/actions";
import Loading from "../../Components/Loading";
import CardioDetailsEditor from "../../features/workout/components/cardio/CardioDetailsEditor";
import WorkoutHeader from "../../features/workout/components/WorkoutHeader";
import useWorkoutCardio from "../../features/workout/hooks/useWorkoutCardio";
import useWorkoutDirtyState from "../../features/workout/hooks/useWorkoutDirtyState";
import useWorkoutScheduleEvent from "../../features/workout/hooks/useWorkoutScheduleEvent";
import useWorkoutSocketSync from "../../features/workout/hooks/useWorkoutSocketSync";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import { normalizeWeightUnit } from "../../utils/weightUnits";
import { readWorkoutGestures, saveWorkoutGestures } from "../../features/workout/utils/workoutUtils";

dayjs.extend(utc);
dayjs.extend(advancedFormat);

const classes = {
  TrainingCategoryInputContainer: {
    marginBottom: "20px",
  },
};

export default function Workout({ socket }) {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const returnPath = searchParams.get("return");
  const sourceView = searchParams.get("source");
  const isProgramBuilder = sourceView === "program";

  const user = useSelector((state) => state.user);
  const defaultWorkoutWeightUnit = normalizeWeightUnit(user.workoutWeightUnit);
  const training = useSelector((state) => {
    const workoutBuckets = Object.values(state.workouts || {});
    for (const bucket of workoutBuckets) {
      const match = (bucket?.workouts || []).find((workout) => workout._id === params._id);
      if (match) return match;
    }
    return null;
  });
  const [size = 900, setBorderHighlight] = useOutletContext();

  const isPersonalWorkout = useCallback(
    () => user._id.toString() === training?.user?._id?.toString(),
    [user._id, training?.user?._id]
  );

  const [localTraining, setLocalTraining] = useState([]);
  const [trainingCategory, setTrainingCategory] = useState([]);
  const [trainingTitle, setTrainingTitle] = useState("");
  const [workoutCompleteStatus, setWorkoutCompleteStatus] = useState(training?.complete || false);
  const [loading, setLoading] = useState(true);
  const [workoutFeedback, setWorkoutFeedback] = useState(training?.workoutFeedback || { difficulty: 1, comments: [] });
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [openTrainerSessionDialog, setOpenTrainerSessionDialog] = useState(false);
  const [workoutType, setWorkoutType] = useState(training?.workoutType || "Strength");
  const [activeWorkoutWeightUnit, setActiveWorkoutWeightUnit] = useState(defaultWorkoutWeightUnit);
  const [workoutGestures, setWorkoutGestures] = useState(readWorkoutGestures);
  const weightLabelUnitToggleEnabled = Boolean(workoutGestures.tapWeightLabelToSwitchUnit);
  const activeWorkoutType = workoutType || training?.workoutType || "Strength";
  const isCardio = activeWorkoutType === "Cardio";
  const handleWorkoutWeightUnitChange = (event, nextUnit) => {
    if (!nextUnit) return;
    setActiveWorkoutWeightUnit(normalizeWeightUnit(nextUnit));
  };
  const toggleWorkoutWeightUnit = () => {
    setActiveWorkoutWeightUnit((prev) => (normalizeWeightUnit(prev) === "kg" ? "lbs" : "kg"));
  };
  const updateWorkoutGesture = (key, value) => {
    setWorkoutGestures((prev) => {
      const nextGestures = {
        ...prev,
        [key]: value,
      };
      saveWorkoutGestures(nextGestures);
      return nextGestures;
    });
  };
  const {
    cardioDetails,
    cardioNotice,
    editorProps: cardioEditorProps,
    handleCardioNoticeClose,
    hydrateCardio,
  } = useWorkoutCardio({ isCardio, training, user });

  const trainerAccessToken = user?.isTrainer
    ? getAccessToken()
    : getDelegatedReturnAccessToken("trainer");
  const activeTrainerId = user?.isTrainer ? user._id : user?.trainerId || null;
  const canManageTrainerSession =
    !!trainerAccessToken &&
    !!activeTrainerId &&
    !!training?.user?._id &&
    String(activeTrainerId) !== String(training.user._id);

  const { buildLocalComposite, isDirty, setBaseline } = useWorkoutDirtyState({
    cardioDetails,
    localTraining,
    trainingCategory,
    trainingTitle,
    workoutCompleteStatus,
    workoutFeedback,
    workoutType,
  });

  const { emitWorkoutUpdate, suppressNextSocketEmit } = useWorkoutSocketSync({
    buildLocalComposite,
    localTraining,
    setLocalTraining,
    socket,
    training,
    userId: user._id,
    workoutId: params._id,
  });
  const { scheduleEvent, setScheduleEvent } = useWorkoutScheduleEvent({
    locationSearch: location.search,
    workoutId: params._id,
  });

  // Hydrate locals when Redux training changes and set the baseline snapshot
  useEffect(() => {
    if (!training?._id) return;

    suppressNextSocketEmit();
    // Optional: hydrate local UI from Redux when workout is loaded/switched
    setLocalTraining(training.training ?? []);
    setTrainingCategory(training.category ?? []);
    setTrainingTitle(training.title ?? "");
    setWorkoutCompleteStatus(!!training.complete);
    setWorkoutFeedback(training.workoutFeedback ?? { difficulty: 1, comments: [] });
    setWorkoutType(training.workoutType || "Strength");
    hydrateCardio(training.cardio, user?.isTrainer);

    setBaseline({
      title: training.title ?? "",
      category: training.category ?? [],
      complete: !!training.complete,
      workoutFeedback: training.workoutFeedback ?? { difficulty: 1, comments: [] },
      training: training.training ?? [],
      workoutType: training.workoutType ?? "Strength",
      cardio: training.cardio ?? {},
    });

    if (training.user?._id) {
      setBorderHighlight(!isPersonalWorkout());
    }

    setLoading(false);
  }, [
    hydrateCardio,
    isPersonalWorkout,
    setBaseline,
    setBorderHighlight,
    suppressNextSocketEmit,
    training,
    user?.isTrainer,
  ]);

  useEffect(() => {
    setActiveWorkoutWeightUnit(defaultWorkoutWeightUnit);
  }, [defaultWorkoutWeightUnit, params._id]);

  const [toggleNewSet, setToggleNewSet] = useState(false);
  const [toggleRemoveSet, setToggleRemoveSet] = useState(false);

  const handleTrainingCategory = (getTagProps) => {
    setTrainingCategory(getTagProps);
  };

  const handleTitleChange = (e) => {
    setTrainingTitle(e.target.value);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalToggle = () => {
    setModalOpen((prev) => !prev);
    setModalActionType("");
  };

  const [modalActionType, setModalActionType] = useState("");
  const handleSetModalAction = (actionType) => setModalActionType(actionType);

  const handleAddExerciseOpen = () => setAddExerciseOpen(true);
  const handleAddExerciseClose = () => setAddExerciseOpen(false);

  const categories = [
    "Abdominals",
    "Back",
    "Biceps",
    "Calves",
    "Chest",
    "Core",
    "Forearms",
    "Full Body",
    "Hamstrings",
    "Legs",
    "Quadriceps",
    "Shoulders",
    "Triceps",
  ];

  const newExercise = (index) => {
    handleAddExerciseOpen();
  };

  // Create a new exercise on the current set
  const confirmedNewExercise = (
    index,
    selectedExercises,
    setSelectedExercises,
    setCount,
    setSelectedExercisesSetCount,
    selectedHistoryByExercise,
    exerciseList,
  ) => {
    if (selectedExercises.length > 0) {
      const newTraining = localTraining.map((group, i) => {
        if (index === i) {
          selectedExercises.forEach((exercise) => {
            const reduxExercise = exerciseList.find((item) => item._id === exercise._id);
            const history = reduxExercise?.history?.[user._id] || [];
            const selectedHistoryId = selectedHistoryByExercise?.[exercise._id];
            const selectedHistory =
              history.find((item) => item._id === selectedHistoryId) ||
              history[history.length - 1];
            const achieved = selectedHistory?.achieved || {};
            const normalizeToSets = (values) => {
              const source = Array.isArray(values) ? values : [];
              return Array.from({ length: setCount }, (_, idx) => source[idx] ?? 0);
            };
            group.push({
              exercise: exercise,
              exerciseType: "Reps",
              goals: {
                sets: setCount,
                minReps: Array(setCount).fill(0),
                maxReps: Array(setCount).fill(0),
                exactReps: normalizeToSets(achieved.reps),
                weight: normalizeToSets(achieved.weight),
                percent: normalizeToSets(achieved.percent),
                seconds: normalizeToSets(achieved.seconds),
              },
              achieved: {
                sets: 0,
                reps: Array(setCount).fill(0),
                weight: Array(setCount).fill(0),
                percent: Array(setCount).fill(0),
                seconds: Array(setCount).fill(0),
              },
            });
          });
        }
        return group;
      });
      dispatch(
        updateTraining(training._id, {
          ...training,
          category: [...trainingCategory],
          training: [...newTraining],
        })
      );
    }
    setSelectedExercises([]);
    setSelectedExercisesSetCount(4);
    handleAddExerciseClose();
  };

  // Create a new set on the current day
  const newSet = () => {
    setLocalTraining((prev) => {
      prev.push([]);
      return prev;
    });
    setToggleNewSet((prev) => !prev);
  };

  // Remove the current set
  const removeSet = (setIndex) => {
    if (localTraining.length > 1) {
      setLocalTraining((prev) => prev.filter((item, index) => index !== setIndex));
      setToggleRemoveSet((prev) => !prev);
    }
  };

  // Remove the current exercise
  const removeExercise = (setIndex, exerciseIndex) => {
    const newTraining = localTraining.map((set, index) => {
      if (index === setIndex) {
        set = set.filter((item, index) => index !== exerciseIndex);
      }
      return set;
    });

    dispatch(
      updateTraining(training._id, {
        ...training,
        category: [...trainingCategory],
        training: [...newTraining],
      })
    );
  };

  // Save all changes to training
  const save = async () => {
    const payload = {
      ...training,
      title: trainingTitle,
      category: [...trainingCategory],
      training: localTraining,
      complete: workoutCompleteStatus,
      workoutFeedback: workoutFeedback,
      workoutType: activeWorkoutType,
      cardio: cardioDetails,
    };

    return dispatch(
      updateTraining(training._id, {
        ...payload,
      })
    ).then((savedWorkout) => {
      if (!savedWorkout) return null;
      const workout = savedWorkout?._id ? savedWorkout : payload;
      emitWorkoutUpdate(workout);
      return workout;
    });
  };

  const handleBackNavigation = async () => {
    if (returnPath) {
      await save();
      navigate(returnPath);
      return;
    }

    if (training.date) {
      const dateKey = dayjs.utc(training.date).format("YYYYMMDD");
      const link = isPersonalWorkout()
        ? `/?date=${dateKey}`
        : `/?date=${dateKey}&client=${training.user._id}`;

      await save();
      navigate(link);
      return;
    }

    await save();
    navigate(training.isTemplate ? "/workout-templates" : "/sessions");
  };

  useEffect(() => {
    dispatch(getExerciseList());
  }, [dispatch]);

  useEffect(() => {
    setLocalTraining([]);
    setLoading(true);

    dispatch(requestTraining(params._id)).then(() => {
      setLoading(false);
    });
  }, [dispatch, params._id]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : training?._id ? (
        <>
          <WorkoutOptionModalView
            modalOpen={modalOpen}
            handleModalToggle={handleModalToggle}
            handleSetModalAction={handleSetModalAction}
            modalActionType={modalActionType}
            training={training}
            setLocalTraining={setLocalTraining}
            localTraining={localTraining}
            allowTrainingReorder
            weightUnit={activeWorkoutWeightUnit}
            weightLabelUnitToggleEnabled={weightLabelUnitToggleEnabled}
            setWeightLabelUnitToggleEnabled={(enabled) =>
              updateWorkoutGesture("tapWeightLabelToSwitchUnit", enabled)
            }
          />
          <Snackbar
            open={cardioNotice.open}
            autoHideDuration={3000}
            onClose={handleCardioNoticeClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert onClose={handleCardioNoticeClose} severity={cardioNotice.severity} variant="filled">
              {cardioNotice.message}
            </Alert>
          </Snackbar>
          {training?._id ? (
            <>
              <Grid
                container
                sx={{
                  justifyContent: "flex-start",
                  minHeight: "100%",
                  paddingTop: "15px",
                }}
              >
                <WorkoutHeader
                  activeWorkoutType={activeWorkoutType}
                  activeWorkoutWeightUnit={activeWorkoutWeightUnit}
                  canManageTrainerSession={canManageTrainerSession}
                  isPersonalWorkout={isPersonalWorkout()}
                  isProgramBuilder={isProgramBuilder}
                  onBack={handleBackNavigation}
                  onOpenSettings={handleModalToggle}
                  onOpenTrainerSessionDialog={() => setOpenTrainerSessionDialog(true)}
                  onWorkoutWeightUnitChange={handleWorkoutWeightUnitChange}
                  scheduleEvent={scheduleEvent}
                  training={training}
                />

                <Grid container size={12} spacing={2} sx={{ paddingTop: "15px" }}>
                  <Grid size={12} container sx={{ alignContent: "center" }}>
                    <TextField
                      label="Title"
                      placeholder="Workout Title"
                      value={trainingTitle}
                      onChange={handleTitleChange}
                      fullWidth
                    />
                  </Grid>
                  {isCardio ? (
                    <CardioDetailsEditor {...cardioEditorProps} />
                  ) : (
                    <Grid size={12} container sx={classes.TrainingCategoryInputContainer}>
                      <Grid size={12} container sx={{ alignContent: "center" }}>
                        <Autocomplete
                          disableCloseOnSelect
                          value={trainingCategory}
                          fullWidth
                          multiple
                          id="tags-filled"
                          defaultValue={trainingCategory.map((category) => category)}
                          options={categories.map((option) => option)}
                          freeSolo
                          onChange={(e, getTagProps) => handleTrainingCategory(getTagProps)}
                          renderValue={(value, getTagProps) =>
                            value.map((option, index) => {
                              const { key, ...tagProps } = getTagProps({ index });
                              return (
                                <Chip key={`${option}-${index}`} variant="outlined" label={option} {...tagProps} />
                              )
                            })
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Muscle Groups"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Grid>
                {!isCardio && (
                  <Grid size={12}>
                    <Divider sx={{ margin: "25px 0px" }} />
                  </Grid>
                )}
                {!isCardio && training.training.length > 0 && (
                  <SwipeableSet
                    workoutUser={training.user}
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
                    selectedDate={training.date}
                    size={size}
                    workoutCompleteStatus={workoutCompleteStatus}
                    setWorkoutCompleteStatus={setWorkoutCompleteStatus}
                    workoutFeedback={workoutFeedback}
                    setWorkoutFeedback={setWorkoutFeedback}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    weightUnit={activeWorkoutWeightUnit}
                    onToggleWeightUnit={
                      weightLabelUnitToggleEnabled ? toggleWorkoutWeightUnit : undefined
                    }
                  />
                )}
              </Grid>
              <Grid
                container
                size={12}
                sx={{
                  alignContent: "flex-end",
                  "&.MuiGrid-root": { flexGrow: 1 },
                  paddingBottom: "5px",
                }}
              >
                <Button
                  variant="contained"
                  onClick={save}
                  fullWidth
                  disabled={loading}
                  color={isDirty ? "warning" : "primary"}
                >
                  Save
                </Button>
              </Grid>

              <AddExercisesDialog
                user={training.user}
                addExerciseOpen={addExerciseOpen}
                handleAddExerciseClose={handleAddExerciseClose}
                confirmedNewExercise={confirmedNewExercise}
                activeStep={activeStep}
                weightUnit={activeWorkoutWeightUnit}
              />
              <WorkoutTrainerSessionDialog
                open={openTrainerSessionDialog}
                onClose={() => setOpenTrainerSessionDialog(false)}
                workouts={
                  training?._id
                    ? [
                        {
                          ...training,
                          title: trainingTitle || training.title,
                          complete: workoutCompleteStatus,
                        },
                      ]
                    : []
                }
                initialWorkoutId={training?._id || ""}
                onSaved={(event) => setScheduleEvent(event)}
              />
            </>
          ) : (
            <Grid
              container
              size={12}
              sx={{
                justifyContent: "center",
                alignContent: "center",
                flexGrow: 1,
              }}
            >
              <Button variant="contained" onClick={() => null}>
                Create Workout
              </Button>
            </Grid>
          )}
        </>
      ) : (
        <>Workout does not exist</>
      )}
    </>
  );
}
