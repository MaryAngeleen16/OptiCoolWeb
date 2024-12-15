import React from 'react';
import './Header.css';  // Your custom CSS file

function Header() {
  return (
    <div className="headercustom">  {/* Custom header section */}
      <div className="navbar">
        <a href="/">Home</a>
        <a href="/">Environment Status</a>

      </div>
    </div>
  );
}

export default Header;
