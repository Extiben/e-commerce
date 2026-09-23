# V01D — Tienda gótica (Next.js 16 + Prisma + Wompi)

E-commerce completo: catálogo, carrito, checkout con **Wompi** (tarjeta, PSE, Nequi, Bancolombia, Daviplata),
webhook de confirmación, control de inventario por talla/color y **panel de administración** en `/admin`.

## 1. Arrancar en tu computador

Requisitos: Node.js 20.9+.

```bash
npm install
cp .env.example .env        # y edita los valores
npm run setup               # crea la base de datos y carga los productos de ejemplo
npm run dev                 # http://localhost:3000
```

- Tienda: `http://localhost:3000`
- Admin: `http://localhost:3000/admin` (contraseña = `ADMIN_PASSWORD` del `.env`)
- Código de descuento de ejemplo: `V01D10`

Sin llaves de Wompi la tienda funciona en **modo demo** (pago simulado), ideal para probar.

## 2. Conectar Wompi

1. Crea tu cuenta en <https://comercios.wompi.co>.
2. En **Desarrolladores → Llaves y secretos** copia (primero las de *Sandbox*):
   - `WOMPI_PUBLIC_KEY` (pub_test_…)
   - `WOMPI_PRIVATE_KEY` (prv_test_…)
   - `WOMPI_INTEGRITY_SECRET` (test_integrity_…)
   - `WOMPI_EVENTS_SECRET` (test_events_…)
3. En **URL de eventos** pon: `https://TU-DOMINIO/api/wompi/webhook`
4. Pon `NEXT_PUBLIC_SITE_URL=https://TU-DOMINIO`.
5. Prueba compras en sandbox. Cuando todo funcione, cambia a las llaves `prod_` (y configura también
   la URL de eventos de producción, que es independiente).

**Cómo funciona el pago (seguro):**
- Los precios, descuentos y envío se recalculan **en el servidor** desde la base de datos.
- La firma de integridad SHA-256 se genera en el servidor (el secreto nunca llega al navegador).
- El pedido solo pasa a *Pagado* cuando llega el webhook firmado de Wompi (se verifica el checksum
  y que el monto coincida). Como respaldo, la página del pedido consulta la transacción a Wompi.
- El stock se descuenta **una sola vez** al confirmarse el pago; si se anula, se devuelve.

## 3. Publicar (producción)

**Opción recomendada — Railway / Render / VPS (un solo servidor):**
1. Crea una base **PostgreSQL** (Railway, Neon o Supabase).
2. En `prisma/schema.prisma` cambia `provider = "sqlite"` → `provider = "postgresql"`.
3. Configura las variables del `.env` en el hosting.
4. Build: `npm install && npm run build && npx prisma db push && npm run db:seed` · Start: `npm start`
5. Para las fotos subidas desde el admin monta un **volumen persistente** y apunta `UPLOAD_DIR` a él.

**Vercel:** funciona igual con Postgres, pero su disco no es persistente: para subir fotos
desde el admin habría que conectar un almacenamiento externo (Vercel Blob, Cloudinary o S3).

Conecta tu dominio (p. ej. `v01d.co`) y activa HTTPS (lo dan gratis Railway/Vercel/Cloudflare).

## 4. Estructura

```
app/(store)/          Tienda: inicio, tienda, producto, checkout, pedido, páginas info
app/admin/            Panel: resumen, pedidos, productos (fotos + inventario), descuentos
app/api/wompi/webhook Receptor de eventos de Wompi
app/actions.ts        Crear pedido, descuentos, newsletter (server actions)
lib/                  Base de datos, Wompi, auth, configuración de la tienda
prisma/               Esquema de la base de datos y datos iniciales
public/products       Fotos de producto (provisionales, generadas por IA)
```

Ajustes de la tienda (nombre, WhatsApp, redes, tarifas de envío, envío gratis) → `lib/config.ts`.

## 5. Antes de lanzar — checklist

- [ ] Reemplazar fotos provisionales por fotos reales (desde el admin)
- [ ] Cambiar `ADMIN_PASSWORD` y `SESSION_SECRET` por valores fuertes
- [ ] Datos reales en `lib/config.ts` (WhatsApp, Instagram, correo, tarifas)
- [ ] Revisar textos legales (`/envios`) con tu contador/abogado; política de datos (Ley 1581)
- [ ] Llaves de Wompi de producción + URL de eventos de producción
- [ ] Logo definitivo en `public/brand/logo.svg` y `app/icon.svg`
