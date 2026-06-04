import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  ArrowForward,
  AssignmentTurnedIn,
  AutoGraph,
  Bolt,
  CheckCircle,
  Groups,
  History,
  Insights,
  ManageAccounts,
  Notes,
  PlayArrow,
  Sync,
  TrackChanges,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { loginJWT } from "../../Redux/actions";
import Footer from "../../Components/Footer";
import BryceFlagpole from "../../img/bryce_flagpole.jpg";
import DeadliftImg from "../../img/deadlift.jpg";
import WebsiteNavbar from "./WebsiteNavbar";

const APP_URL = "https://app.firebellyfitness.com";

const featureHighlights = [
  {
    title: "Build and manage workouts",
    description:
      "Create training sessions with exercises, sets, notes, and structured targets in one organized workflow.",
    icon: AssignmentTurnedIn,
  },
  {
    title: "Track progress over time",
    description:
      "Keep workout history, exercise performance, and training context close enough to adjust the next session.",
    icon: AutoGraph,
  },
  {
    title: "Assign client training",
    description:
      "Give athletes clear workouts to complete while keeping coaches connected to what is happening.",
    icon: Groups,
  },
  {
    title: "Capture feedback",
    description:
      "Log notes, difficulty, and workout responses so training decisions are based on more than memory.",
    icon: Notes,
  },
  {
    title: "Review exercise history",
    description:
      "See what was done last time and use prior work to guide today's loading, volume, and intent.",
    icon: History,
  },
  {
    title: "Stay synced live",
    description:
      "Support live workout updates and shared training state when a session needs to stay current.",
    icon: Sync,
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Create or assign workouts",
    description:
      "Trainers build structured sessions, reuse useful patterns, and send the right plan to the right athlete.",
  },
  {
    step: "02",
    title: "Complete and track training",
    description:
      "Athletes open the workout, record results, and keep the training log accurate as the session happens.",
  },
  {
    step: "03",
    title: "Review and adjust",
    description:
      "Progress history, feedback, and notes make it easier to choose the next productive training step.",
  },
];

const trainerBenefits = [
  "Organize client workouts and training history",
  "Assign sessions with clearer expectations",
  "Review feedback before adjusting programming",
  "Keep coaching work in a cleaner professional system",
];

const athleteBenefits = [
  "Know exactly what to do before the session starts",
  "Log results without losing exercise context",
  "Review workout history and progress patterns",
  "Send useful difficulty notes and training feedback",
];

const previewRows = [
  { label: "Workout builder", value: "Exercises, sets, notes" },
  { label: "Client view", value: "Assigned sessions" },
  { label: "Training log", value: "History and feedback" },
];

const ownerPrinciples = [
  "Practical programming built around real sessions",
  "Clear feedback loops between coach and athlete",
  "Training tools that support consistency instead of adding noise",
];

const sectionLabelStyles = {
  color: "#f97316",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontSize: "0.78rem",
};

const sectionTitleStyles = {
  mt: 1.25,
  fontSize: { xs: "2rem", md: "2.85rem" },
  lineHeight: 1.08,
  letterSpacing: 0,
};

function SectionHeading({ eyebrow, title, body, align = "center" }) {
  return (
    <Box sx={{ maxWidth: 760, mx: align === "center" ? "auto" : 0, textAlign: align, mb: 5 }}>
      <Typography component="p" sx={sectionLabelStyles}>
        {eyebrow}
      </Typography>
      <Typography variant="h2" sx={sectionTitleStyles}>
        {title}
      </Typography>
      {body ? (
        <Typography
          sx={{
            mt: 2,
            color: "rgba(226, 232, 240, 0.82)",
            fontSize: { xs: "1rem", md: "1.08rem" },
            lineHeight: 1.75,
          }}
        >
          {body}
        </Typography>
      ) : null}
    </Box>
  );
}

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <Paper
      component="article"
      elevation={0}
      sx={{
        height: "100%",
        p: 3,
        borderRadius: "8px",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "rgba(15, 23, 42, 0.78)",
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "8px",
          display: "grid",
          placeItems: "center",
          color: "#fed7aa",
          backgroundColor: "rgba(249, 115, 22, 0.14)",
          border: "1px solid rgba(249, 115, 22, 0.24)",
          mb: 2.5,
        }}
      >
        <Icon aria-hidden="true" />
      </Box>
      <Typography variant="h5" sx={{ fontSize: "1.12rem", mb: 1.25 }}>
        {feature.title}
      </Typography>
      <Typography sx={{ color: "rgba(226, 232, 240, 0.76)", lineHeight: 1.65 }}>
        {feature.description}
      </Typography>
    </Paper>
  );
}

function AudiencePanel({ title, description, benefits, icon }) {
  const Icon = icon;

  return (
    <Box
      sx={{
        height: "100%",
        p: { xs: 3, md: 4 },
        borderRadius: "8px",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        backgroundColor: "rgba(2, 6, 23, 0.66)",
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "8px",
            display: "grid",
            placeItems: "center",
            color: "#34d399",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
          }}
        >
          <Icon aria-hidden="true" />
        </Box>
        <Typography variant="h3" sx={{ fontSize: { xs: "1.45rem", md: "1.75rem" } }}>
          {title}
        </Typography>
      </Stack>
      <Typography sx={{ color: "rgba(226, 232, 240, 0.78)", lineHeight: 1.75, mb: 3 }}>
        {description}
      </Typography>
      <Stack spacing={1.5}>
        {benefits.map((benefit) => (
          <Stack key={benefit} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
            <CheckCircle sx={{ color: "#f97316", fontSize: 20, mt: "2px" }} aria-hidden="true" />
            <Typography sx={{ color: "rgba(248, 250, 252, 0.9)" }}>{benefit}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function AppPreview() {
  return (
    <Box
      aria-label="Firebelly Fitness app preview"
      sx={{
        borderRadius: "8px",
        border: "1px solid rgba(148, 163, 184, 0.22)",
        backgroundColor: "#020617",
        overflow: "hidden",
        boxShadow: "0 28px 80px rgba(0, 0, 0, 0.38)",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          backgroundColor: "rgba(15, 23, 42, 0.96)",
        }}
      >
        <Stack direction="row" spacing={0.75} aria-hidden="true">
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444" }} />
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981" }} />
        </Stack>
        <Typography sx={{ color: "rgba(226,232,240,0.7)", fontSize: "0.82rem" }}>
          Product preview
        </Typography>
      </Box>

      <Grid container>
        <Grid size={{ xs: 12, md: 7 }} sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 2.25,
                borderRadius: "8px",
                border: "1px solid rgba(249, 115, 22, 0.28)",
                backgroundColor: "rgba(249, 115, 22, 0.1)",
              }}
            >
              <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ color: "#fed7aa", fontWeight: 800 }}>Workout Builder</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.76)", mt: 0.75 }}>
                    Structure today's training plan
                  </Typography>
                </Box>
                <Chip
                  label="Draft"
                  size="small"
                  sx={{ color: "#ffedd5", backgroundColor: "rgba(249,115,22,0.18)" }}
                />
              </Stack>
            </Box>

            {previewRows.map((row) => (
              <Box
                key={row.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
                  gap: 1,
                  p: 2,
                  borderRadius: "8px",
                  border: "1px solid rgba(148, 163, 184, 0.14)",
                  backgroundColor: "rgba(15, 23, 42, 0.82)",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>{row.label}</Typography>
                <Typography sx={{ color: "rgba(226,232,240,0.7)" }}>{row.value}</Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid
          size={{ xs: 12, md: 5 }}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderTop: { xs: "1px solid rgba(148, 163, 184, 0.16)", md: 0 },
            borderLeft: { md: "1px solid rgba(148, 163, 184, 0.16)" },
            backgroundColor: "rgba(15, 23, 42, 0.56)",
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={sectionLabelStyles}>Training state</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontSize: "1.55rem" }}>
                Built for work before, during, and after a session.
              </Typography>
            </Box>
            <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.18)" }} />
            <Stack spacing={1.5}>
              {[
                ["Plan", "Create exercises and targets"],
                ["Log", "Record completed training"],
                ["Review", "Use history and feedback"],
              ].map(([label, value]) => (
                <Stack key={label} direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                  <Typography sx={{ color: "rgba(226,232,240,0.72)" }}>{label}</Typography>
                  <Typography sx={{ fontWeight: 700, textAlign: "right" }}>{value}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loginJWT(undefined, { clearOnFailure: false }));
  }, [dispatch]);

  return (
    <>
      <WebsiteNavbar />
      <Box
        component="main"
        sx={{
          backgroundColor: "#050505",
          color: "#f8fafc",
          overflow: "hidden",
        }}
      >
        <Box
          component="section"
          id="top"
          sx={{
            position: "relative",
            minHeight: { xs: "calc(100svh - 96px)", md: "calc(86vh - 64px)" },
            display: "flex",
            alignItems: "center",
            py: { xs: 6, md: 10 },
            backgroundImage: `linear-gradient(90deg, rgba(2, 6, 23, 0.96) 0%, rgba(2, 6, 23, 0.82) 43%, rgba(2, 6, 23, 0.2) 100%), url(${DeadliftImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: 760 }}>
              <Chip
                icon={<Bolt />}
                label="Workout software for trainers and athletes"
                sx={{
                  mb: 3,
                  color: "#ffedd5",
                  backgroundColor: "rgba(249, 115, 22, 0.18)",
                  border: "1px solid rgba(249, 115, 22, 0.35)",
                  "& .MuiChip-icon": { color: "#fb923c" },
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.7rem", sm: "3.5rem", md: "5rem" },
                  lineHeight: 0.98,
                  letterSpacing: 0,
                  maxWidth: 820,
                }}
              >
                Firebelly Fitness keeps training organized from plan to progress.
              </Typography>
              <Typography
                sx={{
                  mt: 3,
                  maxWidth: 660,
                  color: "rgba(248, 250, 252, 0.84)",
                  fontSize: { xs: "1.08rem", md: "1.25rem" },
                  lineHeight: 1.75,
                }}
              >
                Build workouts, assign training, log results, and review feedback in a focused
                platform for coaches, athletes, and clients.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
                <Button
                  href={APP_URL}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 3.5,
                    py: 1.35,
                    borderRadius: "8px",
                    background: "#f97316",
                    color: "#111827",
                    "&:hover": { background: "#fb923c" },
                  }}
                >
                  Launch App
                </Button>
                <Button
                  href="#features"
                  variant="outlined"
                  size="large"
                  endIcon={<PlayArrow />}
                  sx={{
                    px: 3.5,
                    py: 1.35,
                    borderRadius: "8px",
                    color: "#f8fafc",
                    borderColor: "rgba(248, 250, 252, 0.42)",
                    backgroundColor: "rgba(2, 6, 23, 0.3)",
                    "&:hover": {
                      borderColor: "#f8fafc",
                      backgroundColor: "rgba(15, 23, 42, 0.72)",
                    },
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>

        <Box component="section" id="features" sx={{ py: { xs: 8, md: 11 } }}>
          <Container maxWidth="lg">
            <SectionHeading
              eyebrow="Platform features"
              title="A cleaner system for the training details that matter."
              body="Firebelly Fitness brings planning, tracking, coaching context, and workout feedback into one product so training is easier to manage and easier to understand."
            />
            <Grid container spacing={2.5}>
              {featureHighlights.map((feature) => (
                <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
                  <FeatureCard feature={feature} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box
          component="section"
          id="workflow"
          sx={{
            py: { xs: 8, md: 11 },
            backgroundColor: "#0f172a",
            borderTop: "1px solid rgba(148, 163, 184, 0.12)",
            borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
          }}
        >
          <Container maxWidth="lg">
            <SectionHeading
              eyebrow="How it works"
              title="Plan the work, log the work, improve the next session."
            />
            <Grid container spacing={2.5}>
              {workflowSteps.map((step) => (
                <Grid key={step.step} size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      height: "100%",
                      p: 3,
                      borderRadius: "8px",
                      border: "1px solid rgba(148, 163, 184, 0.18)",
                      backgroundColor: "rgba(2, 6, 23, 0.42)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#34d399",
                        fontSize: "0.9rem",
                        fontWeight: 900,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {step.step}
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 2, fontSize: "1.5rem" }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ mt: 1.5, color: "rgba(226,232,240,0.76)", lineHeight: 1.7 }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box component="section" id="for-trainers" sx={{ py: { xs: 8, md: 11 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <AudiencePanel
                  title="For trainers"
                  description="Firebelly gives coaches a more professional way to organize client work, deliver sessions, and review training response before making programming decisions."
                  benefits={trainerBenefits}
                  icon={ManageAccounts}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AudiencePanel
                  title="For athletes and clients"
                  description="Clients get a clear workout view, a place to record what happened, and a history that helps training feel less scattered from week to week."
                  benefits={athleteBenefits}
                  icon={TrackChanges}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box
          component="section"
          id="preview"
          sx={{
            py: { xs: 8, md: 11 },
            backgroundColor: "#09090b",
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={5} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <SectionHeading
                  eyebrow="App preview"
                  title="A practical workspace for real training workflows."
                  body="The app preview shows the kinds of surfaces Firebelly is built around: workout creation, client assignment, training logs, history, and feedback."
                  align="left"
                />
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                  {["Workout editing", "Client training", "History", "Feedback"].map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      sx={{
                        color: "#e2e8f0",
                        backgroundColor: "rgba(148, 163, 184, 0.12)",
                        border: "1px solid rgba(148, 163, 184, 0.18)",
                      }}
                    />
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <AppPreview />
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box
          component="section"
          id="about-owner"
          sx={{
            py: { xs: 8, md: 10 },
            backgroundColor: "#050505",
            borderTop: "1px solid rgba(148, 163, 184, 0.12)",
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  component="img"
                  src={BryceFlagpole}
                  alt="Firebelly Fitness owner demonstrating a calisthenics flagpole"
                  sx={{
                    display: "block",
                    width: "100%",
                    maxHeight: { xs: 420, md: 520 },
                    objectFit: "cover",
                    objectPosition: "center",
                    borderRadius: "8px",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    boxShadow: "0 24px 70px rgba(0, 0, 0, 0.34)",
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Box sx={{ maxWidth: 680 }}>
                  <Typography component="p" sx={sectionLabelStyles}>
                    About the coach
                  </Typography>
                  <Typography variant="h2" sx={sectionTitleStyles}>
                    Built by someone who cares about the details behind good training.
                  </Typography>
                  <Typography
                    sx={{
                      mt: 2,
                      color: "rgba(226, 232, 240, 0.82)",
                      fontSize: { xs: "1rem", md: "1.08rem" },
                      lineHeight: 1.75,
                    }}
                  >
                    Firebelly Fitness is shaped by hands-on coaching, strength training,
                    calisthenics, mobility work, and the everyday reality of helping people train
                    with more structure. The goal is simple: make it easier for coaches and athletes
                    to know what was planned, what happened, and what should change next.
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 3 }}>
                    {ownerPrinciples.map((principle) => (
                      <Stack
                        key={principle}
                        direction="row"
                        spacing={1.25}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <CheckCircle
                          sx={{ color: "#34d399", fontSize: 20, mt: "2px" }}
                          aria-hidden="true"
                        />
                        <Typography sx={{ color: "rgba(248, 250, 252, 0.9)" }}>
                          {principle}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box component="section" id="cta" sx={{ py: { xs: 8, md: 10 } }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: "center" }}>
              <Insights sx={{ color: "#34d399", fontSize: 42, mb: 2 }} aria-hidden="true" />
              <Typography variant="h2" sx={sectionTitleStyles}>
                Bring the training plan and training record into the same place.
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  mx: "auto",
                  maxWidth: 680,
                  color: "rgba(226,232,240,0.78)",
                  fontSize: "1.08rem",
                  lineHeight: 1.75,
                }}
              >
                Open Firebelly Fitness to build workouts, manage training, and keep progress visible
                for coaches and athletes.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ justifyContent: "center", mt: 4 }}
              >
                <Button
                  href={APP_URL}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 3.5,
                    py: 1.35,
                    borderRadius: "8px",
                    background: "#f97316",
                    color: "#111827",
                    "&:hover": { background: "#fb923c" },
                  }}
                >
                  Launch App
                </Button>
                <Button
                  href={`${APP_URL}/signup`}
                  variant="text"
                  size="large"
                  sx={{ color: "#f8fafc", px: 3 }}
                >
                  Create an account
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>
      </Box>
      <Footer />
    </>
  );
}
