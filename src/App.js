import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import AuthRoute from "./Components/AuthRoute";
import WebsiteHome from "./Pages/WebsitePages/WebsiteHome";
import Fitness from "./Pages/WebsitePages/Fitness";
import NutritionInfo from "./Pages/WebsitePages/Nutrition";
import Workshops from "./Pages/WebsitePages/Workshops";
import TrainingInfo from "./Pages/WebsitePages/TrainingInfo";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Home from "./Pages/AppPages/Home";
import Workout from "./Pages/AppPages/Workout";
import Dashboard from "./Pages/AppPages/Dashboard";
import Tasks from "./Pages/AppPages/Tasks";
// import Training from "./Pages/AppPages/Training";
import WorkoutHistory from "./Pages/AppPages/WorkoutHistory";
import Nutrition from "./Pages/AppPages/Nutrition";
import Week from "./Pages/AppPages/Week";
import Clients from "./Pages/AppPages/Clients";
import Progress from "./Pages/AppPages/Progress";
import Goals from "./Pages/AppPages/Goals";
import Account from "./Pages/AppPages/Account";
import MyAccount from "./Components/AccountComponents/MyAccount";
import ThemeSettings from "./Components/AccountComponents/ThemeSettings";
import Trainers from "./Components/AccountComponents/Trainers";
import ExerciseLibrary from "./Pages/AppPages/ExerciseLibrary";
import ActivityTrackerContainer from "./Pages/AppPages/ActivityTrackerContainer";
import NotFoundPage from "./Pages/NotFoundPage";
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
    // end line with false : true for production
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
              <Route exact path="/" element={<WebsiteHome />} />
              <Route exact path="/fitness" element={<Fitness />} />
              <Route exact path="/nutrition" element={<NutritionInfo />} />
              <Route exact path="/workshops" element={<Workshops />} />
              <Route exact path="/training" element={<TrainingInfo />} />
            </>
          ) : (
            <> {/* App */}
            {document.getElementById("root").style.scrollbarWidth = 'none'}
            {document.getElementById("root").style.height = 'calc(100% - 56px)'}

              <Route exact path="/login" element={<Login />} />
              <Route exact path="/signup" element={<SignUp />} />

              {/* Must be logged in and have JWT token to authenticate */}
              <Route exact path="/" element={<AuthRoute />}>
                <Route element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Home />} />
                </Route>
              </Route>
              
              <Route exact path="/dashboard" element={<AuthRoute />}>
                <Route element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Dashboard />} />
                </Route>
              </Route>

              <Route exact path="/history" element={<AuthRoute />}>
                <Route element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<WorkoutHistory />} />
                </Route>
              </Route>

              <Route exact path="/workout" element={<AuthRoute />}>
                <Route element={<ActivityTrackerContainer />} >
                  <Route exact path="/workout/:_id" element={<Workout />} />
                </Route>
              </Route>


              <Route exact path="/tasks" element={<AuthRoute />}>
                <Route element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Tasks />} />
                </Route>
              </Route>

              {/* <Route exact path="/training" element={<AuthRoute />}>
                <Route element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Training />} />
                </Route>
              </Route> */}

              <Route exact path="/nutrition" element={<AuthRoute />}>
                <Route element={<ActivityTrackerContainer />} >
                  <Route exact path="" element={<Nutrition />} />
                </Route>
              </Route>

              <Route exact path="/progress" element={<AuthRoute />}>
                <Route element={<ActivityTrackerContainer />} >
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

              <Route exact path="/account/*" element={<AuthRoute />}>
                <Route element={<ActivityTrackerContainer />} >
                  <Route exact path="/account/*/*" element={<Account />}>
                    <Route index={true} exact path="" element={<MyAccount />} />
                    <Route index={true} exact path="theme" element={<ThemeSettings />} />
                    <Route index={true} exact path="trainers" element={<Trainers socket={socket} />} />
                  </Route>
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
