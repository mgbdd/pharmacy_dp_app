import React, { useState } from 'react';
import QueriesService from '../../services/QueriesService';

const OrderQueries = () => {
  const [producingOrders, setProducingOrders] = useState([]);
  const [producingOrdersCount, setProducingOrdersCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обработчики для запросов
  const fetchProducingOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getProducingOrders();
      setProducingOrders(response.data);
    } catch (err) {
      setError('Ошибка при получении заказов в производстве');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountProducingOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.countProducingOrders();
      setProducingOrdersCount(response.data.count);
    } catch (err) {
      setError('Ошибка при получении количества заказов в производстве');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Запросы по заказам</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="query-section">
        <div className="query-card">
          <h3>Заказы в производстве</h3>
          <div className="query-form">
            <button onClick={fetchProducingOrders} disabled={loading}>
              Получить список
            </button>
            <button onClick={fetchCountProducingOrders} disabled={loading}>
              Получить количество
            </button>
          </div>

          {producingOrdersCount !== null && (
            <div className="query-count">Количество заказов: {producingOrdersCount}</div>
          )}

          {producingOrders.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(producingOrders[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {producingOrders.map((order, index) => (
                    <tr key={index}>
                      {Object.values(order).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {producingOrders.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderQueries;

