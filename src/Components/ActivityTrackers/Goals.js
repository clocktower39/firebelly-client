import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { getGoals } from "../../Redux/actions";
import AuthNavbar from "../AuthNavbar";

export default function Goals() {
  const dispatch = useDispatch();
  const goals = useSelector((state) => state.goals);

  useEffect(() => {
    dispatch(getGoals());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Container maxWidth="md" sx={{ height: "100%", padding: "15px 0px" }}>
        <Paper sx={{ padding: "5px 15px", borderRadius: "15px", height: "100%", display: 'flex', flexDirection: 'column', flex: 'auto',  }}>

          <Grid container item xs={12} sx={{ justifyContent: 'center', paddingBottom: "15px", alignSelf: 'flex-start', flex: 'initial', }}>
            <Typography variant="h4">
              Goals
            </Typography>
          </Grid>

          <Grid container item xs={12} spacing={1} sx={{ alignSelf: 'flex-start', alignContent: 'flex-start', overflowY: 'scroll', scrollbarWidth: 'none', flex: 'auto', }}>
          {goals.map((goal) => (
            <Grid
              key={goal._id}
              container
              item
              md={4}
              sm={6}
              xs={12}
              sx={{ justifyContent: "center" }}
            >
              <Box sx={{ width: "100%" }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    '& .MuiPaper-root': {
                      backgroundColor: 'white',
                    }
                  }}
                >
                  <CardActionArea
                  >
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {goal.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {goal.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            </Grid>
          ))}
          </Grid>


        </Paper>
      </Container>
      <AuthNavbar />
    </>
  );
}
