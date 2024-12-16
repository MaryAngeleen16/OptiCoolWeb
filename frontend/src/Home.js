import React from 'react';
import Header from './Components/Layouts/Header';
import './Home.css';

function Home() {
  return (
    <div>
      Home
      <Header />

      <div className="envstatus-container">
        <div className="envstatus">
          {/* Your content for envstatus goes here */}
        </div>
      </div>

      {/* New Wrapper for Accuweather and Box Container */}
      <div className="accuweather-container">
        <div className="accuweather">
          {/* Content for Accuweather goes here */}
        </div>

        <div className="box-container">
          <div className="box1">
            {/* Content for Box 1 */}
          </div>
          <div className="box2">
            {/* Content for Box 2 */}
          </div>
        </div>
      </div>


      <div className="envstatus-container">
        <div className="envstatus">
          {/* Your content for envstatus goes here */}
        </div>
      </div>
    </div>
  );
}

export default Home;
