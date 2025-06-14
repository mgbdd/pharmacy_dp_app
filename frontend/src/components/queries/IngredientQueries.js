import React, { useState } from 'react';
import QueriesService from '../../services/QueriesService';

const IngredientQueries = () => {
  const [ingredientUsage, setIngredientUsage] = useState([]);
  const [ingredientsForProducingOrders, setIngredientsForProducingOrders] = useState([]);
  const [ingredientsForProducingOrdersCount, setIngredientsForProducingOrdersCount] = useState(null);
  const [ingredientName, setIngredientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обработчики для запросов
  const fetchIngredientUsage = async () => {
    if (!ingredientName || !startDate || !endDate) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getIngredientUsage(ingredientName, startDate, endDate);
      setIngredientUsage(response.data);
    } catch (err) {
      setError('Ошибка при получении использования ингредиента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredientsForProducingOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.getIngredientsForProducingOrders();
      setIngredientsForProducingOrders(response.data);
    } catch (err) {
      setError('Ошибка при получении ингредиентов для производства заказов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountIngredientsForProducingOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await QueriesService.countIngredientsForProducingOrders();
      setIngredientsForProducingOrdersCount(response.data.count);
    } catch (err) {
      setError('Ошибка при получении количества ингредиентов для производства заказов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Запросы по ингредиентам</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="query-section">
        <div className="query-card">
          <h3>Использование ингредиента</h3>
          <div className="query-form">
            <input
              type="text"
              placeholder="Название ингредиента"
              value={ingredientName}
              onChange={e => setIngredientName(e.target.value)}
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
            <button onClick={fetchIngredientUsage} disabled={loading}>
              Получить данные
            </button>
          </div>

          {ingredientUsage.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(ingredientUsage[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ingredientUsage.map((usage, index) => (
                    <tr key={index}>
                      {Object.values(usage).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {ingredientUsage.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>

        <div className="query-card">
          <h3>Ингредиенты для производства заказов</h3>
          <div className="query-form">
            <button onClick={fetchIngredientsForProducingOrders} disabled={loading}>
              Получить список
            </button>
            <button onClick={fetchCountIngredientsForProducingOrders} disabled={loading}>
              Получить количество
            </button>
          </div>

          {ingredientsForProducingOrdersCount !== null && (
            <div className="query-count">Количество ингредиентов: {ingredientsForProducingOrdersCount}</div>
          )}

          {ingredientsForProducingOrders.length > 0 && (
            <div className="query-results">
              <table>
                <thead>
                  <tr>
                    {Object.keys(ingredientsForProducingOrders[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ingredientsForProducingOrders.map((ingredient, index) => (
                    <tr key={index}>
                      {Object.values(ingredient).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {ingredientsForProducingOrders.length === 0 && !loading && (
            <div className="empty-result">Нет данных для отображения</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IngredientQueries;

