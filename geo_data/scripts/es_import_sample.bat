@ECHO OFF
node es_mapping.js
type %1 | node csvToJson.js  | node es_importJson.js
