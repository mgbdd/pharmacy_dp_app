import React, { useState } from 'react';
import QueriesService from '../../services/QueriesService';

const TechnologyQueries = () => {
  const [technologies, setTechnologies] = useState([]);
  const [medicineType, setMedicineType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обработчики для запросов
  const fetchAllTechnologies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getTechnologies();
      setTechnologies(response.data);
    } catch (err) {
      setError('Ошибка при получении технологий');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnologiesByType = async () => {
    if (!medicineType) {
      setError('Пожалуйста, введите тип лекарства');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getTechnologies(medicineType);
      setTechnologies(response.data);
    } catch (err) {
      setError('Ошибка при получении технологий по типу лекарства');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnologiesForProducingOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getTechnologies(null, null, true);
      setTechnologies(response.data);
    } catch (err) {
      setError('Ошибка при получении технологий для производства заказов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Запросы по технологиям</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="query-section">
        <div className="query-card">
          <h3>Все технологии</h3>
          <div className="query-form">
            <button onClick={fetchAllTechnologies} disabled={loading}>
              Получить список
            </button>
          </div>
          
          <div className="query-form">
            <input
              type="text"
              placeholder="Тип лекарства"
              value={medicineType}
              onChange={e => setMedicineType(e.target.value)}
            />
            <button onClick={fetchTechnologiesByType} disabled={loading}>
              Получить по типу
            </button>
          </div>
          
          <div className="query-form">
            <button onClick={fetchTechnologiesForProducingOrders} disabled={loading}>
              Для производимых заказов
            </button>
          </div>
          
          {technologies.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(technologies[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {technologies.map((technology, index) => (
                    <tr key={index}>
                      {Object.values(technology).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {technologies.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnologyQueries;
