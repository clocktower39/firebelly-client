import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSwappingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableExercise({ id, children, isPlaceholder }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.8 : 1,
    backgroundColor: isPlaceholder ? "transparent" : "#fff",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes)}
    </div>
  );
}

function SortableCircuit({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

export default function TestPage() {
  const initialData = [
    {
      _id: "workoutA",
      title: "Workout A",
      training: [
        [
          {
            exercise: "Exercise A11",
            _id: "A11",
          },
          {
            exercise: "Exercise A12",
            _id: "A12",
          },
        ],
        [],
        [
          {
            exercise: "Exercise A31",
            _id: "A31",
          },
          {
            exercise: "Exercise A32",
            _id: "A32",
          },
        ],
      ],
    },
    {
      _id: "workoutB",
      title: "Workout B",
      training: [
        [
          {
            exercise: "Exercise B11",
            _id: "B11",
          },
          {
            exercise: "Exercise B12",
            _id: "B12",
          },
        ],
        [],
        [
          {
            exercise: "Exercise B31",
            _id: "B31",
          },
          {
            exercise: "Exercise B32",
            _id: "B32",
          },
        ],
      ],
    },
  ];

  const [data, setData] = useState(initialData);
  const [draggedItem, setDraggedItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }) => {
    setDraggedItem(active.id);
  };

  const handleDragEnd = ({ active, over }) => {
    setDraggedItem(null);
    if (!over || active.id === over.id) return;

    if (active.id.startsWith("circuit-") && over.id.startsWith("circuit-")) {
      handleCircuitDragEnd(active, over);
    } else if (
      active.id.startsWith("exercise-") &&
      (over.id.startsWith("exercise-") || over.id.startsWith("placeholder-"))
    ) {
      handleExerciseDragEnd(active, over);
    }
  };

  const handleCircuitDragEnd = (active, over) => {
    const [activeWorkoutId, activeCircuitIndex] = active.id
      .split("-")
      .slice(1);
    const [overWorkoutId, overCircuitIndex] = over.id.split("-").slice(1);

    setData((prevData) => {
      const updatedData = JSON.parse(JSON.stringify(prevData));
      const activeWorkoutIndex = updatedData.findIndex(
        (w) => w._id === activeWorkoutId
      );
      const overWorkoutIndex = updatedData.findIndex(
        (w) => w._id === overWorkoutId
      );

      if (activeWorkoutIndex === -1 || overWorkoutIndex === -1) return prevData;

      const activeIndex = parseInt(activeCircuitIndex, 10);
      const overIndex = parseInt(overCircuitIndex, 10);

      if (activeWorkoutIndex === overWorkoutIndex) {
        // Reorder circuits within the same workout
        updatedData[activeWorkoutIndex].training = arrayMove(
          updatedData[activeWorkoutIndex].training,
          activeIndex,
          overIndex
        );
      } else {
        // Moving circuits between workouts
        const [movedCircuit] = updatedData[
          activeWorkoutIndex
        ].training.splice(activeIndex, 1);
        updatedData[overWorkoutIndex].training.splice(overIndex, 0, movedCircuit);
      }

      return updatedData;
    });
  };

  const handleExerciseDragEnd = (active, over) => {
    setData((prevData) => {
      const updatedData = JSON.parse(JSON.stringify(prevData));
      let activeWorkoutIndex, activeCircuitIndex, activeItemIndex;
      let overWorkoutIndex, overCircuitIndex, overItemIndex;

      // Locate the active exercise
      outerLoop: for (
        let workoutIndex = 0;
        workoutIndex < updatedData.length;
        workoutIndex++
      ) {
        const workout = updatedData[workoutIndex];
        for (
          let circuitIndex = 0;
          circuitIndex < workout.training.length;
          circuitIndex++
        ) {
          const circuit = workout.training[circuitIndex];
          const itemIndex = circuit.findIndex(
            (exercise) => `exercise-${exercise._id}` === active.id
          );
          if (itemIndex !== -1) {
            activeWorkoutIndex = workoutIndex;
            activeCircuitIndex = circuitIndex;
            activeItemIndex = itemIndex;
            break outerLoop;
          }
        }
      }

      // Locate the target position for the exercise
      if (over.id.startsWith("exercise-")) {
        outerLoop: for (
          let workoutIndex = 0;
          workoutIndex < updatedData.length;
          workoutIndex++
        ) {
          const workout = updatedData[workoutIndex];
          for (
            let circuitIndex = 0;
            circuitIndex < workout.training.length;
            circuitIndex++
          ) {
            const circuit = workout.training[circuitIndex];
            const itemIndex = circuit.findIndex(
              (exercise) => `exercise-${exercise._id}` === over.id
            );
            if (itemIndex !== -1) {
              overWorkoutIndex = workoutIndex;
              overCircuitIndex = circuitIndex;
              overItemIndex = itemIndex;
              break outerLoop;
            }
          }
        }
      } else if (over.id.startsWith("placeholder-")) {
        const [overWorkoutId, overCircuitIndexStr] = over.id
          .split("-")
          .slice(1);
        overWorkoutIndex = updatedData.findIndex(
          (workout) => workout._id === overWorkoutId
        );
        overCircuitIndex = parseInt(overCircuitIndexStr, 10);
        overItemIndex = 0;
      }

      if (
        activeWorkoutIndex === undefined ||
        overWorkoutIndex === undefined ||
        activeCircuitIndex === undefined ||
        overCircuitIndex === undefined ||
        activeItemIndex === undefined
      ) {
        return prevData;
      }

      // Moving the item
      const [movedItem] = updatedData[activeWorkoutIndex].training[
        activeCircuitIndex
      ].splice(activeItemIndex, 1);
      updatedData[overWorkoutIndex].training[overCircuitIndex].splice(
        overItemIndex,
        0,
        movedItem
      );

      return updatedData;
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: "flex", gap: "16px" }}>
        {data.map((workout) => (
          <div
            key={workout._id}
            style={{
              width: "300px",
              padding: "16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#333",
              color: "#fff",
            }}
          >
            <h4>{workout.title}</h4>
            <SortableContext
              items={workout.training.map(
                (_, index) => `circuit-${workout._id}-${index}`
              )}
              strategy={rectSwappingStrategy}
            >
              {workout.training.map((circuit, circuitIndex) => (
                <SortableCircuit
                  key={`circuit-${workout._id}-${circuitIndex}`}
                  id={`circuit-${workout._id}-${circuitIndex}`}
                >
                  <h5>Circuit {circuitIndex + 1}</h5>
                  <SortableContext
                    items={
                      circuit.length > 0
                        ? circuit.map((exercise) => `exercise-${exercise._id}`)
                        : [`placeholder-${workout._id}-${circuitIndex}`]
                    }
                    strategy={rectSwappingStrategy}
                  >
                    {circuit.length > 0 ? (
                      circuit.map((exercise) => (
                        <SortableExercise
                          key={`exercise-${exercise._id}`}
                          id={`exercise-${exercise._id}`}
                        >
                          {(listeners, attributes) => (
                            <div {...listeners} {...attributes}>
                              <h6>{exercise.exercise}</h6>
                            </div>
                          )}
                        </SortableExercise>
                      ))
                    ) : (
                      <SortableExercise
                        key={`placeholder-${workout._id}-${circuitIndex}`}
                        id={`placeholder-${workout._id}-${circuitIndex}`}
                        isPlaceholder
                      >
                        {(listeners, attributes) => (
                          <div
                            style={{
                              color: "#aaa",
                            }}
                            {...listeners}
                            {...attributes}
                          >
                            Drag here to add exercise
                          </div>
                        )}
                      </SortableExercise>
                    )}
                  </SortableContext>
                </SortableCircuit>
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
