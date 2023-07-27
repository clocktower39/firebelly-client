import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Paper } from "@mui/material";
import { Outlet } from "react-router-dom";
import NavDrawer from "./NavDrawer";
import Footer from "../../Components/Footer";

export default function ActivityTrackerContainer(props) {
  const { socket } = props;

  const [size, setSize] = useState(null);
  const containerRef = useRef(null);
  const updateDimensions = () => {
    if (containerRef.current) setSize(containerRef.current.offsetWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", updateDimensions);
    setSize(containerRef.current.offsetWidth);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [size]);

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
          boxSizing: "borderBox",
        }}
        ref={containerRef}
      >
        <Paper
          sx={{
            marginBottom: "20px",
            padding: "0px 15px 0px 15px",
            borderRadius: "15px",
            minHeight: "calc(100% - 5px)",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.ATCPaperBackground",
          }}
        >
          <Outlet socket={socket} context={[size]} />
        </Paper>
      </Container>
      <Footer />
    </>
  );
}
