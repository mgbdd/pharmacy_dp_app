import React, { useState } from 'react';
import QueriesService from '../../services/QueriesService';

const MedicationQueries = () => {
  const [topMedications, setTopMedications] = useState([]);
  const [topMedicationsByType, setTopMedicationsByType] = useState([]);
  const [criticalLevelMedications, setCriticalLevelMedications] = useState([]);
  const [lowStockMedications, setLowStockMedications] = useState([]);
  const [lowStockMedicationsByType, setLowStockMedicationsByType] = useState([]);
  const [medicationType, setMedicationType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обработчики для запросов
  const fetchTopMedications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getTopMedications();
      setTopMedications(response.data);
    } catch (err) {
      setError('Ошибка при получении топ медикаментов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopMedicationsByType = async () => {
    if (!medicationType) {
      setError('Пожалуйста, введите тип медикамента');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getTopMedicationsByType(medicationType);
      setTopMedicationsByType(response.data);
    } catch (err) {
      setError('Ошибка при получении топ медикаментов по типу');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicationsAtCriticalLevel = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getMedicationsAtCriticalLevel();
      setCriticalLevelMedications(response.data);
    } catch (err) {
      setError('Ошибка при получении медикаментов на критическом уровне');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockMedications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getLowStockMedications();
      setLowStockMedications(response.data);
    } catch (err) {
      setError('Ошибка при получении медикаментов с низким запасом');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockMedicationsByType = async () => {
    if (!medicationType) {
      setError('Пожалуйста, введите тип медикамента');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getLowStockMedicationsByType(medicationType);
      setLowStockMedicationsByType(response.data);
    } catch (err) {
      setError('Ошибка при получении медикаментов с низким запасом по типу');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Запросы по медикаментам</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="query-section">
        <div className="query-card">
          <h3>Топ медикаменты</h3>
          <div className="query-form">
            <button onClick={fetchTopMedications} disabled={loading}>
              Получить список
            </button>
          </div>
          
          {topMedications.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(topMedications[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topMedications.map((medication, index) => (
                    <tr key={index}>
                      {Object.values(medication).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {topMedications.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Топ медикаменты по типу</h3>
          <div className="query-form">
            <input
              type="text"
              placeholder="Тип медикамента"
              value={medicationType}
              onChange={e => setMedicationType(e.target.value)}
            />
            <button onClick={fetchTopMedicationsByType} disabled={loading}>
              Получить список
            </button>
          </div>
          
          {topMedicationsByType.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(topMedicationsByType[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topMedicationsByType.map((medication, index) => (
                    <tr key={index}>
                      {Object.values(medication).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {topMedicationsByType.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Медикаменты на критическом уровне</h3>
          <div className="query-form">
            <button onClick={fetchMedicationsAtCriticalLevel} disabled={loading}>
              Получить список
            </button>
          </div>
          
          {criticalLevelMedications.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(criticalLevelMedications[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criticalLevelMedications.map((medication, index) => (
                    <tr key={index}>
                      {Object.values(medication).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {criticalLevelMedications.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Медикаменты с низким запасом</h3>
          <div className="query-form">
            <button onClick={fetchLowStockMedications} disabled={loading}>
              Получить список
            </button>
          </div>
          
          {lowStockMedications.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(lowStockMedications[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lowStockMedications.map((medication, index) => (
                    <tr key={index}>
                      {Object.values(medication).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {lowStockMedications.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Медикаменты с низким запасом по типу</h3>
          <div className="query-form">
            <input
              type="text"
              placeholder="Тип медикамента"
              value={medicationType}
              onChange={e => setMedicationType(e.target.value)}
            />
            <button onClick={fetchLowStockMedicationsByType} disabled={loading}>
              Получить список
            </button>
          </div>
          
          {lowStockMedicationsByType.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(lowStockMedicationsByType[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lowStockMedicationsByType.map((medication, index) => (
                    <tr key={index}>
                      {Object.values(medication).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {lowStockMedicationsByType.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationQueries;
