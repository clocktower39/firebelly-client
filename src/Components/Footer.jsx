import React from "react";
import { Box, Typography } from "@mui/material";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      FirebellyFitness
      {" "}
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: 2,
        px: 2,
        borderTop: "1px solid rgba(148, 163, 184, 0.24)",
        backgroundColor: "rgba(15, 23, 42, 0.96)", // Slate 900 with slight overlay
        backdropFilter: "blur(10px)",
      }}
    >
      <Copyright />
    </Box>
  );
}
