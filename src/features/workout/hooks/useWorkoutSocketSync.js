import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { upsertWorkout } from "../../../Redux/actions";

export default function useWorkoutSocketSync({
  buildLocalComposite,
  localTraining,
  setLocalTraining,
  socket,
  training,
  userId,
  workoutId,
}) {
  const dispatch = useDispatch();
  const isLocalUpdate = useRef(true);
  const hasSynced = useRef(false);

  const getWorkoutAccountId = useCallback(
    (workout = training) => {
      const owner = workout?.user;
      if (!owner) return userId;
      return typeof owner === "object" ? owner._id : owner;
    },
    [training, userId]
  );

  const buildSocketWorkout = useCallback(() => {
    if (!training?._id) return null;
    return {
      ...training,
      ...buildLocalComposite(),
      user: training.user,
    };
  }, [buildLocalComposite, training]);

  const applyRemoteWorkoutPayload = useCallback(
    (payload) => {
      const source = payload?.currentState || payload;
      const incomingWorkout = source?.workout || source?.updatedWorkout || (source?._id ? source : null);
      const incomingTraining = Array.isArray(source)
        ? source
        : Array.isArray(source?.updatedTraining)
        ? source.updatedTraining
        : Array.isArray(incomingWorkout?.training)
        ? incomingWorkout.training
        : null;

      if (incomingWorkout?._id) {
        dispatch(upsertWorkout(incomingWorkout, source.accountId || getWorkoutAccountId(incomingWorkout)));
      }

      if (incomingTraining) {
        setLocalTraining(incomingTraining);
      }
    },
    [dispatch, getWorkoutAccountId, setLocalTraining]
  );

  const suppressNextSocketEmit = useCallback(() => {
    isLocalUpdate.current = false;
  }, []);

  const emitWorkoutUpdate = useCallback(
    (workoutOverride) => {
      if (!socket || !workoutId) return;
      const workout = workoutOverride || buildSocketWorkout();
      socket.emit("liveTrainingUpdate", {
        workoutId,
        accountId: getWorkoutAccountId(workout),
        updatedTraining: workout?.training || localTraining,
        workout,
      });
    },
    [buildSocketWorkout, getWorkoutAccountId, localTraining, socket, workoutId]
  );

  useEffect(() => {
    if (socket && workoutId) {
      hasSynced.current = false;
      socket.emit("joinWorkout", { workoutId });
      socket.emit("requestCurrentState", { workoutId });
    }
    return () => {
      if (socket && workoutId) {
        socket.emit("leaveWorkout", { workoutId });
      }
    };
  }, [socket, workoutId]);

  useEffect(() => {
    if (!socket) return;

    const handleCurrentState = (payload) => {
      if (payload?.workoutId && payload.workoutId !== workoutId) return;
      if (!hasSynced.current) {
        isLocalUpdate.current = false;
        applyRemoteWorkoutPayload(payload?.currentState || payload);
        hasSynced.current = true;
      }
    };

    socket.on("currentState", handleCurrentState);
    return () => {
      socket.off("currentState", handleCurrentState);
    };
  }, [applyRemoteWorkoutPayload, socket, workoutId]);

  useEffect(() => {
    if (!socket || !workoutId) return;
    const handleCurrentStateRequest = ({ workoutId: requestedWorkoutId, requester }) => {
      if (requestedWorkoutId !== workoutId || !requester) return;
      socket.emit("currentState", {
        workoutId,
        requester,
        currentState: buildSocketWorkout() || localTraining,
      });
    };

    socket.on("requestCurrentState", handleCurrentStateRequest);
    return () => {
      socket.off("requestCurrentState", handleCurrentStateRequest);
    };
  }, [buildSocketWorkout, localTraining, socket, workoutId]);

  useEffect(() => {
    if (!socket || !workoutId) return;
    const timer = setTimeout(() => {
      if (!hasSynced.current) {
        hasSynced.current = true;
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [socket, workoutId]);

  useEffect(() => {
    if (!socket) return;

    const handleLiveUpdate = (payload) => {
      if (payload?.workoutId && payload.workoutId !== workoutId) return;
      isLocalUpdate.current = false;
      applyRemoteWorkoutPayload(payload);
    };

    socket.on("liveTrainingUpdate", handleLiveUpdate);
    return () => {
      socket.off("liveTrainingUpdate", handleLiveUpdate);
    };
  }, [applyRemoteWorkoutPayload, socket, workoutId]);

  useEffect(() => {
    if (!socket || !workoutId) return;

    if (!isLocalUpdate.current) {
      isLocalUpdate.current = true;
      return;
    }

    if (!hasSynced.current) return;

    const debouncedEmit = debounce(() => {
      emitWorkoutUpdate();
    }, 1000);

    debouncedEmit();

    return () => {
      debouncedEmit.cancel();
    };
  }, [emitWorkoutUpdate, localTraining, socket, workoutId]);

  return {
    emitWorkoutUpdate,
    suppressNextSocketEmit,
  };
}
