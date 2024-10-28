import React, { useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, InputGroup } from 'react-bootstrap';
import Layout from '../components/layout';
import SEO from '../components/seo';
import FeedCard from '../components/feedCard';
import CodeBlock from '../components/codeBlock';
import Loading from '../components/loading';
import { useStaticQuery, graphql } from 'gatsby';
import { TestCommunityFeeds, TestLocalFeeds } from '../util/helpers/testFeeds';

const initialState = {
  isLoading: true,
  communityFeeds: [],
  localFeeds: [],
  hostname: '',
  isLocal: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_FEEDS':
      return { ...state, communityFeeds: action.payload };
    case 'SET_LOCAL_FEEDS':
      return { ...state, localFeeds: action.payload };
    case 'SET_HOSTNAME':
      return { ...state, hostname: action.payload };
    case 'SET_LOCAL':
      return { ...state, isLocal: action.payload };
    default:
      return state;
  }
};

const IndexPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [search, setSearch] = useState('');

  const isLocal =
    state.hostname === 'localhost' ||
    state.hostname === '127.0.0.1' ||
    state.hostname === '' ||
    state.hostname.startsWith('192.168.') ||
    state.hostname.startsWith('10.');

  let localFeedsInfoFiles = [];
  if (isLocal) {
    // Query all the local feedinfo.json files
    const data = useStaticQuery(graphql`
      query {
        allFile(
          filter: {
            relativePath: { regex: "/feedinfo\\.json$/" }
          }
        ) {
          edges {
            node {
              childFeedsJson {
                name
                description
                img
                type
                contributor
                github
                domain
                tags
                lastUpdated
              }
            }
          }
        }
      }
    `);
    localFeedsInfoFiles = data.allFile.edges;
  }

  useEffect(() => {
    const fetchFeeds = async () => {
      var feedsData = await axios.get(
        'https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/EVENT_FEEDS.json'
      );
      feedsData = feedsData.data.filter((feed) => feed.type !== 'restapi_feed');

      // for local testing only //
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // feedsData = TestCommunityFeeds.filter((feed) => feed.type !== 'restapi_feed');
      // dispatch({ type: 'SET_FEEDS', payload: TestCommunityFeeds });
      // for local testing only //

      dispatch({ type: 'SET_FEEDS', payload: feedsData });
      dispatch({ type: 'SET_LOCAL', payload: isLocal });

      if (isLocal) {
        console.log('Running local UI');
        const localFeeds = localFeedsInfoFiles.map(
          (file) => file.node.childFeedsJson
        );
        dispatch({ type: 'SET_LOCAL_FEEDS', payload: localFeeds });
        // dispatch({ type: 'SET_LOCAL_FEEDS', payload: TestLocalFeeds });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    if (typeof window !== 'undefined') {
      dispatch({ type: 'SET_HOSTNAME', payload: window.location.hostname });
    }

    fetchFeeds();
  }, [state.hostname]);

  return (
    <Layout>
      <SEO title="Solace Feeds" />
      <section id="intro">
        <Container className="pt6 pb5">
          <Row className="tc">
            <Col>
              <h1>Solace Event Feeds</h1>
              <p>
                This site provides a curated set of feeds that make it easy to
                start publishing events to a{' '}
                <a
                  href="https://solace.com/products/event-broker/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solace PubSub+ Event Broker
                </a>
                . Each feed contains a simplified set of events representing a
                domain or use case, and many were generated directly from a
                design in{' '}
                <a
                  href="https://solace.com/products/portal/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PubSub+ Event Portal
                </a>{' '}
                using the app’s AsyncAPI doc.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section id="feeds-section">
        {state.isLoading ? (
          <Loading section="Community feeds" />
        ) : (
          <Container className="pb5">
            <InputGroup className="mt3 mb3">
              <input
                type="text"
                className="form-control"
                placeholder="Search Community Feeds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <h2 className="mt4">Community Feeds</h2>
            <Row className="mt3">
              {state.communityFeeds
                .filter((item) => {
                  if (search.toLowerCase() === '') {
                    return item;
                  } else {
                    return (
                      item.name.toLowerCase().includes(search.toLowerCase()) ||
                      item.domain.toLowerCase().includes(search.toLowerCase())
                    );
                  }
                })
                .map((feed, index) => (
                  <Col
                    key={index}
                    xs={12}
                    sm={12}
                    md={4}
                    lg={4}
                    xl={4}
                    xxl={3}
                    className="mt3 mb3"
                  >
                    <FeedCard feed={feed} index={index} isLocal={false} />
                  </Col>
                ))}
            </Row>
          </Container>
        )}

        {state.isLocal && (
          <Container className="pb5">
            <h2 className="mt4">Local Feeds</h2>
            <Row>
              {state.localFeeds.map((feed, index) => (
                <Col
                  key={index}
                  xs={12}
                  sm={12}
                  md={4}
                  lg={4}
                  xl={4}
                  xxl={3}
                  className="mt3 mb3"
                >
                  <FeedCard feed={feed} index={index} isLocal={true} />
                </Col>
              ))}
            </Row>
          </Container>
        )}
      </section>

      <section id="contribute">
        <Container className="pt6 pb5">
          <Row>
            <Col>
              <h1>How to Contribute</h1>
              <h2>1. Download STM</h2>
              <p>MacOS</p>
              <CodeBlock
                language="bash"
                value={`brew tap SolaceLabs/stm \nbrew install stm`}
              />
              <p>Linux (or WSL on Windows) </p>
              <CodeBlock
                language="bash"
                value={`echo "deb [arch=amd64 trusted=yes] https://raw.githubusercontent.com/SolaceLabs/apt-stm/master stm main" /\n| sudo tee  /etc/apt/sources.list.d/solace-stm-test.list\nsudo apt-get update\nsudo apt-get install stm
`}
              />
              <p>
                Visit the{' '}
                <a
                  href="https://github.com/SolaceLabs/solace-tryme-cli"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solace TryMe CLI GitHub page
                </a>{' '}
                for more infomraiton.
              </p>
              <h2>2. Generate your own feed</h2>
              <CodeBlock language="bash" value={`stm feed generate`} />
              <h2>3. Configure your own feed</h2>
              <CodeBlock language="bash" value={`stm feed configure`} />
              <h2>4. Contribute the feed</h2>
              <CodeBlock language="bash" value={`stm feed contribute`} />
              <p>
                Visit the{' '}
                <a
                  href="https://solace.community/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solace Community forum
                </a>{' '}
                for more discussions.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </Layout>
  );
};

export default IndexPage;
