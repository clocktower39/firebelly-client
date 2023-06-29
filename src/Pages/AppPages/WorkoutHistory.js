import React, { useState, useEffect } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { serverURL } from "../../Redux/actions";
import dayjs from "dayjs";

export default function WorkoutHistory() {
  const [history, setHistory] = useState({
    totalPages: 1,
    docs: [],
  });
  const [page, setPage] = useState(1);
  const [hasMoreWorkouts, setHasMoreWorkouts] = useState(true); // New state variable

  useEffect(() => {
    if (hasMoreWorkouts) { // Check totalPages before fetching again
      const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
      const fetchData = async () => {
        const response = await fetch(`${serverURL}/getWorkoutHistory`, {
          method: "post",
          dataType: "json",
          body: JSON.stringify({
            page,
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            Authorization: bearer,
          },
        });
        const data = await response.json();
        return data;
      };

      fetchData().then((data) => {
        setHistory((prev) => {
          return prev.docs && prev.page < page
            ? { ...data, docs: [...prev.docs, ...data.docs] }
            : data;
        });
        setHasMoreWorkouts(data.totalPages > page); // Update the new state variable
      });
    }
  }, [page, hasMoreWorkouts]);

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1); // Increment the page number to load the next page
  };

  return (
    <Grid container>
      <Grid xs={12}>
        <Typography variant="h5" textAlign="center" sx={{ padding: '15px'}}>
          Workout History
        </Typography>
      </Grid>
      <Grid
        container
        item
        xs={12}
        spacing={2}
        sx={{
          alignSelf: "flex-start",
          alignContent: "flex-start",
          overflowY: "scroll",
          scrollbarWidth: "none",
          flex: "auto",
        }}
      >
        {history?.docs?.map((workout, i) => {
          return (
            <Grid key={workout._id} container item lg={4} sm={6} xs={12} sx={{ justifyContent: "center" }}>
              <Box
                sx={{
                  width: "100%",
                  border: "1px solid white",
                  borderRadius: "5px",
                  padding: "2.5px",
                }}
              >
                <Grid>
                  <Typography variant="h6">{workout?.title}</Typography>
                </Grid>
                <Grid>
                  <Typography variant="caption">
                    {dayjs(workout.date).format("MMMM Do, YYYY")}
                  </Typography>
                </Grid>
                <Grid>{workout?.category?.join(", ")}</Grid>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Grid container justifyContent="center">
        {hasMoreWorkouts ? <Button onClick={loadMore}>Load More</Button> : <Typography>No more workouts to load.</Typography>}
      </Grid>
    </Grid>
  );
}
