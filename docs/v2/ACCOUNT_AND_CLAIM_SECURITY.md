# Cuentas opcionales y reclamo de resultados

## Alcance del MVP local

Questype mantiene el primer Journey completamente anónimo. Una cuenta es opcional y usa un enlace de un solo uso, sin contraseña. La entrega de correo de producción permanece desactivada en esta etapa; `MagicLinkEmailProvider` define el límite de integración y el entorno local devuelve un enlace de desarrollo explícito.

## Credenciales

- El enlace contiene 32 bytes aleatorios codificados en base64url y vence a los 15 minutos.
- D1 guarda únicamente SHA-256 del token, nunca el token utilizable.
- El consumo escribe un nonce único y solo puede cambiar una fila cuyo enlace siga vigente y sin usar.
- Un segundo consumo falla con `409`; no crea otra sesión.
- La sesión de cuenta usa otro token aleatorio, también almacenado como hash, con cookie `HttpOnly`, `SameSite=Lax` y `Secure` bajo HTTPS.
- Las mutaciones conservan la validación de mismo origen ya usada por V1.
- Se limitan cinco solicitudes por correo en una ventana de diez minutos. La respuesta de límite no revela si existe una cuenta.

## Prueba de propiedad anónima

`POST /api/account/claim` no acepta un ID de resultado. El servidor obtiene:

1. la cuenta a partir de su cookie de sesión;
2. el `owner_hash` a partir de la cookie anónima actual;
3. los resultados cuya sesión pertenece a ese hash.

Solo esa intersección puede insertarse en `result_claims`. La clave primaria por resultado evita duplicados y `INSERT OR IGNORE` hace que repetir el reclamo sea idempotente. Un resultado ya reclamado por otra cuenta no cambia de dueño y se informa solo como un conteo de conflicto, sin revelar IDs.

Al completar un Journey mientras la cuenta está activa, el resultado nuevo se reclama dentro del mismo lote D1 que finaliza el resultado. El acceso posterior puede demostrarse por la cookie anónima original o por la cuenta propietaria, lo que permite abrirlo en otro navegador después de iniciar sesión.

## Merge seguro

Volver a entrar con el mismo correo reutiliza el mismo `auth_users.id` mediante la restricción única del correo normalizado. Reclamar desde otro navegador solo agrega resultados probados por la cookie anónima de ese navegador; nunca sustituye reclamos existentes.

## Borrado

- Borrar los datos del navegador elimina únicamente sesiones anónimas que no hayan sido reclamadas. Los resultados reclamados permanecen en la cuenta.
- Borrar la cuenta elimina sus sesiones de autenticación, enlaces pendientes, Journeys reclamados, resultados, evidencia V2 y shares por cascada.
- Los archivos PDF o tarjetas ya descargados quedan fuera del control del servidor, igual que en V1.

## Decisión de arquitectura

La auditoría no encontró un stack de autenticación instalado. Para evitar una dependencia y una migración invasiva, esta etapa usa un servicio D1 pequeño, aislado y compatible con Workers. La interfaz de entrega permite sustituir el proveedor sin cambiar tokens, reclamos o perfiles. Antes de producción deben elegirse el proveedor, la política de retención y el dominio remitente, y ejecutarse una revisión específica de seguridad y abuso.

