import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { loginJWT } from '../Redux/actions';
import { CardMedia } from '@mui/material';
import DeadliftImg from '../img/deadlift.jpg';

export default function Home() {
    const dispatch = useDispatch();

    const handleLoginAttempt = async (e) => {
        dispatch(loginJWT(localStorage.getItem('JWT_AUTH_TOKEN')));
    }

    useEffect(()=>{
        if(localStorage.getItem('JWT_AUTH_TOKEN')!==null){
            handleLoginAttempt();
        }
        // eslint-disable-next-line
    },[])

    return (
        <div style={{marginTop: '-90px'}}>
            <CardMedia image={DeadliftImg} style={{height: 0, paddingTop: '56.25%',}}/>
        </div>
    )
}
