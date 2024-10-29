import React, { useState, useEffect, useContext } from 'react';
import Collapsible from 'react-collapsible';
import '../css/collapsable.css';
import { Button, List, InputNumber, Select } from 'antd';
import { SessionContext } from '../util/helpers/solaceSession';
import Faker from '../util/helpers/faker';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ControlOutlined, LinkOutlined } from '@ant-design/icons';
import solace, { SolclientFactory } from 'solclientjs';

const MAX_DELAY = 10;
const MAX_RATE = 10;

const PublishEvents = (props) => {
  const {
    session,
    sessionProperties,
    isAnyEventRunning,
    setIsAnyEventRunning,
    setStreamedEvents,
  } = useContext(SessionContext); // Use context

  const [isConnected, setIsConnected] = useState(false);
  const [disableForm, setdisableForm] = useState(true);
  const [errorConnection, setErrorString] = useState(undefined);
  const [activeFeedConfig, setActiveFeedConfig] = useState(null); // Track the active Control button
  const tagColors = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
  ];

  const feedRules = props.feedRules;
  const events = {};
  feedRules.map((item) => {
    // To set the initial active state of all the events to false
    events[item.eventName] = {
      active: false,
      topic: item.topic,
      rate: 1,
      freq: 'msg/s',
      delay: parseInt(item.publishSettings.delay, 10) || 0,
      intervalId: null,
      timeoutId: null,
      countSend: 0,
      tagColor: tagColors[Math.floor(Math.random() * tagColors.length)],
    };
  });
  const [activeEvents, setActiveEvents] = useState(events); // Track the active event
  const faker = new Faker(); // For fake data generation
  const toggleControl = (item) => {
    setActiveFeedConfig((prev) =>
      prev === item.eventName ? null : item.eventName
    );
  };

  useEffect(() => {
    setIsConnected(session ? true : false);
    setdisableForm(session ? false : true);
    setIsAnyEventRunning(
      Object.values(activeEvents).some((event) => event.active)
    );
  }, [session, activeEvents]); // This will run every time 'session' is updated

  const startAllFeed = () => {
    console.log('Start AllFeed');
    feedRules.map((item) => {
      startFeed(item);
    });
  };

  const stopAllFeed = () => {
    console.log('Stop AllFeed');
    feedRules.map((item) => {
      stopFeed(item);
    });
  };

  const startFeed = (item) => {
    if (activeEvents[item.eventName]?.active) return; // Don't start if already active

    const message = SolclientFactory.createMessage();
    sessionProperties.qos == 'direct'
      ? message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT)
      : message.setDeliveryMode(solace.MessageDeliveryModeType.PERSISTENT);

    const delay = activeEvents[item.eventName]?.delay || 0; // Get delay, default to 0 if undefined
    let freq;
    switch (activeEvents[item.eventName]?.freq) {
      case 'msg/s':
        freq = 1000;
        break;
      case 'msg/m':
        freq = 60000;
        break;
      case 'msg/h':
        freq = 3600000;
        break;
      default:
        freq = 1000; // Default to 1 second if undefined
    }

    let interval =
      activeEvents[item.eventName]?.rate > 1
        ? freq / activeEvents[item.eventName]?.rate
        : freq * activeEvents[item.eventName]?.rate;
    setActiveEvents((prevState) => ({
      ...prevState,
      [item.eventName]: {
        ...prevState[item.eventName],
        active: true,
      },
    }));

    // Start after the initial delay
    const timeoutId = setTimeout(() => {
      // Set up the interval after the delay
      const intervalId = setInterval(() => {
        const payload = faker.generateRandomPayload(item.payload);
        const topic = faker.generateRandomTopic(item, payload);
        sessionProperties.msgformat === 'text'
          ? message.setSdtContainer(
              solace.SDTField.create(
                solace.SDTFieldType.STRING,
                JSON.stringify(payload)
              )
            )
          : message.setBinaryAttachment(
              typeof payload === 'object' ? JSON.stringify(payload) : payload
            );
        message.setDestination(SolclientFactory.createTopicDestination(topic));

        console.log(
          `Publishing event ${item.eventName}: ${activeEvents[item.eventName].countSend}`
        );
        activeEvents[item.eventName].countSend += 1;
        session.send(message);

        // Update streamedEvents with each published event
        setStreamedEvents((prevEvents) => [
          ...prevEvents,
          {
            eventName: item.eventName,
            topic,
            payload,
            tagColor: activeEvents[item.eventName].tagColor,
            countSend: activeEvents[item.eventName].countSend,
          },
        ]);
      }, interval); // Calculate interval based on rate (messages per second)

      // Store the intervalId for stopping the feed later
      setActiveEvents((prevState) => ({
        ...prevState,
        [item.eventName]: {
          ...prevState[item.eventName],
          intervalId: intervalId,
          timeoutId: timeoutId, // Save timeoutId in case you need to cancel the delay
        },
      }));
    }, delay * 1000); // Convert delay to milliseconds
  };

  const stopFeed = (item) => {
    const intervalId = activeEvents[item.eventName]?.intervalId;
    const timeoutId = activeEvents[item.eventName]?.timeoutId;
    if (intervalId) {
      console.log(`Stopping Feed:`, item.eventName);
      clearInterval(intervalId); // Stop the interval
      clearTimeout(timeoutId); // Stop the timeout
      activeEvents[item.eventName].countSend = 0;
      setActiveEvents((prevState) => ({
        ...prevState,
        [item.eventName]: {
          ...prevState[item.eventName], // Keep all the other values
          active: false, // Set the event to active
          intervalId: null,
          timeoutId: null,
        },
      }));
    }
  };

  const updateRate = (item, rate) => {
    // const alreadyRunning = activeEvents[item.eventName].active;
    stopFeed(item);
    setActiveEvents((prevState) => ({
      ...prevState,
      [item.eventName]: {
        ...prevState[item.eventName], // Keep all the other values
        rate: parseFloat(rate),
      },
    }));
    // if(alreadyRunning) {
    //   console.log(activeEvents[item.eventName]?.active)
    //   startFeed(item);
    // }
  };

  const setFrequency = (item, freq) => {
    setActiveEvents((prevState) => ({
      ...prevState,
      [item.eventName]: {
        ...prevState[item.eventName],
        freq: freq,
      },
    }));
  };

  const updateDelay = (item, delay) => {
    stopFeed(item);
    setActiveEvents((prevState) => ({
      ...prevState,
      [item.eventName]: {
        ...prevState[item.eventName], // Keep all the other values
        delay: delay, // Set the event to active
      },
    }));
  };

  const getMaxDelay = (activeEvents) => {
    return Math.max(
      ...Object.values(activeEvents).map((event) => event.delay || MAX_DELAY)
    );
  };

  const handleDisconnect = () => {
    if (session) {
      try {
        stopAllFeed();
        console.log('Disconnecting Solace session.');
        session.removeAllListeners();
        session.disconnect();
        console.log('Disconnected from Solace message router.');
      } catch (error) {
        console.log(
          'Error disconnecting from Solace message router: ',
          error.toString()
        );
        setErrorString(
          'Error disconnecting from Solace message router: ',
          error.toString()
        );
      }
    }
  };

  return (
    <div>
      <Collapsible
        trigger="Choose Stream(s)"
        transitionTime={400}
        easing={'cubic-bezier(0.175, 0.885, 0.32, 2.275)'}
        style={{ flex: 1 }}
        open={!disableForm}
      >
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            paddingLeft: '10px',
          }}
        >
          <Button
            color="danger"
            variant="filled"
            shape="round"
            onClick={handleDisconnect}
            disabled={!isConnected || isAnyEventRunning}
          >
            {' '}
            Disconnect Broker{' '}
          </Button>
        </div>
        {errorConnection && (
          <div style={{ color: 'red', fontSize: '15px' }}>
            {errorConnection}
          </div>
        )}

        {/* List of events  */}
        <div
          id="scrollableDiv"
          style={{ height: 400, overflow: 'auto', padding: '0 16px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '0 30px 0 0',
            }}
          >
            <List>
              <List.Item
                actions={[
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={startAllFeed}
                    disabled={
                      !isConnected ||
                      !Object.values(activeEvents).some(
                        (event) => !event.active
                      )
                    }
                  >
                    Start All
                  </Button>,
                  <Button
                    color="danger"
                    variant="outlined"
                    onClick={stopAllFeed}
                    disabled={!isConnected || !isAnyEventRunning}
                  >
                    Stop All
                  </Button>,
                ]}
              >
                <List.Item.Meta title=" " description=" " />
              </List.Item>
            </List>
          </div>
          <InfiniteScroll
            dataLength={feedRules.length}
            scrollableTarget="scrollableDiv"
            style={{ display: 'flex', flexDirection: 'column-reverse' }}
          >
            <List
              dataSource={feedRules}
              renderItem={(item) => (
                <List.Item
                  key={item.eventName}
                  actions={[
                    <Button
                      color="primary"
                      variant="filled"
                      shape="round"
                      onClick={() => startFeed(item)}
                      disabled={
                        !isConnected || activeEvents[item.eventName].active
                      }
                    >
                      {' '}
                      Start{' '}
                    </Button>,
                    <Button
                      color="danger"
                      variant="filled"
                      shape="round"
                      onClick={() => stopFeed(item)}
                      disabled={!activeEvents[item.eventName].active}
                    >
                      {' '}
                      Stop{' '}
                    </Button>,
                    <Button
                      style={{
                        color:
                          activeFeedConfig === item.eventName
                            ? '#00ad93'
                            : 'black',
                        background: 'none',
                        border: 'none',
                      }}
                      variant="link"
                      icon={<ControlOutlined />}
                      onClick={() => toggleControl(item)}
                      disabled={!isConnected}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ padding: '10px 0 0 0' }}>
                        <LinkOutlined
                          style={{
                            fontSize: '15px',
                            color: activeEvents[item.eventName].timeoutId
                              ? '#00ad93'
                              : 'black',
                          }}
                        />
                      </div>
                    }
                    title={`${item.eventName} v${item.eventVersion}`}
                    description={
                      activeFeedConfig === item.eventName ? (
                        <div style={{ marginTop: '10px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <span>Message rate:</span>
                            <InputNumber
                              defaultValue="1"
                              min={0.5}
                              max={MAX_RATE}
                              step="0.5"
                              onChange={(rate) => updateRate(item, rate)}
                              stringMode
                            />
                            <Select
                              defaultValue="msg/s"
                              onChange={(freq) => setFrequency(item, freq)}
                              options={[
                                { value: 'msg/s', label: 'msg/s' },
                                { value: 'msg/m', label: 'msg/m' },
                                { value: 'msg/h', label: 'msg/h' },
                              ]}
                            />
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginTop: '8px',
                            }}
                          >
                            <span>
                              Delay ({activeEvents[item.eventName]?.delay} s)
                            </span>
                            <InputNumber
                              defaultValue={activeEvents[item.eventName]?.delay}
                              min={0}
                              max={getMaxDelay(activeEvents)}
                              step="1"
                              onChange={(delay) => updateDelay(item, delay)}
                            />
                          </div>
                        </div>
                      ) : (
                        `${item.topic}`
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </InfiniteScroll>
        </div>
      </Collapsible>
    </div>
  );
};

export default PublishEvents;