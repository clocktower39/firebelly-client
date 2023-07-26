import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Paper } from "@mui/material";
import { Outlet } from "react-router-dom";
import NavDrawer from "./NavDrawer";

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
      <Container
        maxWidth="md"
        component={Box}
        sx={{
            padding: '15px 5px 0 5px',
            height: 'calc(100vh - 20px)',
            minHeight: 'calc(100vh - 20px)',
            boxSizing: 'borderBox',
        }}
        ref={containerRef}
      >
        <Paper
          sx={{
            padding: "0px 15px 0px 15px",
            borderRadius: "15px",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.ATCPaperBackground",
          }}
        >
            <NavDrawer/>
          <Outlet socket={socket} context={[size]} />
        </Paper>
      </Container>
  );
}
