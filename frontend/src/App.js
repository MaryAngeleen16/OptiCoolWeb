import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';



import Home from './Home.js';
import ManageRoom from './ManageRoom.js';
function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.

    //       TRY LANG HEHE
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    //   <Router>

    //   <Routes>

    //   <Route path="/" element={<Home />} exact />

    //   </Routes>


    //   </Router>

    // </div>


  <Router>

    <Routes>

    <Route path="/Home" element={<Home />} exact />
    <Route path="/ManageRoom" element={<ManageRoom />} exact />
    </Routes>


  </Router>

  );
}

export default App;
