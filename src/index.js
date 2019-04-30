'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

const app = express();

const dataCache = {};

app.use(helmet());
app.use(helmet.noCache());

app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: true }));

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.status(200).send();
});

app.get('/calls', (req, res) => {
  res.send({
    number: dataCache.phoneNumber,
  });
});

app.post('/calls', (req, res) => {
  const { body } = req;
  dataCache.phoneNumber = body.phone_number;
  dataCache.digits = undefined;
  console.log(`Received call from ${body.phone_number}`);
  res.status(200).send();
});

app.get('/data', (req, res) => {
  res.send({
    digits: dataCache.digits,
  });
});

app.post('/data', (req, res) => {
  const { body } = req;
  dataCache.digits = body.digits;
  console.log(`User entered digits ${body.digits}`);
  res.status(200).send();
});

app.get('/alldata', (req, res) => {
  res.send({
    data: dataCache,
  });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
