import React from "react";
import { Button, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Grid container sx={{ alignContent: 'center', height: 'calc(100vh - 20px)'}} > {/* make this expand to fill the entire parent container height and center the elements horizontally and vertically */}
      <Grid container item xs={12} sx={{ alignItems: "center", justifyContent: "center" }}>
        <Typography textAlign="center" variant="h4">
          404: Page Not Found
        </Typography>
      </Grid>
      <Grid container item xs={12} sx={{ alignItems: "center", justifyContent: "center" }}>
        <Button component={Link} to="/">
          Go Home
        </Button>
      </Grid>
    </Grid>
  );
}
