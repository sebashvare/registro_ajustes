# Guía de Deployment - Sistema de Registro de Ajustes

## 🚀 Preparación para Producción

### 1. Configuración del Backend

Antes de hacer deployment del frontend, asegúrate de que el backend esté configurado correctamente:

```python
# settings.py del backend Django
CORS_ALLOWED_ORIGINS = [
    "https://tu-dominio-frontend.com",
    "http://localhost:5173",  # Para desarrollo
]

ALLOWED_HOSTS = [
    'tu-dominio-backend.com',
    'localhost',
]

# URLs de producción
FRONTEND_URL = "https://tu-dominio-frontend.com"
BACKEND_URL = "https://tu-dominio-backend.com"
```

### 2. Configuración del Frontend

Actualiza la configuración de la API en `src/lib/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://tu-dominio-backend.com/api',
  AUTH_URL: 'https://tu-dominio-backend.com/auth',
  TIMEOUT: 10000,
  DEV_MODE: false  // ¡IMPORTANTE: false para producción!
};
```

### 3. Build de Producción

```bash
# Instalar dependencias
npm ci

# Ejecutar checks
npm run check
npm run lint

# Build optimizado
npm run build

# Test del build
npm run preview
```

### 4. Deployment Options

#### Opción A: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Opción B: Netlify
```bash
# Build
npm run build

# Subir la carpeta build/ a Netlify
```

#### Opción C: Docker
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
```

### 5. Variables de Entorno

Crea un archivo `.env.production`:

```env
PUBLIC_API_BASE_URL=https://tu-dominio-backend.com
PUBLIC_APP_NAME="Sistema de Registro de Ajustes"
PUBLIC_APP_VERSION="1.0.0"
```

### 6. Configuración de Servidor Web

#### Nginx
```nginx
server {
    listen 80;
    server_name tu-dominio-frontend.com;
    
    root /var/www/registro-ajustes/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass https://tu-dominio-backend.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Apache
```apache
<VirtualHost *:80>
    ServerName tu-dominio-frontend.com
    DocumentRoot /var/www/registro-ajustes/build
    
    <Directory "/var/www/registro-ajustes/build">
        FallbackResource /index.html
    </Directory>
    
    ProxyPass /api https://tu-dominio-backend.com/api
    ProxyPassReverse /api https://tu-dominio-backend.com/api
</VirtualHost>
```

### 7. Checklist de Deployment

- [ ] Backend Django configurado y funcionando
- [ ] CORS configurado correctamente
- [ ] URLs de producción actualizadas
- [ ] DEV_MODE = false en config.ts
- [ ] Build de producción exitoso
- [ ] Variables de entorno configuradas
- [ ] SSL/HTTPS habilitado
- [ ] Dominio configurado
- [ ] Pruebas de funcionalidad completas

### 8. Monitoreo Post-Deployment

#### Health Check Endpoints
- Frontend: `https://tu-dominio-frontend.com`
- Backend API: `https://tu-dominio-backend.com/api/health/`
- Auth: `https://tu-dominio-backend.com/auth/login/`

#### Logs a Monitorear
- Errores de autenticación
- Timeouts de API
- Errores de CORS
- Errores 404/500

### 9. Rollback Plan

```bash
# Si hay problemas, rollback rápido:
git checkout [commit-anterior-estable]
npm run build
# Re-deploy
```

### 10. Performance

#### Optimizaciones Incluidas:
- ✅ Code splitting automático
- ✅ Tree shaking
- ✅ Minificación
- ✅ Compresión gzip
- ✅ Lazy loading de rutas
- ✅ Optimización de imágenes

#### Métricas a Monitorear:
- Tiempo de carga inicial
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Cumulative Layout Shift (CLS)

---

## 🔧 Comandos Útiles Post-Deployment

```bash
# Verificar build
npm run build && npm run preview

# Análisis de bundle
npm run build -- --analyze

# Test de rendimiento
npx lighthouse https://tu-dominio-frontend.com

# Verificar tipos
npm run check

# Test de lint
npm run lint
```

## 📞 Soporte

Para problemas de deployment, verificar:
1. Logs del servidor web
2. Consola del navegador
3. Network tab en DevTools
4. Estado del backend Django
5. Configuración de CORS

---
*Última actualización: Octubre 2025*