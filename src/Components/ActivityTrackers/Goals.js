import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
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
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  AccountCircle,
} from "@mui/icons-material";
import { getGoals, updateGoal, addGoalComment } from "../../Redux/actions";
import AuthNavbar from "../AuthNavbar";

export default function Goals() {
  const dispatch = useDispatch();
  const goals = useSelector((state) => state.goals);

  useEffect(() => {
    dispatch(getGoals());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GoalCard = ({ goal }) => {
    const [openGoalDetails, setOpenGoalDetails] = useState(false);

    const handleOpenGoalDetails = () => setOpenGoalDetails(true);
    const handleCloseGoalDetails = () => setOpenGoalDetails(false);

    return (
      <Grid
        container
        item
        md={4}
        sm={6}
        xs={12}
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
            <CardActionArea onClick={handleOpenGoalDetails}
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
        <GoalDetails goal={goal} open={openGoalDetails} onClose={handleCloseGoalDetails} />
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

    const handleChange = (e, setter) => setter(e.target.value);

    const saveTask = () => {
      dispatch(updateGoal({
        _id: goal._id,
        title,
        description,
        targetDate,
        achievedDate,
      }))
    }

    const cancelEdit = () => {
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
            width: "100%",
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          Goal Details
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
            <Grid item container xs={12}>
              <TextField
                type="text"
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => handleChange(e, setTitle)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item container xs={12} sm={6} >
              <TextField
                type="date"
                fullWidth
                label="Target Date"
                value={targetDate.substr(0, 10)}
                onChange={(e) => handleChange(e, setTargetDate)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item container xs={12} sm={6} >
              <TextField
                type="date"
                fullWidth
                label="Achieved Date"
                value={achievedDate.substr(0, 10)}
                onChange={(e) => handleChange(e, setAchievedDate)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item container xs={12}>
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
            <Grid item container xs={12} spacing={2} sx={{ justifyContent: 'center' }}>
              <Grid item>
                <Button color='secondaryButton' variant="contained" onClick={cancelEdit} >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={saveTask} >
                  Save
                </Button>
              </Grid>
            </Grid>

            <DialogTitle id="alert-dialog-title">
              Comments
            </DialogTitle>
            <Grid container spacing={1} item sx={{ padding: "10px 0px" }}>
              {goal.comments && goal.comments.length > 0
                ? goal.comments.map(comment => (
                  <Grid key={comment._id} container sx={{ padding: "12px 0px" }}>
                    <Grid container item xs={2} sx={{ justifyContent: 'center', alignItems: 'center', }}>
                      <AccountCircle />
                    </Grid>
                    <Grid container item xs={10}>
                      <Grid container item xs={12}>
                        <Typography variant="body1">
                          {/* {n.firstName} {n.lastName} */}
                        </Typography>
                        <Typography variant="caption" component="p" sx={{ padding: '2.5px 5px', }}>{comment.createdDate.substr(0, 10)}</Typography>
                      </Grid>
                      <Grid item xs={11}>
                        <Typography variant="body2">{comment.comment}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                ))
                : "No comments"}
            </Grid>
            <Grid container item xs={12} sx={{ flexGrow: 1, alignContent: 'flex-end', flex: 'initial', }}>
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
      </Dialog>
    )
  }

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", padding: "15px 0px" }}>
        <Paper sx={{ padding: "5px 15px", borderRadius: "15px", height: "100%", display: 'flex', flexDirection: 'column', flex: 'auto', }}>

          <Grid container item xs={12} sx={{ justifyContent: 'center', paddingBottom: "15px", alignSelf: 'flex-start', flex: 'initial', }}>
            <Typography variant="h4">
              Goals
            </Typography>
          </Grid>

          <Grid container item xs={12} spacing={1} sx={{ alignSelf: 'flex-start', alignContent: 'flex-start', overflowY: 'scroll', scrollbarWidth: 'none', flex: 'auto', }}>
            {goals.map((goal) => <GoalCard key={goal._id} goal={goal} /> )}
          </Grid>

        </Paper>
      </Container>
      <AuthNavbar />
    </>
  );
}
