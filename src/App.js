import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import AuthRoute from "./Components/AuthRoute";
import Home from "./Components/BasicInfoComponents/Home";
import Fitness from "./Components/BasicInfoComponents/Fitness";
import NutritionInfo from "./Components/BasicInfoComponents/Nutrition";
import Workshops from "./Components/BasicInfoComponents/Workshops";
import TrainingInfo from "./Components/BasicInfoComponents/TrainingInfo";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import Dashboard from "./Components/Dashboard";
import Tasks from "./Components/ActivityTrackers/Tasks";
import Training from "./Components/ActivityTrackers/Training";
import Notes from "./Components/ActivityTrackers/Notes";
import Nutrition from "./Components/ActivityTrackers/Nutrition";
import Week from "./Components/Week";
import Account from "./Components/AccountComponents/Account";
import Clients from "./Components/Clients";
import Progress from "./Components/Progress";
import MyAccount from "./Components/AccountComponents/MyAccount";
import Biometrics from "./Components/AccountComponents/Biometrics";
import ExerciseLibrary from "./Components/ExerciseLibrary";
import "./App.css";

function App() {
  const checkSubDomain = () => {
    let host = window.location.host;
    let parts = host.split(".");
    let subdomain = "";
    // If we get more than 3 parts, then we have a subdomain
    // INFO: This could be 4, if you have a co.uk TLD or something like that.
    if (parts.length >= 3) {
      subdomain = parts[0];
      // Remove the subdomain from the parts list
      parts.splice(0, 1);
      // Set the location to the new url
    }
    return subdomain === "app" || host === "localhost:3000" ? false : true;
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Default website pages, anyone can access */}
          {checkSubDomain() ? (
            <>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/basicinfo/fitness" element={<Fitness />} />
              <Route exact path="/basicinfo/nutrition" element={<NutritionInfo />} />
              <Route exact path="/basicinfo/workshops" element={<Workshops />} />
              <Route exact path="/basicinfo/training" element={<TrainingInfo />} />
            </>
          ) : (
            <>
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/signup" element={<SignUp />} />

              {/* Must be logged in and have JWT token to authenticate */}
              <Route exact path="/" element={<AuthRoute />}>
                <Route exact path="/" element={<Dashboard />} />
              </Route>

              <Route exact path="/tasks" element={<AuthRoute />}>
                <Route exact path="/tasks" element={<Tasks />} />
              </Route>

              <Route exact path="/training" element={<AuthRoute />}>
                <Route exact path="/training" element={<Training />} />
              </Route>

              <Route exact path="/nutrition" element={<AuthRoute />}>
                <Route exact path="/nutrition" element={<Nutrition />} />
              </Route>
              <Route exact path="/notes" element={<AuthRoute />}>
                <Route exact path="/notes" element={<Notes />} />
              </Route>
              <Route exact path="/nutrition" element={<AuthRoute />}>
                <Route exact path="/nutrition" element={<Nutrition />} />
              </Route>

              <Route exact path="/week" element={<AuthRoute />}>
                <Route exact path="/week" element={<Week />} />
              </Route>

              <Route exact path="/account/*" element={<AuthRoute />}>
                <Route exact path="/account/*/*" element={<Account />}>
                  <Route index={true} exact path="" element={<MyAccount />} />
                  <Route index={false} exact path="biometrics" element={<Biometrics />} />
                </Route>
              </Route>

              <Route exact path="/clients" element={<AuthRoute />}>
                <Route exact path="/clients" element={<Clients />} />
              </Route>

              <Route exact path="/progress" element={<AuthRoute />}>
                <Route exact path="/progress" element={<Progress />} />
              </Route>

              <Route exact path="/exerciseLibrary" element={<AuthRoute />}>
                <Route exact path="/exerciseLibrary" element={<ExerciseLibrary />} />
              </Route>
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
