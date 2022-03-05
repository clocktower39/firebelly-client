import React, { useEffect } from 'react'
import AuthNavbar from './AuthNavbar';
import { useSelector, useDispatch } from 'react-redux';
import { requestExerciseLibrary } from '../Redux/actions';

export default function ExerciseLibrary() {
  const exerciseLibrary = useSelector(state => state.exerciseLibrary)
  const dispatch = useDispatch();

  useEffect(()=> {
    dispatch(requestExerciseLibrary())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return (
    <>
      <div>
        {exerciseLibrary && exerciseLibrary.map(exercise => <p>{exercise.baseExercise}</p>)}
      </div>
      <AuthNavbar />
    </>
  )
}
