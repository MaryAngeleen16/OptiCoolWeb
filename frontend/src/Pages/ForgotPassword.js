import React, { useState } from 'react'
import Header from '../Components/Layouts/Header'
import { Box, Button, Container, TextField } from '@mui/material'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {

    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const handleEmailChange = (value) => {
        setEmail(value)
        setErrorMessage(null)
    }

    const sendCodeToEmail = async () => {

        if (!email) {
            setErrorMessage('Email required')
            return
        }

        try {

            const { data } = await axios.get(`${process.env.REACT_APP_API}/users/sendcode/email?email=${email}`);

            navigate(`/send/code/${email}`)

        } catch ({ response }) {
            if (response) {
                const errorMessage = response?.data?.message;
                setErrorMessage(errorMessage);
            }
        }
    }

    return (
        <div>
            <Header />

            <Container sx={{ mt: 15 }}>

                <Box
                    sx={{ mx: 'auto', maxWidth: 700, gap: 2, display: 'flex', flexDirection: 'column' }}
                >
                    <div
                        style={{ display: 'flex' }}
                    >
                        <img
                            src='https://cdn.dribbble.com/users/1741026/screenshots/6549026/nest_forgot_password_dribbble.gif'
                            width={'50%'}
                            style={{ marginLeft: 'auto', marginRight: 'auto' }}
                        />
                    </div>

                    <div>
                        <div>Email Address</div>
                        <TextField
                            id='email'
                            name='email'
                            value={email}
                            helperText={errorMessage}
                            error={Boolean(errorMessage)}
                            fullWidth
                            onChange={(e) => handleEmailChange(e.target.value)}
                        />
                    </div>

                    <div>
                        <Button
                            variant='contained'
                            fullWidth
                            onClick={sendCodeToEmail}
                        >
                            Send Code
                        </Button>
                    </div>

                </Box>

            </Container>

        </div>

    )
}
