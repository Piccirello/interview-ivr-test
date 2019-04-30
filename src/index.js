#!/usr/bin/env node

'use strict';

//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// define the Express app
const app = express();

// enhance app security with Helmet
app.use(helmet());
app.use(helmet.noCache());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json({limit: '1mb'}));

// TODO should we make this more strict? only allow app.aiinsurance.io? config: https://github.com/expressjs/cors
// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.status(200).send();
});

app.get('/calls', (req, res) => {
  console.log('GET /calls');
  console.log(req.body);
  res.status(200).send();
});

app.post('/calls', (req, res) => {
  console.log('POST /calls');
  console.log(req.body);
  res.status(200).send();
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
