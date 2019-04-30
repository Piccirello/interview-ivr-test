'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

function init(app) {
  app.use(helmet());
  app.use(helmet.noCache());

  app.use(bodyParser.json({limit: '1mb'}));
  app.use(bodyParser.urlencoded({extended: true }));

  app.use(cors());

  app.use(morgan('combined'));  // log http requests

  app.use(express.static('public'))
}

function loadRoutes(app) {
  app.get('/', (req, res) => {
    res.status(200).send();
  });

  app.post('/clear', (req, res) => {
    clearCache();
    res.send({});
  });

  app.get('/calls', (req, res) => {
    res.send({
      number: data.phoneNumber,
    });
  });

  app.get('/data', (req, res) => {
    res.send({
      digits: data.digits,
    });
  });

  app.get('/alldata', (req, res) => {
    res.send({
      data,
    });
  });

  app.post('/calls', (req, res) => {
    const { body } = req;
    clearCache();
    data.phoneNumber = body.phone_number;

    res.status(200).send();
  });

  app.post('/data', (req, res) => {
    const { body } = req;
    data.digits = body.digits;

    res.status(200).send();
  });
}

const data = {};

function clearCache() {
  data.phoneNumber = undefined;
  data.digits = undefined;
}

const app = express();
init(app);
loadRoutes(app);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
