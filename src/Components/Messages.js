import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Autocomplete, Avatar, AvatarGroup, Button, Chip, Container, Drawer, Grid, IconButton, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, TextField, Typography, } from "@mui/material";
import { AddCircle, Create, ArrowBackIosNew, Delete, } from "@mui/icons-material";
import { getConversations, sendMessage, socketMessage, deleteMessage, serverURL } from '../Redux/actions';

const classes = {
  root: {
    paddingBottom: "75px",
  },
  gridContainer: {
    scrollBehavior: "smooth",
  },
};

const Conversation = ({ conversation, socket }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const users = conversation.users.filter(u => u._id !== user._id);
  const [openMessageDrawer, setOpenMessageDrawer] = useState(false);

  const handleMessageDrawerOpen = () => setOpenMessageDrawer(true)

  const handleMessageDrawerClose = () => setOpenMessageDrawer(false)

  useEffect(()=>{
    if(openMessageDrawer) {
      socket.emit('join', { conversationId: conversation._id })
      socket.on("update_messages", (data) => dispatch(socketMessage(data)))
    }
  },[conversation._id, dispatch, openMessageDrawer, socket])

  return (
    <>
      <ListItem
        disablePadding
        sx={{ width: '100%', }}
      >
        <ListItemButton onClick={() => handleMessageDrawerOpen(conversation.users, conversation.messages, conversation._id)} >
          <ListItemAvatar>
            <AvatarGroup max={3} spacing="small">
              {users.slice(0, 3).map(user => <Avatar key={user._id} src={user.profilePicture ? `${serverURL}/user/profilePicture/${user.profilePicture}` : null} />)}
            </AvatarGroup>
          </ListItemAvatar>
          <ListItemText primary={users.map(u => u.username).join(' ')} sx={{ color: 'text.primary', }} />
        </ListItemButton>
      </ListItem>
      <Drawer
        anchor={"right"}
        open={openMessageDrawer}
        onClose={handleMessageDrawerClose}
        sx={{ '& .MuiPaper-root': { width: '100%' } }}
      >
        <div style={{
          height: 'calc(100% - 72px)',
          display: 'flex',
          flexDirection: 'column',
        }} >
          <MessageList users={users} conversationId={conversation._id} messages={conversation.messages} handleMessageDrawerClose={handleMessageDrawerClose} />

        </div>
        <div style={{
          bottom: 0,
          left: 0,
          position: "fixed",
          width: '100%',
        }}>
          <MessageInput conversationId={conversation._id} />
        </div>
      </Drawer>
    </>
  )
};

const MessageList = ({ users, conversationId, messages, handleMessageDrawerClose }) => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const handleMessageDelete = (messageId) => dispatch(deleteMessage(conversationId, messageId))

  return (
    <Container maxWidth="sm" sx={{ padding: "0 0 95px 0", }}>
      <Grid container item >
        <Grid container item xs={1} >
          <IconButton onClick={handleMessageDrawerClose} ><ArrowBackIosNew /></IconButton>
        </Grid>
        <Grid container item xs={11} sx={{ alignContent: 'center', }} >
          <Typography variant="h5">{users.map(u => u.username).join(' ')}</Typography>
        </Grid>
        <Grid container item xs={12} >
          {messages.map((message, i) => {
            return (
              <Grid
                key={message._id || i}
                sx={
                  message.user.username === user.username
                    ? {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      margin: "10px 0px",
                      borderRadius: "7.5px",
                      backgroundColor: "rgb(21, 101, 192)",
                      color: "white"
                    }
                    : {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      margin: "10px 0px",
                      borderRadius: "7.5px",
                      backgroundColor: "#23272A",
                      color: "white"
                    }
                }
                container
                item
                xs={12}
              >
                <Grid container item xs={2} sx={{ justifyContent: 'center', }}>
                  <Avatar src={message.user.profilePicture ? `${serverURL}/user/profilePicture/${message.user.profilePicture}` : null} />
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h6" display="inline">
                    {message.user.username}{" "}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    display="inline"
                    sx={{
                      fontSize: "16px",
                      opacity: ".33",
                    }}
                  >
                    {message.timeStamp == null
                      ? null
                      : `${new Date(message.timeStamp)
                        .toLocaleDateString()
                        .substr(
                          0,
                          new Date(message.timeStamp).toLocaleDateString()
                            .length - 5
                        )} ${new Date(message.timeStamp).toLocaleTimeString()}`}
                  </Typography>
                  <Typography variant="subtitle1" display="block">
                    {message.message}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  {message.user.username === user.username && (
                    <IconButton onClick={() => handleMessageDelete(message._id)} >
                      <Delete />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Container>
  )
};

const MessageInput = ({ conversationId }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleMessageSubmit(e);
    }
  };

  const handleMessageSubmit = (e) => {
    if (message !== '') {
      dispatch(sendMessage(conversationId, message))
      setMessage('');
    }
  }

  return (
    <Container maxWidth="sm">
      <Grid
        container
        sx={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: '12.5px 0px'
        }}
      >
        <Grid item xs={12}>
          <TextField
            fullWidth
            error={error === true ? true : false}
            helperText={error === true ? "Please enter a message" : false}
            label="Message"
            value={message}
            onKeyDown={(e) => handleKeyDown(e)}
            onChange={(e) => {
              setMessage(e.target.value);
              e.target.value === "" ? setError(true) : setError(false);
            }}
            InputProps={{
              endAdornment: (
                <Button variant="contained" color="primary" onClick={(e) => handleMessageSubmit(e)}>
                  Send
                </Button>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

const CreateConversationView = ({ open, handleClose, }) => {
  const [searchUser, setSearchUser] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearchResults, setUserSearchResults] = useState([]);

  const handleSelectedUsers = (getTagProps) => setSelectedUsers(getTagProps);

  const fetchSearch = async () => {
    let payload = JSON.stringify({ username: searchUser });

    let response = await fetch(`${serverURL}/search`, {
      method: "post",
      dataType: "json",
      body: payload,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    let data = await response.json();
    const removedDuplicates = data.users.filter(dataUser => !selectedUsers.some(user => user.username === dataUser.username))
    setUserSearchResults([...selectedUsers, ...removedDuplicates]);
  };
  useEffect(() => {
    fetchSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchUser])

  return (
    <Drawer
      anchor={"right"}
      open={open}
      onClose={handleClose}
      sx={{ '& .MuiPaper-root': { width: '100%' } }}
    >
      <Container maxWidth="sm">
        <Grid container >
          <Grid container item xs={12}>
            <Grid container item xs={1}><IconButton onClick={handleClose} ><ArrowBackIosNew /></IconButton></Grid>
            <Grid container item xs={10} sx={{ justifyContent: 'center', alignContent: 'center', }} ><Typography textAlign="center" variant="h6">New Message</Typography></Grid>
            <Grid container item xs={1}><IconButton onClick={handleClose} ><AddCircle /></IconButton></Grid>
          </Grid>
        </Grid>

        <Autocomplete
          disableCloseOnSelect
          value={selectedUsers}
          fullWidth
          multiple
          options={userSearchResults.map((option) => option)}
          getOptionLabel={option => option.username}
          onChange={(e, getTagProps) => handleSelectedUsers(getTagProps)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option.username} {...getTagProps({ index })} />
            ))
          }
          sx={{ marginTop: '25px' }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Users"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Container>
    </Drawer>
  );
}

export default function Messages({ socket }) {
  const dispatch = useDispatch();
  const conversations = useSelector(state => state.conversations);
  const [conversationDialog, setConversationDialog] = useState(false);

  const handleConversationDialogOpen = () => setConversationDialog(true);
  const handleConversationDialogClose = () => setConversationDialog(false);

  useEffect(() => {
    dispatch(getConversations())
  }, [dispatch])

  return (
    <Container maxWidth="sm" sx={classes.root} disableGutters>
      <Grid container sx={classes.gridContainer}>
        <Grid justify="center" container spacing={3}>
          <Grid container item xs={6}>
            <Typography variant="h5" component={Link} to="/" sx={{ textDecoration: 'none', color: 'text.primary', }} >Firebelly Fitness</Typography>
          </Grid>
          <Grid container item xs={6} sx={{ justifyContent: 'flex-end', }} >
            <IconButton onClick={handleConversationDialogOpen}><Create /></IconButton>
          </Grid>
        </Grid>
        <Grid container item xs={12} >
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {conversations.length > 0
              ? conversations.map(conversation => {
                return <Conversation key={conversation._id} conversation={conversation} socket={socket} />
              })
              : 'No messages'}
          </List>
        </Grid>
      </Grid>
      <CreateConversationView open={conversationDialog} handleClose={handleConversationDialogClose} />
    </Container>
  )
}
