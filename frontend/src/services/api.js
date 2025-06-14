import axios from 'axios';

const API_URL = 'http://localhost:8000'; // URL для API бэкенда

// Функция для получения данных таблицы
export const fetchTableData = async (endpoint) => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    throw new Error(`Ошибка при получении данных: ${error.message}`);
  }
};

// Функция для создания новой записи
export const createRecord = async (endpoint, data) => {
  try {
    console.log('Отправляемые данные:', data); // Логирование данных перед отправкой
    const response = await axios.post(`${API_URL}${endpoint}`, data);
    return response.data;
  } catch (error) {
    // Проверяем наличие детальной информации об ошибке от сервера
    if (error.response && error.response.data) {
      console.error('Детали ошибки от сервера:', error.response.data);
      // Если сервер вернул подробное сообщение об ошибке, используем его
      if (error.response.data.detail) {
        throw new Error(`Ошибка при создании записи: ${error.response.data.detail}`);
      }
    }
    throw new Error(`Ошибка при создании записи: ${error.message}`);
  }
};

// Функция для обновления существующей записи
export const updateRecord = async (endpoint, id, data) => {
  try {
    const response = await axios.put(`${API_URL}${endpoint}${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(`Ошибка при обновлении записи: ${error.message}`);
  }
};

// Функция для удаления записи
export const deleteRecord = async (endpoint, id) => {
  try {
    await axios.delete(`${API_URL}${endpoint}${id}`);
    return true;
  } catch (error) {
    throw new Error(`Ошибка при удалении записи: ${error.message}`);
  }
};
