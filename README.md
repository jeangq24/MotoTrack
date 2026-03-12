<div align="center">
  <br />
  <h1>🛵 MotoTrack</h1>
  <p>
    <strong>El copiloto financiero para conductores de moto y repartidores.</strong>
  </p>
  <p>
    Una aplicación web diseñada desde la experiencia real en las vías, para registrar servicios rápidos, controlar gastos (gasolina, comida) y calcular ganancias netas diarias al instante.
  </p>
  <br />

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
  
  <br />
</div>

## 💡 El Porqué (Motivación)
Este proyecto nació de una necesidad propia. Como conductor de moto en mi trabajo alterno, me di cuenta de lo tedioso que era llevar las cuentas en libretas o Excel. Necesitaba algo **rápido**, que se pudiera usar con una sola mano, con botones grandes para registrar domicilios o carreras en menos de 3 toques, y que me dijera exactamente **cuánto me gané libre de gastos** al final del día. 

Mi objetivo es seguir evolucionando el sistema, publicándolo de forma gratuita para que otros compañeros conductores en la calle puedan probarlo, dar su opinión y llevar el control de sus finanzas de manera profesional.

## ✨ Características Principales

Registro en 3 toques:
- **🛠️ Servicios:** Domicilios, Envíos, Pasajeros o Personalizados.
- **⛽ Gastos:** Gasolina, Comida, Mantenimiento preventivo.
- **🏍️ Taller y Mantenimiento:** Sistema dinámico para el seguimiento de repuestos y tareas de desgaste. Define tus propias reglas (Ej: Cambio de lubricante cada 3,000 km) y MotoTrack calcula y te advierte automáticamente el estado (Seguro, Próximo o Vencido) en base al odómetro.
- **📱 UX Premium y Mobile-First:** Interfaz Dark Glassmorphism de alta gama integrada con iconos vectoriales fluidos (Lucide React). Botones diseñados para pulgares, alto contraste (modo oscuro nativo) y navegación inferor tipo iOS.
- **📊 Estadísticas en Vivo:** Tarjetas estilo Fintech que calculan _Producido_, _Gastos Diarios_ y _Balance Neto Libre_ agrupado por hoy y por el acumulado histórico.
- **🔒 Nube Segura:** Inicio de sesión con validación OTP (Autenticación via correo/códigos sin contraseña). Tus datos están aislados mediante `Row Level Security (RLS)` de PostgreSQL, sincronizando todo al instante respaldado por Supabase.

---

## 🚀 Cómo probarlo localmente

Para colaborar, probar o ejecutar el proyecto en tu máquina:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/mototrack.git
cd mototrack
npm install
```

### 2. Configurar la Base de Datos (Supabase)
1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Ve a las opciones del proyecto y extrae tus variables.
3. Renombra el archivo `.env.local.example` (o créalo si no existe) a `.env.local` y configúralo de la siguiente manera:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-id-de-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
```

### 3. Ejecutar la Base de Datos
En el SQL Editor de tu proyecto de Supabase, **solo necesitas ejecutar un archivo:**
Abre el archivo `supabase_init_production.sql` que se encuentra en la raíz, cópialo y ejecútalo entero. Este script se encargará de crear las tablas, relaciones, políticas de seguridad (RLS), y funciones optimizadas para el rendimiento (Total de gastos y producidos) en un solo paso (A partir de la v1.3.0).

### 4. Arrancar en desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000).

---

## 🗺️ Roadmap (Plan a Futuro)

Este sistema apenas arranca. Las metas a mediano plazo incluyen:

- [ ] **Modo Offline:** Migrar con Service Workers para que se puedan registrar carreras en zonas sin señal de internet y sincronizar al reconectar (Local-First).
- [ ] **Métricas Mensuales:** Gráficos visuales y comparativas (Ej: "¿Lunes o Domingo, qué día rinde más?").
- [ ] **Multi-plataforma:** Compilación con Capacitor o React Native para tener notificaciones push nativas.

---

## 📜 Licencia (Source-Available)
Este proyecto es **"Source-Available"** y está disponible para todos los conductores que lo necesiten para su control financiero diario, educación o investigación.
🚨 **El uso comercial (vender el software, ofrecerlo como servicio de pago, etc) está PROHIBIDO sin la autorización explícita del autor.**

[Revisa el archivo completo LICENSE](./LICENSE) para más detalles legales.

---

<div align="center">
  Hecho con ☕ y mucho amor para la comunidad motera por <a href="https://www.linkedin.com/in/jeangarzon/" target="_blank"><strong>JGDev</strong></a>.
</div>
