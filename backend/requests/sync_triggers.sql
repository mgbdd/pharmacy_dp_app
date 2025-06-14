-- Триггерная функция для синхронизации вставок в medicine и ingredient с medication
CREATE OR REPLACE FUNCTION synchronize_medication_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Вставляем данные в родительскую таблицу medication
    INSERT INTO medication (
        id,
        name,
        manufacturer,
        critical_norm,
        shelf_life,
        unit_of_measure,
        units_per_package,
        price,
        storage_conditions,
        current_amount
    ) VALUES (
        NEW.id,
        NEW.name,
        NEW.manufacturer,
        NEW.critical_norm,
        NEW.shelf_life,
        NEW.unit_of_measure,
        NEW.units_per_package,
        NEW.price,
        NEW.storage_conditions,
        NEW.current_amount
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для таблицы medicine после вставки
CREATE TRIGGER synchronize_medicine_insert_trigger
AFTER INSERT ON medicine
FOR EACH ROW
EXECUTE FUNCTION synchronize_medication_insert();

-- Триггер для таблицы ingredient после вставки
CREATE TRIGGER synchronize_ingredient_insert_trigger
AFTER INSERT ON ingredient
FOR EACH ROW
EXECUTE FUNCTION synchronize_medication_insert();

-- Триггерная функция для синхронизации удалений из medicine и ingredient с medication
CREATE OR REPLACE FUNCTION synchronize_medication_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Удаляем данные из родительской таблицы medication
    DELETE FROM medication WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Триггер для таблицы medicine после удаления
CREATE TRIGGER synchronize_medicine_delete_trigger
AFTER DELETE ON medicine
FOR EACH ROW
EXECUTE FUNCTION synchronize_medication_delete();

-- Триггер для таблицы ingredient после удаления
CREATE TRIGGER synchronize_ingredient_delete_trigger
AFTER DELETE ON ingredient
FOR EACH ROW
EXECUTE FUNCTION synchronize_medication_delete();

-- Триггерная функция для синхронизации обновлений medicine и ingredient с medication
CREATE OR REPLACE FUNCTION synchronize_medication_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем данные в родительской таблице medication
    UPDATE medication
    SET
        name = NEW.name,
        manufacturer = NEW.manufacturer,
        critical_norm = NEW.critical_norm,
        shelf_life = NEW.shelf_life,
        unit_of_measure = NEW.unit_of_measure,
        units_per_package = NEW.units_per_package,
        price = NEW.price,
        storage_conditions = NEW.storage_conditions,
        current_amount = NEW.current_amount
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для таблицы medicine после обновления
CREATE TRIGGER synchronize_medicine_update_trigger
AFTER UPDATE ON medicine
FOR EACH ROW
WHEN (pg_trigger_depth() = 1)   -- срабатывает только при глубине=1
EXECUTE FUNCTION synchronize_medication_update();

-- Триггер для таблицы ingredient после обновления
CREATE TRIGGER synchronize_ingredient_update_trigger
AFTER UPDATE ON ingredient
FOR EACH ROW
WHEN (pg_trigger_depth() = 1)   -- срабатывает только при глубине=1
EXECUTE FUNCTION synchronize_medication_update();