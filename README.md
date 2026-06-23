# BarberApp — Sistema de turnos para barberías

## Qué incluye este MVP

- **Vista pública de reservas** (`/reservar/[slug]`): el cliente elige servicio, ve solo los barberos que hacen ese servicio, elige horario disponible y confirma.
- **Panel del dueño** (`/admin/[slug]`): resumen del día, gestión de servicios (con asignación de qué barbero hace cada uno), estado de suscripción.
- **Agenda del barbero** (`/barbero/[slug]`): vista simple para celular, ve su día, marca turnos como completados.
- **Multi-tenant**: cada barbería tiene su propio `slug`, sus propios servicios, barberos y turnos. Nada se mezcla entre barberías.
- **Control de suscripción**: si la barbería no paga, el acceso al panel y a la página de reservas se corta automáticamente (con días de gracia configurables).

## Lo que falta para producción (no incluido todavía)

- Integración real con Mercado Pago para cobrar la suscripción automáticamente (dejé el modelo de datos listo: `Suscripcion`, `PagoSuscripcion`, y el campo `mercadopagoSubId`).
- Página de registro de nuevas barberías (alta de tenant).
- Gestión de barberos desde el panel (alta/edición — el seed los crea, pero falta el formulario).
- Notificaciones (email/WhatsApp) de confirmación y recordatorio de turno.
- Vista de "historial de cliente" para el dueño.

---

## 1. Cómo correrlo localmente

```bash
# Descomprimir y entrar a la carpeta
unzip barberapp.zip && cd barberapp

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
```

Editá `.env` con tus datos reales:

```
DATABASE_URL="postgresql://usuario:password@TU_IP_VPS:5432/barberapp?schema=public&sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."   # generar con: openssl rand -base64 32
```

Luego:

```bash
# Crear las tablas en la base de datos
npx prisma db push

# Cargar datos de ejemplo (3 barberos, 3 servicios, 1 cliente)
npm run db:seed

# Levantar el servidor
npm run dev
```

Con el seed cargado, podés entrar con:
- Dueño: `dueno@elzorro.com` / `password123` → te lleva a `/admin/el-zorro`
- Barbero: `juan@elzorro.com` / `password123` → te lleva a `/barbero/el-zorro`
- Cliente: `cliente@ejemplo.com` / `password123`
- Reserva pública (sin login para mirar, login para confirmar): `/reservar/el-zorro`

## 2. Postgres en tu VPS

Si todavía no tenés Postgres instalado en el VPS:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE barberapp;
CREATE USER barberapp_user WITH ENCRYPTED PASSWORD 'una-clave-segura';
GRANT ALL PRIVILEGES ON DATABASE barberapp TO barberapp_user;
```

**Importante para conectar desde Vercel:** tu Postgres necesita aceptar conexiones externas.

1. Editá `/etc/postgresql/*/main/postgresql.conf` y poné `listen_addresses = '*'`
2. Editá `/etc/postgresql/*/main/pg_hba.conf` y agregá una línea para permitir conexiones SSL externas:
   ```
   hostssl  all  all  0.0.0.0/0  scram-sha-256
   ```
3. Reiniciá: `sudo systemctl restart postgresql`
4. **Abrí el puerto 5432 en el firewall solo si es necesario** (`ufw allow 5432/tcp`), idealmente restringido a las IPs salientes de Vercel si tu proveedor las lista, o usando una VPN/SSH tunnel para mayor seguridad.

Como alternativa más segura, considerá poner **PgBouncer** delante de Postgres (pooler de conexiones), porque Vercel corre en funciones serverless y puede abrir muchas conexiones simultáneas que agotan el límite de Postgres rápido.

## 3. Desplegar en Vercel

1. Subí este proyecto a un repo de GitHub/GitLab.
2. En Vercel: "Add New Project" → importá el repo.
3. En "Environment Variables" agregá las mismas que tenés en `.env`, pero con:
   - `NEXTAUTH_URL` = tu dominio final (ej. `https://tudominio.com`)
   - `DATABASE_URL` = la cadena de conexión a tu VPS
4. Deploy.
5. En tu proveedor de dominio, apuntá el dominio a Vercel (Vercel te da los registros DNS exactos en "Domains" del proyecto).

## 4. Estructura del proyecto

```
src/
  app/
    login/                    → login compartido (los 3 roles)
    panel/                    → redirige según el rol tras login
    admin/[slug]/             → panel del dueño (protegido + chequeo de suscripción)
      servicios/              → CRUD de servicios + asignación de barberos
    barbero/[slug]/           → agenda del barbero (protegido)
    reservar/[slug]/          → página pública de reservas
    api/
      auth/[...nextauth]/     → autenticación
      disponibilidad/         → calcula horarios libres
  components/                 → componentes de UI reutilizables
  lib/
    prisma.ts                 → cliente de base de datos
    auth.ts                   → configuración de NextAuth
    disponibilidad.ts         → lógica de horarios libres/ocupados
    suscripcion.ts            → lógica de acceso según estado de pago
prisma/
  schema.prisma                → modelo de datos completo
  seed.ts                       → datos de ejemplo
```

## 5. Cómo se resuelve lo de "cada barbería define sus propios servicios"

- Tabla `Servicio`: cada fila tiene `barberiaId`, así que los servicios de una barbería nunca se mezclan con los de otra.
- Tabla `BarberoServicio`: conecta un barbero (`MiembroBarberia`) con los servicios que sabe hacer. En la página de reserva, cuando el cliente elige un servicio, solo se muestran los barberos que tienen ese servicio asignado en esta tabla.
- Desde `/admin/[slug]/servicios` el dueño crea, edita y asigna barberos a cada servicio con checkboxes — sin tocar código.

## 6. Próximos pasos sugeridos

1. Probar el flujo completo localmente con el seed.
2. Conectar Mercado Pago para automatizar el cobro mensual (te puedo armar esa integración cuando quieras).
3. Agregar la página de alta de nuevas barberías (`/registro`), para que vos puedas sumar clientes sin tocar la base de datos a mano.
