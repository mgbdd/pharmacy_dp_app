import React, { useState } from 'react';
import ClientQueries from './queries/ClientQueries';
import MedicineQueries from './queries/MedicineQueries';
import MedicationQueries from './queries/MedicationQueries';
import IngredientQueries from './queries/IngredientQueries';
import OrderQueries from './queries/OrderQueries';
import TechnologyQueries from './queries/TechnologyQueries';
import './QueriesPage.css';

const QueriesPage = () => {
  const [activeCategory, setActiveCategory] = useState('clients');

  const renderContent = () => {
    switch (activeCategory) {
      case 'clients':
        return <ClientQueries />;
      case 'medicines':
        return <MedicineQueries />;
      case 'medications':
        return <MedicationQueries />;
      case 'ingredients':
        return <IngredientQueries />;
      case 'orders':
        return <OrderQueries />;
      case 'technologies':
        return <TechnologyQueries />;
      default:
        return <ClientQueries />;
    }
  };

  return (
    <div className="queries-page">
      <h1>Аптечные запросы</h1>
      
      <div className="queries-navigation">
        <button 
          className={activeCategory === 'clients' ? 'active' : ''} 
          onClick={() => setActiveCategory('clients')}
        >
          Клиенты
        </button>
        <button 
          className={activeCategory === 'medicines' ? 'active' : ''} 
          onClick={() => setActiveCategory('medicines')}
        >
          Лекарства
        </button>
        <button 
          className={activeCategory === 'medications' ? 'active' : ''} 
          onClick={() => setActiveCategory('medications')}
        >
          Медикаменты
        </button>
        <button 
          className={activeCategory === 'ingredients' ? 'active' : ''} 
          onClick={() => setActiveCategory('ingredients')}
        >
          Ингредиенты
        </button>
        <button 
          className={activeCategory === 'orders' ? 'active' : ''} 
          onClick={() => setActiveCategory('orders')}
        >
          Заказы
        </button>
        <button 
          className={activeCategory === 'technologies' ? 'active' : ''} 
          onClick={() => setActiveCategory('technologies')}
        >
          Технологии
        </button>
      </div>
      
      <div className="queries-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default QueriesPage;
