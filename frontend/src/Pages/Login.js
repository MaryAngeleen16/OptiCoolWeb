import React from 'react'
import Header from '../Components/Layouts/Header'
import { TextField, Button, Typography } from '@mui/material'
import * as Yup from 'yup';
import { Formik } from 'formik';
import axios from 'axios';

export default function Login() {

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email('Please enter a valid email')
            .required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
    });

    const handleSubmit = async (values, setSubmitting) => {
        try {

            const { data } = await axios.post(`${process.env.REACT_APP_API}/users/login`, values);

            console.log(data)
            // dispatch(setAuth({
            //     user: data.user,
            //     token: data.token,
            // }))


            setSubmitting(false);
        } catch (err) {
            setSubmitting(false);
            console.info(err)
        }
    };

    return (
        <div>
            <Header />

            <div style={{ marginTop: "5%" }}>

                <Formik
                    initialValues={{
                        email: '',
                        password: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        handleSubmit(values, setSubmitting);
                    }}
                >
                    {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        touched,
                        isSubmitting,
                        setSubmitting
                    }) => (
                        <div id='form' style={{ display: 'flex', gap: 20, flexDirection: 'column', marginTop: 100, width: "40%", marginLeft: 'auto', marginRight: 'auto' }}>
                            {console.log(errors)}
                            <div>
                                <TextField
                                    fullWidth
                                    id="email"
                                    name='email'
                                    label="Email Address"
                                    variant="outlined"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.email}
                                    error={touched.email && !!errors.email}
                                    helperText={touched.email && errors.email && errors.email}
                                />
                            </div>

                            <div>
                                <TextField
                                    fullWidth
                                    id="password"
                                    name='password'
                                    label="Password"
                                    variant="outlined"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.password}
                                    error={touched.password && !!errors.password}
                                    helperText={touched.password && errors.password && errors.password}
                                />
                            </div>

                            <div>
                                <div>
                                    <Button
                                        fullWidth
                                        variant='contained'
                                        disabled={isSubmitting}
                                        onClick={handleSubmit}
                                    >
                                        Login
                                    </Button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography>Don't have an account?</Typography>
                                    <Button variant="text">Register</Button>
                                    <Button variant="text" style={{ marginLeft: 'auto' }}>Forgot Password</Button>
                                </div>
                            </div>

                        </div>
                    )}
                </Formik>

            </div>
        </div>
    )
}
