const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

process.env.SILENCE_EMPTY_LAMBDA_WARNING = true;

router.get('/', (req, res) => {
  res.json({
    hello: 'hi!'
  });
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
