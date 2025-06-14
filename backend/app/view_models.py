from .database import execute_query
from .models import Model, Client, Medicine, Ingredient, Order, Medication, Prescription

# Models for views
class ClientsWithUnclaimedOrders(Model):
    __tablename__ = "clients_with_unclaimed_orders"

    def __init__(self, client_id=None, surname=None, name=None, patronymic=None, 
                 phone_number=None, order_number=None, expected_date_of_issue=None):
        self.client_id = client_id
        self.surname = surname
        self.name = name
        self.patronymic = patronymic
        self.phone_number = phone_number
        self.order_number = order_number
        self.expected_date_of_issue = expected_date_of_issue

    @classmethod
    def get_all(cls):
        query = f"SELECT * FROM {cls.__tablename__}"
        results = execute_query(query)
        return [cls(*row) for row in results]

    def get_client(self):
        return Client.get_by_id(self.client_id)

    @staticmethod
    def count():
        query = "SELECT count_unclaimed_orders_clients()"
        result = execute_query(query)
        return result[0][0] if result else 0


class ClientsWaitingForDelivery(Model):
    __tablename__ = "clients_waiting_for_delivery"

    def __init__(self, client_id=None, surname=None, name=None, patronymic=None, 
                 phone_number=None, order_number=None, expected_date_of_issue=None, 
                 medication_name=None, medication_type=None):
        self.client_id = client_id
        self.surname = surname
        self.name = name
        self.patronymic = patronymic
        self.phone_number = phone_number
        self.order_number = order_number
        self.expected_date_of_issue = expected_date_of_issue
        self.medication_name = medication_name
        self.medication_type = medication_type

    @classmethod
    def get_all(cls):
        query = f"SELECT * FROM {cls.__tablename__}"
        results = execute_query(query)
        return [cls(*row) for row in results]

    def get_client(self):
        return Client.get_by_id(self.client_id)

    @staticmethod
    def count():
        query = "SELECT count_clients_waiting_for_delivery()"
        result = execute_query(query)
        return result[0][0] if result else 0

    @staticmethod
    def count_by_medication_type(med_type):
        query = "SELECT count_clients_waiting_for_delivery_by_medication_type(%s)"
        result = execute_query(query, (med_type,))
        return result[0][0] if result else 0


class MedicineDetailsView(Model):
    __tablename__ = "medicine_details_view"

    def __init__(self, medicine_id=None, medicine_name=None, medicine_type=None, 
                 preparation_description=None, 
                 component_name=None, component_amount=None, 
                 component_unit_of_measure=None, component_price=None, 
                 current_stock_amount=None):
        self.medicine_id = medicine_id
        self.medicine_name = medicine_name
        self.medicine_type = medicine_type
        self.preparation_description = preparation_description
        self.component_name = component_name
        self.component_amount = component_amount
        self.component_unit_of_measure = component_unit_of_measure
        self.component_price = component_price
        self.current_stock_amount = current_stock_amount

    @classmethod
    def get_all(cls):
        query = f"SELECT * FROM {cls.__tablename__}"
        results = execute_query(query)
        return [cls(*row) for row in results]

    @classmethod
    def get_by_medicine_name(cls, medicine_name):
        query = "SELECT * FROM get_single_medicine_details(%s)"
        results = execute_query(query, (medicine_name,))
        return [cls(*row) for row in results]

    def get_medicine(self):
        return Medicine.get_by_id(self.medicine_id)


# Models for function results
class TopMedication:
    def __init__(self, medication_id=None, medication_name=None, order_count=None):
        self.medication_id = medication_id
        self.medication_name = medication_name
        self.order_count = order_count

    def get_medication(self):
        return Medication.get_by_id(self.medication_id)

    @staticmethod
    def get_top_10():
        query = "SELECT * FROM get_top_10_medications()"
        results = execute_query(query)
        return [TopMedication(*row) for row in results]

    @staticmethod
    def get_top_10_by_type(med_type):
        query = "SELECT * FROM get_top_10_medications_by_type(%s)"
        results = execute_query(query, (med_type,))
        return [TopMedication(*row) for row in results]


class IngredientUsage:
    def __init__(self, ingredient_name=None, unit_of_measure=None, total_amount_used=None):
        self.ingredient_name = ingredient_name
        self.unit_of_measure = unit_of_measure
        self.total_amount_used = total_amount_used

    @staticmethod
    def get_usage_volume(ingredient_name, start_date, end_date):
        query = "SELECT * FROM get_ingredient_usage_volume(%s, %s, %s)"
        results = execute_query(query, (ingredient_name, start_date, end_date))
        return [IngredientUsage(*row) for row in results]


class ClientByMedication:
    def __init__(self, client_id=None, surname=None, name=None, patronymic=None, 
                 phone_number=None, order_number=None, expected_date_of_issue=None,
                 medication_name=None, medication_type=None):
        self.client_id = client_id
        self.surname = surname
        self.name = name
        self.patronymic = patronymic
        self.phone_number = phone_number
        self.order_number = order_number
        self.expected_date = expected_date_of_issue
        self.medication_name = medication_name
        self.medication_type = medication_type if 'medication_type' in locals() else None

    def get_client(self):
        return Client.get_by_id(self.client_id)

    @staticmethod
    def get_by_medication_name_and_period(med_name, start_date, end_date):
        query = "SELECT * FROM get_clients_by_medication_name_and_period(%s, %s, %s)"
        results = execute_query(query, (med_name, start_date, end_date))
        return [ClientByMedication(*row) for row in results]

    @staticmethod
    def get_by_medication_type_and_period(med_type, start_date, end_date):
        query = "SELECT * FROM get_clients_by_medication_type_and_period(%s, %s, %s)"
        results = execute_query(query, (med_type, start_date, end_date))
        return [ClientByMedication(*row) for row in results]

    @staticmethod
    def count_by_medication_name_and_period(med_name, start_date, end_date):
        query = "SELECT count_clients_by_medication_name_and_period(%s, %s, %s)"
        result = execute_query(query, (med_name, start_date, end_date))
        return result[0][0] if result else 0

    @staticmethod
    def count_by_medication_type_and_period(med_type, start_date, end_date):
        query = "SELECT count_clients_by_medication_type_and_period(%s, %s, %s)"
        result = execute_query(query, (med_type, start_date, end_date))
        return result[0][0] if result else 0


class MedicationAtCriticalLevel:
    def __init__(self, medication_id=None, medication_name=None, medication_type=None, 
                 current_amount=None, critical_norm=None):
        self.medication_id = medication_id
        self.medication_name = medication_name
        self.medication_type = medication_type
        self.current_amount = current_amount
        self.critical_norm = critical_norm

    def get_medication(self):
        return Medication.get_by_id(self.medication_id)

    @staticmethod
    def get_all():
        query = "SELECT * FROM get_medications_at_critical_level()"
        results = execute_query(query)
        return [MedicationAtCriticalLevel(*row) for row in results]


class LowStockMedication:
    def __init__(self, medication_id=None, medication_name=None, medication_type=None, 
                 current_amount=None, critical_norm=None):
        self.medication_id = medication_id
        self.medication_name = medication_name
        self.medication_type = medication_type
        self.current_amount = current_amount
        self.critical_norm = critical_norm

    def get_medication(self):
        return Medication.get_by_id(self.medication_id)

    @staticmethod
    def get_all():
        query = "SELECT * FROM get_low_stock_medications()"
        results = execute_query(query)
        return [LowStockMedication(*row) for row in results]

    @staticmethod
    def get_by_type(med_type):
        query = "SELECT * FROM get_low_stock_medications_by_type(%s)"
        results = execute_query(query, (med_type,))
        return [LowStockMedication(*row) for row in results]


class ProducingOrder:
    def __init__(self, order_id=None, prescription_id=None, client_id=None, 
                 order_number=None, expected_date_of_issue=None, status=None, 
                 date_of_issue=None, production_time=None, cost=None):
        self.order_id = order_id
        self.prescription_id = prescription_id
        self.client_id = client_id
        self.order_number = order_number
        self.expected_date_of_issue = expected_date_of_issue
        self.status = status
        self.date_of_issue = date_of_issue
        self.production_time = production_time
        self.cost = cost

    def get_order(self):
        return Order.get_by_id(self.order_id)

    def get_prescription(self):
        return Prescription.get_by_id(self.prescription_id)

    def get_client(self):
        return Client.get_by_id(self.client_id)

    @staticmethod
    def get_all():
        query = "SELECT * FROM get_producing_orders()"
        results = execute_query(query)
        return [ProducingOrder(*row) for row in results]

    @staticmethod
    def count():
        query = "SELECT count_producing_orders()"
        result = execute_query(query)
        return result[0][0] if result else 0


class IngredientForProducingOrder:
    def __init__(self, ingredient_id=None, ingredient_name=None, 
                 total_required_amount=None, unit_of_measure=None):
        self.ingredient_id = ingredient_id
        self.ingredient_name = ingredient_name
        self.total_required_amount = total_required_amount
        self.unit_of_measure = unit_of_measure

    def get_ingredient(self):
        return Ingredient.get_by_id(self.ingredient_id)

    @staticmethod
    def get_all():
        query = "SELECT * FROM get_ingredients_for_producing_orders()"
        results = execute_query(query)
        return [IngredientForProducingOrder(*row) for row in results]

    @staticmethod
    def count():
        query = "SELECT count_ingredients_for_producing_orders()"
        result = execute_query(query)
        return result[0][0] if result else 0


class TechnologyOfPreparation:
    def __init__(self, tech_id=None, tech_description=None, 
                 medicine_name=None, medicine_type=None):
        self.tech_id = tech_id
        self.tech_description = tech_description
        self.medicine_name = medicine_name
        self.medicine_type = medicine_type

    @staticmethod
    def get_all(medicine_type=None, medicine_names=None, from_producing_orders=False):
        query = "SELECT * FROM get_technology_of_preparation(%s, %s, %s)"
        results = execute_query(query, (medicine_type, medicine_names, from_producing_orders))
        return [TechnologyOfPreparation(*row) for row in results]


class MedicinePriceAndComponents:
    def __init__(self, medicine_name=None, medicine_price=None, component_name=None, 
                 required_component_amount=None, component_unit_of_measure=None, 
                 component_price=None):
        self.medicine_name = medicine_name
        self.medicine_price = medicine_price
        self.component_name = component_name
        self.required_component_amount = required_component_amount
        self.component_unit_of_measure = component_unit_of_measure
        self.component_price = component_price

    @staticmethod
    def get_by_medicine_name(medicine_name):
        query = "SELECT * FROM get_medicine_price_and_components_info(%s)"
        results = execute_query(query, (medicine_name,))
        return [MedicinePriceAndComponents(*row) for row in results]


class MostFrequentClient:
    def __init__(self, client_id=None, client_surname=None, client_name=None, 
                 client_patronymic=None, total_orders=None):
        self.client_id = client_id
        self.client_surname = client_surname
        self.client_name = client_name
        self.client_patronymic = client_patronymic
        self.total_orders = total_orders

    def get_client(self):
        return Client.get_by_id(self.client_id)

    @staticmethod
    def get_most_frequent(medicine_type=None, medicine_names=None, limit=10):
        query = "SELECT * FROM get_most_frequent_clients(%s, %s, %s)"
        results = execute_query(query, (medicine_type, medicine_names, limit))
        return [MostFrequentClient(*row) for row in results]