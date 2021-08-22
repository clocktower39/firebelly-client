import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { loginJWT } from '../Redux/actions';
import Loading from './Loading';

export const AuthRoute = (props) => {

    const dispatch = useDispatch();
    const Component = props.component;
    const user = useSelector(state => state.user);
    const [loading, setLoading] = useState(true);


    const handleLoginAttempt = async (e) => {
        dispatch(loginJWT(localStorage.getItem('JWT_AUTH_TOKEN'))).then(()=>setLoading(false));
    }

    useEffect(()=>{
        if(localStorage.getItem('JWT_AUTH_TOKEN')!==null){
            handleLoginAttempt();
        }
        else{
            setLoading(false);
        }
        // eslint-disable-next-line
    },[])

    return loading?<Loading />:user.email?<Component socket={props.socket} />:<Redirect to={{ pathname: '/login'}} />;
}

export default AuthRoute
