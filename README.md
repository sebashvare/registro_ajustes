# 🚀 Sistema de Registro de Ajustes - Frontend

Una aplicación web moderna para el registro y gestión de ajustes de cuenta de servicio, construida con SvelteKit 5, TypeScript y completamente integrada con backend Django REST API.

![SvelteKit](https://img.shields.io/badge/SvelteKit-5.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Django](https://img.shields.io/badge/Django_REST-092E20?style=for-the-badge&logo=django&logoColor=white)

## ✨ Características Principales

### 🔐 **Sistema de Autenticación Completo**
- ✅ Login seguro con email/password
- ✅ Autenticación JWT con tokens Bearer
- ✅ Protección automática de rutas
- ✅ Manejo de sesiones con localStorage
- ✅ Redirects automáticos según estado de autenticación

### 🎨 **Interfaz de Usuario Avanzada**
- ✅ Diseño 100% responsive (móvil, tablet, desktop)
- ✅ Modo claro/oscuro con persistencia
- ✅ Navegación intuitiva con breadcrumbs
- ✅ Componentes reutilizables y modulares
- ✅ Indicadores de carga y estados

### 📊 **Dashboard Analítico en Tiempo Real**
- ✅ Estadísticas calculadas dinámicamente desde API
- ✅ KPIs de ajustes positivos/negativos
- ✅ Gráficos de barras interactivos por asesor
- ✅ Análisis temporal por mes
- ✅ Métricas de rendimiento por asesor
- ✅ Resumen ejecutivo con totales

### 📝 **Gestión Completa de Registros**
- ✅ Formulario validado de ajustes
- ✅ Integración completa con API Django
- ✅ Lista paginada y filtrable
- ✅ Exportación a CSV con codificación UTF-8 BOM
- ✅ Búsqueda y filtros avanzados
- ✅ Ordenamiento por columnas
- ✅ Visualización de detalles

### 🔌 **Integración Backend Robusta**
- ✅ API REST Django completamente integrada
- ✅ Autenticación JWT Bearer tokens
- ✅ Manejo de errores y estados de carga
- ✅ Paginación del lado del servidor
- ✅ CORS configurado correctamente
- ✅ Validación de datos en frontend y backend

## 🛠️ Stack Tecnológico

- **Frontend Framework**: SvelteKit 5 con TypeScript
- **Styling**: TailwindCSS + CSS personalizado
- **Backend Integration**: Django REST Framework
- **Autenticación**: JWT Tokens con Bearer Auth
- **Base de Datos**: Conectada a través de API Django
- **Exportación**: CSV con UTF-8 BOM para Excel
- **Estado**: Svelte stores reactivos
- **HTTP Client**: Fetch API nativo

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm
- Backend Django REST API ejecutándose en `http://localhost:8000`
- Git para clonar el repositorio

### Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd Registro_Ajustes

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### Configuración del Backend

Asegúrate de que el backend Django esté ejecutándose con:

- **URL**: `http://localhost:8000`
- **Endpoints requeridos**:
  - `POST /auth/login/` - Autenticación
  - `GET /api/registros/` - Lista de registros
  - `POST /api/registros/` - Crear registro
- **CORS habilitado** para `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── lib/
│   ├── api/                 # Servicios de API
│   │   ├── auth.ts         # Autenticación JWT
│   │   ├── config.ts       # Configuración de API
│   │   └── registros.ts    # CRUD de registros
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # Componentes base
│   │   ├── BarChart.svelte # Gráficas de barras
│   │   └── ...
│   ├── stores/            # Estado global
│   │   ├── auth.ts        # Store de autenticación
│   │   └── theme.ts       # Store de tema
│   └── types/             # Tipos TypeScript
├── routes/                # Rutas de la aplicación
│   ├── (protected)/       # Rutas protegidas
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── nuevo/         # Crear registro
│   │   └── registros/     # Lista de registros
│   ├── login/             # Página de login
│   └── +layout.svelte     # Layout principal
└── app.html              # Template HTML base
```

## 🎯 Funcionalidades Detalladas

### Dashboard Analítico
- **KPIs en tiempo real**: Total registros, valores positivos/negativos
- **Gráficas interactivas**: Rendimiento por asesor y evolución temporal
- **Métricas calculadas**: Promedios, totales y distribuciones
- **Actualización automática**: Se recalcula con cada carga

### Sistema de Registros
- **Formulario completo**: Todos los campos requeridos validados
- **Lista con filtros**: Búsqueda por texto, fechas y asesores
- **Exportación avanzada**: CSV con UTF-8 BOM para compatibilidad Excel
- **Paginación**: Manejo eficiente de grandes volúmenes de datos

### Autenticación
- **JWT Security**: Tokens seguros con validación
- **Persistencia**: Sesiones guardadas en localStorage
- **Protección automática**: Rutas protegidas sin configuración adicional
- **Manejo de errores**: Feedback claro para errores de login

## 🛡️ Seguridad

- **Autenticación JWT**: Tokens Bearer en headers
- **Protección de rutas**: Middleware automático
- **Validación frontend**: Sanitización de inputs
- **CORS configurado**: Solo orígenes permitidos
- **Manejo de errores**: Sin exposición de información sensible

## 📊 APIs Integradas

### Autenticación
```typescript
POST /auth/login/
{
  "email": "usuario@email.com",
  "password": "contraseña"
}
```

### Registros
```typescript
GET /api/registros/          # Lista paginada
POST /api/registros/         # Crear nuevo
```

## 🎨 Temas y Estilos

- **TailwindCSS**: Framework CSS utility-first
- **Tema personalizado**: Colores corporativos definidos
- **Responsive design**: Mobile-first approach
- **Dark/Light mode**: Cambio de tema persistente
- **Componentes modulares**: Reutilizables y consistentes

## 📱 Compatibilidad

- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos**: Desktop, tablet, móvil
- **Resoluciones**: Desde 320px hasta 4K
- **Accesibilidad**: ARIA labels y navegación por teclado

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Preview del build
npm run check        # Verificar TypeScript
npm run check:watch  # Verificar en modo watch
npm run lint         # Linter ESLint
npm run format       # Formatear con Prettier
```

## 🐛 Solución de Problemas

### Error de CORS
```bash
# Verificar que el backend tenga CORS habilitado para:
# http://localhost:5173
```

### Error de autenticación
```bash
# Verificar endpoint de login en:
# http://localhost:8000/auth/login/
```

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Desarrollador Principal** - Desarrollo inicial y arquitectura

## 🙏 Agradecimientos

- Equipo de SvelteKit por el excelente framework
- Comunidad de TailwindCSS por los componentes
- Contribuidores del proyecto Django REST Framework

---

⭐ **¡No olvides dar una estrella al repo si te fue útil!** ⭐