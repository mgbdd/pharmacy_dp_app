import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header>
        <h1>Аптечная Система</h1>
        <p>Управление аптечными операциями</p>
      </header>
      
      <div className="menu-container">
        <div className="menu-section">
          <h2>Управление данными</h2>
          <div className="menu-buttons">
            <Link to="/medications" className="menu-button">
              <span className="button-icon">💊</span>
              <span className="button-text">Медикаменты</span>
            </Link>
            <Link to="/medicines" className="menu-button">
              <span className="button-icon">💉</span>
              <span className="button-text">Лекарства</span>
            </Link>
            <Link to="/clients" className="menu-button">
              <span className="button-icon">👥</span>
              <span className="button-text">Клиенты</span>
            </Link>
            <Link to="/orders" className="menu-button">
              <span className="button-icon">📋</span>
              <span className="button-text">Заказы</span>
            </Link>
          </div>
        </div>
        
        <div className="menu-section">
          <h2>Дополнительные функции</h2>
          <div className="menu-buttons">
            <Link to="/technologies" className="menu-button">
              <span className="button-icon">🔬</span>
              <span className="button-text">Технологии</span>
            </Link>
            <Link to="/inventory" className="menu-button">
              <span className="button-icon">📦</span>
              <span className="button-text">Инвентарь</span>
            </Link>
            <Link to="/delivery" className="menu-button">
              <span className="button-icon">🚚</span>
              <span className="button-text">Доставка</span>
            </Link>
            <Link to="/queries" className="menu-button">
              <span className="button-icon">🔍</span>
              <span className="button-text">Запросы</span>
            </Link>
          </div>
        </div>
      </div>
      
      <footer>
        <p>&copy; 2023 Аптечная Система</p>
      </footer>
    </div>
  );
};

export default Home;
