@ECHO OFF
type %1 | node csvToJson.js  | pgfutter --pass admin --table "db_crimes" json