import axios from 'axios';
import { store } from './states/store';
import { setAuth } from './states/authSlice';

// Set up a global response interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Remove token and clear Redux auth state
      localStorage.removeItem('token');
      if (store.dispatch) {
        store.dispatch(setAuth(null));
      }
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// No export needed, just import this file once in index.js to activate the interceptor.
