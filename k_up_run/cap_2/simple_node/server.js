'use strict'; 

const express = require('express');

// Constantes
 
const PORT = 3000;
const HOST = '0.0.0.0';

//App
 
const app = express();
app.get('/', (req, res) => {
	res.send('Ola mundo!');
});

app.listen(PORT, HOST);
console.log(`Rodando em http://${HOST}:${PORT}`);
