import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Checkbox,
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
import { requestDailyTasks, checkToggleDailyTask, addDailyTask } from '../../Redux/actions';

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

export default function Tasks() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user );
    const dailyTasks = useSelector(state => state.calander.dailyView.dailyTasks );

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

    // format a Date object like ISO
    const dateToISOLikeButLocal = (date) => {
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        const msLocal = date.getTime() - offsetMs;
        const dateLocal = new Date(msLocal);
        const iso = dateLocal.toISOString();
        const isoLocal = iso.slice(0, 19);
        return isoLocal;
    }

    const dailyTasksAchieved = dailyTasks.reduce((a, b) => ({ achieved: a.achieved + b.achieved }) ).achieved;
    const dailyTasksGoal = dailyTasks.reduce((a, b) => ({ goal: a.goal + b.goal })).goal;
    
    useEffect(()=>{
        dispatch(requestDailyTasks(user["_id"], dateToISOLikeButLocal(new Date()).substr(0, 10).split('-').join('/')))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return (
        <>
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
                    {dailyTasks.map(task => {
                        const handleCheckChange = (e) => {
                            dispatch(checkToggleDailyTask(task.title))
                        }

                        return(
                            <FormControl component="fieldset" key={task.title}>
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
        </>
    )
}
