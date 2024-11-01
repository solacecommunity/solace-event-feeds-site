import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Loading from '../components/loading';
import BrokerConfig from '../components/brokerConfig';
import PublishEvents from '../components/publishEvents';
import Stream from '../components/stream';
import { Container, Row, Col } from 'react-bootstrap';
import { SolaceSession } from '../util/helpers/solaceSession';
import useGetFilesQuery from '../util/helpers/useGetFilesQuery';
import { TestFeedMetadata } from '../util/helpers/testFeeds';

const feedMetadata = {
  fakerRules: [],
  feedInfo: [],
  feedRules: [],
  // For AsyncAPI feeds
  analysis: [],
  feedSchemas: [],
  // For REST API feeds
  feedAPI: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FAKER_RULES':
      return { ...state, fakerRules: action.payload };
    case 'SET_FEED_INFO':
      return { ...state, feedInfo: action.payload };
    case 'SET_FEED_RULES':
      return { ...state, feedRules: action.payload };
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload };
    case 'SET_FEED_SCHEMAS':
      return { ...state, feedSchemas: action.payload };
    case 'SET_FEED_API':
      return { ...state, feedAPI: action.payload };
    default:
      return state;
  }
};

const FeedPage = ({ location }) => {
  const [state, dispatch] = useReducer(reducer, feedMetadata);
  // for local testing only //
  // const [state, dispatch] = useReducer(reducer, TestFeedMetadata);

  const params = new URLSearchParams(location.search);
  const feed = {
    name: params.get('name') || '',
    isLocal: params.get('isLocal') || false,
    type: params.get('type') || '',
  };

  let localFeedFiles = null;
  if (feed.isLocal == 'true') {
    localFeedFiles = useGetFilesQuery(feed.name);
  }

  useEffect(() => {
    const fetchGithubFeedInfo = async () => {
      // Query all the feed metadata

      // var feedFakerRules = await axios.get(
      //   `https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/fakerrules.json`
      // );
      // dispatch({ type: 'SET_FAKER_RULES', payload: feedFakerRules.data });

      var feedInfo = await axios.get(
        `https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/feedinfo.json`
      );
      dispatch({ type: 'SET_FEED_INFO', payload: feedInfo.data });

      var feedRules = await axios.get(
        `https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/feedrules.json`
      );
      dispatch({ type: 'SET_FEED_RULES', payload: feedRules.data });

      if (feed.type === 'asyncapi_feed') {
        // var analysis = await axios.get(
        //   `https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/analysis.json`
        // );
        // dispatch({ type: 'SET_ANALYSIS', payload: analysis.data });
        // var feedSchemas = await axios.get(
        //   `https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/feedschemas.json`
        // );
        // dispatch({ type: 'SET_FEED_SCHEMAS', payload: feedSchemas.data });
      } else if (feed.type === 'restapi_feed') {
        var feedAPI = await axios.get(
          `https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/feedapi.json`
        );
        dispatch({ type: 'SET_FEED_API', payload: feedAPI.data });
      }
    };

    const fetchLocalFeedInfo = async () => {
      let feedRulesFile = localFeedFiles.find(
        (file) => file.name === 'feedrules'
      );
      var feedRules = feedRulesFile
        ? await axios.get(feedRulesFile.publicURL)
        : null;
      dispatch({ type: 'SET_FEED_RULES', payload: feedRules.data });

      let feedInfoFile = localFeedFiles.find(
        (file) => file.name === 'feedinfo'
      );
      var feedInfo = feedInfoFile
        ? await axios.get(feedInfoFile.publicURL)
        : null;
      dispatch({ type: 'SET_FEED_INFO', payload: feedInfo.data });

      let feedAPIFile = localFeedFiles.find((file) => file.name === 'feedapi');
      var feedAPI = feedAPIFile ? await axios.get(feedAPIFile.publicURL) : null;
      feedAPI
        ? dispatch({ type: 'SET_FEED_API', payload: feedAPI.data })
        : null;
    };

    feed.isLocal == 'true' ? fetchLocalFeedInfo() : fetchGithubFeedInfo();
  }, []);

  return (
    <Layout>
      <SEO title={`${feed.name} Stream`} />
      <section id="intro">
        <Container className="pt6 pb5">
          <Row className="tc">
            <Col>
              <h1>{feed.name.replace(/_/g, ' ')}</h1>
              {state.feedInfo.length === 0 ? (
                <Loading section="Description" />
              ) : (
                <div>{state.feedInfo.description}</div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      <SolaceSession>
        <Container className="pb5">
          <Row className="mt3">
            <BrokerConfig />
          </Row>

          {feed.type === 'asyncapi_feed' ? (
            state.feedRules.length === 0 ? (
              <Loading section="Events" />
            ) : (
              <Row className="mt3">
                <PublishEvents feedRules={state.feedRules} />
              </Row>
            )
          ) : feed.type === 'restapi_feed' ? (
            state.feedAPI.length === 0 ? (
              <Loading section="Events" />
            ) : (
              <Row className="mt3">
                <p> REST APIs Not yet supported</p>
              </Row>
            )
          ) : null}
          <Row className="mt3">
            <Stream />
          </Row>
          {/* <Row className="mt3">
            <TopicTester testData={}/>
          </Row> */}
        </Container>
      </SolaceSession>
    </Layout>
  );
};

export default FeedPage;
