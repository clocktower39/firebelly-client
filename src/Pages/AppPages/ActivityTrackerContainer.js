import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Paper } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import NavDrawer from "./NavDrawer";
import Footer from "../../Components/Footer";

export default function ActivityTrackerContainer(props) {
  const { socket } = props;
  const location = useLocation(); // Get the current location

  const [size, setSize] = useState(null);
  const containerRef = useRef(null);
  const updateDimensions = () => {
    if (containerRef.current) setSize(containerRef.current.offsetWidth);
  };
  const [borderHighlight, setBorderHighlight] = useState(false);

  useEffect(() => {
    // Reset borderHighlight to false on link change
    setBorderHighlight(false);

    window.addEventListener("resize", updateDimensions);
    setSize(containerRef.current.offsetWidth);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [location.pathname]); // Add location.pathname as a dependency

  return (
    <>
      <NavDrawer />
      <Container
        maxWidth="md"
        component={Box}
        sx={{
          padding: "0 5px",
          height: "calc(100vh - 65px)",
          minHeight: "calc(100vh - 65px)",
          boxSizing: "border-box",
        }}
        ref={containerRef}
      >
        <Paper
          sx={{
            padding: "0px 15px 0px 15px",
            borderRadius: "15px",
            minHeight: "calc(100% - 5px)",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.ATCPaperBackground",
            border: borderHighlight ? "1px solid red" : "",
          }}
        >
          <Outlet socket={socket} context={[size, setBorderHighlight]} />
        </Paper>
        <div style={{ height: "20px" }} />
      </Container>
      <Footer />
    </>
  );
}