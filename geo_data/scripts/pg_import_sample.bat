@ECHO OFF
type %1 | node geo_data/scripts/csvToJson.js  | pgfutter --pass admin --table "db_crimes" json