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
import { TestFeedMetadata } from '../util/helpers/testFeeds';
import { Button, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import asyncApiLogo from '../images/asyncapi-logo.png';
import solaceEPLogo from '../images/solace-ep.png';
import ExportEPModal from '../modals/export';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Toaster } from 'react-hot-toast';

const feedMetadata = {
  fakerRules: [],
  feedInfo: [],
  feedRules: [],
  // For AsyncAPI feeds
  analysis: [],
  feedSchemas: [],
  specFile: [],
  // For REST API feeds
  feedAPI: [],
  specFileURL: '',
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FAKER_RULES':
      return { ...state, fakerRules: action.payload };
    case 'SET_SPEC_FILE':
      return { ...state, specFile: action.payload };
    case 'SET_SPEC_FILE_URL':
      return { ...state, specFileURL: action.payload };
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
  const modal = useModal(ExportEPModal);
  const openExportModal = () => {
    modal.show({ specFile: state.specFile });
  };
  const downloadSpecFile = () => {
    const blob = new Blob([JSON.stringify(state.specFile, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.specFile.info.title.replace(/ /g, '_') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchGithubFeedInfo = async () => {
      // Query all the feed metadata

      // var feedFakerRules = await axios.get(
      //   `https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/fakerrules.json`
      // );
      // dispatch({ type: 'SET_FAKER_RULES', payload: feedFakerRules.data });

      var githubFiles = await axios.get(
        `https://api.github.com/repos/solacecommunity/solace-event-feeds/contents/${encodeURIComponent(feed.name)}`
      );

      dispatch({
        type: 'SET_SPEC_FILE_URL',
        payload: githubFiles.data[0].download_url,
      });
      var specFile = await axios.get(githubFiles.data[0].download_url);
      dispatch({ type: 'SET_SPEC_FILE', payload: specFile.data });

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
      const feeds = await axios.get('http://127.0.0.1:8081/feeds');
      let feedDetails = feeds.data.find((f) => f.directory === feed.name);

      dispatch({ type: 'SET_FEED_RULES', payload: feedDetails['feedrules'] });
      dispatch({ type: 'SET_FEED_INFO', payload: feedDetails['feedinfo'] });
      dispatch({ type: 'SET_FEED_API', payload: feedDetails['feedapi'] });
    };

    feed.isLocal == 'true' ? fetchLocalFeedInfo() : fetchGithubFeedInfo();
  }, []);

  return (
    <NiceModal.Provider>
      <Toaster position="bottom-center" reverseOrder={false} />
      <Layout>
        <SEO title={`${feed.name} Stream`} />
        <section id="feedBanner">
          <Container className="pt6 pb3">
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
          <Tooltip title="Export to Solace Event Portal">
            <Button
              style={{
                background: 'none',
                border: 'none',
                padding: '0 30px 0 0',
              }}
              onClick={() => openExportModal()}
            >
              <img
                src={solaceEPLogo}
                alt="Solace PS+ Event Portal Logo"
                style={{
                  height: '30px',
                  position: 'absolute',
                }}
              />
            </Button>
          </Tooltip>
          <Tooltip title="Open in AsyncAPI Studio">
            <Button
              style={{
                background: 'none',
                border: 'none',
                padding: '0 40px 0 30px',
              }}
              onClick={() =>
                window.open(
                  `https://studio.solace.dev/?specURL=${state.specFileURL}`,
                  '_blank'
                )
              }
            >
              <img
                src={asyncApiLogo}
                alt="AsyncAPI Logo"
                style={{
                  height: '30px',
                  position: 'absolute',
                }}
              />
            </Button>
          </Tooltip>
          <Tooltip title="Download AsyncAPI Spec">
            <Button
              shape="round"
              icon={<DownloadOutlined />}
              style={{
                height: '30px',
                position: 'absolute',
              }}
              onClick={downloadSpecFile}
            ></Button>
          </Tooltip>
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
    </NiceModal.Provider>
  );
};

export default FeedPage;
