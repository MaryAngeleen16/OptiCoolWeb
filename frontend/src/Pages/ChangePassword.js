import React from 'react'
import Header from '../Components/Layouts/Header'
import { Box, Container } from '@mui/material'
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { TextField, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { removeAuth } from '../states/authSlice';
import axios from 'axios';

const validationSchema = Yup.object({
    newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm password is required'),
});

export default function ChangePassword() {

    const { userId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const initialValues = {
        newPassword: '',
        confirmPassword: '',
    };

    const handleSubmit = async (values) => {
        console.log('Form values:', values);
        try {

            const { data } = await axios.put(`${process.env.REACT_APP_API}/users/change/password/${userId}`, {
                password: values.newPassword,
            });

            console.log(data)

            alert('Password changed, please login')
            dispatch(removeAuth());

            navigate('/login');

        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <Header />

            <Container sx={{ mt: 15 }}>

                <Box
                    sx={{ mx: 'auto', maxWidth: 800, gap: 5, display: 'flex', flexDirection: 'column' }}
                >

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched }) => (
                            <Form
                                style={{ maxWidth: 800, gap: 20, display: 'flex', flexDirection: 'column' }}
                            >
                                <Field
                                    name="newPassword"
                                    as={TextField}
                                    label="New Password"
                                    type="password"
                                    variant="outlined"
                                    error={touched.newPassword && Boolean(errors.newPassword)}
                                    helperText={touched.newPassword && errors.newPassword}
                                    fullWidth
                                />
                                <Field
                                    name="confirmPassword"
                                    as={TextField}
                                    label="Confirm Password"
                                    type="password"
                                    variant="outlined"
                                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                    helperText={touched.confirmPassword && errors.confirmPassword}
                                    fullWidth
                                />
                                <Button type="submit" variant="contained" color="primary" fullWidth>
                                    Set Password
                                </Button>
                            </Form>
                        )}
                    </Formik>

                </Box>

            </Container>

        </div>
    )
}
