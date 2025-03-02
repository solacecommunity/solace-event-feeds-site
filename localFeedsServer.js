// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const app = express();
const PORT = 8081;
app.use(cors());

const feedsPath = process.env.STM_HOME
  ? path.resolve(process.env.STM_HOME)
  : path.resolve(process.env.HOME, '.stm/feeds');

app.use(cors()); // Enable CORS

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
        const feedAnalysisPath = path.join(
          feedsPath,
          dir.name,
          'analysis.json'
        );

        return new Promise((resolve) => {
          // Read feedinfo.json, feedrules.json, and analysis.json in parallel
          Promise.all([
            fs.promises.readFile(feedInfoPath, 'utf8').catch(() => null),
            fs.promises.readFile(feedRulesPath, 'utf8').catch(() => null),
            fs.promises.readFile(feedAnalysisPath, 'utf8').catch(() => null),
          ]).then(([feedInfoData, feedRulesData, feedAnalysisData]) => {
            if (feedInfoData || feedRulesData || feedAnalysisData) {
              try {
                const feedInfo = feedInfoData ? JSON.parse(feedInfoData) : null;
                const feedRules = feedRulesData
                  ? JSON.parse(feedRulesData)
                  : null;
                const feedAnalysis = feedAnalysisData
                  ? JSON.parse(feedAnalysisData)
                  : null;
                const specFilePath = path.join(
                  feedsPath,
                  dir.name,
                  feedAnalysis?.fileName || ''
                );
                fs.promises
                  .readFile(specFilePath, 'utf8')
                  .then((specFileData) => {
                    let specFile = null;
                    try {
                      specFile = JSON.parse(specFileData);
                    } catch (jsonParseError) {
                      try {
                        specFile = yaml.load(specFileData);
                      } catch (yamlParseError) {
                        specFile = null;
                      }
                    }
                    resolve({
                      directory: dir.name,
                      feedinfo: feedInfo,
                      feedrules: feedRules,
                      analysis: feedAnalysis,
                      specFile: specFile,
                    });
                  })
                  .catch(() => {
                    resolve({
                      directory: dir.name,
                      feedinfo: feedInfo,
                      feedrules: feedRules,
                      analysis: feedAnalysis,
                      specFile: null,
                    });
                  });
              } catch (parseError) {
                resolve(null); // Ignore parsing errors
              }
            } else {
              resolve(null); // No data found for this directory
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
