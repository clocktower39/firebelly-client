import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccountCircle,
  AddCircle,
  Delete,
} from "@mui/icons-material";
import { getGoals, updateGoal, addGoalComment, addNewGoal, deleteGoal, serverURL, } from "../../Redux/actions";

export default function Goals({ view = "client", client, }) {
  const dispatch = useDispatch();
  const goals = useSelector((state) => state.goals);

  const [selectedGoal, setSelectedGoal] = useState({});
  const [openGoalDetails, setOpenGoalDetails] = useState(false);
  const [openAddNewGoal, setOpenAddNewGoal] = useState(false);


  const handleOpenGoalDetails = (goal) => {
    setSelectedGoal(goal)
    setOpenGoalDetails(true);
  }
  const handleCloseGoalDetails = () => setOpenGoalDetails(false);

  const handleOpenAddNewGoal = () => setOpenAddNewGoal(true);
  const handleCloseAddNewGoal = () => setOpenAddNewGoal(false);

  useEffect(() => {
    setSelectedGoal(prev => {
      return prev ? goals.filter(goal => goal._id === prev._id)[0] : prev;
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals]);

  useEffect(() => {
    dispatch(getGoals({ requestedBy: view, client: client?._id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GoalCard = ({ goal, handleOpenGoalDetails }) => {

    return (
      <Grid
        container
        size={{ xs: 12, sm: 6, md: 4, }} 
        sx={{ justifyContent: "center" }}
      >
        <Box sx={{ width: "100%" }}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              '& .MuiPaper-root': {
                backgroundColor: 'white',
              }
            }}
          >
            <CardActionArea onClick={() => handleOpenGoalDetails(goal)}
            >
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {goal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {goal.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      </Grid>
    );
  }

  const GoalDetails = (props) => {
    const { goal, open, onClose } = props;
    const [title, setTitle] = useState(goal.title || '');
    const [description, setDescription] = useState(goal.description || '');
    const [targetDate, setTargetDate] = useState(goal.targetDate || '');
    const [achievedDate, setAchievedDate] = useState(goal.achievedDate || '');
    const [newComment, setNewComment] = useState('');
    const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

    const handleChange = (e, setter) => setter(e.target.value);


    const saveGoal = () => {
      dispatch(updateGoal({
        _id: goal._id,
        title,
        description,
        targetDate,
        achievedDate,
      }))
    }

    const resetEdit = () => {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setTargetDate(goal.targetDate || '');
      setAchievedDate(goal.achievedDate || '');
    }

    const handleCommentSubmit = () => {
      if (newComment !== '') {
        dispatch(addGoalComment(goal._id, newComment))
          .then(() => setNewComment(''));
      }
    }

    const handleOpenDeleteConfirmation = () => setOpenDeleteConfirmation(true);
    const handleCloseDeleteConfirmation = () => setOpenDeleteConfirmation(false);

    const DeleteConfirmation = ({ goalId, open, onClose }) => {
      const submitDelete = () => dispatch(deleteGoal(goalId))
      return (
        <Dialog
          open={open}
          onClose={onClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            '& .MuiDialog-paper': {
              width: "80%",
            }
          }}
        >
          <DialogTitle id="alert-dialog-title">
            <Grid container  >
              <Grid container size={12} >
                Delete Confirmation
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
              <Grid container size={12}>
                <Typography variant="body1" >Are you sure you would like to permanently delete this goal?</Typography>
              </Grid>
              <Grid container size={12} spacing={2} sx={{ justifyContent: 'center' }}>
                <Grid >
                  <Button color='secondaryButton' variant="contained" onClick={onClose} >
                    Cancel
                  </Button>
                </Grid>
                <Grid >
                  <Button variant="contained" onClick={submitDelete} >
                    Confirm
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>);
    }

    useEffect(() => {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setTargetDate(goal.targetDate || '');
      setAchievedDate(goal.achievedDate || '');
    }, [goal])

    return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            height: '100%',
            width: "100%",
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          <Grid container  >
            <Grid container size={6} >
              Goal Details
            </Grid>
            <Grid container size={6} justifyContent="flex-end" >
              <Tooltip title="Delete">
                <IconButton variant="contained" onClick={handleOpenDeleteConfirmation} >
                  <Delete />
                </IconButton>
              </ Tooltip>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
            <Grid container size={12}>
              <TextField
                type="text"
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => handleChange(e, setTitle)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 6, }} >
              <TextField
                type="date"
                fullWidth
                label="Target Date"
                value={targetDate.substr(0, 10)}
                onChange={(e) => handleChange(e, setTargetDate)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 6, }} >
              <TextField
                type="date"
                fullWidth
                label="Achieved Date"
                value={achievedDate.substr(0, 10)}
                onChange={(e) => handleChange(e, setAchievedDate)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={12}>
              <TextField
                type="text"
                fullWidth
                multiline
                label="Description"
                value={description}
                onChange={(e) => handleChange(e, setDescription)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={12} spacing={2} sx={{ justifyContent: 'center' }}>
              <Grid >
                <Button color='secondaryButton' variant="contained" onClick={resetEdit} >
                  Reset
                </Button>
              </Grid>
              <Grid >
                <Button variant="contained" onClick={saveGoal} >
                  Save
                </Button>
              </Grid>
            </Grid>

            <DialogTitle id="alert-dialog-title">
              Comments
            </DialogTitle>
            <Grid container spacing={1} size={12} sx={{ padding: "10px 0px", justifyContent: 'center', }}>
              {goal.comments && goal.comments.length > 0
                ? goal.comments.map(comment => (
                  <Grid key={comment._id} container size={12} sx={{ padding: "12px 0px" }}>
                    <Grid container size={2} sx={{ justifyContent: 'center', alignItems: 'center', }}>
                      <Avatar src={comment?.user?.profilePicture ? `${serverURL}/user/profilePicture/${comment.user.profilePicture}` : null} />
                    </Grid>
                    <Grid container size={10}>
                      <Grid container size={12}>
                        <Typography variant="body1">
                          {comment?.user.firstName} {comment?.user.lastName}
                        </Typography>
                        <Typography variant="caption" component="p" sx={{ padding: '2.5px 5px', }}>{comment.createdDate.substr(0, 10)}</Typography>
                      </Grid>
                      <Grid size={11}>
                        <Typography variant="body2">{comment.comment}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                ))
                : <Typography variant="body1" >No comments</Typography>}
            </Grid>
            <Grid container size={12} sx={{ flexGrow: 1, alignContent: 'flex-end', flex: 'initial', }}>
              <TextField
                fullWidth
                multiline
                variant="outlined"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                label="Note"
                InputProps={{
                  endAdornment: <Button variant="contained" sx={{}} onClick={handleCommentSubmit}>Submit</Button>
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DeleteConfirmation open={openDeleteConfirmation} onClose={handleCloseDeleteConfirmation} goalId={goal._id} />
      </Dialog>
    )
  }

  const AddNewGoal = (props) => {
    const { open, onClose } = props;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [achievedDate, setAchievedDate] = useState('');

    const handleChange = (e, setter) => setter(e.target.value);

    const resetForm = () => {
      setTitle('');
      setDescription('');
      setTargetDate('');
      setAchievedDate('');
    }

    const submitNewGoal = () => {
      dispatch(addNewGoal({
        title,
        description,
        targetDate,
        achievedDate,
      }))
        .then(() => {
          resetForm();
          onClose();
        });
    }

    return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            height: '100%',
            width: "100%",
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          New Goal
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ padding: "10px 0px" }} >
            <Grid container size={12} >
              <TextField
                type="text"
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => handleChange(e, setTitle)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 6, }} >
              <TextField
                type="date"
                fullWidth
                label="Target Date"
                value={targetDate.substr(0, 10)}
                onChange={(e) => handleChange(e, setTargetDate)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={{ xs: 12, sm: 6, }} >
              <TextField
                type="date"
                fullWidth
                label="Achieved Date"
                value={achievedDate.substr(0, 10)}
                onChange={(e) => handleChange(e, setAchievedDate)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={12}>
              <TextField
                type="text"
                fullWidth
                multiline
                label="Description"
                value={description}
                onChange={(e) => handleChange(e, setDescription)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid container size={12} spacing={2} sx={{ justifyContent: 'center' }}>
              <Grid >
                <Button color='secondaryButton' variant="contained" onClick={resetForm} >
                  Reset
                </Button>
              </Grid>
              <Grid >
                <Button variant="contained" onClick={submitNewGoal} >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", padding: "15px 0px" }}>
        <Paper sx={{ padding: "5px 15px", borderRadius: "15px", minHeight: "100%", }}>

          <Grid container size={12} sx={{ justifyContent: 'center', paddingBottom: "15px", alignSelf: 'flex-start', flex: 'initial', }}>
            <Typography variant="h4">
              Goals
            </Typography>
            <Tooltip title="New Goal">
              <IconButton onClick={handleOpenAddNewGoal}><AddCircle /></IconButton>
            </ Tooltip>
          </Grid>

          <Grid container size={12} spacing={1} sx={{ alignSelf: 'flex-start', alignContent: 'flex-start', overflowY: 'scroll', scrollbarWidth: 'none', flex: 'auto', }}>
            {goals && goals.map((goal) => <GoalCard key={goal._id} goal={goal} handleOpenGoalDetails={handleOpenGoalDetails} />)}
          </Grid>

        </Paper>
      </Container>

      {selectedGoal && <GoalDetails goal={selectedGoal} open={openGoalDetails} onClose={handleCloseGoalDetails} />}
      <AddNewGoal goal={selectedGoal} open={openAddNewGoal} onClose={handleCloseAddNewGoal} />
    </>
  );
}
