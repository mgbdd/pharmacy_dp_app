from enum import Enum as PyEnum
from .database import execute_query

# Enums
class MethodOfApplication(PyEnum):
    INTERNAL = "internal"
    EXTERNAL = "external"
    FOR_MIXING = "for mixing"

class MedicineKind(PyEnum):
    PILLS = 'pills'
    MIXTURE = 'mixture'
    OINTMENT = 'ointment'
    SOLUTION = 'solution'
    TINCTURE = 'tincture'
    POWDER = 'powder'

class UnitsOfMeasure(PyEnum):
    GRAMMS = 'g'
    MILLIGRAMS = 'mg'
    MILLILITERS = 'ml'
    PIECES = 'pc'

class OrderStatus(PyEnum):
    WAITING = 'waiting for a delivery'
    PRODUCING = 'producing'
    READY = 'ready'
    ISSUEED = 'issued'
    CANCELLED = 'cancelled'

class MedicineType(PyEnum):
    FINISHED = 'finished'
    MANUFACTURED = 'manufactured'

# Base class for models
class Model:
    @classmethod
    def get_by_id(cls, id):
        query = f"SELECT * FROM {cls.__tablename__} WHERE id = %s"
        result = execute_query(query, (id,))
        if result:
            return cls(*result[0])
        return None

    @classmethod
    def get_all(cls):
        query = f"SELECT * FROM {cls.__tablename__}"
        results = execute_query(query)
        return [cls(*row) for row in results]

# Models
class Medication(Model):
    __tablename__ = "medication"

    def __init__(self, id=None, name=None, manufacturer=None, critical_norm=None, 
                 shelf_life=None, unit_of_measure=None, units_per_package=None, 
                 price=None, storage_conditions=None, current_amount=None):
        self.id = id
        self.name = name
        self.manufacturer = manufacturer
        self.critical_norm = critical_norm
        self.shelf_life = shelf_life
        self.unit_of_measure = unit_of_measure
        self.units_per_package = units_per_package
        self.price = price
        self.storage_conditions = storage_conditions
        self.current_amount = current_amount

    def save(self):
        if self.id:
            query = """
                UPDATE medication 
                SET name = %s, manufacturer = %s, critical_norm = %s, 
                    shelf_life = %s, unit_of_measure = %s, units_per_package = %s, 
                    price = %s, storage_conditions = %s, current_amount = %s
                WHERE id = %s
            """
            params = (self.name, self.manufacturer, self.critical_norm, 
                      self.shelf_life, self.unit_of_measure, self.units_per_package, 
                      self.price, self.storage_conditions, self.current_amount, self.id)
            execute_query(query, params, fetch=False)
        else:
            query = """
                INSERT INTO medication 
                (name, manufacturer, critical_norm, shelf_life, unit_of_measure, 
                 units_per_package, price, storage_conditions, current_amount)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            params = (self.name, self.manufacturer, self.critical_norm, 
                      self.shelf_life, self.unit_of_measure, self.units_per_package, 
                      self.price, self.storage_conditions, self.current_amount)
            result = execute_query(query, params, commit=True)
            self.id = result[0][0]
        return self

    def get_deliveries(self):
        query = "SELECT * FROM medication_delivery WHERE medication_id = %s"
        results = execute_query(query, (self.id,))
        return [StockDelivery(*row) for row in results]

class Ingredient(Medication):
    __tablename__ = "ingredient"

    def __init__(self, id=None, name=None, manufacturer=None, critical_norm=None, 
                 shelf_life=None, unit_of_measure=None, units_per_package=None, 
                 price=None, storage_conditions=None, current_amount=None, 
                 type=None, caution=None, incompatibility=None):
        super().__init__(id, name, manufacturer, critical_norm, shelf_life, 
                         unit_of_measure, units_per_package, price, 
                         storage_conditions, current_amount)
        self.type = type
        self.caution = caution
        self.incompatibility = incompatibility

    def save(self):
        super().save()
        query = """
            INSERT INTO ingredient (id, type, caution, incompatibility)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE 
            SET type = %s, caution = %s, incompatibility = %s
        """
        params = (self.id, self.type, self.caution, self.incompatibility,
                  self.type, self.caution, self.incompatibility)
        execute_query(query, params, fetch=False, commit=True)
        return self

    def get_used_in_medicines(self):
        query = """
            SELECT m.* FROM medicine m
            JOIN composition c ON m.id = c.medicine_id
            WHERE c.ingredient_id = %s
        """
        results = execute_query(query, (self.id,))
        return [Medicine(*row) for row in results]

class Medicine(Medication):
    __tablename__ = "medicine"

    def __init__(self, id=None, name=None, manufacturer=None, critical_norm=None, 
                 shelf_life=None, unit_of_measure=None, units_per_package=None, 
                 price=None, storage_conditions=None, current_amount=None, 
                 type=None, kind=None, application=None, tech_prep_id=None):
        super().__init__(id, name, manufacturer, critical_norm, shelf_life, 
                         unit_of_measure, units_per_package, price, 
                         storage_conditions, current_amount)
        self.type = type
        self.kind = kind
        self.application = application
        self.tech_prep_id = tech_prep_id

    def save(self):
    # Сначала сохраняем в medication (родительскую таблицу)
        super().save()
        
        # Затем сохраняем в medicine (дочернюю таблицу)
        query = """
            INSERT INTO medicine (id, type, kind, application, tech_prep_id)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE 
            SET type = %s, kind = %s, application = %s, tech_prep_id = %s
        """
        params = (self.id, self.type, self.kind, self.application, self.tech_prep_id,
                self.type, self.kind, self.application, self.tech_prep_id)
        execute_query(query, params, fetch=False, commit=True)
        return self

    def get_technology(self):
        query = "SELECT * FROM technology_of_preparation WHERE id = %s"
        result = execute_query(query, (self.tech_prep_id,))
        if result:
            return Technology(*result[0])
        return None

    def get_prescriptions(self):
        query = "SELECT * FROM prescription WHERE medicine_id = %s"
        results = execute_query(query, (self.id,))
        return [Prescription(*row) for row in results]

    def get_compositions(self):
        query = """
            SELECT c.*, i.* FROM composition c
            JOIN ingredient i ON c.ingredient_id = i.id
            WHERE c.medicine_id = %s
        """
        results = execute_query(query, (self.id,))
        compositions = []
        for row in results:
            composition = Composition(
                medicine_id=row[0],
                ingredient_id=row[1],
                amount=row[2]
            )
            compositions.append(composition)
        return compositions

class Composition(Model):
    __tablename__ = "composition"

    def __init__(self, medicine_id=None, ingredient_id=None, amount=None):
        self.medicine_id = medicine_id
        self.ingredient_id = ingredient_id
        self.amount = amount

    def save(self):
        query = """
            INSERT INTO composition (medicine_id, ingredient_id, amount)
            VALUES (%s, %s, %s)
            ON CONFLICT (medicine_id, ingredient_id) DO UPDATE 
            SET amount = %s
        """
        params = (self.medicine_id, self.ingredient_id, self.amount, self.amount)
        execute_query(query, params, fetch=False, commit=True)
        return self

    def get_medicine(self):
        return Medicine.get_by_id(self.medicine_id)

    def get_ingredient(self):
        return Ingredient.get_by_id(self.ingredient_id)

class Technology(Model):
    __tablename__ = "technology_of_preparation"

    def __init__(self, id=None, description=None, preparation_time=None):
        self.id = id
        self.description = description
        self.preparation_time = preparation_time


    def save(self):
        if self.id:
            query = """
                UPDATE technology_of_preparation 
                SET description = %s, preparation_time = %s
                WHERE id = %s
            """
            params = (self.description, self.preparation_time, self.id)
            execute_query(query, params, fetch=False)
        else:
            query = """
                INSERT INTO technology_of_preparation (description, preparation_time))
                VALUES (%s, %s)
                RETURNING id
            """
            params = (self.description, self.preparation_time)
            result = execute_query(query, params, commit=True)
            self.id = result[0][0]
        return self

    def get_medicines(self):
        query = "SELECT * FROM medicine WHERE tech_prep_id = %s"
        results = execute_query(query, (self.id,))
        return [Medicine(*row) for row in results]

class Prescription(Model):
    __tablename__ = "prescription"

    def __init__(self, id=None, client_id=None, medicine_id=None, prescription_number=None,
                 doctor_surname=None, doctor_name=None, doctor_patronymic=None, 
                 signature=None, stamp=None, age=None, diagnosis=None, 
                 amount=None, application=None):
        self.id = id
        self.client_id = client_id
        self.medicine_id = medicine_id
        self.prescription_number = prescription_number
        self.doctor_surname = doctor_surname
        self.doctor_name = doctor_name
        self.doctor_patronymic = doctor_patronymic
        self.signature = signature
        self.stamp = stamp
        self.age = age
        self.diagnosis = diagnosis
        self.amount = amount
        self.application = application

    def save(self):
        if self.id:
            query = """
                UPDATE prescription 
                SET client_id=%s, medicine_id = %s, prescription_number = %s, doctor_surname = %s,
                    doctor_name = %s, doctor_patronymic = %s, signature = %s,
                    stamp = %s, age = %s, diagnosis = %s, amount = %s, application = %s
                WHERE id = %s
            """
            params = (self.client_id, self.medicine_id, self.prescription_number, self.doctor_surname,
                      self.doctor_name, self.doctor_patronymic, self.signature,
                      self.stamp, self.age, self.diagnosis, self.amount, 
                      self.application, self.id)
            execute_query(query, params, fetch=False)
        else:
            query = """
                INSERT INTO prescription 
                (client_id, medicine_id, prescription_number, doctor_surname, doctor_name, 
                 doctor_patronymic, signature, stamp, age, diagnosis, amount, application)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            params = (self.client_id, self.medicine_id, self.prescription_number, self.doctor_surname,
                      self.doctor_name, self.doctor_patronymic, self.signature,
                      self.stamp, self.age, self.diagnosis, self.amount, self.application)
            result = execute_query(query, params, commit=True)
            self.id = result[0][0]
        return self

    def get_medicine(self):
        return Medicine.get_by_id(self.medicine_id)

    def get_orders(self):
        query = "SELECT * FROM medicine_order WHERE prescription_id = %s"
        results = execute_query(query, (self.id,))
        return [Order(*row) for row in results]

class Order(Model):
    __tablename__ = "medicine_order"

    def __init__(self, id=None, prescription_id=None, client_id=None, 
                 order_number=None, status=None, date_of_issue=None,
                 start_data=None, expected_date_of_issue = None, cost=None):
        self.id = id
        self.prescription_id = prescription_id
        self.client_id = client_id
        self.order_number = order_number
        self.status = status
        self.date_of_issue = date_of_issue
        self.expected_date_of_issue = expected_date_of_issue
        self.start_data = start_data
        self.cost = cost

    def save(self):
        if self.id:
            query = """
                UPDATE medicine_order 
                SET prescription_id = %s, client_id = %s, order_number = %s, status = %s, date_of_issue = %s,
                    start_data = %s, expected_date_of_issue = %s, cost = %s
                WHERE id = %s
            """
            params = (self.prescription_id, self.client_id, self.order_number,
                      self.status, self.date_of_issue,
                      self.start_data, self.cost, self.expected_date_of_issue, self.id)
            execute_query(query, params, fetch=False)
        else:
            query = """
                INSERT INTO medicine_order 
                (prescription_id, client_id, order_number,  
                 status, date_of_issue, start_data, expected_date_of_issue, cost)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            params = (self.prescription_id, self.client_id, self.order_number,
                       self.status, self.date_of_issue,
                      self.start_data, self.expected_date_of_issue, self.cost)
            result = execute_query(query, params, commit=True)
            self.id = result[0][0]
        return self

    def get_prescription(self):
        return Prescription.get_by_id(self.prescription_id)

    def get_client(self):
        return Client.get_by_id(self.client_id)

class Client(Model):
    __tablename__ = "client"

    def __init__(self, id=None, surname=None, name=None, patronymic=None, phone_number=None):
        self.id = id
        self.surname = surname
        self.name = name
        self.patronymic = patronymic
        self.phone_number = phone_number

    def save(self):
        if self.id:
            query = """
                UPDATE client 
                SET surname = %s, name = %s, patronymic = %s, phone_number = %s
                WHERE id = %s
            """
            params = (self.surname, self.name, self.patronymic, self.phone_number, self.id)
            execute_query(query, params, fetch=False)
        else:
            query = """
                INSERT INTO client (surname, name, patronymic, phone_number)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """
            params = (self.surname, self.name, self.patronymic, self.phone_number)
            result = execute_query(query, params, commit=True)
            self.id = result[0][0]
        return self

    def get_orders(self):
        query = "SELECT * FROM medicine_order WHERE client_id = %s"
        results = execute_query(query, (self.id,))
        return [Order(*row) for row in results]

    @staticmethod
    def search(surname, name, patronymic, phone_number):
        if patronymic is not None:
            condition = "patronymic = %s"
        else:
            condition = "patronymic IS NULL"

        query = "SELECT id FROM client WHERE surname = %s AND name = %s AND " + condition + " AND phone_number = %s"

        if patronymic is not None:
            result = execute_query(query, [surname, name, patronymic, phone_number])
        else:
            result = execute_query(query, [surname, name, phone_number])

        return result[0][0] if result else None


class StockDelivery(Model):
    __tablename__ = "medication_delivery"

    def __init__(self, id=None, medication_id=None, application_date=None, 
                 delivery_date=None, amount=None):
        self.id = id
        self.medication_id = medication_id
        self.application_date = application_date
        self.delivery_date = delivery_date
        self.amount = amount

    def save(self):
        if self.id:
            query = """
                UPDATE medication_delivery 
                SET medication_id = %s, application_date = %s, 
                    delivery_date = %s, amount = %s
                WHERE id = %s
            """
            params = (self.medication_id, self.application_date, 
                      self.delivery_date, self.amount, self.id)
            execute_query(query, params, fetch=False)
        else:
            query = """
                INSERT INTO medication_delivery 
                (medication_id, application_date, delivery_date, amount)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """
            params = (self.medication_id, self.application_date, 
                      self.delivery_date, self.amount)
            result = execute_query(query, params, commit=True)
            self.id = result[0][0]
        return self

    def get_medication(self):
        return Medication.get_by_id(self.medication_id)

class Inventory(Model):
    __tablename__ = "inventory"

    def __init__(self, id=None, medication_id=None, date=None, amount=None):
        self.id = id
        self.medication_id = medication_id
        self.inventory_date = date
        self.amount = amount

    def save(self):
        if self.id:
            query = """
                UPDATE inventory 
                SET medication_id = %s, date = %s, amount = %s
                WHERE id = %s
            """
            params = (self.medication_id, self.inventory_date, self.amount, self.id)
            execute_query(query, params, fetch=False)
        else:
            query = """
                INSERT INTO inventory (medication_id, date, amount)
                VALUES (%s, %s, %s)
                RETURNING id
            """
            params = (self.medication_id, self.inventory_date, self.amount)
            result = execute_query(query, params, commit=True)
            self.id = result[0][0]
        return self

    def get_medication(self):
        return Medication.get_by_id(self.medication_id)
