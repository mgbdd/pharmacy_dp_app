import React, { useState } from 'react';
import QueriesService from '../../services/QueriesService';

const MedicineQueries = () => {
  const [medicineDetails, setMedicineDetails] = useState([]);
  const [medicineDetailsByName, setMedicineDetailsByName] = useState([]);
  const [medicinePriceAndComponents, setMedicinePriceAndComponents] = useState([]);
  const [medicineName, setMedicineName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обработчики для запросов
  const fetchAllMedicineDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getAllMedicineDetails();
      setMedicineDetails(response.data);
    } catch (err) {
      setError('Ошибка при получении деталей о лекарствах');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicineDetailsByName = async () => {
    if (!medicineName) {
      setError('Пожалуйста, введите название лекарства');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Отправляем русский текст без URL-кодирования
      const response = await QueriesService.getMedicineDetailsByName(decodeURI(medicineName));
      setMedicineDetailsByName(response.data);
    } catch (err) {
      setError('Ошибка при получении деталей о лекарстве по названию');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMedicinePriceAndComponents = async () => {
    if (!medicineName) {
      setError('Пожалуйста, введите название лекарства');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Отправляем русский текст без URL-кодирования
      const response = await QueriesService.getMedicinePriceAndComponents(decodeURI(medicineName));
      setMedicinePriceAndComponents(response.data);
    } catch (err) {
      setError('Ошибка при получении цены и компонентов лекарства');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Запросы по лекарствам</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="query-section">
        <div className="query-card">
          <h3>Все детали лекарств</h3>
          <div className="query-form">
            <button onClick={fetchAllMedicineDetails} disabled={loading}>
              Получить список
            </button>
          </div>
          
          {medicineDetails.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(medicineDetails[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {medicineDetails.map((medicine, index) => (
                    <tr key={index}>
                      {Object.values(medicine).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {medicineDetails.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Детали лекарства по названию</h3>
          <div className="query-form">
            <input
              type="text"
              placeholder="Название лекарства"
              value={medicineName}
              onChange={e => setMedicineName(e.target.value)}
            />
            <button onClick={fetchMedicineDetailsByName} disabled={loading}>
              Получить детали
            </button>
          </div>
          
          {medicineDetailsByName.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(medicineDetailsByName[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {medicineDetailsByName.map((medicine, index) => (
                    <tr key={index}>
                      {Object.values(medicine).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {medicineDetailsByName.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Цена и компоненты лекарства</h3>
          <div className="query-form">
            <input
              type="text"
              placeholder="Название лекарства"
              value={medicineName}
              onChange={e => setMedicineName(e.target.value)}
            />
            <button onClick={fetchMedicinePriceAndComponents} disabled={loading}>
              Получить информацию
            </button>
          </div>
          
          {medicinePriceAndComponents.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(medicinePriceAndComponents[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {medicinePriceAndComponents.map((item, index) => (
                    <tr key={index}>
                      {Object.values(item).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {medicinePriceAndComponents.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineQueries;
