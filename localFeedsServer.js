// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8081;
app.use(cors());  

const feedsPath = process.env.STM_HOME
  ? path.resolve(process.env.STM_HOME)
  : path.resolve(process.env.HOME, '.stm/feeds');

app.use(cors());  // Enable CORS

app.get('/feeds', (req, res) => {
  fs.readdir(feedsPath, { withFileTypes: true }, (err, entries) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read directory' });
      return;
    }

    const feedPromises = entries
      .filter((entry) => entry.isDirectory())
      .map((dir) => {
        const feedInfoPath = path.join(feedsPath, dir.name, 'feedinfo.json');
        const feedRulesPath = path.join(feedsPath, dir.name, 'feedrules.json');

        return new Promise((resolve) => {
          // Read feedinfo.json and feedrules.json in parallel
          Promise.all([
            fs.promises.readFile(feedInfoPath, 'utf8').catch(() => null),
            fs.promises.readFile(feedRulesPath, 'utf8').catch(() => null),
          ]).then(([feedInfoData, feedRulesData]) => {
            if (feedInfoData || feedRulesData) {
              try {
                const feedInfo = feedInfoData ? JSON.parse(feedInfoData) : null;
                const feedRules = feedRulesData ? JSON.parse(feedRulesData) : null;
                resolve({ directory: dir.name, feedinfo: feedInfo, feedrules: feedRules });
              } catch (parseError) {
                resolve(null);  // Ignore parsing errors
              }
            } else {
              resolve(null);  // No data found for this directory
            }
          });
        });
      });

    Promise.all(feedPromises).then((feeds) => {
      const validFeeds = feeds.filter((feed) => feed !== null);
      res.json(validFeeds);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
