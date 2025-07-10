@echo off
echo Starting Shopee Clone Development Server...
echo.
echo 🚀 Đang khởi động server với cấu hình tối ưu cho Windows...
echo.

REM Xóa cache cũ
if exist "node_modules\.vite*" (
    echo 🧹 Đang xóa cache cũ...
    rmdir /s /q "node_modules\.vite*"
)

REM Khởi động server
echo 🎯 Khởi động development server...
pnpm run dev:bypass

pause 