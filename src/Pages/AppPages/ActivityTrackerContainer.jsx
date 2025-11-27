import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Paper } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import NavDrawer from "./NavDrawer";
import Footer from "../../Components/Footer";

export default function ActivityTrackerContainer(props) {
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
        sx={{
          px: { xs: 1.5, sm: 2 },
          pt: 2,
          pb: 4,
          minHeight: "calc(100vh - 80px)",
          boxSizing: "border-box",
        }}
        ref={containerRef}
      >
        <Paper
          sx={{
            px: { xs: 2, sm: 3 },
            pt: 2,
            pb: 3,
            borderRadius: 3,
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.ATCPaperBackground",
            border: borderHighlight
              ? "1px solid #f97316"
              : "1px solid rgba(148, 163, 184, 0.25)",
            boxShadow:
              "0 24px 60px rgba(15, 23, 42, 0.75), 0 0 0 1px rgba(15, 23, 42, 0.9)",
          }}
        >
          <Outlet context={[size, setBorderHighlight]} />
        </Paper>
      </Container>
      <Footer />
    </>
  );
}
