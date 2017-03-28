@ECHO OFF
node es_mapping.js
for /r %1 %%f in (*.csv) do  type %%f | node csvToJson.js  | node es_importJson.js
