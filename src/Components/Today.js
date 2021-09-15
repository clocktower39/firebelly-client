import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Checkbox,
    Container,
    FormGroup,
    FormControlLabel,
    FormControl,
    Grid,
    IconButton,
    LinearProgress,
    Modal,
    Paper,
    TextField,
    Typography,
    makeStyles
} from '@material-ui/core';
import {
    AddCircle,
} from '@material-ui/icons';
import { ExpandMore } from '@material-ui/icons';
import { requestDailyTasks, checkToggleDailyTask, addDailyTask } from '../Redux/actions';

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

export default function Today() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const today = useSelector(state => state.calander.dailyView );
    const [note, setNote] = useState('');
    const handleChange = (e) => {
        setNote(e.value)
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleModalToggle = () => setIsModalOpen(!isModalOpen);

    const [modalNewTaskTitle, setModalNewTaskTitle] = useState('');
    const submitDailyTask = () => {
        if(modalNewTaskTitle!==""){
            dispatch(addDailyTask({
                title: modalNewTaskTitle,
                goal: 1,
                achieved: 0,
                date: new Date(),
            }))
            .then(()=>handleModalToggle()).then(()=>setModalNewTaskTitle(''));
        }
    }
    const cancelNewTask = () => {
        setIsModalOpen(false);
        setModalNewTaskTitle('');
    }

    let allTraining = [];
    today.dailyTraining.training.forEach(set => {
        set.forEach(task => {
            allTraining.push({
                goal: task.goals.sets,
                achieved: task.achieved.sets,
            })
        })
    })
    const dailyTasksAchieved = today.dailyTasks.reduce((a, b) => ({ achieved: a.achieved + b.achieved }) ).achieved;
    const dailyTasksGoal = today.dailyTasks.reduce((a, b) => ({ goal: a.goal + b.goal })).goal;
    
    const dailyTrainingAchieved = allTraining.reduce((a, b) => ({ achieved: a.achieved + b.achieved }) ).achieved;
    const dailyTrainingGoal = allTraining.reduce((a, b) => ({ goal: a.goal + b.goal }) ).goal;
    
    const dailyNutritionAchieved = today.dailyNutrition.reduce((a, b) => ({ achieved: a.achieved + b.achieved }) ).achieved;
    const dailyNutritionGoal = today.dailyNutrition.reduce((a, b) => ({ goal: a.goal + b.goal }) ).goal;

    useEffect(()=>{
        dispatch(requestDailyTasks(1,"9/13/2021"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    return (
        <Container maxWidth="md" style={{ height: '100%', }}>
            <Modal open={isModalOpen} >
                
                <Paper className={classes.ModalPaper}>
                    <Grid container >
                        <Grid item xs={12} container justifyContent="center"><TextField label="New Task Title" value={modalNewTaskTitle} onChange={(e)=>setModalNewTaskTitle(e.target.value)} /></Grid>
                        <Grid item xs={12} container justifyContent="center">
                            <Button variant="outlined" onClick={cancelNewTask}>Cancel</Button>
                            <Button variant="outlined" onClick={submitDailyTask}>Submit</Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Modal>
            <Typography variant="h5" gutterBottom style={{color: '#fff'}}>Today: {new Date().toString().substr(0,15)}</Typography>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={3}><Typography className={classes.heading}>Daily Tasks</Typography></Grid>
                        <Grid item xs={9} ><LinearProgress variant="determinate" value={(dailyTasksAchieved/ dailyTasksGoal)*100} /></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2} justifyContent="center">
                        {today.dailyTasks.map(task => {
                            const handleCheckChange = (e) => {
                                dispatch(checkToggleDailyTask(task.title))
                            }

                            return(
                                <FormControl component="fieldset" kay={task.title}>
                                    <FormGroup aria-label="position" row>
                                        <FormControlLabel
                                        value={task.achieved}
                                        control={<Checkbox color="primary" />}
                                        label={task.title}
                                        labelPlacement="top"
                                        onChange={handleCheckChange}
                                        checked={task.achieved>0?true:false}
                                        />
                                    </FormGroup>
                                </FormControl>
                        )})}
                                <FormControl component="fieldset" >
                                    <FormGroup aria-label="position" row>
                                        <FormControlLabel
                                        control={<IconButton onClick={handleModalToggle}><AddCircle /></IconButton>}
                                        label="Add Task"
                                        labelPlacement="top"
                                        />
                                    </FormGroup>
                                </FormControl>
                        
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={3}><Typography className={classes.heading}>Training</Typography></Grid>
                        <Grid item xs={9} ><LinearProgress variant="determinate" value={(dailyTrainingAchieved/dailyTrainingGoal)*100} /></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {today.dailyTraining.training.map((group, index) => (
                            <Grid item xs={12} key={group}>
                                <Typography variant="h5">Set {index+1}</Typography>
                                {group.map(exercise => (
                                    <TextField key={exercise} fullWidth variant="outlined" label={exercise.exercise} />
                                ))}
                            </Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>
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
                            <Grid item xs={12} key={task}><TextField fullWidth variant="outlined" label={task.title} /></Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <Grid container alignItems="center">
                        <Grid item xs={3}><Typography className={classes.heading}>Notes</Typography></Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12} ><TextField fullWidth variant="outlined" value={note} onChange={(e)=>handleChange(e)} label="Please provide feedback on your day; what was difficult and what went well?"/></Grid>
                        <Grid item xs={12} ><Button variant="outlined" >Save</Button></Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Container>
    )
}
