import React, { useEffect, useReducer, useState } from "react"
import axios from 'axios';
import { Container, Row, Col, InputGroup } from "react-bootstrap"
import Layout from "../components/layout"
import SEO from "../components/seo"
import FeedCard from "../components/feedCard"
import CodeBlock from '../components/codeBlock'; 
import Loading from "../components/loading"

const initialState = {
  isLoading: true,
  communityFeeds: [],
  localFeeds: [],
  hostname: "",
  isLocal: false
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
  const [search, setSearch] = useState("");

  const TestCommunityFeeds =  [
    {
        "name": "Point_of_Sale_System",
        "description": "Commercial off-the-shelf (COTS) Point of Sale (PoS) system that serves checkout areas for all stores within acme-retail.   Receives Product events from supply chain management domain to allow for price updates and restrictions on purchases.  Emits Retail Order events that allow for analytics and supply chain management decisions.",
        "img": "https://cdn-icons-png.flaticon.com/512/641/641813.png",
        "type": "asyncapi_feed",
        "contributor": "Giri Venkatesan",
        "github": "gvensan",
        "domain": "Retail",
        "tags": "PoS, Shopping, Retail",
        "lastUpdated": "2024-05-23T12:33:18.293Z"
    },
    {
        "name": "Aviation - ACARSEngine",
        "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtdB0qq-iGC7RpPzwdvrlgEq8haqrY-_QQd-Wg61qrdA&s",
        "title": "ACARSEngine",
        "description": "ACARS-Aircraft Communications Addressing and Reporting System is a digital datalink system for transmission of short messages between aircraft and ground stations via airband radio or satellite. ",
        "github": "solacecommunity",
        "contributor": "Solace Community",
        "domain": "Aviation",
        "tags": "Landing Status, Aircraft Status",
        "type": "asyncapi_feed",
        "lastUpdated": "2024-06-09T16:31:36.870Z"
    },
    {
        "name": "CRMSystem",
        "img": "https://assets.bizclikmedia.net/1800/3eb7889182dd47f70f445f0e16f3591a:e4b74fc371efa3cf6f5942192c548b8c/gettyimages-1259086543-0-jpg.webp",
        "title": "CRMSystem",
        "description": "Mange Customer information - Address Change, Birthday, Name and other personal information change management",
        "github": "gvensan",
        "contributor": "Giri Venkatesan",
        "domain": "CRM",
        "tags": "Address Change, Name Change, DOB Change",
        "type": "asyncapi_feed",
        "lastUpdated": "2024-06-09T16:31:36.870Z"
    },
    {
        "name": "Mining - HR Service",
        "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcymJMuurAmVekjFY_PKcTYLpBuLNg5ZIa5w&s",
        "title": "HR Service",
        "description": "HR services in mining are crucial for managing the distinct challenges posed by the industry, which operates in often remote and hazardous environments. These services ensure the effective recruitment, retention, and development of a skilled workforce equipped to meet operational demands. Key functions include conducting robust safety and skills training, overseeing compliance with labor laws and safety regulations, and implementing programs that promote employee well-being and job satisfaction.",
        "github": "solacecommunity",
        "contributor": "Solace Community",
        "domain": "Mining",
        "tags": "HR Service, Shift Management, Break Management",
        "type": "asyncapi_feed",
        "lastUpdated": "2024-06-09T16:31:36.870Z"
    },
    {
        "type": "restapi_feed",
        "name": "StarWars",
        "description": "Star Wars API for the People End Point. All the Star Wars data you've ever wanted: Planets, Spaceships, Vehicles, People, Films and Species -  From all SEVEN Star Wars films, Now with The Force Awakens data!",
        "img": "https://lumiere-a.akamaihd.net/v1/images/image_5c51d8fe.jpeg",
        "contributor": "Tamimi",
        "github": "TamimiGithub",
        "domain": "StarWars",
        "tags": "starwars, fiction, movie, TV",
        "lastUpdated": "2024-08-01T12:55:54.776Z"
    },
    {
        "type": "asyncapi_feed",
        "name": "Fraud-Detection",
        "description": "Application which scans and detects fradulent transactions in a banking domain",
        "img": "./defaultfeed.png",
        "contributor": "Hari-Rangarajan-Solace",
        "github": "Hari-Rangarajan-Solace",
        "domain": "Acme-Banking",
        "tags": "fraud detection, banking, solace broker, intelligent topics",
        "lastUpdated": "2024-08-14T07:30:29.801Z",
        "contributed": true
    },
    {
        "type": "asyncapi_feed",
        "name": "Shipping-Service",
        "description": "A streaming service leveraging the solace Streams API. This service reacts to orders as they are created, updating the Shipping topic as notifications are received from the delivery company",
        "img": "https://cdn-icons-png.flaticon.com/512/411/411763.png",
        "contributor": "Tamimi",
        "github": "TamimiGithub",
        "domain": "Shipping",
        "tags": "shipping, delivery, tracking",
        "lastUpdated": "2024-08-14T09:11:25.554Z",
        "contributed": true
    },
    {
        "type": "restapi_feed",
        "name": "Random-User-Generator",
        "description": "The random user generator provides realistic user data for testing and development purposes. The user's profile encompasses personal information such as email (kim.myre@example.com), login credentials, date of birth, and registration details. Additionally, it includes contact numbers, a unique identifier, and a set of profile pictures. The generator also specifies geographical coordinates and timezone information, offering a comprehensive, realistic user profile for various application scenarios.",
        "img": "https://xsgames.co/randomusers/assets/images/favicon.png",
        "contributor": "Giri Venkatesan",
        "github": "gvensan",
        "domain": "Random Data",
        "tags": "random user, fake data, fake profile",
        "lastUpdated": "2024-08-14T09:51:47.345Z",
        "contributed": true
    },
    {
        "type": "asyncapi_feed",
        "name": "Core-Banking",
        "description": "The Core Banking Application processes all transactions across bank accounts and automatically publishes the relevant event for each transaction. It ensures seamless, real-time management of all financial activities, enhancing operational efficiency and system integration",
        "img": "./defaultfeed.png",
        "contributor": "Hari-Rangarajan-Solace",
        "github": "HariRangarajan-Solace",
        "domain": "Acme-Banking",
        "tags": "banking, transactions generator, solace broker, intelligent topics",
        "lastUpdated": "2024-08-14T12:14:30.086Z",
        "contributed": true
    }
]

  const TestLocalFeeds = [
    {
      "name": "TEST LOCAL",
      "description": "TEST LOCAL DESCRIPTION",
      "img": "./defaultfeed.png",
      "type": "asyncapi_feed",
      "contributor": "Solace Community",
      "github": "solacecommunity",
      "domain": "Banking",
      "tags": "Account Management, Fraud Detection",
      "lastUpdated": "2024-05-23T12:33:18.293Z"
    }
  ]

  useEffect(() => {
    const fetchFeeds = async () => {
      // for local testing only //
      await new Promise(resolve => setTimeout(resolve, 1000));
      var feedsData = TestCommunityFeeds;
      feedsData = feedsData.filter(feed => feed.type !== 'restapi_feed');
      // for local testing only //

      // var feedsData = await axios.get('https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/EVENT_FEEDS.json')
      // feedsData = feedsData.data.filter(feed => feed.type !== 'restapi_feed');
      
      dispatch({ type: 'SET_FEEDS', payload: feedsData });

      const isLocal = state.hostname === 'localhost' || state.hostname === '127.0.0.1' || state.hostname === '' || state.hostname.startsWith('192.168.') || state.hostname.startsWith('10.');
      dispatch({ type: 'SET_LOCAL', payload: isLocal });

      if (isLocal) {
        console.log("Running local UI");
        dispatch({ type: 'SET_LOCAL_FEEDS', payload: TestLocalFeeds });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    if (typeof window !== "undefined") {
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
              <h1>Solace Feeds</h1>
              <p>
                This site provides a curated set of feeds that make it easy to start publishing events to a <a href="https://solace.com/products/event-broker/" target="_blank" rel="noopener noreferrer">Solace PubSub+ Event Broker</a>. Each feed contains a simplified set of events representing a domain or use case, and many were generated directly from a design in <a href="https://solace.com/products/portal/" target="_blank" rel="noopener noreferrer">PubSub+ Event Portal</a> using the app’s AsyncAPI doc.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section id="feeds-section">
        {state.isLoading ? (
          <Loading section="Community feeds"/>
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
                {state.communityFeeds.filter((item) => {
                  if (search.toLowerCase() === "") {
                    return item;
                  } else {
                    return item.name.toLowerCase().includes(search.toLowerCase()) || item.domain.toLowerCase().includes(search.toLowerCase())
                  }
                }).map((feed, index) => (
                  <Col key={index} xs={12} sm={12} md={4} lg={4} xl={4} xxl={3} className="mt3 mb3">
                    <FeedCard feed={feed} index={index}/>
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
                <Col key={index} xs={12} sm={12} md={4} lg={4} xl={4} xxl={3} className="mt3 mb3">
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
              <CodeBlock language="bash" value={`brew tap SolaceLabs/stm \nbrew install stm`} />
              <p>Linux (or WSL on Windows) </p>
              <CodeBlock language="bash" value={`echo "deb [arch=amd64 trusted=yes] https://raw.githubusercontent.com/SolaceLabs/apt-stm/master stm main" /\n| sudo tee  /etc/apt/sources.list.d/solace-stm-test.list\nsudo apt-get update\nsudo apt-get install stm
`} />
              <p>Visit the <a href="https://github.com/SolaceLabs/solace-tryme-cli" target="_blank" rel="noopener noreferrer">Solace TryMe CLI GitHub page</a> for more infomraiton.</p>
              <h2>2. Generate your own feed</h2>
              <CodeBlock language="bash" value={`stm feed generate`} />
              <h2>3. Configure your own feed</h2>
              <CodeBlock language="bash" value={`stm feed configure`} />
              <h2>4. Contribute the feed</h2>
              <CodeBlock language="bash" value={`stm feed contribute`} />
              <p>Visit the <a href="https://solace.community/" target="_blank" rel="noopener noreferrer">Solace Community forum</a> for more discussions.</p>
            </Col>
          </Row>
        </Container>
      </section>

    </Layout>
  )
}

export default IndexPage