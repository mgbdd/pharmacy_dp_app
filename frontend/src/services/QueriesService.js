import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class QueriesService {
  // Клиенты
  getClientsWithUnclaimedOrders() {
    return axios.get(`${API_URL}/queries/clients/unclaimed-orders`);
  }

  countClientsWithUnclaimedOrders() {
    return axios.get(`${API_URL}/queries/clients/unclaimed-orders/count`);
  }

  getClientsWaitingForDelivery() {
    return axios.get(`${API_URL}/queries/clients/waiting-for-delivery`);
  }

  countClientsWaitingForDelivery() {
    return axios.get(`${API_URL}/queries/clients/waiting-for-delivery/count`);
  }

  countClientsWaitingForDeliveryByType(medType) {
    return axios.get(`${API_URL}/queries/clients/waiting-for-delivery/count/${medType}`);
  }

  getClientsByMedicationName(medName, startDate, endDate) {
    return axios.get(`${API_URL}/queries/clients/by-medication-name`, {
      params: { med_name: medName, start_date: startDate, end_date: endDate }
    });
  }

  countClientsByMedicationName(medName, startDate, endDate) {
    return axios.get(`${API_URL}/queries/clients/by-medication-name/count`, {
      params: { med_name: medName, start_date: startDate, end_date: endDate }
    });
  }

  getClientsByMedicationType(medType, startDate, endDate) {
    return axios.get(`${API_URL}/queries/clients/by-medication-type`, {
      params: { med_type: medType, start_date: startDate, end_date: endDate }
    });
  }

  countClientsByMedicationType(medType, startDate, endDate) {
    return axios.get(`${API_URL}/queries/clients/by-medication-type/count`, {
      params: { med_type: medType, start_date: startDate, end_date: endDate }
    });
  }

  getMostFrequentClients(medicineType = null, medicineNames = null, limit = 10) {
    const params = { limit };
    if (medicineType) params.medicine_type = medicineType;
    if (medicineNames) params.medicine_names = medicineNames;
    
    return axios.get(`${API_URL}/queries/clients/most-frequent`, { params });
  }

  // Лекарства
  getAllMedicineDetails() {
    return axios.get(`${API_URL}/queries/medicines/details`);
  }

  getMedicineDetailsByName(medicineName) {
    return axios.get(`${API_URL}/queries/medicines/details/${medicineName}`);
  }

  getMedicinePriceAndComponents(medicineName) {
    return axios.get(`${API_URL}/queries/medicines/price-and-components/${medicineName}`);
  }

  // Медикаменты
  getTopMedications() {
    return axios.get(`${API_URL}/queries/medications/top`);
  }

  getTopMedicationsByType(medType) {
    return axios.get(`${API_URL}/queries/medications/top/${medType}`);
  }

  getMedicationsAtCriticalLevel() {
    return axios.get(`${API_URL}/queries/medications/critical`);
  }

  getLowStockMedications() {
    return axios.get(`${API_URL}/queries/medications/low-stock`);
  }

  getLowStockMedicationsByType(medType) {
    return axios.get(`${API_URL}/queries/medications/low-stock/${medType}`);
  }

  // Ингредиенты
  getIngredientUsage(ingredientName, startDate, endDate) {
    return axios.get(`${API_URL}/queries/ingredients/usage/${ingredientName}`, {
      params: { start_date: startDate, end_date: endDate }
    });
  }

  getIngredientsForProducingOrders() {
    return axios.get(`${API_URL}/queries/ingredients/for-producing-orders`);
  }

  countIngredientsForProducingOrders() {
    return axios.get(`${API_URL}/queries/ingredients/for-producing-orders/count`);
  }

  // Заказы
  getProducingOrders() {
    return axios.get(`${API_URL}/queries/orders/producing`);
  }

  countProducingOrders() {
    return axios.get(`${API_URL}/queries/orders/producing/count`);
  }

  // Технологии
  getTechnologies(medicineType = null, medicineNames = null, fromProducingOrders = false) {
    const params = { from_producing_orders: fromProducingOrders };
    if (medicineType) params.medicine_type = medicineType;
    if (medicineNames) params.medicine_names = medicineNames;

    return axios.get(`${API_URL}/queries/technologies`, { params });
  }
}

export default new QueriesService();

