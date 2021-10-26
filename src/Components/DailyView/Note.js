import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from '@mui/styles';
import { ExpandMore } from "@mui/icons-material";
import { requestDailyNote, updateDailyNote } from "../../Redux/actions";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

export default function Note(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const today = useSelector((state) => state.calander.dailyView);

  const [note, setNote] = useState("");
  const handleChange = (e) => {
    setNote(e.target.value);
  };

  const handleSave = () => {
    dispatch(updateDailyNote({ _id: today.dailyNote._id, note }));
  };

  useEffect(() => {
    setNote(today.dailyNote.note);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today.dailyNote.note]);

  useEffect(() => {
    setNote("");
    dispatch(requestDailyNote(user._id, props.selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedDate]);

  return (
    <Accordion defaultExpanded >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Grid container alignItems="center">
          <Grid item xs={3}>
            <Typography className={classes.heading}>Notes</Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              variant="outlined"
              value={note||''}
              onChange={(e) => handleChange(e)}
              label="Please provide feedback on your day; what was difficult and what went well?"
            />
          </Grid>
          <Grid item container style={{justifyContent:"center"}} xs={12}>
            <Button variant="outlined" onClick={handleSave}>
              Save
            </Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
