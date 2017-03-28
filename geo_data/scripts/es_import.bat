@ECHO OFF
node mapping.js
for /r %1 %%f in (*.csv) do  type %%f | node csvToJson.js  | node importJsonToES.js
