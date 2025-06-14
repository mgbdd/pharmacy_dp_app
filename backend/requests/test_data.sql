DO $$
    DECLARE
        v_tech INT;
        v_client INT;
        v_prescription INT;
        v_order INT;
        v_inventory INT;
        v_delivery INT;
        -- Объявляем переменные для ID лекарств
        paracetomol_id INT;
        antibiotic_id INT;
        analgin_id INT;
        -- Объявляем переменные для ID ингредиентов
        aspirin_id INT;
        ibuprofen_id INT;
        cipro_id INT;
    BEGIN
        -- Технологии приготовления
        INSERT INTO technology_of_preparation (description, preparation_time)
VALUES
    ('Смешать ингредиенты и нагреть до 80°C', INTERVAL '1 hour 30 minutes'),
    ('Быстро перемешать с последующим охлаждением', INTERVAL '15 minutes'),
    ('Использовать только органические компоненты, минимальное нагревание', INTERVAL '2 days 4 hours');
        -- Клиенты
        INSERT INTO client (surname, name, patronymic, phone_number)
        VALUES
            ('Иванов', 'Иван', 'Иванович', '79034063954'),
            ('Петров', 'Пётр', 'Петрович', '88005553535'),
            ('Сидоров', 'Сергей', 'Сергеевич', '79027468464'),
            ('Морозов', 'Алексей', 'Алексеевич', '73064963864'),
            ('Кузнецов', 'Дмитрий', 'Дмитриевич', '79042306420'),
            ('Виноградова', 'Светлана', 'Савельевна', '79025341212');
        SELECT COALESCE(MIN(id), 1) - 1 INTO v_client FROM client;

        INSERT INTO medicine (
            name,
            manufacturer,
            critical_norm,
            shelf_life,
            unit_of_measure,
            units_per_package,
            price,
            storage_conditions,
            current_amount,
            type,
            kind,
            application,
            tech_prep_id
        )
        VALUES
            ('Парацетамол', 'Фармацевтическая компания', 0.05, INTERVAL '365 days',
             'mg', 10, 5.00, 'Хранить в сухом, прохладном месте', 100,
             'finished', 'pills', 'internal', v_tech + 1)
        RETURNING id INTO paracetomol_id; -- Получаем ID Парацетамола

        INSERT INTO medicine (
            name,
            manufacturer,
            critical_norm,
            shelf_life,
            unit_of_measure,
            units_per_package,
            price,
            storage_conditions,
            current_amount,
            type,
            kind,
            application,
            tech_prep_id
        )
        VALUES
            ('Антибиотик ЦФ', 'Биофарм', 0.10, INTERVAL '180 days',
             'ml', 15, 12.00, 'Хранить в темном месте', 50,
             'manufactured', 'mixture', 'internal', v_tech + 2)
        RETURNING id INTO antibiotic_id; -- Получаем ID Антибиотика ЦФ

        INSERT INTO medicine (
            name,
            manufacturer,
            critical_norm,
            shelf_life,
            unit_of_measure,
            units_per_package,
            price,
            storage_conditions,
            current_amount,
            type,
            kind,
            application,
            tech_prep_id
        )
        VALUES
            ('Анальгин мазь', 'ФармСтандарт', 0.02, INTERVAL '730 days',
             'g', 5, 8.50, 'Хранить в прохладном месте', 75,
             'finished', 'ointment', 'external', v_tech + 1)
        RETURNING id INTO analgin_id; -- Получаем ID Анальгин мази

        INSERT INTO ingredient (
            name,
            manufacturer,
            critical_norm,
            shelf_life,
            unit_of_measure,
            units_per_package,
            price,
            storage_conditions,
            current_amount,
            type,
            caution,
            incompatibility
        )
        VALUES
            ('Аспирин', 'Химическая компания', 0.10, INTERVAL '730 days',
             'mg', 20, 3.50, 'Хранить при комнатной температуре', 200,
             'active ingredient', 'Может вызвать аллергию', 'Не смешивать с алкоголем')
        RETURNING id INTO aspirin_id; -- Получаем ID Аспирина

        INSERT INTO ingredient (
            name,
            manufacturer,
            critical_norm,
            shelf_life,
            unit_of_measure,
            units_per_package,
            price,
            storage_conditions,
            current_amount,
            type,
            caution,
            incompatibility
        )
        VALUES
            ('Ибупрофен', 'МедХим', 0.08, INTERVAL '365 days',
             'mg', 30, 4.00, 'Хранить в прохладном месте', 150,
             'active ingredient', 'Использовать с осторожностью', 'Избегать с нестероидными')
        RETURNING id INTO ibuprofen_id; -- Получаем ID Ибупрофена

        INSERT INTO ingredient (
            name,
            manufacturer,
            critical_norm,
            shelf_life,
            unit_of_measure,
            units_per_package,
            price,
            storage_conditions,
            current_amount,
            type,
            caution,
            incompatibility
        )
        VALUES
            ('Ципрофлоксацин', 'ФармПротект', 0.15, INTERVAL '365 days',
             'mg', 25, 7.00, 'Хранить в темном месте', 120,
             'active ingredient', 'Только по рецепту', 'Не комбинировать с антикоагулянтами')
        RETURNING id INTO cipro_id; -- Получаем ID Ципрофлоксацина


        /*
          Далее вставляются рецепты, составы, заказы, записи инвентаря и поставки,
          используя полученные ID лекарств и ингредиентов.
        */
        INSERT INTO prescription (
            client_id, medicine_id, prescription_number, doctor_surname, doctor_name, doctor_patronymic,
            signature, stamp, age, diagnosis, amount, application
        )
        VALUES
            (v_client + 1, paracetomol_id, 1001, 'Петров', 'Сергей', 'Николаевич',
             TRUE, TRUE,
             45, 'Грипп', 5.00, 'internal'),
            (v_client + 2, antibiotic_id, 1002, 'Смирнов', 'Александр', 'Иванович',
             TRUE, FALSE,
             30, 'Бактериальная инфекция', 10.00, 'internal'),
            (v_client + 3, analgin_id, 1003, 'Козлов', 'Денис', 'Петрович',
             FALSE, TRUE,
             60, 'Болевой синдром', 3.00, 'external'),
            (v_client + 4, antibiotic_id, 1004, 'Новиков', 'Владимир', 'Александрович',
             FALSE, FALSE,
             50, 'Инфекция', 7.00, 'internal');
        SELECT COALESCE(MIN(id), 1) - 1 INTO v_prescription FROM prescription;

        INSERT INTO composition (medicine_id, ingredient_id, amount)
        VALUES
            (paracetomol_id, aspirin_id, 2.00),
            (antibiotic_id, ibuprofen_id, 1.50),
            (antibiotic_id, cipro_id, 0.50),
            (analgin_id, ibuprofen_id, 1.00);

        INSERT INTO medicine_order (
            prescription_id, client_id, order_number,
            status, date_of_issue, start_data, expected_date_of_issue, cost
        )
        VALUES
            (v_prescription + 1, v_client + 1, 101, 'ready', CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 hour', 25.00),
            (v_prescription + 2, v_client + 2, 102, 'producing', NULL, CURRENT_DATE - INTERVAL '1 day',NOW() - INTERVAL '4 hour', 120.00),
            (v_prescription + 3, v_client + 3, 103, 'ready', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '10 hour', 30.00),
            (v_prescription + 4, v_client + 4, 104, 'waiting for a delivery', NULL, CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '1 day',  84.00);
        SELECT COALESCE(MIN(id), 1) - 1 INTO v_order FROM medicine_order;

        INSERT INTO inventory (medication_id, date, amount)
        VALUES
            (paracetomol_id, CURRENT_DATE, 50),
            (antibiotic_id, CURRENT_DATE - INTERVAL '2 days', 30),
            (analgin_id, CURRENT_DATE - INTERVAL '1 day', 40),
            (aspirin_id, CURRENT_DATE, 100),
            (ibuprofen_id, CURRENT_DATE, 80),
            (cipro_id, CURRENT_DATE, 90);
        SELECT COALESCE(MIN(id), 1) - 1 INTO v_inventory FROM inventory;

        INSERT INTO medication_delivery (medication_id, application_date, delivery_date, amount)
        VALUES
            (paracetomol_id, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', 20.00),
            (analgin_id, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days', 15.00);
        INSERT INTO medication_delivery (medication_id, application_date, delivery_date, amount)
        VALUES
            (aspirin_id, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '2 days', 30.00),
            (ibuprofen_id, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE, 25.00),
            (cipro_id, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '3 days', 40.00);
        SELECT COALESCE(MIN(id), 1) - 1 INTO v_delivery FROM medication_delivery;

    END$$;