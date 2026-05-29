@echo off
title Taller Motos - Servidores
echo Iniciando todos los servidores del proyecto...
echo.

echo [1/4] Iniciando Redis (cache y colas)...
start "Redis" "C:\Program Files\Redis\redis-server.exe"
timeout /t 2 /nobreak >nul

echo [2/4] Iniciando backend Laravel (puerto 8000 - 8 workers)...
start "Laravel Backend" cmd /k "cd /d "C:\Users\stiff\OneDrive\Desktop\Proyecto Integrador\backend" && set PHP_CLI_SERVER_WORKERS=8 && C:\Users\stiff\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe artisan serve --port=8000"
timeout /t 3 /nobreak >nul

echo [3/4] Iniciando Queue Worker (procesa notificaciones en background)...
start "Queue Worker" cmd /k "cd /d "C:\Users\stiff\OneDrive\Desktop\Proyecto Integrador\backend" && C:\Users\stiff\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe artisan queue:work redis --tries=3 --timeout=30"

echo [4/4] Iniciando frontend Ionic (puerto 5173)...
start "Ionic Admin" cmd /k "cd /d "C:\Users\stiff\OneDrive\Desktop\Proyecto Integrador\admin" && npm run dev"

echo.
echo ============================================
echo  SERVIDORES INICIADOS - Taller Motos
echo ============================================
echo   API + Web cliente : http://localhost:8000
echo   App Admin Ionic   : http://localhost:5173
echo   Redis             : puerto 6379
echo   Queue Worker      : procesando en background
echo ============================================
echo.
echo IMPORTANTE: No cierre ninguna de las ventanas negras.
echo Para detener todo, cierre esta ventana y las 4 ventanas de servidores.
pause
