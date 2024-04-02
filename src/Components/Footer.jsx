import React from "react";
import { Typography } from "@mui/material";

function Copyright() {
  return (
    <Typography variant="body2" color="#fff" align="center">
      {"Copyright © "}
        FirebellyFitness
      {" "}
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <>
      <footer
        style={{
          marginTop: "1rem",
          backgroundColor: "#000",
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
        }}
      >
        <Copyright />
      </footer>
    </>
  );
}
