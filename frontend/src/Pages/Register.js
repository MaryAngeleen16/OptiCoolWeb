import React from 'react'
import Header from '../Components/Layouts/Header'
import { TextField, Button, Typography } from '@mui/material'
import axios from 'axios';
import * as Yup from 'yup';
import { Formik } from 'formik';
import mime from 'mime'

export default function Register() {

    const validationSchema = Yup.object().shape({
        username: Yup.string()
            .min(3, 'Username must be at least 3 characters')
            .required('Username is required'),
        email: Yup.string()
            .email('Please enter a valid email')
            .required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Please confirm your password'),
        avatar: Yup.string().required('Avatar is required'),
    });

    const register = async (formData) => {

        try {

            const { data } = await axios.post(`${process.env.REACT_APP_API}/users/register`, formData, {
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            });


        } catch (err) {
            console.log(err);
        }

    }

    const submit = async (userData, setSubmitting) => {

        const formData = new FormData;
        formData.append('avatar', userData.avatar);
        formData.append('username', userData.username)
        formData.append('email', userData.email)
        formData.append('password', userData.password)

        await register(formData)

        setSubmitting(false)
    }

    return (
        <div>
            <Header />

            <div style={{ marginTop: "5%" }}>


                <Formik
                    initialValues={{
                        username: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        avatar: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        submit(values, setSubmitting);
                    }}
                >
                    {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        touched,
                        setFieldValue,
                        setFieldError,
                        setFieldTouched,
                        setSubmitting,
                        isSubmitting,
                    }) => (
                        <div id='form' style={{ display: 'flex', gap: 20, flexDirection: 'column', marginTop: 150, width: "40%", marginLeft: 'auto', marginRight: 'auto' }}>

                            <div>
                                <TextField
                                    fullWidth
                                    id="username"
                                    name='username'
                                    label="Username"
                                    variant="outlined"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.username}
                                    error={touched.username && !!errors.username}
                                    helperText={touched.username && errors.username && errors.username}
                                />
                            </div>

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
                                <TextField
                                    fullWidth
                                    id="confirmPassword"
                                    name='confirmPassword'
                                    label="Cofirm Password"
                                    variant="outlined"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.confirmPassword}
                                    error={touched.confirmPassword && !!errors.confirmPassword}
                                    helperText={touched.confirmPassword && errors.confirmPassword && errors.confirmPassword}
                                />
                            </div>
                            {console.log(errors)}
                            <div>
                                <TextField
                                    fullWidth
                                    id="avatar"
                                    name='avatar'
                                    accept="image/*"
                                    InputProps={{
                                        inputProps: { accept: "image/*" }, // Correct way to pass accept attribute
                                    }}
                                    type='file'
                                    variant="outlined"
                                    onBlur={() => {
                                        setFieldTouched('avatar', true)
                                    }}
                                    onChange={(e) => {
                                        console.log(e.target.files[0])
                                        setFieldValue('avatar', e.target.files[0])
                                    }}
                                    error={touched.avatar && !!errors.avatar}
                                    helperText={touched.avatar && errors.avatar && errors.avatar}
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
                                    <Typography>Already have an account?</Typography>
                                    <Button variant="text">Login</Button>
                                </div>
                            </div>

                        </div>
                    )}
                </Formik>

            </div>
        </div>
    )
}
