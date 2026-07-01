@echo off
echo ===============================
echo  中世紀探險遊戲 - 啟動器
echo ===============================
echo.
echo 正在檢查可用的伺服器...

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo 使用 Python 啟動伺服器...
    echo 請開啟瀏覽器前往: http://localhost:8080
    start http://localhost:8080
    python -m http.server 8080
    goto :end
)

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo 使用 Node.js 啟動伺服器...
    npm install -g http-server 2>nul
    echo 請開啟瀏覽器前往: http://localhost:8080
    start http://localhost:8080
    npx http-server . -p 8080
    goto :end
)

echo 找不到 Python 或 Node.js！
echo.
echo 請手動使用以下其中一種方式：
echo.
echo 方式 1: 安裝 Python，然後執行:
echo   python -m http.server 8080
echo.
echo 方式 2: 使用 VS Code 的 Live Server 擴充功能
echo   在 index.html 上按右鍵 -> Open with Live Server
echo.
pause

:end
pause
