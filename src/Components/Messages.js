import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Container, Drawer, Grid, IconButton, TextField, Typography, } from "@mui/material";
import { ArrowBackIosNew, Delete, } from "@mui/icons-material";
import { sendMessage, socketMessage, deleteMessage, serverURL } from '../Redux/actions';
  

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
          {messages?.map((message, i) => {
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


export default function Messages({ open, handleClose, conversation, socket }) {
  const dispatch = useDispatch();


  useEffect(() => {
    if (open) {
      socket.emit('join', { conversationId: conversation._id })
      socket.on("update_messages", (data) => dispatch(socketMessage(data)))
    }
  }, [conversation._id, dispatch, open, socket])

  return (
      <Drawer
        anchor={"right"}
        open={open}
        onClose={handleClose}
        sx={{ '& .MuiPaper-root': { width: '100%' } }}
      >
        <div style={{
          height: 'calc(100% - 72px)',
          display: 'flex',
          flexDirection: 'column',
        }} >
          <MessageList users={conversation.users} conversationId={conversation._id} messages={conversation.messages} handleMessageDrawerClose={handleClose} />

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
  )
};
