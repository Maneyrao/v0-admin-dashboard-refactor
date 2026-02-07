# Guía de Deploy y Gestión de Dependencias

## 🚨 Problemas Comunes de Deploy

### Lockfile Desactualizado

**Error típico en Vercel:**
```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json
```

**Causa:** El `package.json` fue modificado pero el lockfile no se actualizó.

## ✅ Solución

### 1. Actualizar Lockfile

```bash
# Usar npm (gestor de paquetes oficial del proyecto)
npm install
```

### 2. Verificar y Commitear

```bash
git status
git add package-lock.json
git commit -m "fix: actualizar lockfile para deploy"
```

## 🛡️ Prevención

### Regla de Oro: **Siempre actualizar lockfile después de modificar package.json**

**Flujo correcto:**
1. Modificar `package.json` (agregar/eliminar dependencias)
2. **Inmediatamente después**: Ejecutar `npm install`
3. Verificar cambios en lockfile
4. Commitear ambos archivos juntos

### Comandos Esenciales

```bash
# Después de cualquier cambio en package.json
npm install

# Verificar qué dependencias cambiaron
git diff package.json

# Verificar cambios en lockfile
git diff package-lock.json
```

## 🔄 Gestión de Paquetes

### Estructura del Proyecto

```
📁 Raíz del proyecto
├── package.json           # Dependencias y scripts
├── package-lock.json     # Lockfile de npm (usado por Vercel y desarrollo)
└── node_modules/        # Dependencias instaladas
```

### Gestor de Paquetes

- **Este proyecto usa**: npm
- **Vercel**: Detecta automáticamente npm y usa `package-lock.json`
- **Desarrollo local**: Usa npm para consistencia
- **Importante**: Mantener `package-lock.json` actualizado

## 📋 Checklist Antes de Deploy

### ✅ Verificación de Dependencias

```bash
# 1. Verificar que package.json esté limpio
git status

# 2. Actualizar lockfile si es necesario
pnpm install

# 3. Verificar que no haya cambios pendientes
git status

# 4. Probar build localmente
pnpm run build
```

### ✅ Comandos de Verificación

```bash
# Verificar dependencias desactualizadas
npm outdated

# Verificar vulnerabilidades
npm audit

# Limpiar e instalar desde cero
rm -rf node_modules package-lock.json
npm install
```

## 🔧 Configuración de Vercel

### Variables de Entorno Requeridas

```bash
# Supabase Cliente
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase Servidor
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Administración
NEXT_PUBLIC_ADMIN_EMAIL=
```

### Build Command

Vercel usa automáticamente:
```bash
npm install
npm run build
```

## 🚨 Errores Comunes y Soluciones

### Error: "frozen-lockfile"

**Causa:** Lockfile desactualizado
**Solución:** `pnpm install` y commitear lockfile

### Error: "dependency not found"

**Causa:** Dependencia faltante en package.json
**Solución:** Agregar dependencia y actualizar lockfile

### Error: "build failed"

**Causa:** Error de compilación
**Solución:** Probar build localmente primero

## 📝 Mejores Prácticas

### 1. Commits Atómicos

```bash
# ✅ Correcto: Cambio de dependencias en un commit
git add package.json pnpm-lock.yaml
git commit -m "feat: agregar TanStack Query"

# ❌ Incorrecto: Separar los cambios
git add package.json
git commit -m "feat: agregar TanStack Query"
# (olvidando el lockfile)
```

### 2. Verificación Pre-Deploy

```bash
# Siempre probar build antes de push
pnpm run build

# Verificar que no haya cambios sin commitear
git status
```

### 3. Manejo de Versiones

```bash
# Para actualizar dependencias
npm update

# Para agregar nueva dependencia
npm install nombre-del-paquete

# Para agregar dev dependency
npm install --save-dev nombre-del-paquete
```

## 🆘 Soporte

### Si el deploy falla:

1. **Verificar logs de Vercel** para identificar el error exacto
2. **Revisar este documento** para soluciones comunes
3. **Probar localmente** con los mismos comandos que Vercel
4. **Verificar variables de entorno** en el dashboard de Vercel

### Comandos de Debug

```bash
# Verificar instalación de dependencias
npm list

# Verificar scripts disponibles
npm run

# Verificar configuración
npm config list
```

---

**Recordatorio:** Esta guía debe actualizarse cuando se realicen cambios en la configuración del proyecto o en los procesos de deploy.