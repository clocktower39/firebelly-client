import React from "react";
import { Route, Switch, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import MyAccount from "./MyAccount";
import AccountTasks from "./AccountTasks";

export default function Account() {
  return (
    <Container maxWidth="md" style={{ height: "100%" }}>
      <Grid container>
        <Grid container item xs={4} alignContent="flex-start">
          <Grid item xs={12}>
            <Typography variant="h5" style={{ color: "#fff" }}>
              Account Settings
            </Typography>
          </Grid>
            <List>
              <ListItem button component={Link} to='/account'>
                <ListItemText primary="My Account" />
              </ListItem>
              <ListItem button component={Link} to='/account/tasks'>
                <ListItemText primary="Default Tasks" />
              </ListItem>
              <ListItem button component={Link} to='/account/tasks'>
                <ListItemText primary="Biometrics" />
              </ListItem>
            </List>
            
        </Grid>
          <Grid container item xs={7}>
            <Switch>
              <Route exact path="/account" component={MyAccount} />
              <Route exact path="/account/tasks" component={AccountTasks} />
            </Switch>
          </Grid>
      </Grid>
    </Container>
  );
}
