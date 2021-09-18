import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Grid,
    InputAdornment,
    LinearProgress,
    TextField,
    Typography,
    makeStyles
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { requestDailyNutrition } from '../../Redux/actions';

const useStyles = makeStyles(theme => ({
    heading: {},
    ModalPaper: {
        position: 'absolute',
        padding: '17.5px',
        width: '65%',
        backgroundColor: '#fcfcfc',
        left: '50%',
        transform: 'translate(-50%, 50%)',
    },
}))

export default function Nutrition() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user );
    const today = useSelector(state => state.calander.dailyView );
    
    // format a Date object like ISO
    const dateToISOLikeButLocal = (date) => {
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        const msLocal = date.getTime() - offsetMs;
        const dateLocal = new Date(msLocal);
        const iso = dateLocal.toISOString();
        const isoLocal = iso.slice(0, 19);
        return isoLocal;
    }

    const dailyNutritionAchieved = today.dailyNutrition.reduce((a, b) => ({ achieved: a.achieved + b.achieved }) ).achieved;
    const dailyNutritionGoal = today.dailyNutrition.reduce((a, b) => ({ goal: a.goal + b.goal }) ).goal;

    const NutritionStat = (props) => {
        const [taskAchieved, setTaskAchieved] = useState(props.task.achieved);
        const handleChange = (e) => {
            setTaskAchieved(e.target.value);
        }

        return (
            <Grid item xs={12} key={props.task.title}>
                <TextField fullWidth variant="outlined" label={props.task.title} value={taskAchieved} onChange={handleChange} type="number" InputProps={{endAdornment: <InputAdornment position="start">/{props.task.goal} {props.task.unit}</InputAdornment>,}} />
            </Grid>
            );
    }

    // useEffect(()=>{
    //     dispatch(requestDailyNutrition(user["_id"], dateToISOLikeButLocal(new Date()).substr(0, 10).split('-').join('/')))
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // },[])

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMore />}
            >
                <Grid container alignItems="center">
                    <Grid item xs={3}><Typography className={classes.heading}>Nutrition</Typography></Grid>
                    <Grid item xs={9} ><LinearProgress variant="determinate" value={(dailyNutritionAchieved/dailyNutritionGoal)*100} /></Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    {today.dailyNutrition.map(task => (
                        <NutritionStat task={task} />
                    ))}
                    <Grid xs={12} item container justifyContent="center" >
                        <Button variant="outlined" >Edit Goals</Button>
                        <Button variant="outlined" >Save</Button>
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    )
}
