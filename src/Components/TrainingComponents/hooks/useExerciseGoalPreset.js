import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { requestExerciseProgress } from "../../../Redux/actions";
import {
  buildExercisePresetFromHistory,
  buildRecentHistoryOptions,
} from "../utils/exercisePresetUtils";

export default function useExerciseGoalPreset({
  currentExercise,
  setCurrentExercise,
  exerciseType,
  setExerciseType,
  sets,
  setLocalTraining,
  setIndex,
  exerciseIndex,
  exerciseList,
  workoutUser,
  user,
}) {
  const dispatch = useDispatch();
  const pendingPresetExerciseIdRef = useRef(null);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState("");

  const historyTargetUser = workoutUser || user;
  const historyUserId = historyTargetUser?._id || user?._id;

  const recentHistoryOptions = useMemo(() => {
    const selectedExerciseId = currentExercise?._id;
    if (!selectedExerciseId || !historyUserId) return [];

    const reduxExercise = exerciseList.find((item) => item._id === selectedExerciseId);
    const history = reduxExercise?.history?.[historyUserId] || [];
    return buildRecentHistoryOptions(history);
  }, [currentExercise?._id, exerciseList, historyUserId]);

  const applyExerciseHistoryPreset = useCallback(
    (selectedExercise, historyItem = null) => {
      if (!selectedExercise) return;

      const preset = buildExercisePresetFromHistory(historyItem, sets, exerciseType);
      setExerciseType(preset.exerciseType);

      setLocalTraining((prev) =>
        prev.map((set, sIndex) => {
          if (setIndex !== sIndex) {
            return set;
          }

          return set.map((item, eIndex) => {
            if (eIndex !== exerciseIndex) {
              return item;
            }

            return {
              ...item,
              exercise: selectedExercise,
              exerciseType: preset.exerciseType,
              goals: preset.goals,
              achieved: preset.achieved,
            };
          });
        })
      );
    },
    [exerciseIndex, exerciseType, setExerciseType, setIndex, setLocalTraining, sets]
  );

  const handleExerciseSelectionChange = useCallback(
    (event, newSelection) => {
      if (!newSelection) return;

      setCurrentExercise(newSelection);

      const reduxExercise = exerciseList.find((item) => item._id === newSelection._id);
      const history = reduxExercise?.history?.[historyUserId] || [];
      const historyOptions = buildRecentHistoryOptions(history);
      const latestHistoryOption = historyOptions[historyOptions.length - 1];

      setSelectedHistoryKey(latestHistoryOption?.key || "");
      applyExerciseHistoryPreset(newSelection, latestHistoryOption?.historyItem || null);

      if (history.length === 0) {
        pendingPresetExerciseIdRef.current = newSelection._id;
        dispatch(requestExerciseProgress(newSelection, historyTargetUser));
      } else {
        pendingPresetExerciseIdRef.current = null;
      }
    },
    [
      applyExerciseHistoryPreset,
      dispatch,
      exerciseList,
      historyTargetUser,
      historyUserId,
      setCurrentExercise,
    ]
  );

  const handleHistoryPresetChange = useCallback(
    (event) => {
      const nextHistoryKey = event.target.value;
      setSelectedHistoryKey(nextHistoryKey);

      const selectedHistory =
        recentHistoryOptions.find((option) => option.key === nextHistoryKey)?.historyItem || null;

      applyExerciseHistoryPreset(currentExercise, selectedHistory);
    },
    [applyExerciseHistoryPreset, currentExercise, recentHistoryOptions]
  );

  useEffect(() => {
    if (!currentExercise?._id) {
      setSelectedHistoryKey("");
      pendingPresetExerciseIdRef.current = null;
      return;
    }

    if (recentHistoryOptions.length === 0) {
      setSelectedHistoryKey("");
      return;
    }

    const latestHistoryOption = recentHistoryOptions[recentHistoryOptions.length - 1];

    setSelectedHistoryKey((prev) => {
      if (prev && recentHistoryOptions.some((option) => option.key === prev)) {
        return prev;
      }

      return latestHistoryOption.key;
    });

    if (pendingPresetExerciseIdRef.current === currentExercise._id) {
      applyExerciseHistoryPreset(currentExercise, latestHistoryOption.historyItem);
      pendingPresetExerciseIdRef.current = null;
    }
  }, [applyExerciseHistoryPreset, currentExercise, recentHistoryOptions]);

  return {
    recentHistoryOptions,
    selectedHistoryKey,
    handleExerciseSelectionChange,
    handleHistoryPresetChange,
  };
}
