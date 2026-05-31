import React from "react";
import { Button, Container, Divider, Grid, TextField } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

export default function WeekNavigator({
  selectedDate,
  setSelectedDate,
  weekPickerRef,
  weekRangeDisplay,
  dayjs,
}) {
  return (
    <Grid container size={12}>
      <Container maxWidth="md" sx={{ height: "100%", paddingTop: "25px", maxWidth: "100%" }}>
        <Grid size={12} container sx={{ justifyContent: "center", flexWrap: "nowrap" }}>
          <Button onClick={() => setSelectedDate(selectedDate.subtract(1, "week"))}>
            <ArrowBack sx={{ color: "primary.dark" }} />
          </Button>
          <TextField
            focused
            label="Week"
            type="text"
            color="primary"
            value={weekRangeDisplay}
            onClick={() => {
              if (weekPickerRef.current?.showPicker) {
                weekPickerRef.current.showPicker();
              } else if (weekPickerRef.current) {
                weekPickerRef.current.click();
                weekPickerRef.current.focus();
              }
            }}
            InputProps={{ readOnly: true }}
          />
          <Button onClick={() => setSelectedDate(selectedDate.add(1, "week"))}>
            <ArrowForward sx={{ color: "primary.dark" }} />
          </Button>
          <input
            ref={weekPickerRef}
            type="date"
            value={selectedDate.format("YYYY-MM-DD")}
            onChange={(event) => setSelectedDate(dayjs(event.target.value))}
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              width: 0,
              height: 0,
            }}
          />
        </Grid>
        <Divider sx={{ margin: "15px" }} />
      </Container>
    </Grid>
  );
}

