import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, Box, Button, Grid2, TextField } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { setAuth } from '../../states/authSlice';
import Sidebar from '../../Components/Layouts/Sidebar';


export default function ViewProfile() {

    const { user, token } = useSelector(state => state.auth);
    const [imgPreview, setImgPreview] = useState(null);
    const dispatch = useDispatch();

    const validationSchema = Yup.object().shape({
        // avatar: Yup.string()
        //     .required('Avatar URL is required'),
        username: Yup.string()
            .min(3, 'Username must be at least 3 characters')
            .max(15, 'Username cannot exceed 15 characters')
            .required('Username is required'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
    });

    // Initial Values
    const initialValues = {
        avatar: null,
        username: user.username,
        email: user.email,
    };
    // Form Submission

    useEffect(() => {
        setImgPreview(user.avatar.url)
    }, [])

    const updateProfile = async (values) => {
        const formData = new FormData;

        if (values.avatar) {
            formData.append('avatar', values.avatar)
        }

        formData.append('username', values.username)
        formData.append('email', values.email)

        try {

            const { data } = await axios.put(`${process.env.REACT_APP_API}/users/update/${user._id}`,
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            )

            dispatch(setAuth({
                user: data.user,
                token: data.token,
            }))

            alert("Updated successfully")

        } catch (err) {
            alert("Error occured")
        }
    };

    return (
        <div>


            <div style={{ marginTop: 120, }} >

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={updateProfile}
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
                        <div style={{
                            display: 'flex', justifyContent: 'center',
                        }}>

                            <div style={{ width: '50%', display: 'flex', gap: 20, flexDirection: 'column' }}>

                                <div>
                                    <Avatar src={imgPreview} sx={{ marginX: 'auto', width: 150, height: 150, borderColor: 'black', borderWidth: 2, borderStyle: 'solid' }} />

                                </div>

                                <div style={{ width: "90%", marginLeft: 'auto', marginRight: 'auto', display: 'flex', gap: 20, flexDirection: 'column' }}>

                                    <div>
                                        <TextField
                                            sx={{ marginX: '20' }}
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
                                                const file = e.target.files[0];
                                                setFieldValue('avatar', file);

                                                // Generate a preview
                                                if (file) {
                                                    setImgPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            error={touched.avatar && !!errors.avatar}
                                            helperText={touched.avatar && errors.avatar && errors.avatar}
                                        />
                                    </div>

                                    <div>
                                        <TextField
                                            sx={{ marginX: '20' }}
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
                                            sx={{ marginX: '20' }}
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

                                    <Button variant='contained' onClick={handleSubmit}>Save</Button>
                                    <Button variant='contained' color='error'>Change Password</Button>
                                </div>


                            </div>

                        </div>
                    )
                    }
                </Formik >

            </div >

                    <Sidebar />

        </div >
    )
}
