@ECHO OFF
for /r %1 %%f in (*.csv) do  type %%f | node geo_data/scripts/csvToJson.js  | pgfutter --pass admin --table "db_crimes" json
