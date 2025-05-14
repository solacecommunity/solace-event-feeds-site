import React, { useState, useEffect, useContext } from 'react';
import {
  Button,
  List,
  InputNumber,
  Select,
  Collapse,
  Tooltip,
  message,
} from 'antd';
import { SessionContext } from '../util/helpers/solaceSession';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  ControlOutlined,
  LinkOutlined,
  CaretRightOutlined,
  CopyOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import solace, { SolclientFactory } from 'solclientjs';
import { generateEvent } from '@solace-labs/solace-data-generator';
import { faker } from '@faker-js/faker';

const MAX_START_DELAY = 10;
const MAX_RATE = 10;
const MAX_MSG_COUNT = 1000;

const PublishEvents = (props) => {
  const {
    session,
    sessionProperties,
    isAnyEventRunning,
    setIsAnyEventRunning,
    setStreamedEvents,
  } = useContext(SessionContext); // Use context

  const [isConnected, setIsConnected] = useState(false);
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
      maxMsgCount: parseInt(item.publishSettings.count, 10) || MAX_MSG_COUNT,
      dmqEligible: item?.messageSettings?.dmqEligible === undefined ? true : item?.messageSettings?.dmqEligible === 'true',
      ttl: parseInt(item?.messageSettings?.timeToLive || 0),
      appMessageId: item?.messageSettings?.appMessageId || null,
      userProperties: item?.messageSettings?.userProperties || null,
      partitionKeys: item?.messageSettings?.partitionKeys || null,
    };
  });
  const [activeEvents, setActiveEvents] = useState(events); // Track the active event

  const toggleControl = (item, e) => {
    // Skip toggling the control if the user is interacting with an input or select element
    const skipToggleClassNames = ['input', 'select', 'description'];
    let skip =
      typeof e.target.className == 'string'
        ? skipToggleClassNames.some((className) =>
          e.target.className.includes(className)
        )
        : null;
    if(e.target.dataset.icon == 'up' || e.target.dataset.icon == 'down')
      skip = true;

    if(skip) return;
    setActiveFeedConfig((prev) =>
      prev === item.eventName ? null : item.eventName
    );
  };

  const handleSampleCopy = (sampleEvent) => {
    navigator.clipboard.writeText(JSON.stringify(sampleEvent, null, 2));
    message.success({
      content: `Sample event Copied!`,
      style: {
        marginTop: '50vh',
      },
      duration: 2,
    });
  };

  const handleCopySub = (item) => {
    // Generate topic subscription string
    const matches = item.topic.match(/{[^}]*}/g);
    if(!matches) return item.topic;

    // Replace all occurrences except the last one with '*'
    const topicSub = item.topic.replace(/{[^}]*}/g, (match, index) => {
      return index === item.topic.lastIndexOf(matches[matches.length - 1])
        ? '>'
        : '*';
    });

    navigator.clipboard.writeText(topicSub);
    // message.success(`${topicSub} Copied!`);
    message.success({
      content: `${topicSub} Copied!`,
      style: {
        marginTop: '50vh',
      },
      duration: 2,
    });
  };

  useEffect(() => {
    setIsConnected(session ? true : false);
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

  // parser user properties
  const prepareUserPropertiesFromSettings = (value) => {
    const result = value.replace(/(['"])(.*?)\1/g, (match, quote, content) => {
      return quote + content.replace(/ /g, '$') + quote;
    });

    var props = result.split(' ');
    var propsMap = {};
    props.forEach((prop) => {
      const [key, val] = prop.split(':')
      if(key && val) {
        var _key = key.trim().replace(/\$/g, ' ');
        _key = _key.replace(/^['"]|['"]$/g, '');
        var _val = val.trim().replace(/\$/g, ' ');
        _val = _val.replace(/^['"]|['"]$/g, '');
        propsMap[_key] = _val;
      }
    })

    return propsMap
  }

  // get field value from the payload
  const getSourceFieldValue = (obj, path) => {
    if(path.indexOf('.') < 0)
      return obj[path];

    let field = path.substring(0, path.indexOf('.'));
    let fieldName = field.replaceAll('[0]', '');
    var remaining = path.substring(path.indexOf('.') + 1);
    return getSourceFieldValue(field.includes('[0]') ? obj[fieldName][0] : obj[field], remaining);
  }

  const startFeed = (item) => {
    if(activeEvents[item.eventName]?.active) return; // Don't start if already active

    const message = SolclientFactory.createMessage();
    sessionProperties.qos == 'direct'
      ? message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT)
      : message.setDeliveryMode(solace.MessageDeliveryModeType.PERSISTENT);

    message.setDMQEligible(activeEvents[item.eventName]?.dmqEligible);
    message.setTimeToLive(activeEvents[item.eventName]?.ttl || 0);
    if(activeEvents[item.eventName]?.appMessageId === 'uuid')
      message.setApplicationMessageId(faker.string.uuid());

    if(activeEvents[item.eventName]?.userProperties) {
      var userProperties = prepareUserPropertiesFromSettings(activeEvents[item.eventName]?.userProperties);
      let propertyMap = new solace.SDTMapContainer();
      Object.entries(userProperties).forEach((entry) => {
        propertyMap.addField(entry[0], solace.SDTField.create(solace.SDTFieldType.STRING, entry[1]));
      });
      message.setUserPropertyMap(propertyMap);
    }

    const delay = activeEvents[item.eventName]?.delay || 0; // Get delay, default to 0 if undefined
    let freq;
    switch(activeEvents[item.eventName]?.freq) {
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
        const { payload, topic } = generateEvent(item);
        if(activeEvents[item.eventName]?.partitionKeys) {
          var partitionKeys = activeEvents[item.eventName]?.partitionKeys;
          if(Array.isArray(partitionKeys) && !partitionKeys.length) {
            partitionKeys = '';
          }

          var fields = partitionKeys.split('|').map((field) => field.trim());
          if(fields.length) {
            let propertyMap = message.getUserPropertyMap();
            if(!propertyMap) propertyMap = new solace.SDTMapContainer();

            var values = [];
            fields.forEach((field) => {
              try {
                let val = getSourceFieldValue(payload, field);
                values.push(val);
              } catch(error) {
                Logger.logWarn(`failed to get field value for ${field} - ${error.toString()}`)
              }
            });
            var pKey1 = values.join('-');
            propertyMap.addField("JMSXGroupID", solace.SDTField.create(solace.SDTFieldType.STRING, pKey1));
            message.setUserPropertyMap(propertyMap);
          }
        }

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
        if(
          activeEvents[item.eventName]?.countSend >=
          activeEvents[item.eventName]?.maxMsgCount &&
          activeEvents[item.eventName]?.maxMsgCount !== -1
        ) {
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
    if(intervalId) {
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

  const updateMaxMsgCount = (item, maxMsgCount) => {
    setActiveEvents((prevState) => ({
      ...prevState,
      [item.eventName]: {
        ...prevState[item.eventName], // Keep all the other values
        maxMsgCount: maxMsgCount,
      },
    }));
  };

  const updateTTL = (item, ttl) => {
    setActiveEvents((prevState) => ({
      ...prevState,
      [item.eventName]: {
        ...prevState[item.eventName], // Keep all the other values
        ttl: ttl,
      },
    }));
  };

  const handleDisconnect = () => {
    if(session) {
      try {
        stopAllFeed();
        console.log('Disconnecting Solace session.');
        session.removeAllListeners();
        session.disconnect();
        console.log('Disconnected from Solace message router.');
      } catch(error) {
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

  const CopySubIcon = (item) => {
    return (
      <Tooltip title="Copy Subscription">
        <Button
          style={{
            color: '#00ad93',
            background: 'none',
            border: 'none',
          }}
          icon={<CopyOutlined />}
          onClick={(e) => handleCopySub(item, e)}
        />
      </Tooltip>
    );
  };

  const SampleEvent = (item) => {
    let { topic, payload } = generateEvent(item);
    let sampleEvent = {
      topic: topic,
      payload: payload,
    };
    return (
      <Tooltip
        title={
          <pre style={{ textAlign: 'left', margin: 0 }}>
            {JSON.stringify(sampleEvent, null, 2)}
          </pre>
        }
      >
        <Button
          style={{
            color: '#00ad93',
            background: 'none',
            border: 'none',
          }}
          icon={<FileSearchOutlined />}
          onClick={(e) => handleSampleCopy(sampleEvent, e)}
        />
      </Tooltip>
    );
  };

  const ConfigureEvent = (item) => {
    return (
      <Tooltip title="Configure Stream">
        <Button
          style={{
            color: activeFeedConfig === item.eventName ? '#00ad93' : 'black',
            background: 'none',
            border: 'none',
          }}
          variant="link"
          icon={<ControlOutlined />}
          onClick={(e) => toggleControl(item, e)}
        />
      </Tooltip>
    );
  };

  const Events = (
    <div>
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
        <div style={{ color: 'red', fontSize: '15px' }}>{errorConnection}</div>
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
                    !Object.values(activeEvents).some((event) => !event.active)
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
                  ConfigureEvent(item),
                  CopySubIcon(item),
                  SampleEvent(item),
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
                            defaultValue={activeEvents[item.eventName]?.rate}
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
                            Start Delay ({activeEvents[item.eventName]?.delay}{' '}
                            s)
                          </span>
                          <InputNumber
                            defaultValue={activeEvents[item.eventName]?.delay}
                            min={0}
                            max={MAX_START_DELAY}
                            step="1"
                            onChange={(delay) => updateDelay(item, delay)}
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
                          <span>Max number of messages (-1 for infinite)</span>
                          <InputNumber
                            defaultValue={
                              activeEvents[item.eventName]?.maxMsgCount
                            }
                            min={-1}
                            max={MAX_MSG_COUNT}
                            step="1"
                            onChange={(maxMsgCount) =>
                              updateMaxMsgCount(item, maxMsgCount)
                            }
                          />
                        </div>
                        <Tooltip
                          placement="bottomLeft"
                          title="Queue must respect TTL!"
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginTop: '8px',
                              textDecoration: 'underline',
                            }}
                          >
                            <span>
                              **Time to live, in milliseconds (0 for infinite)
                            </span>
                            <InputNumber
                              defaultValue={activeEvents[item.eventName]?.ttl}
                              min={0}
                              max={31536000009}
                              step="1"
                              onChange={(ttl) => updateTTL(item, ttl)}
                            />
                          </div>
                        </Tooltip>
                      </div>
                    ) : (
                      `${item.topic}`
                    )
                  }
                  onClick={(e) => toggleControl(item, e)}
                />
              </List.Item>
            )}
          />
        </InfiniteScroll>
      </div>
    </div>
  );

  return (
    <div>
      <Collapse
        items={[
          {
            key: 'events',
            label: 'Choose Event(s) in your Stream',
            children: Events,
          },
        ]}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: '20px', padding: '15px 0 0 0' }}
            rotate={isActive ? 90 : 0}
          />
        )}
        size="medium"
      />
    </div>
  );
};

export default PublishEvents;
