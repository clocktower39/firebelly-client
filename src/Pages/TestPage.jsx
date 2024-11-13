import React, { useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id, children, isPlaceholder }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, over } = useSortable({
    id,
  });

  const isOverPlaceholder = isPlaceholder && over && over.id === id;

  const wrapperStyle = {
    padding: "10px", // Increased hitbox without affecting visual size
    margin: "-10px", // Counterbalance padding to keep the visible size the same
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "8px", // Keep visual padding the same
    border: isPlaceholder ? "2px dashed #aaa" : "1px solid #ccc",
    marginBottom: "4px",
    backgroundColor: isPlaceholder ? (isOverPlaceholder ? "#444" : "#555") : "#333",
    color: "#fff",
    zIndex: isDragging ? 1000 : "auto",
    opacity: isDragging ? 0.5 : 1,
    minHeight: "50px", // Minimum height for placeholders to make them noticeable
    textAlign: isPlaceholder ? "center" : "left",
  };

  return (
    <div ref={setNodeRef} style={wrapperStyle} {...attributes} {...listeners}>
      <div style={style}>{children}</div>
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

  const handleDragStart = ({ active }) => {
    setDraggedItem(active.id);
  };

  const handleDragEnd = ({ active, over }) => {
    setDraggedItem(null);
    if (!over || active.id === over.id) return;

    if (active.id.startsWith("circuit-") && over.id.startsWith("circuit-")) {
      handleCircuitDragEnd(active, over);
    } else if (active.id.startsWith("exercise-") && (over.id.startsWith("exercise-") || over.id.startsWith("placeholder-"))) {
      handleExerciseDragEnd(active, over);
    }
  };

  const handleCircuitDragEnd = (active, over) => {
    const [activeWorkoutId, activeCircuitIndex] = active.id.split("-").slice(1);
    const [overWorkoutId, overCircuitIndex] = over.id.split("-").slice(1);

    setData((prevData) => {
      const updatedData = [...prevData];
      const activeWorkoutIndex = updatedData.findIndex((w) => w._id === activeWorkoutId);
      const overWorkoutIndex = updatedData.findIndex((w) => w._id === overWorkoutId);

      if (activeWorkoutIndex === -1 || overWorkoutIndex === -1) return updatedData;

      if (activeWorkoutIndex === overWorkoutIndex) {
        // Reorder circuits within the same workout
        updatedData[activeWorkoutIndex].training = arrayMove(
          updatedData[activeWorkoutIndex].training,
          parseInt(activeCircuitIndex),
          parseInt(overCircuitIndex)
        );
      } else {
        // Moving circuits between workouts
        const [movedCircuit] = updatedData[activeWorkoutIndex].training.splice(
          parseInt(activeCircuitIndex),
          1
        );
        updatedData[overWorkoutIndex].training.splice(parseInt(overCircuitIndex), 0, movedCircuit);
      }

      return updatedData;
    });
  };

  const handleExerciseDragEnd = (active, over) => {
    setData((prevData) => {
      const updatedData = [...prevData];
      let activeWorkoutIndex, activeCircuitIndex, activeItemIndex;
      let overWorkoutIndex, overCircuitIndex, overItemIndex;

      // Locate the active exercise
      for (let workoutIndex = 0; workoutIndex < updatedData.length; workoutIndex++) {
        const workout = updatedData[workoutIndex];
        for (let circuitIndex = 0; circuitIndex < workout.training.length; circuitIndex++) {
          const circuit = workout.training[circuitIndex];
          const itemIndex = circuit.findIndex((exercise) => `exercise-${exercise._id}` === active.id);
          if (itemIndex !== -1) {
            activeWorkoutIndex = workoutIndex;
            activeCircuitIndex = circuitIndex;
            activeItemIndex = itemIndex;
          }
        }
      }

      // Locate the target position for the exercise
      if (over.id.startsWith("exercise-")) {
        for (let workoutIndex = 0; workoutIndex < updatedData.length; workoutIndex++) {
          const workout = updatedData[workoutIndex];
          for (let circuitIndex = 0; circuitIndex < workout.training.length; circuitIndex++) {
            const circuit = workout.training[circuitIndex];
            const itemIndex = circuit.findIndex((exercise) => `exercise-${exercise._id}` === over.id);
            if (itemIndex !== -1) {
              overWorkoutIndex = workoutIndex;
              overCircuitIndex = circuitIndex;
              overItemIndex = itemIndex;
            }
          }
        }
      } else if (over.id.startsWith("placeholder-")) {
        const [overWorkoutId, overCircuitIndexStr] = over.id.split("-").slice(1);
        overWorkoutIndex = updatedData.findIndex((workout) => workout._id === overWorkoutId);
        overCircuitIndex = parseInt(overCircuitIndexStr);
        overItemIndex = 0; // Since it's an empty circuit, we insert at position 0.
      }

      if (
        activeWorkoutIndex === undefined ||
        overWorkoutIndex === undefined ||
        activeCircuitIndex === undefined ||
        overCircuitIndex === undefined ||
        activeItemIndex === undefined
      ) {
        return updatedData;
      }

      // Moving the item
      const [movedItem] = updatedData[activeWorkoutIndex].training[activeCircuitIndex].splice(
        activeItemIndex,
        1
      );
      updatedData[overWorkoutIndex].training[overCircuitIndex].splice(overItemIndex, 0, movedItem);

      return updatedData;
    });
  };

  return (
    <DndContext
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
              items={workout.training.map((_, index) => `circuit-${workout._id}-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              {workout.training.map((circuit, circuitIndex) => (
                <SortableItem
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
                    strategy={verticalListSortingStrategy}
                  >
                    {circuit.length > 0 ? (
                      circuit.map((exercise) => (
                        <SortableItem key={`exercise-${exercise._id}`} id={`exercise-${exercise._id}`}>
                          <h6>{exercise.exercise}</h6>
                        </SortableItem>
                      ))
                    ) : (
                      <SortableItem
                        key={`placeholder-${workout._id}-${circuitIndex}`}
                        id={`placeholder-${workout._id}-${circuitIndex}`}
                        isPlaceholder
                      >
                        <div
                          style={{
                            color: "#aaa",
                          }}
                        >
                          Drag here to add exercise
                        </div>
                      </SortableItem>
                    )}
                  </SortableContext>
                </SortableItem>
              ))}
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {draggedItem ? (
          <div
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#333",
              color: "#fff",
            }}
          >
            <h6>{draggedItem}</h6>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
