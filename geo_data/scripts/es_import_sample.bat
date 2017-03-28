@ECHO OFF
node mapping.js
type %1 | node csvToJson.js  | node importJsonToES.js
