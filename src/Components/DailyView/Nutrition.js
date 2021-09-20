import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
    // const dispatch = useDispatch();
    // const user = useSelector(state => state.user );
    const today = useSelector(state => state.calander.dailyView );

    const dailyNutritionAchieved = today.dailyNutrition.reduce((a, b) => ({ achieved: a.achieved + b.achieved }) ).achieved;
    const dailyNutritionGoal = today.dailyNutrition.reduce((a, b) => ({ goal: a.goal + b.goal }) ).goal;

    const NutritionStat = (props) => {
        const [taskAchieved, setTaskAchieved] = useState(props.task.achieved);
        const handleChange = (e) => {
            if(e.target.value === "" && e.target.value.length === 0){
                setTaskAchieved(0);
            }
            else if(Number(e.target.value) || e.target.value === "0"){
                if(e.target.value.length > 1 && e.target.value[0] === "0"){
                    let trimmed = e.target.value.split('');
                    while(trimmed[0] === "0"){
                        trimmed.shift();
                    }
                    setTaskAchieved(trimmed.join(''))
                }
                else{
                    setTaskAchieved(e.target.value);
                }
            }
        }
        const handleKeyDown = (e) => {
            if(e.keyCode === 8){
                setTaskAchieved(e.target.value);
            }
        }

        return (
            <Grid item xs={12} key={props.task.title}>
                <TextField fullWidth variant="outlined" label={props.task.title} value={taskAchieved} onChange={handleChange} onKeyDown={handleKeyDown} type="number" InputProps={{endAdornment: <InputAdornment position="start">/{props.task.goal} {props.task.unit}</InputAdornment>,}} />
            </Grid>
            );
    }

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
