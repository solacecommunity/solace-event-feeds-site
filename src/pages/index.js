import React, { useEffect, useReducer } from "react"
import axios from 'axios';
import { Container, Row, Col } from "react-bootstrap"
import Layout from "../components/layout"
import SEO from "../components/seo"
import FeedCard from "../components/feedCard"

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

  const TestCommunityFeeds = [
    {
      "name": "Account_Management",
      "description": "Application for supporting account maintenance activities. Includes support for fraud detection.",
      "img": "./defaultfeed.png",
      "type": "asyncapi_feed",
      "contributor": "Solace Community",
      "github": "solacecommunity",
      "domain": "Banking",
      "tags": "Account Management, Fraud Detection",
      "lastUpdated": "2024-05-23T12:33:18.293Z"
    },
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
      "name": "Fake_London_Bus",
      "description": "Fake London Bus",
      "img": "./defaultfeed.png",
      "type": "asyncapi_feed",
      "contributor": "Giri Venkatesan",
      "github": "gvensan",
      "domain": "Transportation",
      "tags": "Bus, Control",
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
      "name": "Aviation - AirOps",
      "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtdB0qq-iGC7RpPzwdvrlgEq8haqrY-_QQd-Wg61qrdA&s",
      "description": "AirOps systems is resposible for complex management of flight scheduling and trip oversight, crew compliance and communication, customer data, charter and maintenance .",
      "github": "solacecommunity",
      "contributor": "Solace Community",
      "domain": "Aviation",
      "tags": "Gate Change",
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
      "tags": "Customer Management",
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
      "name": "Jokes",
      "description": "Random Jokes",
      "img": "./defaultfeed.png",
      "contributor": "Anonymous",
      "github": "",
      "domain": "Jokes",
      "tags": "Jokes",
      "lastUpdated": "2024-07-02T12:48:54.776Z"
    },
    {
      "type": "restapi_feed",
      "name": "StarWars",
      "description": "Star Wars API for the People End Point",
      "img": "https://lumiere-a.akamaihd.net/v1/images/image_5c51d8fe.jpeg",
      "contributor": "Tamimi",
      "github": "TamimiGithub",
      "domain": "StarWars",
      "tags": "starwars, fiction, movie, TV",
      "lastUpdated": "2024-08-01T12:55:54.776Z"
    },
    {
      "type": "asyncapi_feed",
      "name": "Shipping Service",
      "description": "A streaming service leveraging the solace Streams API. This service reacts to orders as they are created, updating the Shipping topic as notifications are received from the delivery company",
      "img": "https://cdn-icons-png.flaticon.com/512/411/411763.png",
      "contributor": "Tamimi",
      "github": "TamimiGithub",
      "domain": "Shipping",
      "tags": "Shipping",
      "lastUpdated": "2024-08-05T17:39:01.875Z",
      "contributed": true
    },
    {
      "type": "restapi_feed",
      "name": "Quotes from Alpha Vantage",
      "description": "A lightweight stock quote API, this service returns the latest price and volume information for a ticker of your choice.",
      "img": "https://miro.medium.com/v2/resize:fit:1400/1*UDPtLHUTpusvLU623P8Q4w.jpeg",
      "contributor": "Giri Venkatesan",
      "github": "gvensan",
      "domain": "Stocks",
      "tags": "Real-time, Delayd, Quotes",
      "lastUpdated": "2024-08-06T12:05:19.585Z",
      "contributed": true
    },
    {
      "type": "asyncapi_feed",
      "name": "FraudService",
      "description": "This service searches for potentially fraudulent transactions by calculating the total value of orders for a customer within a time period, then checks to see if this is over a configured limit. \n\n[GitHub](https://github.com/confluentinc/solace-streams-examples/blob/5.0.0-post/src/main/java/io/confluent/examples/streams/microservices/FraudService.java)",
      "img": "https://banner2.cleanpng.com/20180531/kwp/kisspng-computer-icons-data-analysis-techniques-for-fraud-detector-5b0fe22874a146.1442294115277675924777.jpg",
      "contributor": "Tamimi",
      "github": "Tamimigithub",
      "domain": "Fullfillment",
      "tags": "fraud, fullfillment, e-commerce",
      "lastUpdated": "2024-08-07T14:23:05.763Z",
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
      // await new Promise(resolve => setTimeout(resolve, 1000));
      // var feedsData = TestCommunityFeeds;
      // for local testing only //

      var feedsData = await axios.get('https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/EVENT_FEEDS.json')
      console.log(feedsData.data);
      dispatch({ type: 'SET_FEEDS', payload: feedsData.data });

      const isLocal = state.hostname === 'localhost' || state.hostname === '127.0.0.1' || state.hostname === '' || state.hostname.startsWith('192.168.') || state.hostname.startsWith('10.');
      dispatch({ type: 'SET_LOCAL', payload: isLocal });

      if (isLocal) {
        console.log("Running local UI");
        dispatch({ type: 'SET_LOCAL_FEEDS', payload: TestLocalFeeds });
      }

      // for local testing only //
      // dispatch({ type: 'SET_FEEDS', payload: feedsData });
      // for local testing only //
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
              <p className="pt3 pb3 f5">
                This site provides published event feeds that can be used to generate events. This will give you a guided, hands-on experience with the Solace PubSub+ Platform. Each feed exposes events relevant to specific industry domains or business contexts as exposed by the AsyncAPI document of application in the Event Portal.
              <br />
                Discuss your Event Feed experience in the Developer Community
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {state.isLoading ? (
        <div>Loading community feeds...</div>
      ) : (
        <Container className="pb5">
          <h2 className="mt4">Community Feeds</h2>
          <Row className="mt3">
            {state.communityFeeds.map((feed, index) => (
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
                <FeedCard feed={feed} index={index} />
              </Col>
            ))}
          </Row>
        </Container>
      )}

    </Layout>
  )
}

export default IndexPage