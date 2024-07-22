import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
  Avatar,
  Card,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import { AddCircle } from '@mui/icons-material';
import { getTrainers, requestTrainer, serverURL } from '../../Redux/actions';

export default function SearchTrainerDialog({ open, handleClose, currentRelationships }) {
  const dispatch = useDispatch();
  const trainers = useSelector(state => state.trainers);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(trainers.filter(trainer => currentRelationships.includes(trainer.trainer)));

  const handleChange = (e, setter) => setter(e.target.value);

  const SearchResultsTrainerCard = (props) => {
    const { trainer } = props;

    const handleRequestTrainer = () => {
      dispatch(requestTrainer(trainer.trainer))
    }

    return (
      <Grid container item xs={12}>
        <Card sx={{ width: '100%' }} >
          <CardHeader
            avatar={
              <Avatar
                src={
                  trainer.profilePicture && `${serverURL}/user/profilePicture/${trainer.profilePicture}`
                }>
                {trainer.firstName[0]}{trainer.lastName[0]}
              </Avatar>
            }
            action={
              <IconButton aria-label="status" onClick={handleRequestTrainer}>
                <AddCircle />
              </IconButton>
            }
            title={`${trainer.firstName} ${trainer.lastName}`}
            subheader={'Available'}
            sx={{
              '& .MuiCardHeader-action': {
                alignSelf: 'center',
              },
            }}
          />
        </Card>
      </Grid>
    );
  }

  useEffect(() => {
    dispatch(getTrainers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setSearchResults(trainers
      .filter(trainer => !currentRelationships.includes(trainer.trainer))
      .filter(trainer => new RegExp(search, "i").test(trainer.firstName) || new RegExp(search, "i").test(trainer.lastName)))
  }, [search, trainers, currentRelationships])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        '& .MuiDialog-paper': {
          width: "100%",
        }
      }}
    >
      <DialogTitle id="alert-dialog-title">
        {"Search Trainers"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ padding: "10px 0px" }}>
          <Grid item container xs={12}>
            <TextField
              type="text"
              value={search}
              onChange={(e) => handleChange(e, setSearch)}
              fullWidth
              label="Search"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item container xs={12} >
            <Grid container item xs={12} spacing={1} >
              {searchResults.map(trainer => {
                return (<SearchResultsTrainerCard key={trainer} trainer={trainer} />);
              })}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
