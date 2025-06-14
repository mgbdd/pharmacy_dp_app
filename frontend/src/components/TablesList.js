import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const TablesList = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Здесь определяем доступные таблицы в зависимости от роли
    let availableTables = [];
    switch (role) {
      case 'provizor':
        // Фармацевт - доступны только для чтения
        availableTables = [
          { id: 'medications', name: 'Медикаменты', endpoint: '/medications/', access: 'readonly' },
          { id: 'medicines', name: 'Лекарства', endpoint: '/medicines/', access: 'readonly' },
          { id: 'ingredients', name: 'Ингредиенты', endpoint:  '/ingredients/', access: 'readonly'},
          { id: 'technologies', name: 'Технологии приготовления', endpoint: '/technologies/', access: 'readonly' },
          { id: 'compositions', name: 'Состав', endpoint: '/compositions/', access: 'readonly' },
          { id: 'prescriptions', name: 'Рецепты', endpoint: '/prescriptions/', access: 'full' },
          { id: 'orders', name: 'Заказы', endpoint: '/orders/', access: 'full' },
          { id: 'clients', name: 'Клиенты', endpoint: '/clients/', access: 'full' },
          { id: 'deliveries', name: 'Поставки на склад', endpoint: '/deliveries/', access: 'full' },
          { id: 'inventories', name: 'Инвентаризация', endpoint: '/inventories/', access: 'full' },
        ];
        break;
      case 'pharmacist':
        availableTables = [
          { id: 'medicines', name: 'Лекарства', endpoint: '/medicines/', access: 'readonly' },
          { id: 'ingredients', name: 'Ингредиенты', endpoint:  '/ingredients/', access: 'readonly'},
          { id: 'technologies', name: 'Технологии приготовления', endpoint: '/technologies/', access: 'readonly' },
          { id: 'compositions', name: 'Состав', endpoint: '/compositions/', access: 'readonly' },
          { id: 'prescriptions', name: 'Рецепты', endpoint: '/prescriptions/', access: 'create_delete' },
          { id: 'clients', name: 'Клиенты', endpoint: '/clients/', access: 'create_delete' },
          { id: 'orders', name: 'Заказы', endpoint: '/orders/', access: 'full' },
          { id: 'deliveries', name: 'Поставки на склад', endpoint: '/deliveries/', access: 'full' },
          { id: 'inventories', name: 'Инвентаризация', endpoint: '/inventories/', access: 'full' },
        ];
        break;
      case 'manager':
        availableTables = [
          // Доступны для добавления, редактирования и удаления
          { id: 'deliveries', name: 'Поставки на склад', endpoint: '/deliveries/', access: 'full' },
          { id: 'inventories', name: 'Инвентаризация', endpoint: '/inventories/', access: 'full' },
          // Дополнительные отчеты и запросы
          //{ id: 'low_stock', name: 'Медикаменты на исходе', endpoint: '/queries/medications/low-stock', access: 'readonly' },
          //{ id: 'top_medications', name: 'Популярные медикаменты', endpoint: '/queries/medications/top', access: 'readonly' },
        ];
        break;
      default:
        break;
    }
    setTables(availableTables);
  }, [role]);

  const handleTableClick = (tableId) => {
    navigate(`/tables/${role}/${tableId}`);
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'pharmacist': return 'Фармацевт';
      case 'provizor': return 'Провизор';
      case 'manager': return 'Менеджер товарной группы';
      default: return '';
    }
  };

  return (
    <div>
      <div className="breadcrumbs">
        <Link to="/">Главная</Link> / <span>{getRoleTitle()}</span>
      </div>
      <h2>Доступные таблицы для роли: {getRoleTitle()}</h2>
      <div className="tables-list">
        {tables.map((table) => (
          <div
            key={table.id}
            className="table-item"
            onClick={() => handleTableClick(table.id)}
          >
            <h3>{table.name}</h3>
            <div className="access-type">
              {table.access === 'readonly' && <span className="readonly-badge">Только для чтения</span>}
              {table.access === 'create_delete' && <span className="partial-badge">Добавление и удаление</span>}
              {table.access === 'full' && <span className="full-badge">Полный доступ</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablesList;
