import React, { useState } from 'react'
import Header from '../Components/Layouts/Header'
import { Box, Button, Container, TextField } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function SendCode() {

    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const { email } = useParams()

    const handleCodeChange = (value) => {
        console.log(Number(value.split('').slice(-1)))
        if (isNaN(Number(value.slice(-1)))) {
            return;
        }

        if (value.length >= 7) {
            return;
        }

        setCode(value)
        setErrorMessage(null)
    }

    const handleSubmit = async () => {

        if (!code) {
            setErrorMessage("Code verification required")
            return;
        }

        try {

            const { data } = await axios.post(`${process.env.REACT_APP_API}/users/verifycode/email`, {
                email: email,
                code: code,
            });

            console.log(data)
            alert(data.message)
            navigate(`/change/password/${data.user._id}`)

        } catch ({ response }) {
            if (response) {
                const errorMessage = response?.data?.message;
                setErrorMessage(errorMessage);
            }
        }
    }

    const sendCodeToEmail = async () => {

        if (!email) {
            setErrorMessage('Email required')
            return
        }

        try {

            const { data } = await axios.get(`${process.env.REACT_APP_API}/users/sendcode/email?email=${email}`);

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

                    <div>
                        <div>Code</div>
                        <TextField
                            id='code'
                            name='code'
                            value={code}
                            helperText={errorMessage}
                            error={Boolean(errorMessage)}
                            fullWidth
                            onChange={(e) => handleCodeChange(e.target.value)}
                        />
                    </div>

                    <div>
                        <Button
                            variant='contained'
                            fullWidth
                            onClick={handleSubmit}
                        >
                            Verify
                        </Button>
                    </div>

                    <div>
                        <Button
                            variant='outlined'
                            fullWidth
                            onClick={sendCodeToEmail}
                        >
                            Resend Code
                        </Button>
                    </div>

                </Box>

            </Container>

        </div>
    )
}
