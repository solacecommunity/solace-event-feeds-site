class IFeed {
  feedName = undefined;
  feed = {};

  // CONSTRUCTOR

  /**
   * @param {string} feedName - event feed name
   */
  constructor (feedName) {
    this.feedName = feedName;
  }

  /**
   * Initialize feed: Handle all initialization operations
   */
  initialize () {
    return false; // implementation should define the initialization
  }

  /**
   * @param {string} param
   */
  setFeedParam (param, value) {
    this.feed[param] = value;
  }

  /**
   * @param {string} param
   * 
   * @return {string}
   */
  getFeedParam (param) {
    return this.feed[param]
  }


  /**
   * Get Feed Info
   * 
   * @return object, an object with feed information
   */
  getInfo () {
    return undefined;   // implementation should define the logic
  }

  /**
   * Get Send Messages
   * 
   * @return List<string>, a list of send messages
   */
  getSendMessages () {
    return [];
  }

  /**
   * Get Receive Messages
   * 
   * @return List<string>, a list of receive messages
   */
  getReceiveMessages () {
    return [];
  }

  // HELPER FUNCTIONS
  /**
   * @return {string}
   */
  printFeed () {
    return JSON.stringify( this, null, 2);
  }
}


class Feed extends IFeed {
  constructor(gitUrl) {
    super(gitUrl);
  }

  async initialize () {
    if (!this.feedName) {
      return ({
        status: false,
        message: "Feed name missing!"
      })
    }

    var info = await getCommunityFeed(communityUserName, communityRepoName, `${feedName}/feedinfo.json`);
    this.setFeedParam("info", info);
    var rules = await getCommunityFeed(communityUserName, communityRepoName, `${feedName}/feedrules.json`);
    this.setFeedParam("rules", rules);
    var schemas = await getCommunityFeed(communityUserName, communityRepoName, `${feedName}/feedschemas.json`);
    this.setFeedParam("schemas", schemas);
    var analysis = await getCommunityFeed(communityUserName, communityRepoName, `${feedName}/analysis.json`);
    this.setFeedParam("analysis", analysis);
  }

  getInfo () {
    var info = this.getFeedParam("info");
    if (info) return info;

    console.log(info);
    
    var analysis = this.getFeedParam("analysis");
    if (!analysis) {
      return ({
        status: false,
        message: "Feed not initialized!"
      })
    }

    info = {
      version: analysis.info.version,
      asyncApiFile: analysis.fileName,
      asyncApiVersion: analysis.version,
      appTitle: info.name,
      appDescription: analysis.info.description,
      appState: analysis.info["x-ep-state-name"],
      appDomainName: analysis.info["x-ep-application-domain-name"],
    }

    return info;
  }

  getReceiveMessages() {
    var messages = [];
    let rules = this.getFeedParam('rules');
    let analysis = this.getFeedParam('analysis');
    if (analysis && analysis.messages) {
      var msgNames = Object.keys(analysis.messages);
      msgNames.forEach(msg => {
        if (analysis.messages[msg].send?.length) {
          for (var i=0; i<analysis.messages[msg].send.length; i++) {
            var data = {
              messageName: msg,
              description: analysis.messages[msg].send[i].message.description,
              topicName: analysis.messages[msg].send[i].topicName,
              hasPayload: analysis.messages[msg].hasPayload,
              schema: analysis.messages[msg].schema,
            };

            if (rules) {
              var rule = rules.find(el => el.messageName === msg);
              data.count = rule ? rule.publishSettings.count : 20;
              data.interval = rule ? rule.publishSettings.interval : 1;
              data.delay = rule ? rule.publishSettings.delay : 0;
            }
            
            messages.push(data);
          }
        }
      })      
    }

    return messages;
  }
}

function printHello(str) {
  console.log('Hello', str);
}

async function getFeed(feedName) {
  var feed = new Feed(feedName);
  await feed.initialize();
  return feed;
}

async function readFile (path) {
  try {
    // const config = fs.readFileSync(path, 'utf-8')
    const config = await fetch(path, {mode: 'no-cors'})
                            .then(d => d.json());
    return config;
  } catch (error) {
    var errorMessage = `'read file failed: ${error.toString()} (${error.cause?.message} ? [${error.cause?.message}] : ''`;
    return {
      status: false,
      message: errorMessage
    }
  }
}

async function getCommunityFeed (owner, repo, path) { 
  let data = await fetch (
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  )
    .then (d => d.json ())
    .then (d =>
      fetch (
        `https://api.github.com/repos/${owner}/${repo}/git/blobs/${d.sha}`
      )
    )
    .then (d => d.json ())
    .then (d => JSON.parse (atob (d.content)));

  return data;
}