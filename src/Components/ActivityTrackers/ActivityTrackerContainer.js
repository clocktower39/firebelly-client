import React, { useEffect, useRef, useState } from 'react';
import { Container, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AuthNavbar from '../AuthNavbar';

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
        <>
            <Container maxWidth="md" sx={{ height: "100%", paddingTop: "15px", paddingBottom: "15px", }} ref={containerRef} >
                <Paper
                    sx={{
                        padding: "0px 15px 0px 15px",
                        borderRadius: "15px",
                        minHeight: "100%",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: 'background.ATCPaperBackground',
                    }}
                >
                    <Outlet socket={socket} context={[size]} />
                </Paper>
            </Container>
            <AuthNavbar />
        </>
    )
}
