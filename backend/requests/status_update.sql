-- 1. Триггер для создания заказа при добавлении рецепта
CREATE OR REPLACE FUNCTION create_medicine_order()
RETURNS TRIGGER AS $$
DECLARE
    med_type medicine_type;
    status_val order_status;
    order_cost NUMERIC;
    current_quantity NUMERIC;
BEGIN
    -- Получаем информацию о лекарстве
    SELECT 
        m.type,
        md.current_amount,
        md.price * NEW.amount
    INTO
        med_type,
        current_quantity,
        order_cost
    FROM medicine m
    JOIN medication md ON m.id = md.id
    WHERE m.id = NEW.medicine_id;
    
    -- Определяем начальный статус
    IF med_type = 'finished' THEN
        IF current_quantity >= NEW.amount THEN
            status_val := 'ready'::order_status;
        ELSE
            status_val := 'waiting for a delivery'::order_status;
            -- Заказ на поставку готового лекарства
            INSERT INTO medication_delivery (
                medication_id,
                application_date,
                amount
            ) VALUES (
                NEW.medicine_id,
                CURRENT_DATE,
                NEW.amount - current_quantity
            );
        END IF;
    ELSE
        IF check_components(NEW.medicine_id, NEW.amount) THEN
            status_val := 'producing'::order_status;
        ELSE
            status_val := 'waiting for a delivery'::order_status;
            -- Заказ недостающих компонентов
            PERFORM order_missing_components(NEW.medicine_id, NEW.amount);
        END IF;
    END IF;
    
    -- Создаем заказ
    INSERT INTO medicine_order (
        prescription_id,
        client_id,
        order_number,
        start_data,
        expected_date_of_issue,
        status,
        cost
    ) VALUES (
        NEW.id,
        (SELECT client_id FROM prescription WHERE id = NEW.id), -- предполагая, что client_id есть в prescription
        NEW.prescription_number,
        NOW(),
        NOW() + (SELECT t.preparation_time
                 FROM technology_of_preparation as t
                 JOIN medicine as m ON m.tech_prep_id = t.id
                 JOIN prescription as p ON p.medicine_id = m.id
                 WHERE p.id = NEW.id),
        status_val,
        order_cost
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_medicine_order
AFTER INSERT ON prescription
FOR EACH ROW
EXECUTE FUNCTION create_medicine_order();

-- 2. Функция проверки компонентов
CREATE OR REPLACE FUNCTION check_components(
    medicine_id INTEGER,
    required_amount NUMERIC
)
RETURNS BOOLEAN AS $$
DECLARE
    component RECORD;
BEGIN
    FOR component IN 
        SELECT 
            c.ingredient_id,
            c.amount * required_amount AS required,
            md.current_amount AS available
        FROM composition c
        JOIN medication md ON c.ingredient_id = md.id
        WHERE c.medicine_id = check_components.medicine_id
    LOOP
        IF component.available < component.required THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 3. Функция заказа недостающих компонентов
CREATE OR REPLACE FUNCTION order_missing_components(
    medicine_id INTEGER,
    required_amount NUMERIC
)
RETURNS VOID AS $$
DECLARE
    component RECORD;
    missing_amount NUMERIC;
BEGIN
    FOR component IN 
        SELECT 
            c.ingredient_id,
            c.amount * required_amount AS required,
            md.current_amount AS available
        FROM composition c
        JOIN medication md ON c.ingredient_id = md.id
        WHERE c.medicine_id = order_missing_components.medicine_id
    LOOP
        IF component.available < component.required THEN
            missing_amount := component.required - component.available;
            
            INSERT INTO medication_delivery (
                medication_id,
                application_date,
                amount
            ) VALUES (
                component.ingredient_id,
                CURRENT_DATE,
                missing_amount
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Триггер для обработки поставок
CREATE OR REPLACE FUNCTION process_delivery_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем количество медикаментов
    UPDATE medication
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.medication_id;
    
    -- Обновляем статусы заказов
    UPDATE medicine_order mo
    SET status = CASE 
        WHEN m.type = 'finished' THEN 'ready'::order_status
        ELSE 'producing'::order_status
    END
    FROM prescription p
    JOIN medicine m ON p.medicine_id = m.id
    WHERE mo.prescription_id = p.id
    AND mo.status = 'waiting for a delivery'::order_status
    AND (
        (m.type = 'finished' AND m.id = NEW.medication_id AND 
         (SELECT current_amount FROM medication WHERE id = m.id) >= p.amount)
        OR
        (m.type = 'manufactured' AND EXISTS (
            SELECT 1 FROM composition c 
            WHERE c.medicine_id = m.id AND c.ingredient_id = NEW.medication_id
        ) AND check_components(p.medicine_id, p.amount))
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_process_inventory
AFTER INSERT ON medication_delivery
FOR EACH ROW
EXECUTE FUNCTION process_delivery_update();