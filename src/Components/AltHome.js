import React from 'react';
import { CardMedia } from '@material-ui/core';
import DeadliftImg from '../img/deadlift.jpg';

export default function AltHome() {
    return (
        <div style={{marginTop: '-50px'}}>
            <CardMedia image={DeadliftImg} style={{height: 0, paddingTop: '56.25%',}}/>
        </div>
    )
}
