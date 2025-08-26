-- Events and timezone setup for automatic purge of TESORERIA trash
-- Timezone: Lima, Peru (UTC-05:00)

-- Ensure event scheduler is enabled (also set via my.cnf)
SET GLOBAL event_scheduler = ON;

-- Set DB server timezone to Lima/Peru (safe offset even if zoneinfo tables not loaded)
SET GLOBAL time_zone = '-05:00';

-- Create daily purge event: removes records soft-deleted more than 7 days ago
DROP EVENT IF EXISTS ev_purge_tesoreria;
CREATE EVENT ev_purge_tesoreria
ON SCHEDULE EVERY 1 DAY
-- Start tomorrow at 03:00 (Lima time, with global time_zone = -05:00)
STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 3 HOUR)
DO
  DELETE FROM TESORERIA
  WHERE deleted_at IS NOT NULL
    AND deleted_at < (NOW() - INTERVAL 7 DAY);
