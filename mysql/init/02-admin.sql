-- Crear usuario administrador por defecto
-- Credenciales iniciales:
--   Email: admin@rmp.com
--   Contraseña: admin123!
-- IMPORTANTE: Se recomienda cambiar la contraseña después del primer inicio de sesión
INSERT INTO USUARIO (username, email, nombre_completo, password_hash, activo) VALUES
('admin', 'admin@rmp.com', 'Administrador del Sistema', '$2a$10$P0BixBr/OaNEc9rIEWHo1.XJJrwf3ktJPNPBKuImrfQhmFl4lV3u6', TRUE);

-- Asignar rol de administrador
INSERT INTO USUARIO_ROL (id_usuario, id_rol)
SELECT 
    (SELECT id_usuario FROM USUARIO WHERE username = 'admin'),
    (SELECT id_rol FROM ROL WHERE nombre = 'ADMINISTRADOR');
