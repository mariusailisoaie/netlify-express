const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

process.env.SILENCE_EMPTY_LAMBDA_WARNING = true;

router.get('/getRateLimit', async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/rate_limit', { headers: { 'Authorization': `Token ${ process.env.GITHUB_TOKEN }` } });
    res.json(response.data.rate);
  } catch (error) {
    res.json(error);
  }
});

router.post('/getCommits', async (req, res) => {
  const { owner, repo } = req.body;
  const allCommits = [];

  try {
    const commits = await axios.get(`https://api.github.com/repos/${ owner }/${ repo }/commits?page=1&per_page=100`, { headers: { 'Authorization': `Token ${ process.env.GITHUB_TOKEN }` } });

    if (commits.headers.link) {
      const linkLength = parseInt(commits.headers.link.split(',')[1].split('?page=')[1].split('&')[0]);

      for (let i = 1; i < linkLength + 1; i++) {
        const commitsPerPage = await axios.get(`https://api.github.com/repos/${ owner }/${ repo }/commits?page=${ i }&per_page=100`, { headers: { 'Authorization': `Token ${ process.env.GITHUB_TOKEN }` } });
        allCommits.push(commitsPerPage.data);
      }

      res.json([...allCommits.flat()]);
    } else {
      res.json([...commits.data]);
    }
  } catch (error) {
    res.json(error);
  }
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
