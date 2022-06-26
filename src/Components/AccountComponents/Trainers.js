import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
    Avatar,
    Card,
    CardHeader,
    Container,
    Grid,
    IconButton,
    Paper,
    Typography
} from "@mui/material";
import { AddCircle, Delete, Done, PendingActions } from '@mui/icons-material';
import { requestMyTrainers } from '../../Redux/actions';
import SearchTrainerDialog from "./SearchTrainerDialog";

export default function Trainers() {
    const dispatch = useDispatch();
    const myTrainers = useSelector(state => state.myTrainers);
    const [openSearch, setOpenSearch] = useState(false);

    const currentRelationshipIds=myTrainers.map(trainer => trainer.trainerId);

    const handleOpenSearch = () => setOpenSearch(true);
    const handleCloseSearch = () => setOpenSearch(false);

    useEffect(() => {
        dispatch(requestMyTrainers());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const RelationshipTrainerCard = (props) => {
        const { trainer } = props;
        const [isHovered, setIsHovered] = useState(false);

        const toggleHover = () => setIsHovered(prev => !prev);
        return (
            <Grid container item xs={12}>
                <Card sx={{width:'100%'}} >
                    <CardHeader
                        avatar={
                            <Avatar aria-label="recipe">
                                {trainer.firstName[0]}{trainer.lastName[0]}
                            </Avatar>
                        }
                        action={
                            <IconButton aria-label="status" onMouseEnter={toggleHover} onMouseLeave={toggleHover} >
                                {isHovered ? <Delete /> : trainer.accepted ? <Done /> : <PendingActions />}
                            </IconButton>
                        }
                        title={`${trainer.firstName} ${trainer.lastName}`}
                        subheader={trainer.accepted ? 'Accepted' : 'Pending'}
                    />
                </Card>
            </Grid>
        );
    }

    return (
        <Container maxWidth="md" sx={{ height: "100%" }}>
            <Grid container item xs={12} sx={{ padding: "15px" }}>
                <Typography color="primary.contrastText" variant="h5" gutterBottom >
                    Trainers
                </Typography>
            </Grid>
            <Paper >
                <Grid container spacing={2} sx={{ padding: "15px" }}>
                    <Grid container item xs={12} sx={{ justifyContent: 'center', paddingBottom: '15px' }}>
                        {myTrainers.length > 0 ? myTrainers.map(t => <RelationshipTrainerCard key={t.trainerId} trainer={t} />) : <Typography >'No trainers'</Typography>}
                    </Grid>
                    <Grid container sx={{ justifyContent: 'center' }}>
                        <Grid item ><IconButton onClick={handleOpenSearch} ><AddCircle /></IconButton></Grid>
                    </Grid>
                </Grid>
            </Paper>
            <SearchTrainerDialog open={openSearch} handleClose={handleCloseSearch} currentRelationships={currentRelationshipIds} />
        </Container>
    )
}
