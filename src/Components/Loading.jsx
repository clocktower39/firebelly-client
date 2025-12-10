import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const classes = {
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
            minHeight: "calc(100vh - 165px)",
  },
};

export default function CircularIndeterminate() {

  return (
    <Box sx={classes.root}>
      <Typography variant="h4">Loading</Typography>
      <CircularProgress />
    </Box>
  );
}
