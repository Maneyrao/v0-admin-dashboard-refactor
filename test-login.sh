#!/bin/bash

echo "🔍 Probando flujo completo de login..."
echo ""

echo "1️⃣ Verificando página de login:"
curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/admin/login
echo ""

echo "2️⃣ Probando redirección automática /login/admin:"
curl -I http://localhost:3000/login/admin 2>/dev/null | grep -E "(location|HTTP)"
echo ""

echo "3️⃣ Probando redirección con slash extra /admin/login/:"
curl -I http://localhost:3000/admin/login/ 2>/dev/null | grep -E "(location|HTTP)"
echo ""

echo "4️⃣ Verificando acceso a dashboard sin auth (debe mostrar skeleton):"
curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/admin
echo ""

echo ""
echo "✅ Pruebas básicas completadas. Prueba manual:"
echo "- Abre http://localhost:3000/admin/login"
echo "- Intenta login con credenciales"
echo "- Observa la consola para logs de token y SWR"