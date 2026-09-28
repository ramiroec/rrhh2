#!/bin/bash
# Script de inicio para TEKI RRHH

# Directorio raíz del proyecto (absoluto, independiente del CWD)
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Iniciando TEKI RRHH..."
echo "   Directorio: $DIR"

# Backend
echo ""
echo "▶ Iniciando backend en puerto 3001..."
cd "$DIR/backend" && npm run dev &
BACKEND_PID=$!

# Esperar a que el backend levante
sleep 3

# Frontend
echo ""
echo "▶ Iniciando frontend en puerto 5173..."
cd "$DIR/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ TEKI RRHH corriendo:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "   Email:    admin@teki.com.py"
echo "   Password: admin123"
echo ""
echo "Presioná Ctrl+C para detener ambos servicios."

# Manejar cierre limpio
cleanup() {
  echo ""
  echo "Deteniendo servicios..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID 2>/dev/null
  wait $FRONTEND_PID 2>/dev/null
  echo "✓ Servicios detenidos."
  exit 0
}
trap cleanup SIGINT SIGTERM

wait
