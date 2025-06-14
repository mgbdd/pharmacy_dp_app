DROP TABLE IF EXISTS medication CASCADE;
DROP TABLE IF EXISTS client CASCADE;
DROP TABLE IF EXISTS technology_of_preparation CASCADE;
DROP TABLE IF EXISTS medicine CASCADE;
DROP TABLE IF EXISTS ingredient CASCADE;
DROP TABLE IF EXISTS prescription CASCADE;
DROP TABLE IF EXISTS composition CASCADE;
DROP TABLE IF EXISTS medicine_order CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS medication_delivery CASCADE;

DROP TYPE IF EXISTS units_of_measure CASCADE;
CREATE TYPE units_of_measure AS ENUM (
    'g',
    'mg',
    'ml',
    'pc'
    );

DROP TYPE IF EXISTS method_of_application CASCADE;
CREATE TYPE method_of_application AS ENUM (
    'internal',
    'external',
    'for mixing'
    );

DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM (
    'waiting for a delivery',
    'producing',
    'ready',
    'issued',
    'cancelled'
    );

DROP TYPE IF EXISTS medicine_kind CASCADE;
CREATE TYPE medicine_kind AS ENUM (
    'pills',
    'mixture',
    'ointment',
    'solution',
    'tincture',
    'powder'
    );

DROP TYPE IF EXISTS medicine_type CASCADE;
CREATE TYPE medicine_type AS ENUM (
    'finished',
    'manufactured'
    );

CREATE TABLE IF NOT EXISTS medication (
                                          id SERIAL PRIMARY KEY,
                                          name VARCHAR(50) NOT NULL,
                                          manufacturer VARCHAR(50) NOT NULL,
                                          critical_norm NUMERIC(10, 2) NOT NULL,
                                          shelf_life INTERVAL NOT NULL,
                                          unit_of_measure units_of_measure NOT NULL,
                                          units_per_package NUMERIC(10, 2) CHECK (units_per_package > 0),
                                          price NUMERIC(10, 2) CHECK (price > 0),
                                          storage_conditions VARCHAR(250) NOT NULL,
                                          current_amount NUMERIC(10, 2) CHECK (current_amount >= 0)
);

CREATE TABLE IF NOT EXISTS client(
                                     id SERIAL PRIMARY KEY,
                                     surname VARCHAR(50) NOT NULL,
                                     name VARCHAR(50) NOT NULL,
                                     patronymic VARCHAR(50),
                                     phone_number VARCHAR(15) NOT NULL
);

CREATE TABLE IF NOT EXISTS technology_of_preparation (
                                                         id SERIAL PRIMARY KEY,
                                                         description TEXT NOT NULL,
                                                         preparation_time INTERVAL NOT NULL

);


CREATE TABLE IF NOT EXISTS medicine (
                                        PRIMARY KEY (id),
                                        type medicine_type NOT NULL, -- Теперь этот тип будет определён
                                        kind medicine_kind NOT NULL,
                                        application method_of_application NOT NULL,
                                        tech_prep_id INTEGER REFERENCES technology_of_preparation(id),
                                        CONSTRAINT valid_tech_prep CHECK (tech_prep_id > 0)
) INHERITS (medication);

CREATE TABLE IF NOT EXISTS ingredient (
                                          PRIMARY KEY (id),
                                          type VARCHAR(100) NOT NULL,
                                          caution TEXT NOT NULL,
                                          incompatibility VARCHAR(250)
) INHERITS (medication);

CREATE TABLE IF NOT EXISTS prescription(
                                           id SERIAL PRIMARY KEY,
                                           client_id INTEGER NOT NULL REFERENCES client(id),
                                           medicine_id INTEGER NOT NULL REFERENCES medicine(id),
                                           prescription_number INTEGER NOT NULL CHECK (prescription_number > 0),
                                           doctor_surname VARCHAR(50) NOT NULL,
                                           doctor_name VARCHAR(50) NOT NULL,
                                           doctor_patronymic VARCHAR(50),
                                           signature BOOLEAN NOT NULL,
                                           stamp BOOLEAN NOT NULL,
                                           age INTEGER NOT NULL CHECK (age >= 0),
                                           diagnosis VARCHAR(100) NOT NULL,
                                           amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
                                           application VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS composition (
                                           medicine_id INTEGER NOT NULL REFERENCES medicine(id) ON DELETE CASCADE,
                                           ingredient_id INTEGER NOT NULL REFERENCES ingredient(id) ON DELETE RESTRICT,
                                           amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
                                           PRIMARY KEY (medicine_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS medicine_order(
                                             id SERIAL PRIMARY KEY,
                                             prescription_id INTEGER NOT NULL REFERENCES prescription(id),
                                             client_id INTEGER NOT NULL REFERENCES client(id),
                                             order_number INTEGER NOT NULL CHECK (order_number > 0),
                                             status order_status NOT NULL,
                                             date_of_issue DATE NULL CHECK (
                                                 date_of_issue IS NULL OR
                                                 date_of_issue <= CURRENT_DATE
                                                 ),
                                             start_data TIMESTAMPTZ NOT NULL CHECK (start_data <= NOW()),
                                             expected_date_of_issue TIMESTAMPTZ NOT NULL,
                                             cost NUMERIC(10, 2) NOT NULL CHECK (cost > 0)
);

CREATE TABLE inventory(
                          id SERIAL PRIMARY KEY,
                          medication_id INTEGER NOT NULL,
                          date DATE NOT NULL CHECK (date <= CURRENT_DATE),
                          amount INTEGER NOT NULL CHECK (amount >= 0),

                          FOREIGN KEY (medication_id)
                              REFERENCES medication(id)
                              ON DELETE RESTRICT
);

CREATE TABLE medication_delivery(
                                    id SERIAL PRIMARY KEY,
                                    medication_id INTEGER NOT NULL,
                                    application_date DATE NOT NULL CHECK (application_date <= CURRENT_DATE),
                                    delivery_date DATE NULL CHECK (
                                        delivery_date IS NULL OR
                                        delivery_date <= CURRENT_DATE
                                        ),
                                    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),

                                    FOREIGN KEY (medication_id)
                                        REFERENCES medication(id)
                                        ON DELETE RESTRICT
);