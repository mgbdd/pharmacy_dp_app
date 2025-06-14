-- Представление для получения клиентов, которые вовремя не забрали заказ
CREATE OR REPLACE VIEW clients_with_unclaimed_orders AS
SELECT
    c.id AS client_id,
    c.surname,
    c.name,
    c.patronymic,
    c.phone_number,
    mo.order_number,
    mo.expected_date_of_issue
FROM
    client c
JOIN
    medicine_order mo ON c.id = mo.client_id
WHERE
    mo.status = 'ready'
AND
    mo.expected_date_of_issue <= NOW();

-- Функция для подсчета общего числа клиентов, которые не забрали вовремя свой заказ
CREATE OR REPLACE FUNCTION count_unclaimed_orders_clients()
RETURNS BIGINT AS $$
BEGIN
    RETURN (SELECT COUNT(DISTINCT client_id) FROM clients_with_unclaimed_orders);
END;
$$ LANGUAGE plpgsql;

-- Представление для получения клиентов, ожидающих поставку медикаментов
CREATE OR REPLACE VIEW clients_waiting_for_delivery AS
SELECT
    c.id AS client_id,
    c.surname,
    c.name,
    c.patronymic,
    c.phone_number,
    mo.order_number,
    mo.start_data,
    m.name AS medication_name,
    med.type AS medicine_type
FROM
    client c
        JOIN
    medicine_order mo ON c.id = mo.client_id
        JOIN
    prescription p ON mo.prescription_id = p.id
        JOIN
    medicine med ON p.medicine_id = med.id
        JOIN
    medication m ON med.id = m.id
WHERE
    mo.status = 'waiting for a delivery';

-- Функция для подсчета общего числа клиентов, ожидающих поставку
CREATE OR REPLACE FUNCTION count_clients_waiting_for_delivery()
    RETURNS BIGINT AS $$
BEGIN
    RETURN (SELECT COUNT(DISTINCT client_id) FROM clients_waiting_for_delivery);
END;
$$ LANGUAGE plpgsql;

-- Функция для подсчета числа клиентов, ожидающих поставку по типу медикамента
CREATE OR REPLACE FUNCTION count_clients_waiting_for_delivery_by_medication_type(
    med_type medicine_type
)
    RETURNS BIGINT AS $$
BEGIN
    RETURN (SELECT COUNT(DISTINCT client_id) FROM clients_waiting_for_delivery WHERE medicine_type = med_type);
END;
$$ LANGUAGE plpgsql;

-- Функция для получения 10 наиболее часто используемых медикаментов
CREATE OR REPLACE FUNCTION get_top_10_medications()
    RETURNS TABLE (
                      medication_id INT,
                      medication_name VARCHAR(50),
                      order_count BIGINT
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            m.id AS medication_id,
            m.name AS medication_name,
            COUNT(mo.id) AS order_count
        FROM
            medication m
                JOIN
            medicine med ON m.id = med.id -- Joining through medicine table
                JOIN
            prescription p ON med.id = p.medicine_id
                JOIN
            medicine_order mo ON p.id = mo.prescription_id
        GROUP BY
            m.id, m.name
        ORDER BY
            order_count DESC
        LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения 10 наиболее часто используемых медикаментов по типу
CREATE OR REPLACE FUNCTION get_top_10_medications_by_type(
    med_type medicine_type
)
    RETURNS TABLE (
                      medication_id INT,
                      medication_name VARCHAR(50),
                      order_count BIGINT
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            m.id AS medication_id,
            m.name AS medication_name,
            COUNT(mo.id) AS order_count
        FROM
            medication m
                JOIN
            medicine med ON m.id = med.id -- Joining through medicine table
                JOIN
            prescription p ON med.id = p.medicine_id
                JOIN
            medicine_order mo ON p.id = mo.prescription_id
        WHERE
            med.type = med_type
        GROUP BY
            m.id, m.name
        ORDER BY
            order_count DESC
        LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения объема использованных ингредиентов за период
CREATE OR REPLACE FUNCTION get_ingredient_usage_volume(
    ingredient_name VARCHAR(50),
    start_date DATE,
    end_date DATE
)
    RETURNS TABLE (
                      returning_ingredient_name VARCHAR(50),
                      unit_of_measure units_of_measure,
                      total_amount_used NUMERIC(10, 2)
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            i.name AS returning_ingredient_name,
            i.unit_of_measure,
            SUM(c.amount * p.amount) AS total_amount_used -- Assuming c.amount is amount of ingredient per medicine unit and p.amount is amount of medicine per prescription
        FROM
            ingredient i
                JOIN
            composition c ON i.id = c.ingredient_id
                JOIN
            medicine m ON c.medicine_id = m.id
                JOIN
            prescription p ON m.id = p.medicine_id
                JOIN
            medicine_order mo ON p.id = mo.prescription_id
        WHERE
            i.name = ingredient_name
          AND mo.status = 'issued' -- Consider only issued orders
          AND mo.date_of_issue BETWEEN start_date AND end_date
        GROUP BY
            i.name, i.unit_of_measure;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения клиентов, заказывавших определенное лекарство за период
CREATE OR REPLACE FUNCTION get_clients_by_medication_name_and_period(
    med_name VARCHAR(50),
    start_date DATE,
    end_date DATE
)
    RETURNS TABLE (
                      client_id INT,
                      surname VARCHAR(50),
                      name VARCHAR(50),
                      patronymic VARCHAR(50),
                      phone_number VARCHAR(15),
                      order_number INT,
                      start_data DATE,
                      medication_name VARCHAR(50)
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT DISTINCT
            c.id AS client_id,
            c.surname,
            c.name,
            c.patronymic,
            c.phone_number,
            mo.order_number,
            mo.start_data,
            m.name AS medication_nam
        FROM
            client c
                JOIN
            medicine_order mo ON c.id = mo.client_id
                JOIN
            prescription p ON mo.prescription_id = p.id
                JOIN
            medicine med ON p.medicine_id = med.id -- Joining through medicine table
                JOIN
            medication m ON med.id = m.id
        WHERE
            m.name = med_name
          AND mo.start_data BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения клиентов, заказывавших лекарства определенного типа за период
CREATE OR REPLACE FUNCTION get_clients_by_medication_type_and_period(
    med_type medicine_type,
    start_date DATE,
    end_date DATE
)
    RETURNS TABLE (
                      client_id INT,
                      surname VARCHAR(50),
                      name VARCHAR(50),
                      patronymic VARCHAR(50),
                      phone_number VARCHAR(15),
                      order_number INT,
                      start_data DATE,
                      medication_name VARCHAR(50),
                      medication_type medicine_type
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT DISTINCT
            c.id AS client_id,
            c.surname,
            c.name,
            c.patronymic,
            c.phone_number,
            mo.order_number,
            mo.start_data,
            m.name AS medication_name,
            med.type AS medication_type
        FROM
            client c
                JOIN
            medicine_order mo ON c.id = mo.client_id
                JOIN
            prescription p ON mo.prescription_id = p.id
                JOIN
            medicine med ON p.medicine_id = med.id -- Joining through medicine table
                JOIN
            medication m ON med.id = m.id
        WHERE
            med.type = med_type
          AND mo.start_data BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Функция для подсчета числа клиентов, заказывавших определенное лекарство за период
CREATE OR REPLACE FUNCTION count_clients_by_medication_name_and_period(
    med_name VARCHAR(50),
    start_date DATE,
    end_date DATE
)
    RETURNS BIGINT AS $$
BEGIN
    RETURN (SELECT COUNT(DISTINCT c.id)
            FROM client c
                     JOIN medicine_order mo ON c.id = mo.client_id
                     JOIN prescription p ON mo.prescription_id = p.id
                     JOIN medicine med ON p.medicine_id = med.id
                     JOIN medication m ON med.id = m.id
            WHERE m.name = med_name
              AND mo.start_data BETWEEN start_date AND end_date);
END;
$$ LANGUAGE plpgsql;

-- Функция для подсчета числа клиентов, заказывавших лекарства определенного типа за период
CREATE OR REPLACE FUNCTION count_clients_by_medication_type_and_period(
    med_type medicine_type,
    start_date DATE,
    end_date DATE
)
    RETURNS BIGINT AS $$
BEGIN
    RETURN (SELECT COUNT(DISTINCT c.id)
            FROM client c
                     JOIN medicine_order mo ON c.id = mo.client_id
                     JOIN prescription p ON mo.prescription_id = p.id
                     JOIN medicine med ON p.medicine_id = med.id
            WHERE med.type = med_type
              AND mo.start_data BETWEEN start_date AND end_date);
END;
$$ LANGUAGE plpgsql;

-- Функция для получения списка лекарств, достигших критической нормы или закончившихся
CREATE OR REPLACE FUNCTION get_medications_at_critical_level()
    RETURNS TABLE (
                      medication_id INT,
                      medication_name VARCHAR(50),
                      medication_type medicine_type,
                      current_amount NUMERIC(10, 2),
                      critical_norm NUMERIC(10, 2)
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            m.id AS medication_id,
            m.name AS medication_name,
            med.type AS medication_type,
            m.current_amount,
            m.critical_norm
        FROM
            medication m
                JOIN
            medicine med ON m.id = med.id
        WHERE
            m.current_amount <= m.critical_norm;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения списка лекарств с минимальным запасом на складе
CREATE OR REPLACE FUNCTION get_low_stock_medications()
    RETURNS TABLE (
                      medication_id INT,
                      medication_name VARCHAR(50),
                      medication_type medicine_type,
                      current_amount NUMERIC(10, 2),
                      critical_norm NUMERIC(10, 2)
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            m.id AS medication_id,
            m.name AS medication_name,
            med.type AS medication_type,
            m.current_amount,
            m.critical_norm
        FROM
            medication m
                JOIN
            medicine med ON m.id = med.id
        ORDER BY
            m.current_amount;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения списка лекарств указанного типа с минимальным запасом на складе
CREATE OR REPLACE FUNCTION get_low_stock_medications_by_type(
    med_type medicine_type
)
    RETURNS TABLE (
                      medication_id INT,
                      medication_name VARCHAR(50),
                      medication_type medicine_type,
                      current_amount NUMERIC(10, 2),
                      critical_norm NUMERIC(10, 2)
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            m.id AS medication_id,
            m.name AS medication_name,
            med.type AS medication_type,
            m.current_amount,
            m.critical_norm
        FROM
            medication m
                JOIN
            medicine med ON m.id = med.id
        WHERE
            med.type = med_type
        ORDER BY
            m.current_amount;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения полного перечня заказов в производстве
CREATE OR REPLACE FUNCTION get_producing_orders()
    RETURNS TABLE (
                      order_id INT,
                      returning_prescription_id INT,
                      returning_client_id INT,
                      returning_order_number INT,
                      returning_start_data DATE,
                      returning_status order_status,
                      returning_date_of_issue DATE,
                      returning_production_time INTERVAL,
                      returning_cost NUMERIC(10, 2)
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            id,
            prescription_id,
            client_id,
            order_number,
            start_data,
            status,
            date_of_issue,
            production_time,
            cost
        FROM
            medicine_order
        WHERE
            status = 'producing'::order_status;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения общего числа заказов в производстве
CREATE OR REPLACE FUNCTION count_producing_orders()
    RETURNS BIGINT AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM medicine_order WHERE status = 'producing'::order_status);
END;
$$ LANGUAGE plpgsql;

-- Функция для получения списка ингредиентов, необходимых для заказов в производстве
CREATE OR REPLACE FUNCTION get_ingredients_for_producing_orders()
    RETURNS TABLE (
                      ingredient_id INT,
                      ingredient_name VARCHAR(50),
                      total_required_amount NUMERIC(10, 2),
                      unit_of_measure units_of_measure
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            ing.id AS ingredient_id,
            ing.name AS ingredient_name,
            SUM(c.amount * p.amount) AS total_required_amount,
            ing.unit_of_measure
        FROM
            medicine_order mo
                JOIN
            prescription p ON mo.prescription_id = p.id
                JOIN
            composition c ON p.medicine_id = c.medicine_id
                JOIN
            ingredient ing ON c.ingredient_id = ing.id
        WHERE
            mo.status = 'producing'::order_status
        GROUP BY
            ing.id, ing.name, ing.unit_of_measure
        ORDER BY
            ing.name;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения общего числа уникальных ингредиентов, необходимых для заказов в производстве
CREATE OR REPLACE FUNCTION count_ingredients_for_producing_orders()
    RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT c.ingredient_id)
        FROM medicine_order mo
                 JOIN prescription p ON mo.prescription_id = p.id
                 JOIN composition c ON p.medicine_id = c.medicine_id
        WHERE mo.status = 'producing'::order_status
    );
END;
$$ LANGUAGE plpgsql;

-- Функция для получения технологий приготовления лекарств
CREATE OR REPLACE FUNCTION get_technology_of_preparation(
    p_medicine_type medicine_type DEFAULT NULL,
    p_medicine_names VARCHAR[] DEFAULT NULL,
    p_from_producing_orders BOOLEAN DEFAULT FALSE
)
    RETURNS TABLE (
                      tech_id INT,
                      tech_description TEXT,
                      medicine_name VARCHAR(50),
                      medicine_type medicine_type
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT DISTINCT
            top.id AS tech_id,
            top.description AS tech_description,
            m.name AS medicine_name,
            m.type AS medicine_type
        FROM
            technology_of_preparation top
                JOIN
            medicine m ON top.id = m.tech_prep_id
        WHERE
            (p_medicine_type IS NULL OR m.type = p_medicine_type)
          AND (p_medicine_names IS NULL OR m.name = ANY(p_medicine_names))
          AND (
            p_from_producing_orders = FALSE
                OR m.id IN (
                SELECT p.medicine_id
                FROM medicine_order mo
                         JOIN prescription p ON mo.prescription_id = p.id
                WHERE mo.status = 'producing'::order_status
            )
            );
END;
$$ LANGUAGE plpgsql;

-- Функция для получения сведений о ценах на лекарство и его компоненты
CREATE OR REPLACE FUNCTION get_medicine_price_and_components_info(
    p_medicine_name VARCHAR
)
    RETURNS TABLE (
                      medicine_name VARCHAR(50),
                      medicine_price NUMERIC(10, 2),
                      component_name VARCHAR(50),
                      required_component_amount NUMERIC(10, 2),
                      component_unit_of_measure units_of_measure,
                      component_price NUMERIC(10, 2)
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            m.name AS medicine_name,
            m.price AS medicine_price,
            ing.name AS component_name,
            c.amount AS required_component_amount,
            ing.unit_of_measure AS component_unit_of_measure,
            ing.price AS component_price
        FROM
            medicine m
                LEFT JOIN
            composition c ON m.id = c.medicine_id
                LEFT JOIN
            ingredient ing ON c.ingredient_id = ing.id
        WHERE
            m.name = p_medicine_name;
END;
$$ LANGUAGE plpgsql;

--- Функция для получения сведения о наиболее часто делающих заказы клиентах
CREATE OR REPLACE FUNCTION get_most_frequent_clients(
    p_medicine_type medicine_type DEFAULT NULL,
    p_medicine_names VARCHAR[] DEFAULT NULL,
    p_limit INT DEFAULT 10
)
    RETURNS TABLE (
                      client_id INT,
                      client_surname VARCHAR(50),
                      client_name VARCHAR(50),
                      client_patronymic VARCHAR(50),
                      total_orders BIGINT
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            c.id AS client_id,
            c.surname AS client_surname,
            c.name AS client_name,
            c.patronymic AS client_patronymic,
            COUNT(mo.id) AS total_orders
        FROM
            client c
                JOIN
            medicine_order mo ON c.id = mo.client_id
                JOIN
            prescription p ON mo.prescription_id = p.id
                JOIN
            medicine m ON p.medicine_id = m.id
        WHERE
            (p_medicine_type IS NULL OR m.type = p_medicine_type)
          AND (p_medicine_names IS NULL OR m.name = ANY(p_medicine_names))
        GROUP BY
            c.id, c.surname, c.name, c.patronymic
        ORDER BY
            total_orders DESC
        LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Представление для получения подробных сведений о лекарстве
CREATE OR REPLACE VIEW medicine_details_view AS
SELECT
    m.id AS medicine_id,
    m.name AS medicine_name,
    m.type AS medicine_type,
    tp.description AS preparation_description,
    i.name AS component_name,
    c.amount AS component_amount,
    i.unit_of_measure AS component_unit_of_measure,
    i.price AS component_price,
    m.current_amount AS current_stock_amount
FROM
    medicine m
        LEFT JOIN
    technology_of_preparation tp ON m.tech_prep_id = tp.id
        LEFT JOIN
    composition c ON m.id = c.medicine_id
        LEFT JOIN
    ingredient i ON c.ingredient_id = i.id;

CREATE OR REPLACE FUNCTION get_single_medicine_details(
    p_medicine_name VARCHAR
)
RETURNS SETOF medicine_details_view AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM medicine_details_view
    WHERE medicine_name = p_medicine_name;
END;
$$ LANGUAGE plpgsql;
