import React, { useState } from "react";
import Header from "../Components/Layouts/Header";
import { TextField, Button, Typography, IconButton, InputAdornment } from "@mui/material";
import * as Yup from "yup";
import { Formik } from "formik";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuth } from "../states/authSlice";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values, setSubmitting) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API}/users/login`,
        values
      );

      dispatch(
        setAuth({
          user: data.user,
          token: data.token,
        })
      );

      navigate("/home");
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      if (err.response && err.response.status === 401) {
        setLoginError("Incorrect email or password");
      } else {
        console.info(err);
      }
    }
  };

  return (
    <div>
      <Header />

      <div style={{ marginTop: "5%" }}>
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={validationSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={(values, { setSubmitting }) => {
            setLoginError(""); // Clear previous login error
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
            setSubmitting,
          }) => (
            <div
              id="form"
              style={{
                display: "flex",
                gap: 20,
                flexDirection: "column",
                marginTop: 150,
                width: "40%",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {console.log(errors)}
              <div>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
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
                  name="password"
                  label="Password"
                  variant="outlined"
                  type={showPassword ? "text" : "password"} // Ensure password is hidden by default
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              {loginError && (
                <Typography color="error" variant="body2">
                  {loginError}
                </Typography>
              )}

              <div>
                <div>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    Login
                  </Button>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography>Don't have an account?</Typography>
                  <Button variant="text" onClick={() => navigate("/register")}>
                    Register
                  </Button>
                  <Button
                    variant="text"
                    style={{ marginLeft: "auto" }}
                    onClick={() => navigate("/forgot/password")}
                  >
                    Forgot Password
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Formik>
      </div>
    </div>
  );
}
