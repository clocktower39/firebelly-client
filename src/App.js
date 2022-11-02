import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
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
import Nutrition from "./Components/ActivityTrackers/Nutrition";
import Week from "./Components/Week";
import Clients from "./Components/Clients";
import Messages from "./Components/Messages";
import Progress from "./Components/Progress";
import Goals from "./Components/ActivityTrackers/Goals";
import Account from "./Components/AccountComponents/Account";
import MyAccount from "./Components/AccountComponents/MyAccount";
import ThemeSettings from "./Components/AccountComponents/ThemeSettings";
import Trainers from "./Components/AccountComponents/Trainers";
import ExerciseLibrary from "./Components/ExerciseLibrary";
import ActivityTrackerContainer from "./Components/ActivityTrackers/ActivityTrackerContainer";
import NotFoundPage from "./Components/NotFoundPage";
import "./App.css";

function App({ socket }) {
  const themeMode = useSelector(state => state.user.themeMode);
  const [themeSelection, setThemeSelection] = useState(theme());
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
    return subdomain === "app"  || subdomain === "172" || subdomain === "192" || subdomain === "10" || host === "localhost:3000" ? false : true;
  };

  useEffect(()=>{
    setThemeSelection(theme());
  },[themeMode])

  return (
    <ThemeProvider theme={themeSelection}>
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
            <> {/* App */}
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/signup" element={<SignUp />} />

              {/* Must be logged in and have JWT token to authenticate */}
              <Route exact path="/" element={<AuthRoute />}>
                <Route exact path="/" element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Dashboard />} />
                </Route>
              </Route>

              <Route exact path="/tasks" element={<AuthRoute />}>
                <Route exact path="/tasks" element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Tasks />} />
                </Route>
              </Route>

              <Route exact path="/training" element={<AuthRoute />}>
                <Route exact path="/training" element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Training />} />
                </Route>
              </Route>

              <Route exact path="/nutrition" element={<AuthRoute />}>
                <Route exact path="/nutrition" element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Nutrition />} />
                </Route>
              </Route>

              <Route exact path="/progress" element={<AuthRoute />}>
                <Route exact path="/progress" element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Progress />} />
                </Route>
              </Route>
              
              <Route exact path="/goals" element={<AuthRoute />}>
                <Route exact path="/goals" element={<Goals />} />
              </Route>

              <Route exact path="/week" element={<AuthRoute />}>
                <Route exact path="/week" element={<Week />} />
              </Route>

              <Route exact path="/clients" element={<AuthRoute />}>
                <Route exact path="/clients" element={<Clients />} />
              </Route>

            <Route exact path="/messages" element={<AuthRoute />} >
              <Route exact path="/messages" element={<Messages socket={socket} />} />
            </Route>

              <Route exact path="/account/*" element={<AuthRoute />}>
                <Route exact path="/account/*/*" element={<Account />}>
                  <Route index={true} exact path="" element={<MyAccount />} />
                  <Route index={true} exact path="theme" element={<ThemeSettings />} />
                  <Route index={true} exact path="trainers" element={<Trainers />} />
                </Route>
              </Route>

              <Route exact path="/clients" element={<AuthRoute />}>
                <Route exact path="/clients" element={<Clients />} />
              </Route>

              <Route exact path="/exerciseLibrary" element={<AuthRoute />}>
                <Route exact path="/exerciseLibrary" element={<ExerciseLibrary />} />
              </Route>
            </>
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
