import React, { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { DragHandle as DragHandleIcon } from "@mui/icons-material";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";

const CIRCUIT_DND_KEY = "__firebellyCircuitDndKey";
const EXERCISE_DND_KEY = "__firebellyExerciseDndKey";
let dndKeyCounter = 0;

const createDndKey = (prefix) => {
  dndKeyCounter += 1;
  return `${prefix}-${dndKeyCounter}`;
};

const ensureHiddenDndKey = (target, keyName, prefix) => {
  if (!target || typeof target !== "object") {
    return `${prefix}-missing`;
  }

  if (!target[keyName]) {
    Object.defineProperty(target, keyName, {
      value: createDndKey(prefix),
      configurable: true,
      writable: true,
    });
  }

  return target[keyName];
};

const copyHiddenArrayKey = (source, target, keyName) => {
  if (!source?.[keyName]) return target;

  Object.defineProperty(target, keyName, {
    value: source[keyName],
    configurable: true,
    writable: true,
  });

  return target;
};

const getCircuitKey = (circuit) => ensureHiddenDndKey(circuit, CIRCUIT_DND_KEY, "circuit");
const getExerciseKey = (exercise) => ensureHiddenDndKey(exercise, EXERCISE_DND_KEY, "exercise");
const getWorkoutContainerId = () => "workout-structure-container";
const getCircuitSortableId = (circuitKey) => `circuit:${circuitKey}`;
const getCircuitContainerId = (circuitKey) => `exercise-container:${circuitKey}`;
const getExerciseSortableId = (exerciseKey) => `exercise:${exerciseKey}`;

const cloneCircuitWithKey = (circuit, nextItems) =>
  copyHiddenArrayKey(circuit, [...nextItems], CIRCUIT_DND_KEY);

const ensureTrainingDndKeys = (training = []) => {
  training.forEach((circuit) => {
    if (!Array.isArray(circuit)) return;
    getCircuitKey(circuit);
    circuit.forEach((exercise) => {
      if (exercise && typeof exercise === "object") {
        getExerciseKey(exercise);
      }
    });
  });
};

const buildTrainingDndModel = (training = []) => {
  ensureTrainingDndKeys(training);

  const circuits = training.map((circuit, circuitIndex) => {
    const circuitKey = getCircuitKey(circuit);
    const exerciseItems = (Array.isArray(circuit) ? circuit : []).map((exercise, exerciseIndex) => {
      const exerciseKey = getExerciseKey(exercise);
      return {
        exercise,
        exerciseIndex,
        exerciseKey,
        exerciseId: getExerciseSortableId(exerciseKey),
      };
    });

    return {
      circuit,
      circuitIndex,
      circuitKey,
      circuitId: getCircuitSortableId(circuitKey),
      exerciseContainerId: getCircuitContainerId(circuitKey),
      exerciseItems,
      exerciseIds: exerciseItems.map((item) => item.exerciseId),
    };
  });

  return {
    circuits,
    circuitIds: circuits.map((circuit) => circuit.circuitId),
    workoutContainerId: getWorkoutContainerId(),
  };
};

const findCircuitIndexByKey = (training, circuitKey) => {
  ensureTrainingDndKeys(training);
  return training.findIndex((circuit) => getCircuitKey(circuit) === circuitKey);
};

const findExerciseLocationByKey = (training, exerciseKey) => {
  ensureTrainingDndKeys(training);

  for (let circuitIndex = 0; circuitIndex < training.length; circuitIndex += 1) {
    const circuit = training[circuitIndex];
    if (!Array.isArray(circuit)) continue;

    for (let exerciseIndex = 0; exerciseIndex < circuit.length; exerciseIndex += 1) {
      if (getExerciseKey(circuit[exerciseIndex]) === exerciseKey) {
        return { circuitIndex, exerciseIndex };
      }
    }
  }

  return null;
};

const moveCircuitByKey = (training, circuitKey, targetCircuitIndex) => {
  ensureTrainingDndKeys(training);

  const sourceCircuitIndex = findCircuitIndexByKey(training, circuitKey);
  if (sourceCircuitIndex === -1) return training;

  const safeTargetIndex = Math.max(
    0,
    Math.min(Number.isInteger(targetCircuitIndex) ? targetCircuitIndex : 0, training.length)
  );

  if (sourceCircuitIndex === safeTargetIndex) {
    return training;
  }

  if (safeTargetIndex >= training.length) {
    const nextTraining = [...training];
    const [movedCircuit] = nextTraining.splice(sourceCircuitIndex, 1);
    if (!movedCircuit) return training;
    nextTraining.push(movedCircuit);
    return nextTraining;
  }

  return arrayMove(training, sourceCircuitIndex, safeTargetIndex);
};

const moveExerciseByKey = (training, exerciseKey, targetCircuitKey, targetExerciseIndex) => {
  ensureTrainingDndKeys(training);

  const sourceLocation = findExerciseLocationByKey(training, exerciseKey);
  const targetCircuitIndex = findCircuitIndexByKey(training, targetCircuitKey);

  if (!sourceLocation || targetCircuitIndex === -1) {
    return training;
  }

  const { circuitIndex: sourceCircuitIndex, exerciseIndex: sourceExerciseIndex } = sourceLocation;
  const sourceCircuit = training[sourceCircuitIndex];
  const targetCircuit = training[targetCircuitIndex];

  if (!Array.isArray(sourceCircuit) || !Array.isArray(targetCircuit)) {
    return training;
  }

  const safeTargetIndex = Math.max(
    0,
    Math.min(
      Number.isInteger(targetExerciseIndex) ? targetExerciseIndex : targetCircuit.length,
      targetCircuit.length
    )
  );

  if (sourceCircuitIndex === targetCircuitIndex) {
    if (sourceExerciseIndex === safeTargetIndex) {
      return training;
    }

    const reorderedCircuit = cloneCircuitWithKey(
      sourceCircuit,
      arrayMove(sourceCircuit, sourceExerciseIndex, safeTargetIndex)
    );

    return training.map((circuit, circuitIndex) =>
      circuitIndex === sourceCircuitIndex ? reorderedCircuit : circuit
    );
  }

  const movedExercise = sourceCircuit[sourceExerciseIndex];
  if (!movedExercise) return training;

  return training.map((circuit, circuitIndex) => {
    if (circuitIndex === sourceCircuitIndex) {
      const nextSourceCircuit = sourceCircuit.filter((_, index) => index !== sourceExerciseIndex);
      return cloneCircuitWithKey(sourceCircuit, nextSourceCircuit);
    }

    if (circuitIndex === targetCircuitIndex) {
      const nextTargetCircuit = [...targetCircuit];
      nextTargetCircuit.splice(safeTargetIndex, 0, movedExercise);
      return cloneCircuitWithKey(targetCircuit, nextTargetCircuit);
    }

    return circuit;
  });
};

const getExerciseDropTarget = (overData) => {
  if (!overData) return null;

  if (overData.type === "exercise") {
    return {
      circuitKey: overData.circuitKey,
      exerciseIndex: overData.exerciseIndex,
    };
  }

  if (overData.type === "exercise-container") {
    return {
      circuitKey: overData.circuitKey,
      exerciseIndex: overData.exerciseCount,
    };
  }

  if (overData.type === "circuit") {
    return {
      circuitKey: overData.circuitKey,
      exerciseIndex:
        overData.exerciseCount ?? (Array.isArray(overData.circuit) ? overData.circuit.length : 0),
    };
  }

  return null;
};

const getCircuitDropTarget = (overData) => {
  if (!overData) return null;

  if (overData.type === "circuit") {
    return {
      circuitIndex: overData.circuitIndex,
    };
  }

  if (overData.type === "workout-container") {
    return {
      circuitIndex: overData.circuitCount,
    };
  }

  return null;
};

const getContainersByType = (args, allowedTypes) =>
  args.droppableContainers.filter((container) =>
    allowedTypes.includes(container.data.current?.type)
  );

const getPointerCollisionsByType = (args, allowedTypes) => {
  const filteredContainers = getContainersByType(args, allowedTypes);

  if (filteredContainers.length === 0) {
    return [];
  }

  return pointerWithin({
    ...args,
    droppableContainers: filteredContainers,
  });
};

const getClosestCollisionsByType = (args, allowedTypes) => {
  const filteredContainers = getContainersByType(args, allowedTypes);

  if (filteredContainers.length === 0) {
    return [];
  }

  return closestCorners({
    ...args,
    droppableContainers: filteredContainers,
  });
};

const getTypedCollisions = (args, allowedTypes) => {
  const pointerCollisions = getPointerCollisionsByType(args, allowedTypes);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return getClosestCollisionsByType(args, allowedTypes);
};

const getExerciseCollisions = (args) => {
  const directPointerCollisions = getPointerCollisionsByType(args, [
    "exercise",
    "exercise-container",
  ]);
  if (directPointerCollisions.length > 0) {
    return directPointerCollisions;
  }

  const circuitPointerCollisions = getPointerCollisionsByType(args, ["circuit"]);
  if (circuitPointerCollisions.length > 0) {
    return circuitPointerCollisions;
  }

  const directClosestCollisions = getClosestCollisionsByType(args, [
    "exercise",
    "exercise-container",
  ]);
  if (directClosestCollisions.length > 0) {
    return directClosestCollisions;
  }

  return getClosestCollisionsByType(args, ["circuit"]);
};

const renderExerciseSummary = (exercise) => {
  const exerciseType = exercise?.exerciseType;
  const goals = exercise?.goals || {};
  const achieved = exercise?.achieved || {};

  switch (exerciseType) {
    case "Reps":
      return (
        <Typography variant="body2" color="text.secondary">
          {(goals.exactReps || []).length} sets: {(goals.exactReps || []).join(", ")} reps
        </Typography>
      );
    case "Time":
      return (
        <Typography variant="body2" color="text.secondary">
          {(goals.seconds || []).length} sets: {(goals.seconds || []).join(", ")} seconds
        </Typography>
      );
    case "Reps with %":
      return (
        <Typography variant="body2" color="text.secondary">
          {(goals.percent || []).length} sets: {(goals.exactReps || []).join(", ")} reps
          {goals.oneRepMax ? ` • 1RM ${goals.oneRepMax} lbs` : ""}
        </Typography>
      );
    default:
      if ((achieved.reps || []).length > 0) {
        return (
          <Typography variant="body2" color="text.secondary">
            {(achieved.reps || []).length} achieved sets
          </Typography>
        );
      }
      return (
        <Typography variant="body2" color="text.secondary">
          Drag to reorder
        </Typography>
      );
  }
};

function SortableExercise({ id, data, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data,
    animateLayoutChanges: (args) => (args.isSorting ? false : defaultAnimateLayoutChanges(args)),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes)}
    </div>
  );
}

function SortableCircuit({ id, data, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data,
    animateLayoutChanges: defaultAnimateLayoutChanges,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes)}
    </div>
  );
}

function ExerciseDropZone({ id, data, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data });
  return children({ setNodeRef, isOver });
}

function WorkoutDropZone({ id, data, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data });
  return children({ setNodeRef, isOver });
}

const ReorderCircuitCard = ({
  circuit,
  circuitIndex,
  circuitKey,
  exerciseContainerId,
  exerciseItems,
  exerciseIds,
  listeners,
  attributes,
}) => {
  return (
    <Paper sx={{ padding: "8px", marginBottom: "10px" }}>
      <Grid container alignItems="center" sx={{ marginBottom: "6px" }}>
        <Grid size={12}>
          <Box
            {...listeners}
            {...attributes}
            sx={{
              touchAction: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <DragHandleIcon fontSize="small" />
            <Typography variant="subtitle1">Circuit {circuitIndex + 1}</Typography>
          </Box>
        </Grid>
      </Grid>

      <ExerciseDropZone
        id={exerciseContainerId}
        data={{
          type: "exercise-container",
          circuitKey,
          exerciseCount: exerciseItems.length,
        }}
      >
        {({ setNodeRef, isOver }) => (
          <Box
            ref={setNodeRef}
            sx={{
              padding: "6px 0",
              minHeight: exerciseItems.length === 0 ? 64 : undefined,
              borderRadius: 2,
              backgroundColor: isOver ? "action.hover" : "transparent",
              border: isOver || exerciseItems.length === 0 ? "1px dashed" : "1px solid transparent",
              borderColor: isOver ? "primary.main" : exerciseItems.length === 0 ? "divider" : "transparent",
            }}
          >
            <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
              {exerciseItems.length > 0 ? (
                exerciseItems.map(({ exercise, exerciseIndex, exerciseKey, exerciseId }) => (
                  <SortableExercise
                    id={exerciseId}
                    key={exerciseId}
                    data={{
                      type: "exercise",
                      circuitKey,
                      exerciseKey,
                      exerciseIndex,
                      exercise,
                    }}
                  >
                    {(exerciseListeners, exerciseAttributes) => (
                      <Paper
                        variant="outlined"
                        sx={{ marginBottom: "8px", padding: "8px 10px" }}
                      >
                        <Grid container alignItems="center" spacing={1}>
                          <Grid size={1}>
                            <Box
                              {...exerciseListeners}
                              {...exerciseAttributes}
                              sx={{
                                touchAction: "none",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <DragHandleIcon fontSize="small" />
                            </Box>
                          </Grid>
                          <Grid size={11}>
                            <Typography variant="body1">
                              {exercise?.exercise?.exerciseTitle || "Select an exercise"}
                            </Typography>
                            {renderExerciseSummary(exercise)}
                          </Grid>
                        </Grid>
                      </Paper>
                    )}
                  </SortableExercise>
                ))
              ) : (
                <Box
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  Empty circuit: drag an exercise here
                </Box>
              )}
            </SortableContext>
          </Box>
        )}
      </ExerciseDropZone>
    </Paper>
  );
};

export default function WorkoutReorderEditor({ localTraining = [], setLocalTraining }) {
  const [activeExercise, setActiveExercise] = useState(null);
  const [activeCircuit, setActiveCircuit] = useState(null);
  const lastDragMoveRef = useRef("");
  const trainingDndModel = useMemo(() => buildTrainingDndModel(localTraining), [localTraining]);
  const overlayRoot = typeof document !== "undefined" ? document.body : null;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const clearActiveDrag = () => {
    setActiveExercise(null);
    setActiveCircuit(null);
    lastDragMoveRef.current = "";
  };

  const handleDragStart = ({ active }) => {
    const activeData = active?.data?.current;
    if (!activeData) return;

    lastDragMoveRef.current = "";

    if (activeData.type === "exercise") {
      setActiveExercise(activeData.exercise);
      setActiveCircuit(null);
      return;
    }

    if (activeData.type === "circuit") {
      setActiveExercise(null);
      setActiveCircuit({
        circuitIndex: activeData.circuitIndex,
        exercises: Array.isArray(activeData.circuit) ? activeData.circuit : [],
      });
    }
  };

  const handleDragOver = ({ active, over }) => {
    const activeData = active?.data?.current;
    const overData = over?.data?.current;

    if (!activeData || !overData) return;

    if (activeData.type === "exercise") {
      const target = getExerciseDropTarget(overData);
      if (!target) return;

      const moveKey = `${active.id}->exercise:${target.circuitKey}:${target.exerciseIndex}`;
      if (lastDragMoveRef.current === moveKey) return;
      lastDragMoveRef.current = moveKey;

      setLocalTraining((prevTraining) =>
        moveExerciseByKey(
          prevTraining,
          activeData.exerciseKey,
          target.circuitKey,
          target.exerciseIndex
        )
      );
      return;
    }

    if (activeData.type === "circuit") return;
  };

  const handleDragEnd = ({ active, over }) => {
    const activeData = active?.data?.current;
    const overData = over?.data?.current;

    if (activeData?.type === "circuit" && overData) {
      const target = getCircuitDropTarget(overData);

      if (target) {
        setLocalTraining((prevTraining) =>
          moveCircuitByKey(prevTraining, activeData.circuitKey, target.circuitIndex)
        );
      }
    }

    clearActiveDrag();
  };

  const collisionDetection = (args) => {
    const activeType = args.active.data.current?.type;

    if (activeType === "exercise") {
      return getExerciseCollisions(args);
    }

    if (activeType === "circuit") {
      return getTypedCollisions(args, ["circuit", "workout-container"]);
    }

  return closestCorners(args);
};

const overlayPaperSx = {
  width: "min(360px, calc(100vw - 32px))",
  maxWidth: "calc(100vw - 32px)",
  boxSizing: "border-box",
  overflow: "hidden",
};

const overlayTextContainerSx = {
  minWidth: 0,
};

const overlayTextSx = {
  whiteSpace: "normal",
  overflowWrap: "anywhere",
};

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: "10px" }}>
        Drag circuits by the circuit header and drag exercises by the handle to reorder this workout.
      </Typography>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={clearActiveDrag}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <WorkoutDropZone
          id={trainingDndModel.workoutContainerId}
          data={{
            type: "workout-container",
            circuitCount: trainingDndModel.circuits.length,
          }}
        >
          {({ setNodeRef, isOver }) => (
            <Box
              ref={setNodeRef}
              sx={{
                maxHeight: "58vh",
                overflowY: "auto",
                padding: "6px",
                borderRadius: 2,
                backgroundColor: isOver ? "action.hover" : "transparent",
                border:
                  isOver || trainingDndModel.circuits.length === 0
                    ? "1px dashed"
                    : "1px solid transparent",
                borderColor:
                  isOver
                    ? "primary.main"
                    : trainingDndModel.circuits.length === 0
                    ? "divider"
                    : "transparent",
              }}
            >
              {trainingDndModel.circuits.length > 0 ? (
                <SortableContext
                  items={trainingDndModel.circuitIds}
                  strategy={verticalListSortingStrategy}
                >
                  {trainingDndModel.circuits.map(
                    ({
                      circuit,
                      circuitIndex,
                      circuitKey,
                      circuitId,
                      exerciseContainerId,
                      exerciseItems,
                      exerciseIds,
                    }) => (
                      <SortableCircuit
                        id={circuitId}
                        key={circuitId}
                        data={{
                          type: "circuit",
                          circuitKey,
                          circuitIndex,
                          exerciseCount: exerciseItems.length,
                          circuit,
                        }}
                      >
                        {(listeners, attributes) => (
                          <ReorderCircuitCard
                            circuit={circuit}
                            circuitIndex={circuitIndex}
                            circuitKey={circuitKey}
                            exerciseContainerId={exerciseContainerId}
                            exerciseItems={exerciseItems}
                            exerciseIds={exerciseIds}
                            listeners={listeners}
                            attributes={attributes}
                          />
                        )}
                      </SortableCircuit>
                    )
                  )}
                </SortableContext>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    padding: "12px",
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  No circuits to reorder yet.
                </Paper>
              )}
            </Box>
          )}
        </WorkoutDropZone>

        {overlayRoot
          ? createPortal(
              <DragOverlay
                adjustScale={false}
                zIndex={1500}
                modifiers={[restrictToWindowEdges]}
                dropAnimation={{
                  duration: 200,
                  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}
              >
                {activeExercise ? (
                  <Paper
                    sx={{ ...overlayPaperSx, opacity: 0.9, boxShadow: 3, padding: "8px 10px" }}
                  >
                    <Grid container alignItems="center" spacing={1}>
                      <Grid size={1}>
                        <DragHandleIcon fontSize="small" />
                      </Grid>
                      <Grid size={11} sx={overlayTextContainerSx}>
                        <Typography variant="body1" sx={overlayTextSx}>
                          {activeExercise?.exercise?.exerciseTitle || "Select an exercise"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ) : activeCircuit ? (
                  <Paper sx={{ ...overlayPaperSx, padding: "10px", opacity: 0.9, boxShadow: 3 }}>
                    <Typography variant="subtitle1" sx={{ marginBottom: "6px" }}>
                      Circuit {activeCircuit.circuitIndex + 1}
                    </Typography>
                    {activeCircuit.exercises.length > 0 ? (
                      activeCircuit.exercises.slice(0, 4).map((exercise) => (
                        <Typography
                          key={getExerciseKey(exercise)}
                          variant="body2"
                          color="text.secondary"
                          sx={overlayTextSx}
                        >
                          {exercise?.exercise?.exerciseTitle || "Select an exercise"}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Empty circuit
                      </Typography>
                    )}
                  </Paper>
                ) : null}
              </DragOverlay>,
              overlayRoot
            )
          : null}
      </DndContext>
    </Box>
  );
}
