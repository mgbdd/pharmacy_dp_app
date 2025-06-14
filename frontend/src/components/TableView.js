import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTableData, createRecord, updateRecord, deleteRecord } from '../services/api';

const TableView = () => {
  const { role, table } = useParams();
  const [data, setData] = useState([]);
  const [fieldTranslations, setFieldTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableInfo, setTableInfo] = useState(null);
  
  // Новые состояния для управления модальными окнами и формами
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create' или 'edit'
  const [formData, setFormData] = useState({});
  const [currentItemId, setCurrentItemId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Определяем информацию о таблице и права доступа
    let availableTables = [];
    switch (role) {
      case 'provizor':
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
    
    const currentTable = availableTables.find(t => t.id === table);
    if (currentTable) {
      setTableInfo(currentTable);
    }
  }, [role, table]);

  useEffect(() => {
    if (tableInfo) {
      loadData();
    }
  }, [tableInfo]);

  // Функция для загрузки данных, выделена отдельно для повторного использования
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchTableData(tableInfo.endpoint);
      setData(result.data || result || []);
      setFieldTranslations(result.headers || {})
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'pharmacist': return 'Фармацевт';
      case 'provizor': return 'Провизор';
      case 'manager': return 'Менеджер товарной группы';
      default: return '';
    }
  };

  const getAccessDescription = (access) => {
    switch (access) {
      case 'readonly': return 'Только просмотр';
      case 'create_delete': return 'Добавление и удаление';
      case 'full': return 'Полный доступ';
      default: return '';
    }
  };

  const renderTableHeaders = () => {
    if (data.length === 0) return null;
    
    const item = data[0];
    return (
      <tr>
        {Object.keys(item).map((key) => (
          <th key={key}>{fieldTranslations[key] || key}</th>
        ))}
        {tableInfo && tableInfo.access !== 'readonly' && <th>Действия</th>}
      </tr>
    );
  };

  const renderTableRows = () => {
    if (data.length === 0) return null;
    
    return data.map((item, index) => (
      <tr key={index}>
        {Object.values(item).map((value, i) => (
          <td key={i}>
            {value === null ? '-' : 
             typeof value === 'object' ? JSON.stringify(value) : 
             String(value)}
          </td>
        ))}
        {tableInfo && tableInfo.access !== 'readonly' && (
          <td className="actions-cell">
            {(tableInfo.access === 'full') && (
              <button className="edit-btn" onClick={() => handleEdit(item)}>
                Редактировать
              </button>
            )}
            {(tableInfo.access === 'full' || tableInfo.access === 'create_delete') && (
              <button className="delete-btn" onClick={() => handleDelete(item)}>
                Удалить
              </button>
            )}
          </td>
        )}
      </tr>
    ));
  };

  // Получение ID записи из объекта
  const getItemId = (item) => {
    // Предполагаем, что id - это первое поле или поле с именем 'id'
    return item.id || Object.values(item)[0];
  };

  // Обновленный обработчик редактирования
  const handleEdit = (item) => {
    // Получаем ID записи
    const id = getItemId(item);
    setCurrentItemId(id);
    
    // Копируем данные записи в форму (исключаем служебные поля с текстом)
    const formValues = {};
    Object.keys(item).forEach(key => {
      formValues[key] = item[key];
    });
    
    setFormData(formValues);
    
    // Открываем модальное окно для редактирования
    setModalType('edit');
    setShowModal(true);
  };

  // Обновленный обработчик удаления
  const handleDelete = async (item) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        setLoading(true);
        // Получаем ID записи
        const id = getItemId(item);
        
        // Отправляем запрос на удаление
        await deleteRecord(tableInfo.endpoint, id);
        
        // Обновляем данные в таблице
        await loadData();
        
        // Показываем сообщение об успехе
        setSuccessMessage('Запись успешно удалена');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  // Обновленный обработчик создания
  const handleCreate = () => {
    // Создаем пустую форму на основе первой записи (если есть данные)
    const emptyForm = {};
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        // Не включаем в форму поля, содержащие '_text' (для boolean значений)

          if (typeof data[0][key] === 'number') {
            emptyForm[key] = 0;
          } else if (typeof data[0][key] === 'boolean') {
            emptyForm[key] = false;
          } else {
            emptyForm[key] = '';
          }

      });
    }

    if (table === 'prescriptions') {
      // Удаляем поле client_id, если оно есть
      if ('client_id' in emptyForm) {
        delete emptyForm.client_id;
      }

      // Добавляем поля для информации о клиенте
      emptyForm.name = '';
      emptyForm.surname = '';
      emptyForm.patronymic = '';
      emptyForm.phone_number = '';
    }

    if (table === 'orders') {
      if ('date_of_issue' in emptyForm) {
        delete emptyForm.date_of_issue;
      }
      if ('expected_date_of_issue' in emptyForm) {
        delete emptyForm.expected_date_of_issue;
      }
      if ('start_data' in emptyForm) {
        delete emptyForm.start_data;
      }
    }

    
    setFormData(emptyForm);
    setModalType('create');
    setShowModal(true);
  };
  
  // Обработка изменений в форме
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Для чекбоксов используем checked вместо value
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } 
    // Для числовых полей преобразуем строку в число
    else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } 
    // Для остальных полей используем значение как есть
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const prepareDataForSubmit = (data) => {
    const preparedData = {...data};
    const integerFields = []; // Массив для хранения обнаруженных integer полей
    const floatFields = [];   // Массив для хранения обнаруженных float полей
    const stringFields = [];  // Массив для хранения строковых полей
    
    // Первый проход: анализируем данные, чтобы определить типы полей
    Object.keys(preparedData).forEach(key => {
      // Определяем поля, которые всегда должны быть строками
      if (key === 'phone' || 
          key === 'phone_number' || 
          key.includes('phone')) {
        stringFields.push(key);
      }
      // Определяем integer поля по имени
      else if (key === 'id' || 
          key.endsWith('_id') || 
          key.endsWith('_number') || 
          key === 'age' || 
          key.includes('count') || 
          key.includes('quantity') || 
          key === 'units_per_package') {
        integerFields.push(key);
      }
      
      // Определяем float поля по имени
      else if (key === 'amount' || 
               key === 'price' || 
               key === 'cost' || 
               key === 'critical_norm' || 
               key.includes('amount') || 
               key.includes('price') || 
               key.includes('cost') ||
               key.includes('rate') ||
               key.includes('percentage') ||
               key.includes('weight')) {
        floatFields.push(key);
      }
      
      // Если значение уже является числом, определяем его тип
      if (typeof preparedData[key] === 'number') {
        // Если число целое и еще не в списке целых чисел
        if (Number.isInteger(preparedData[key]) && !integerFields.includes(key) && !floatFields.includes(key)) {
          // Проверяем, должно ли оно быть float по контексту
          if (key.includes('amount') || key.includes('price') || key.includes('cost')) {
            floatFields.push(key);
          } else {
            integerFields.push(key);
          }
        }
        // Если число с плавающей точкой и еще не в списке float
        else if (!Number.isInteger(preparedData[key]) && !floatFields.includes(key)) {
          floatFields.push(key);
        }
      }
    });
    
    // Второй проход: применяем преобразования типов
    Object.keys(preparedData).forEach(key => {
      // Пустые строки заменяем на null для всех полей
      if (preparedData[key] === '') {
        preparedData[key] = null;
        return; // Переходим к следующему полю
      }
      
      // Если значение null, пропускаем его
      if (preparedData[key] === null) {
        return; // Переходим к следующему полю
      }
      
      // Поля, которые всегда должны быть строками
      if (stringFields.includes(key)) {
        // Преобразуем в строку любое значение (число, булево и т.д.)
        preparedData[key] = String(preparedData[key]);
      }
      // Преобразуем в integer
      else if (integerFields.includes(key) && typeof preparedData[key] !== 'number') {
        // Только если значение можно преобразовать в число
        if (!isNaN(preparedData[key])) {
          preparedData[key] = parseInt(preparedData[key], 10);
        }
      }
      
      // Преобразуем в float
      else if (floatFields.includes(key) && typeof preparedData[key] !== 'number') {
        // Только если значение можно преобразовать в число
        if (!isNaN(preparedData[key])) {
          preparedData[key] = parseFloat(preparedData[key]);
        }
      }
      
      // Если число целое, но должно быть float по контексту
      else if (typeof preparedData[key] === 'number' && 
               Number.isInteger(preparedData[key]) && 
               floatFields.includes(key)) {
        // Преобразуем целое число в float
        preparedData[key] = parseFloat(preparedData[key]);
      }
    });
    
    // При создании записи удаляем id из данных
    if (modalType === 'create' && 'id' in preparedData) {
      delete preparedData.id;
    }
    
    console.log('Подготовленные данные:', preparedData);
    return preparedData;
  };

  // Отправка формы
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null); // Сбрасываем предыдущие ошибки

      // Подготавливаем данные перед отправкой
      const preparedData = prepareDataForSubmit(formData);

      if (modalType === 'create') {
        // Создание новой записи
        await createRecord(tableInfo.endpoint, preparedData);
        setSuccessMessage('Запись успешно создана');
      } else {
        // Обновление существующей записи
        await updateRecord(tableInfo.endpoint, currentItemId, preparedData);
        setSuccessMessage('Запись успешно обновлена');
      }

      // Закрываем модальное окно
      setShowModal(false);

      // Обновляем данные
      await loadData();

      // Скрываем сообщение через 3 секунды
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Ошибка при отправке формы:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Определение типа поля ввода на основе значения и имени поля
  const getInputType = (key, value) => {
    // Поля даты
    if (key.toLowerCase().includes('date')) {
      return 'date';
    } 
    // Телефонные номера и другие строковые идентификаторы всегда должны быть текстом,
    // даже если их значение выглядит как число
    else if (key === 'phone' || 
             key === 'phone_number' || 
             key.includes('phone')) {
      return 'text';
    }
    // Числовые поля
    else if (typeof value === 'number') {
      return 'number';
    } 
    // Булевы поля
    else if (typeof value === 'boolean') {
      return 'checkbox';
    } 
    // По умолчанию - текстовое поле
    else {
      return 'text';
    }
  };

  // Рендер модального окна с формой
  const renderModal = () => {
    if (!showModal) return null;

    const title = modalType === 'create' ? 'Создание новой записи' : 'Редактирование записи';

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>{title}</h3>
            <button onClick={() => setShowModal(false)}>×</button>
          </div>

          {/* Отображение ошибки в модальном окне */}
          {error && (
            <div className="error-message modal-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitForm}>
            {Object.keys(formData).map(field => {
              // Не показываем поле id при создании записи
              if (modalType === 'create' && (field === 'id')) {
                return null;
              }

              const inputType = getInputType(field, formData[field]);

              return (
                <div className="form-group" key={field}>
                  <label htmlFor={field}>{fieldTranslations[field] || field}</label>

                  {inputType === 'checkbox' ? (
                    <input
                      type="checkbox"
                      id={field}
                      name={field}
                      checked={!!formData[field]}
                      onChange={handleFormChange}
                    />
                  ) : (
                    <input
                      type={inputType}
                      id={field}
                      name={field}
                      value={formData[field] !== null ? formData[field] : ''}
                      onChange={handleFormChange}
                      // Делаем поле id только для чтения при редактировании
                      readOnly={field === 'id'}
                    />
                  )}
                </div>
              );
            })}

            <div className="form-actions">
              <button type="button" onClick={() => setShowModal(false)}>Отмена</button>
              <button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!tableInfo) {
    return <div>Таблица не найдена</div>;
  }

  return (
    <div>
      <div className="breadcrumbs">
        <Link to="/">Главная</Link> / <Link to={`/tables/${role}`}>{getRoleTitle()}</Link> / <span>{tableInfo.name}</span>
      </div>
      
      <div className="table-header">
        <h2>{tableInfo.name}</h2>
        <div className="access-info">
          <span className="access-badge">{getAccessDescription(tableInfo.access)}</span>
        </div>
      </div>

      {/* Сообщение об успешной операции */}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {(tableInfo.access === 'full' || tableInfo.access === 'create_delete') && (
        <div className="table-actions">
          <button className="create-btn" onClick={handleCreate}>
            Добавить запись
          </button>
        </div>
      )}

      {loading && <p>Загрузка данных...</p>}
      {error && <p className="error-message">Ошибка: {error}</p>}

      {!loading && !error && data.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              {renderTableHeaders()}
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <p>Нет данных для отображения</p>
      )}
      
      {/* Модальное окно */}
      {renderModal()}
    </div>
  );
};

export default TableView;
