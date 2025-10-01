@echo off
echo Definindo senha do PostgreSQL como 'postgres123'...
echo.

cd "C:\Program Files\PostgreSQL\17\bin"
psql.exe -U postgres -d postgres -f "C:\Users\carlo\Documents\Poker Grinder's Edge\poker-grinders-edge\backend\set-password.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCESSO! Senha definida como: postgres123
    echo ========================================
) else (
    echo.
    echo Erro ao definir senha
    echo Codigo de erro: %ERRORLEVEL%
)

pause