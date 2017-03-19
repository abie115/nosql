@ECHO OFF
SET first=y
SET newfile=ukcrimes.csv
For /R D:\nosql\1\ukcrimes111201 %%F  IN (*.csv) do (
 if defined first (
    COPY /y "%%F" %newfile% >nul
    set "first="
  ) else (
    FOR /f "skip=1delims=" %%i IN (%%F) DO >> %newfile% ECHO %%i
  ))