import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="header">
      <div className="container">
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <h1>База данных производственной аптеки</h1>
        </Link>
      </div>
    </div>
  );
};

export default Header;
