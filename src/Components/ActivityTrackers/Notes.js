import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Container, Grid, Paper, TextField, Typography } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { requestNotes, createNote } from "../../Redux/actions";
import AuthNavbar from "../AuthNavbar";

export default function Notes() {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes);
  const [note, setNote] = useState("");
  const handleChange = (e) => {
    setNote(e.target.value);
  };

  const handleSave = () => {
    dispatch(createNote(note)).then(() => setNote(""));
  };

  useEffect(() => {
    dispatch(requestNotes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", paddingTop: "15px", paddingBottom: "75px" }}>
        <Paper sx={{ padding: "5px 15px", borderRadius: "15px", minHeight: "100%" }}>
          <Grid container sx={{ alignItems: "center", paddingBottom: "15px" }}>
            <Grid item xs={12}>
              <Typography variant="h4" textAlign="center">
                Notes
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid container item xs={12}>
              {notes &&
                notes.map((n, i) => (
                  <Grid key={`note-${n.date}-${i}`} container sx={{ padding: "12px 0px" }}>
                    <Grid container item xs={2} sx={{ justifyContent: 'center', alignItems: 'center', }}>
                      <AccountCircle />
                    </Grid>
                    <Grid container item xs={10}>
                      <Grid container item xs={12}>
                        <Typography variant="body1">
                          {n.firstName} {n.lastName}
                        </Typography>
                        <Typography variant="caption" component="p" sx={{ padding: '2.5px 5px',}}>{n.date.substr(0, 10)}</Typography>
                      </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">{n.note}</Typography>
                    </Grid>
                    </Grid>
                  </Grid>
                ))}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                variant="outlined"
                value={note || ""}
                onChange={(e) => handleChange(e)}
                label="Note"
              />
            </Grid>
            <Grid item container style={{ justifyContent: "center" }} xs={12}>
              <Button variant="outlined" onClick={handleSave}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <AuthNavbar />
    </>
  );
}
