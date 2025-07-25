import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { serverURL } from "./Redux/actions";
import socketIOClient from "socket.io-client";
import AuthRoute from "./Components/AuthRoute";
import WebsiteNavbar from "./Pages/WebsitePages/WebsiteNavbar";
import WebsiteHome from "./Pages/WebsitePages/WebsiteHome";
import NutritionInfo from "./Pages/WebsitePages/Nutrition";
import Workshops from "./Pages/WebsitePages/Workshops";
import TrainingInfo from "./Pages/WebsitePages/TrainingInfo";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import VerifyEmail from "./Pages/VerifyEmail";
import Home from "./Pages/AppPages/Home";
import Workout from "./Pages/AppPages/Workout";
import Tasks from "./Pages/AppPages/Tasks";
import Calendar from "./Pages/AppPages/Calendar";
import WorkoutHistory from "./Pages/AppPages/WorkoutHistory";
import WorkoutBuilder from "./Pages/AppPages/WorkoutBuilder";
// import WorkoutQueue from "./Pages/AppPages/WorkoutQueue";
import Exercises from "./Pages/AppPages/Exercises";
import Nutrition from "./Pages/AppPages/Nutrition";
import Clients from "./Pages/AppPages/Clients";
import Progress from "./Pages/AppPages/Progress";
import Goals from "./Pages/AppPages/Goals";
import Account from "./Pages/AppPages/Account";
import MyAccount from "./Components/AccountComponents/MyAccount";
import ThemeSettings from "./Components/AccountComponents/ThemeSettings";
import Trainers from "./Components/AccountComponents/Trainers";
import ChangePassword from "./Components/AccountComponents/ChangePassword";
import LogoutConfirmation from "./Components/AccountComponents/LogoutConfirmation";
import ActivityTrackerContainer from "./Pages/AppPages/ActivityTrackerContainer";
import NotFoundPage from "./Pages/NotFoundPage";
import "./App.css";

function App({ }) {
  const themeMode = useSelector((state) => state.user.themeMode);
  const [themeSelection, setThemeSelection] = useState(theme());

  const userId = useSelector((state) => state.user._id);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (userId) {
      const newSocket = socketIOClient(serverURL, {
        query: { userId },
        transports: ["websocket"],
        upgrade: false,
      });
      setSocket(newSocket);

      return () => newSocket.disconnect(); // Cleanup on unmount
    }
  }, [userId]);

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
    return subdomain === "app" ||
      subdomain === "172" ||
      subdomain === "192" ||
      subdomain === "10" ||
      host === "localhost:3000"
      ? false
      : true;
  };

  useEffect(() => {
    setThemeSelection(theme());
  }, [themeMode]);

  return (
    <ThemeProvider theme={themeSelection}>
      <Router>
        <Routes>
          {/* Default website pages, anyone can access */}
          {checkSubDomain() ? (
            <>
              <Route exact path="/" element={<WebsiteHome />} />
              <Route exact path="/nutrition" element={<NutritionInfo />} />
              <Route exact path="/workshops" element={<Workshops />} />
              <Route exact path="/training" element={<TrainingInfo />} />

              <Route path="*" element={<><WebsiteNavbar /><NotFoundPage /></>} />
            </>
          ) : (
            <>
              {" "}
              {/* App */}
              <Route element={<ActivityTrackerContainer />}>
                <Route exact path="/login" element={<Login />} />
                <Route exact path="/signup" element={<SignUp />} />

                {/* Must be logged in and have JWT token to authenticate */}
                <Route exact element={<AuthRoute />}>
                  <Route exact path="/" element={<Home />} />
                  <Route exact path="/workoutHistory" element={<WorkoutHistory />} />
                  <Route exact path="/calendar" element={<Calendar />} />
                  <Route exact path="/workout/:_id" element={<Workout socket={socket} />} />
                  {/* <Route exact path="/queue" element={<WorkoutQueue />} /> */}
                  <Route exact path="/builder" element={<WorkoutBuilder />} />
                  <Route exact path="/tasks" element={<Tasks />} />
                  <Route exact path="/nutrition" element={<Nutrition />} />
                  <Route exact path="/progress" element={<Progress />} />
                  <Route exact path="/goals" element={<Goals />} />
                  <Route exact path="/exercises" element={<Exercises />} />

                  <Route exact path="/account/*" element={<Account />}>
                    <Route index={true} exact path="" element={<MyAccount />} />
                    <Route index={true} exact path="theme" element={<ThemeSettings />} />
                    <Route
                      index={true}
                      exact
                      path="trainers"
                      element={<Trainers socket={socket} />}
                    />
                    <Route index={true} exact path="password" element={<ChangePassword />} />
                    <Route index={true} exact path="logout" element={<LogoutConfirmation />} />
                  </Route>

                  <Route exact path="/clients" element={<Clients socket={socket} />} />

                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </>
          )}
          <Route element={<ActivityTrackerContainer />}>
            <Route exact path="/verify-email" element={<VerifyEmail />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
