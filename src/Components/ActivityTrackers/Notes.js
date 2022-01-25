import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ExpandMore } from "@mui/icons-material";
import { requestDailyNote, updateDailyNote } from "../../Redux/actions";
import SelectedDate from "./SelectedDate";
import AuthNavbar from '../AuthNavbar';

const useStyles = makeStyles((theme) => ({
  root: {},
}));

export default function Notes(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const today = useSelector((state) => state.calander.dailyView);
  const [selectedDate, setSelectedDate] = useState(null);

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
    dispatch(requestDailyNote(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <>
      <Container maxWidth="md" style={{ height: "100%", paddingTop: "25px" }}>
        <SelectedDate setParentSelectedDate={setSelectedDate} />
        <Accordion defaultExpanded>
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
                  value={note || ""}
                  onChange={(e) => handleChange(e)}
                  label="Please provide feedback on your day; what was difficult and what went well?"
                />
              </Grid>
              <Grid item container style={{ justifyContent: "center" }} xs={12}>
                <Button variant="outlined" onClick={handleSave}>
                  Save
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Container>
      <AuthNavbar />
    </>
  );
}
