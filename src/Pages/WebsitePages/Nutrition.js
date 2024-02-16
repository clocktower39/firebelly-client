import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import WebsiteNavbar from "./WebsiteNavbar";

const classes = {
  root: {},
  MainCategory: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  SubCategory: {
    fontWeight: "bold",
  },
};

export default function Nutrition() {
  return (
    <>
      <WebsiteNavbar />
      <Container>
        <Paper sx={{ margin: "15px 0", padding: "5px 25px" }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Nutrition
          </Typography>
          <Typography>
            This Nutrition page will lay out the most important information that you need to know in
            order to be successful. Remember to take things step-by-step to ensure that you can
            understand what you are trying to do and why!
          </Typography>
          <br />
          <br />
          <Typography variant="h5">
            <Box sx={classes.MainCategory} display="inline">
              CALORIES
            </Box>
          </Typography>
          <Typography>
            A simplified definition: A Calorie is a Unit of Energy
            <br /> How do we measure the amount of energy we consume when we eat, or the amount of
            energy we expend during exercise?
          </Typography>
          <Typography>
            <span sx={{ backgroundColor: "green" }}>- IT IS MEASURED IN CALORIES</span>
          </Typography>
          <br />
          <br />
          <Typography variant="h6">
            <Box sx={classes.SubCategory} display="inline">
              Why is this important?
            </Box>
          </Typography>
          <Typography>
            Having a measurable number for how much energy we expend compared to how much we intake
            allows us to control our Weight.
          </Typography>
          <br />

          <Typography variant="h6">
            <Box sx={classes.SubCategory} display="inline">
              How do we control weight with calories?
            </Box>
          </Typography>
          <Typography>
            3500 Calories = 1 Pound of weight. (This is the standard, everyone may be slightly
            different)
            <br />
            This means that if you consume 3500 calories more than you expend, you will gain one
            pound of weight.
            <br />
            The opposite is also true; if you expend 3500 calories more than you consume, you will
            lose one pound of weight.
          </Typography>
          <br />

          <Typography variant="h6">
            <Box sx={classes.SubCategory} display="inline">
              Tracking Caloric Intake
            </Box>
          </Typography>
          <Typography>
            Tracking your caloric intake has become very easy with many different food tracking apps
            such as MyFitnessPal, Fitbit, and others. You can simply scan barcodes of many packaged
            meals; or for homemade meals, figure out the calories content yourself and plug it in
            the app to save it. (Click here for an excel spread sheet to calculate calories & macros
            for homemade meals with multiple ingredients)
          </Typography>
          <br />

          <Typography variant="h6">
            <Box sx={classes.SubCategory} display="inline">
              Finding Caloric Expenditure
            </Box>
          </Typography>
          <Typography>
            When trying to figure out how many calories you are normally burning throughout the day,
            you must first find your BASAL METABOLIC RATE (BMR) BMR is also frequently referred to
            as "Resting Metabolism", meaning the amount of energy (in calories) that your body
            requires to stay alive, without any action (as if you laid in bed all day long). You can
            use our BMR Calculator if you don’t know yours already - more accurate if you are able
            to add in your body fat percentage.
          </Typography>
          <br />

          <Typography>
            Of course, BMR only gives us the calories that you burn at rest, so we still need to
            figure out how many more active calories you are burning to figure out your Total Energy
            Expenditure (TEE). Fitness tracking watches are a great way to help figure out your TEE,
            but that doesn’t mean you need to have one. Another way is to multiply your BMR with a
            range of different numbers depending on how active you are.
          </Typography>
          <br />
          {/*table*/}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={classes.SubCategory} display="inline">
                      Amount of Activity
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={classes.SubCategory} display="inline">
                      Calculation
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Sedentary (Ex: Desk Job, little to no exercise)</TableCell>
                  <TableCell>BMR * (1.1) = TEE</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Light Activity (Ex: Desk Job, 3 workouts per week)</TableCell>
                  <TableCell>BMR * (1.2) = TEE</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Moderate Activity (Ex: Standing or walking job, 3 workouts per week)
                  </TableCell>
                  <TableCell>BMR * (1.3) = TEE</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Active (Ex: Standing or walking job, 4 - 6 workouts per week)
                  </TableCell>
                  <TableCell>BMR * (1.4) = TEE</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Very Active (Ex: Active Job, 4- 6 workouts per week)</TableCell>
                  <TableCell>BMR * (1.5) = TEE</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <br />
          <Typography>
            Using this system is a rough estimate, but with proper caloric and weight tracking, you
            will be able to figure out your average total energy expenditure (also known as
            maintenance level).
          </Typography>
          <Typography>
            Once we have this number we can use it to control our weight, lets use an example:
          </Typography>
          <Typography>
            {" "}
            Jon wants to lose 10 pounds of body weight over a 10 week period. His BMR is 2000
            Calories, he has a full-time desk job, and works out 0-1 times per week. We would use
            the Sedentary calculation since Jon does not have a fitness tracker: 2000 * 1.1 = 2200
            Calories As you can see, Jon's average daily total energy expenditure is 2200 Calories.
            This means, with his current lifestyle, he should eat 2200 calories per day in order to
            maintain his weight; but he wants to lose 1 pound per week for the next 10 weeks, so he
            needs to eat less than this. How much less? Since Jon is trying to lose 1 pound per
            week, lets think of this on a weekly basis. If you recall from before, its takes 3500
            calories to lose 1 pound. Jon needs to consume 3500 less calories than his total weekly
            expenditure, which is 15,400 calories (2200 daily average * 7 days in a week). This
            means he would need to eat 11,900 calories over the course of the week, or 1700 calories
            per day and he should lose one pound per week. To make the numbers easier to look at,
            simply think of 1 pound per week is being in a 500 calorie deficit from your daily TEE
            (3500cal / 7 Days = 500cal)
          </Typography>
        </Paper>
      </Container>
    </>
  );
}
