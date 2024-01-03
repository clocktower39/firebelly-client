import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";

const LoadingPage = ({ PropComponent }) => {
  return (
    <>
      <Container
        maxWidth="md"
        component={Box}
        sx={{
          padding: "0 5px",
          height: "calc(100vh - 65px)",
          minHeight: "calc(100vh - 65px)",
          boxSizing: "border-box",
        }}
      >
        <Paper
          sx={{
            padding: "0px 15px 0px 15px",
            borderRadius: "15px",
            minHeight: "calc(100% - 5px)",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.ATCPaperBackground",
            justifyContent: "center",
          }}
        >
          <PropComponent />
        </Paper>
        <div style={{ height: "20px" }} />
      </Container>
    </>
  );
};

export default LoadingPage;
