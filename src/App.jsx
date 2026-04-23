import React, { useState, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from "react-router-dom";
import { ThemeProvider, GlobalStyles } from "@mui/material";
import { theme } from "./theme";
import { removeWorkouts, requestClients, serverURL, upsertWorkout } from "./Redux/actions";
import socketIOClient from "socket.io-client";
import AuthRoute from "./Components/AuthRoute";
import WebsiteNavbar from "./Pages/WebsitePages/WebsiteNavbar";
import WebsiteHome from "./Pages/WebsitePages/WebsiteHome";
import NutritionInfo from "./Pages/WebsitePages/Nutrition";
import Workshops from "./Pages/WebsitePages/Workshops";
import TrainingInfo from "./Pages/WebsitePages/TrainingInfo";
import PublicSchedule from "./Pages/WebsitePages/PublicSchedule";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import VerifyEmail from "./Pages/VerifyEmail";
import Home from "./Pages/AppPages/Home";
import Coverage from "./Pages/AppPages/Coverage";
import Workout from "./Pages/AppPages/Workout";
import Calendar from "./Pages/AppPages/Calendar";
import Schedule from "./Pages/AppPages/Schedule";
import ProgramBuilder from "./Pages/AppPages/ProgramBuilder";
import Programs from "./Pages/AppPages/Programs";
import ProgramsMarketplacePreview from "./Pages/AppPages/ProgramsMarketplacePreview";
import WorkoutTemplates from "./Pages/AppPages/WorkoutTemplates";
import WorkoutHistory from "./Pages/AppPages/WorkoutHistory";
import Exercises from "./Pages/AppPages/Exercises";
import Clients from "./Pages/AppPages/Clients";
import Groups from "./Pages/AppPages/Groups";
import GroupDetail from "./Pages/AppPages/GroupDetail";
import GroupInviteAccept from "./Pages/AppPages/GroupInviteAccept";
import Progress from "./Pages/AppPages/Progress";
import Goals from "./Pages/AppPages/Goals";
import Account from "./Pages/AppPages/Account";
import Invoices from "./Pages/AppPages/Invoices";
import Products from "./Pages/AppPages/Products";
import TrainerStore from "./Pages/AppPages/TrainerStore";
import MyAccount from "./Components/AccountComponents/MyAccount";
import ThemeSettings from "./Components/AccountComponents/ThemeSettings";
import Trainers from "./Components/AccountComponents/Trainers";
import ChangePassword from "./Components/AccountComponents/ChangePassword";
import LogoutConfirmation from "./Components/AccountComponents/LogoutConfirmation";
import WorkoutPreferences from "./Components/AccountComponents/WorkoutPreferences";
import GuardianDashboard from "./Components/AccountComponents/GuardianDashboard";
import ActivityTrackerContainer from "./Pages/AppPages/ActivityTrackerContainer";
import NotFoundPage from "./Pages/NotFoundPage";
import "./App.css";

const getSocketURL = () => {
  if (serverURL === "/api") {
    return typeof window !== "undefined" ? window.location.origin : undefined;
  }
  return serverURL;
};

function App({ }) {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.user.themeMode);
  const [themeSelection, setThemeSelection] = useState(theme());

  const userId = useSelector((state) => state.user._id);
  const isTrainer = useSelector((state) => state.user.isTrainer);
  const workoutAccountIds = useSelector((state) => {
    const ids = new Set();
    if (state.user?._id) ids.add(String(state.user._id));

    Object.keys(state.workouts || {}).forEach((accountId) => {
      if (accountId) ids.add(String(accountId));
    });

    (state.clients || []).forEach((clientRel) => {
      const clientId = clientRel?.client?._id || clientRel?.client;
      if (clientRel?.accepted && clientId) ids.add(String(clientId));
    });

    return Array.from(ids).sort();
  }, shallowEqual);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (userId) {
      const newSocket = socketIOClient(getSocketURL(), {
        path: "/socket.io",
        query: { userId },
        transports: ["websocket"],
        upgrade: false,
      });
      setSocket(newSocket);

      return () => newSocket.disconnect(); // Cleanup on unmount
    }
  }, [userId]);

  useEffect(() => {
    if (isTrainer) {
      dispatch(requestClients());
    }
  }, [dispatch, isTrainer]);

  useEffect(() => {
    if (!socket) return;

    const handleWorkoutUpdated = (payload) => {
      const workout = payload?.workout || payload?.updatedWorkout;
      if (!workout?._id) return;
      dispatch(upsertWorkout(workout, payload.accountId));
    };
    const handleWorkoutDeleted = (payload) => {
      if (!payload?.accountId || !payload?.workoutId) return;
      dispatch(removeWorkouts(payload.accountId, [payload.workoutId]));
    };

    socket.on("workoutUpdated", handleWorkoutUpdated);
    socket.on("workoutDeleted", handleWorkoutDeleted);
    return () => {
      socket.off("workoutUpdated", handleWorkoutUpdated);
      socket.off("workoutDeleted", handleWorkoutDeleted);
    };
  }, [dispatch, socket]);

  useEffect(() => {
    if (!socket || workoutAccountIds.length === 0) return;

    workoutAccountIds.forEach((accountId) => {
      socket.emit("joinWorkoutAccount", { accountId });
    });

    return () => {
      workoutAccountIds.forEach((accountId) => {
        socket.emit("leaveWorkoutAccount", { accountId });
      });
    };
  }, [socket, workoutAccountIds]);

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
      <GlobalStyles
        styles={(theme) => ({
          html: {
            backgroundColor: theme.palette.background.default,
            minHeight: "100vh",
          },
          body: {
            backgroundColor: theme.palette.background.default,
            minHeight: "100vh",
            margin: 0,
          },
          "#root": {
            backgroundColor: theme.palette.background.default,
            minHeight: "100vh",
          },
        })}
      />
      <Router>
        <Routes>
          {/* Default website pages, anyone can access */}
          {checkSubDomain() ? (
            <>
              <Route exact path="/" element={<WebsiteHome />} />
              <Route exact path="/nutrition" element={<NutritionInfo />} />
              <Route exact path="/workshops" element={<Workshops />} />
              <Route exact path="/training" element={<TrainingInfo />} />
              <Route exact path="/public/sessions/:trainerId" element={<PublicSchedule />} />
              <Route exact path="/public/schedule/:trainerId" element={<PublicScheduleRedirect />} />

              <Route path="*" element={<><WebsiteNavbar /><NotFoundPage /></>} />
            </>
          ) : (
            <>
              {" "}
              {/* App */}
              <Route element={<ActivityTrackerContainer />}>
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/signup" element={<SignUp />} />
              <Route exact path="/groups/invite" element={<GroupInviteAccept />} />
              <Route exact path="/public/sessions/:trainerId" element={<PublicSchedule />} />
                <Route exact path="/public/schedule/:trainerId" element={<PublicScheduleRedirect />} />

                {/* Must be logged in and have JWT token to authenticate */}
                <Route exact element={<AuthRoute />}>
                  <Route exact path="/" element={<Home />} />
                  <Route exact path="/coverage" element={<Coverage />} />
                  <Route exact path="/workoutHistory" element={<WorkoutHistory />} />
                  <Route exact path="/calendar" element={<Calendar />} />
                  <Route exact path="/workout-templates" element={<WorkoutTemplates />} />
                  <Route exact path="/sessions" element={<Schedule />} />
                  <Route exact path="/schedule" element={<Navigate to="/sessions" replace />} />
                  <Route exact path="/workout/:_id" element={<Workout socket={socket} />} />
                  <Route exact path="/progress" element={<Progress />} />
                  <Route exact path="/goals" element={<Goals />} />
                  <Route exact path="/exercises" element={<Exercises />} />
                  <Route exact path="/invoices" element={<Invoices />} />
                  <Route exact path="/session-counter" element={<Navigate to="/invoices" replace />} />
                  <Route exact path="/products" element={<Products />} />
                  <Route exact path="/trainer-store" element={<TrainerStore />} />
                  <Route exact path="/programs" element={<Programs />} />
                  <Route exact path="/programs/marketplace-preview" element={<ProgramsMarketplacePreview />} />
                  <Route exact path="/programs/builder" element={<ProgramBuilder />} />
                  <Route exact path="/programs/:programId/edit" element={<ProgramBuilder />} />
                  <Route exact path="/groups" element={<Groups />} />
                  <Route exact path="/groups/:groupId" element={<GroupDetail />} />

                  <Route exact path="/account/*" element={<Account />}>
                    <Route index={true} exact path="" element={<MyAccount />} />
                    <Route index={true} exact path="theme" element={<ThemeSettings />} />
                    <Route index={true} exact path="workout-preferences" element={<WorkoutPreferences />} />
                    <Route
                      index={true}
                      exact
                      path="trainer-connections"
                      element={<Navigate to="/account/trainers" replace />}
                    />
                    <Route index={true} exact path="family" element={<GuardianDashboard />} />
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

function PublicScheduleRedirect() {
  const { trainerId } = useParams();
  return <Navigate to={`/public/sessions/${trainerId}`} replace />;
}

export default App;
