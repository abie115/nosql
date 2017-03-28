@ECHO OFF
for /r %1 %%f in (*.csv) do  type %%f | node csvToJson.js  | pgfutter --pass admin --table "db_crimes" json
