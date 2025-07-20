
import './axiosinterceptors'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

import { store, persistor } from './states/store';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react';




console.log("Frontend running on port:", window.location.port); 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>

    <Provider store={store}>

      <PersistGate loading={null} persistor={persistor}>

        <App />

      </PersistGate>

    </Provider>

  </React.StrictMode>
);


reportWebVitals();
