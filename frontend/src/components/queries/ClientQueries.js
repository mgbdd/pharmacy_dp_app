import React, { useState } from 'react';
import QueriesService from '../../services/QueriesService';

const ClientQueries = () => {
  const [unclaimedOrders, setUnclaimedOrders] = useState([]);
  const [unclaimedOrdersCount, setUnclaimedOrdersCount] = useState(null);
  const [waitingForDelivery, setWaitingForDelivery] = useState([]);
  const [waitingForDeliveryCount, setWaitingForDeliveryCount] = useState(null);
  const [waitingByTypeCount, setWaitingByTypeCount] = useState(null);
  const [medicationType, setMedicationType] = useState('');
  const [byNameClients, setByNameClients] = useState([]);
  const [byNameClientsCount, setByNameClientsCount] = useState(null);
  const [byTypeClients, setByTypeClients] = useState([]);
  const [byTypeClientsCount, setByTypeClientsCount] = useState(null);
  const [mostFrequentClients, setMostFrequentClients] = useState([]);
  const [medicationName, setMedicationName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обработчики для запросов
  const fetchClientsWithUnclaimedOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getClientsWithUnclaimedOrders();
      setUnclaimedOrders(response.data);
    } catch (err) {
      setError('Ошибка при получении клиентов с невыкупленными заказами');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountClientsWithUnclaimedOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.countClientsWithUnclaimedOrders();
      setUnclaimedOrdersCount(response.data.count);
    } catch (err) {
      setError('Ошибка при получении количества клиентов с невыкупленными заказами');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsWaitingForDelivery = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getClientsWaitingForDelivery();
      setWaitingForDelivery(response.data);
    } catch (err) {
      setError('Ошибка при получении клиентов, ожидающих доставку');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountClientsWaitingForDelivery = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.countClientsWaitingForDelivery();
      setWaitingForDeliveryCount(response.data.count);
    } catch (err) {
      setError('Ошибка при получении количества клиентов, ожидающих доставку');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountClientsWaitingForDeliveryByType = async () => {
    if (!medicationType) {
      setError('Пожалуйста, укажите тип медикамента');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Отправляем русский текст без URL-кодирования
      const response = await QueriesService.countClientsWaitingForDeliveryByType(decodeURI(medicationType));
      setWaitingByTypeCount(response.data.count);
    } catch (err) {
      setError('Ошибка при получении количества клиентов, ожидающих доставку по типу');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClientsByMedicationName = async () => {
    if (!medicationName || !startDate || !endDate) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Отправляем русский текст без URL-кодирования
      const response = await QueriesService.getClientsByMedicationName(decodeURI(medicationName), startDate, endDate);
      setByNameClients(response.data);
    } catch (err) {
      setError('Ошибка при получении клиентов по названию медикамента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCountClientsByMedicationName = async () => {
    if (!medicationName || !startDate || !endDate) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Отправляем русский текст без URL-кодирования
      const response = await QueriesService.countClientsByMedicationName(decodeURI(medicationName), startDate, endDate);
      setByNameClientsCount(response.data.count);
    } catch (err) {
      setError('Ошибка при получении количества клиентов по названию медикамента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClientsByMedicationType = async () => {
    if (!medicationType || !startDate || !endDate) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Отправляем русский текст без URL-кодирования
      const response = await QueriesService.getClientsByMedicationType(decodeURI(medicationType), startDate, endDate);
      setByTypeClients(response.data);
    } catch (err) {
      setError('Ошибка при получении клиентов по типу медикамента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCountClientsByMedicationType = async () => {
    if (!medicationType || !startDate || !endDate) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // Отправляем русский текст без URL-кодирования
      const response = await QueriesService.countClientsByMedicationType(decodeURI(medicationType), startDate, endDate);
      setByTypeClientsCount(response.data.count);
    } catch (err) {
      setError('Ошибка при получении количества клиентов по типу медикамента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMostFrequentClients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getMostFrequentClients();
      setMostFrequentClients(response.data);
    } catch (err) {
      setError('Ошибка при получении наиболее частых клиентов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Запросы по клиентам</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="query-section">
        <div className="query-card">
          <h3>Клиенты с невыкупленными заказами</h3>
          <div className="query-form">
            <button onClick={fetchClientsWithUnclaimedOrders} disabled={loading}>
              Получить список
            </button>
            <button onClick={fetchCountClientsWithUnclaimedOrders} disabled={loading}>
              Получить количество
            </button>
          </div>
          
          {unclaimedOrdersCount !== null && (
            <div className="query-count">Количество клиентов: {unclaimedOrdersCount}</div>
          )}
          
          {unclaimedOrders.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(unclaimedOrders[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unclaimedOrders.map((client, index) => (
                    <tr key={index}>
                      {Object.values(client).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {unclaimedOrders.length === 0 && unclaimedOrdersCount === null && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Клиенты, ожидающие доставку</h3>
          <div className="query-form">
            <button onClick={fetchClientsWaitingForDelivery} disabled={loading}>
              Получить список
            </button>
            <button onClick={fetchCountClientsWaitingForDelivery} disabled={loading}>
              Получить количество
            </button>
          </div>
          
          {waitingForDeliveryCount !== null && (
            <div className="query-count">Количество клиентов: {waitingForDeliveryCount}</div>
          )}
          
          {waitingForDelivery.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(waitingForDelivery[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waitingForDelivery.map((client, index) => (
                    <tr key={index}>
                      {Object.values(client).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {waitingForDelivery.length === 0 && waitingForDeliveryCount === null && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Количество клиентов, ожидающих доставку по типу</h3>
          <div className="query-form">
            <input
              type="text"
              placeholder="Тип медикамента"
              value={medicationType}
              onChange={e => setMedicationType(e.target.value)}
            />
            <button onClick={fetchCountClientsWaitingForDeliveryByType} disabled={loading}>
              Получить количество
            </button>
          </div>
          
          {waitingByTypeCount !== null && (
            <div className="query-count">
              Количество клиентов для типа "{medicationType}": {waitingByTypeCount}
            </div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Клиенты по названию медикамента</h3>
          <div className="query-form">
            <input
              type="text"
              placeholder="Название медикамента"
              value={medicationName}
              onChange={e => setMedicationName(e.target.value)}
            />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
            <button onClick={fetchClientsByMedicationName} disabled={loading}>
              Получить список
            </button>
            <button onClick={fetchCountClientsByMedicationName} disabled={loading}>
              Получить количество
            </button>
          </div>
          
          {byNameClientsCount !== null && (
            <div className="query-count">Количество клиентов: {byNameClientsCount}</div>
          )}
          
          {byNameClients.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(byNameClients[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byNameClients.map((client, index) => (
                    <tr key={index}>
                      {Object.values(client).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {byNameClients.length === 0 && byNameClientsCount === null && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Клиенты по типу медикамента</h3>
          <div className="query-form">
            <input
              type="text"
              placeholder="Тип медикамента"
              value={medicationType}
              onChange={e => setMedicationType(e.target.value)}
            />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
            <button onClick={fetchClientsByMedicationType} disabled={loading}>
              Получить список
            </button>
            <button onClick={fetchCountClientsByMedicationType} disabled={loading}>
              Получить количество
            </button>
          </div>
          
          {byTypeClientsCount !== null && (
            <div className="query-count">Количество клиентов: {byTypeClientsCount}</div>
          )}
          
          {byTypeClients.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(byTypeClients[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byTypeClients.map((client, index) => (
                    <tr key={index}>
                      {Object.values(client).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {byTypeClients.length === 0 && byTypeClientsCount === null && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
        
        <div className="query-card">
          <h3>Наиболее частые клиенты</h3>
          <div className="query-form">
            <button onClick={fetchMostFrequentClients} disabled={loading}>
              Получить список
            </button>
          </div>
          
          {mostFrequentClients.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(mostFrequentClients[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mostFrequentClients.map((client, index) => (
                    <tr key={index}>
                      {Object.values(client).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {mostFrequentClients.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientQueries;
