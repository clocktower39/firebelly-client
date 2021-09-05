import React from "react";
import {
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import MyAccount from "./MyAccount";

export default function Account() {
  return (
    <Container maxWidth="md" style={{ height: "100%" }}>
      <Grid container>
        <Grid container item xs={4}>
          <Grid item xs={12}>
            <Typography variant="h5" style={{ color: "#fff" }}>
              Account Settings
            </Typography>
          </Grid>
          <Grid container item xs={12}>
            <List>
              <ListItem button >
                <ListItemText primary="My Account" />
              </ListItem>
            </List>
          </Grid>
        </Grid>
        <Grid container item xs={7}>
          <MyAccount />
        </Grid>
      </Grid>
    </Container>
  );
}
