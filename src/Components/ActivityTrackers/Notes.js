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
      <Container maxWidth="md" sx={{ height: "100%", padding: "15px 0px" }}>
        <Paper sx={{ padding: "5px 15px", borderRadius: "15px", height: "100%", display: 'flex', flexDirection: 'column', flex: 'auto',  }}>

          <Grid container item xs={12} sx={{ justifyContent: 'center', paddingBottom: "15px", alignSelf: 'flex-start', flex: 'initial', }}>
            <Typography variant="h4">
              Notes
            </Typography>
          </Grid>

          <Grid container item xs={12} sx={{ alignSelf: 'flex-start', alignContent: 'flex-start', overflowY: 'scroll', flex: 'auto', }}>
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
                      <Typography variant="caption" component="p" sx={{ padding: '2.5px 5px', }}>{n.date.substr(0, 10)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">{n.note}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
          </Grid>

          <Grid container item xs={12} sx={{ flexGrow: 1, alignContent: 'flex-end', flex: 'initial', }}>
            <TextField
              fullWidth
              multiline

              variant="outlined"
              value={note || ""}
              onChange={(e) => handleChange(e)}
              label="Note"
              InputProps={{
                endAdornment: <Button variant="contained" sx={{}} onClick={handleSave}>Submit</Button>
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

        </Paper>
      </Container>
      <AuthNavbar />
    </>
  );
}
