import React, { useState, useEffect, useContext, useRef } from 'react';
import { SessionContext } from '../util/helpers/solaceSession';
import { Button, List, Tag } from 'antd';
import Collapsible from 'react-collapsible';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CopyOutlined } from '@ant-design/icons';

const Stream = () => {
  const { streamedEvents, setStreamedEvents } = useContext(SessionContext); // Use context
  const [fadeClass, setFadeClass] = useState('');
  const [showPayload, setShowPayload] = useState(false);
  const [copyText, setCopyText] = useState(null);
  const scrollableDivRef = useRef(null);

  const handleCopy = (value) => {
    navigator.clipboard.writeText(JSON.stringify(value.payload, null, 2));
    setCopyText(`${value.eventName} Payload Copied!`);
  };

  useEffect(() => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop =
        scrollableDivRef.current.scrollHeight;
    }

    if (copyText) {
      setFadeClass('fade-in');
      const timer = setTimeout(() => {
        setFadeClass('fade-out');
        setCopyText(null);
      }, 2000); // Hide tooltip after 1 second

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [streamedEvents, copyText]);

  return (
    <div>
      <Collapsible
        trigger="Publishing Streams"
        open={streamedEvents.length > 0}
      >
        {streamedEvents.length > 0 ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '0 30px 0 0',
              }}
            >
              {copyText && (
                <span
                  className={fadeClass}
                  style={{
                    color: 'grey',
                    padding: '20px 0 0 0',
                    fontSize: '10px',
                  }}
                >
                  {copyText}
                </span>
              )}
              <List>
                <List.Item
                  actions={[
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => setStreamedEvents([])}
                    >
                      Clear
                    </Button>,
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => setShowPayload(!showPayload)}
                    >
                      {showPayload ? 'Hide Payload' : 'Show Payload'}
                    </Button>,
                  ]}
                ></List.Item>
              </List>
            </div>
            <div
              id="scrollableDiv"
              ref={scrollableDivRef}
              style={{
                height: 300,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <InfiniteScroll
                dataLength={streamedEvents.length}
                scrollableTarget="scrollableDiv"
              >
                <List
                  dataSource={streamedEvents}
                  renderItem={(event) => (
                    <List.Item
                      key={event.eventName}
                      actions={[
                        <Button
                          color="primary"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopy(event)}
                          style={{ background: 'none', border: 'none' }}
                        ></Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div style={{ padding: '10px 0 0 0' }}>
                            <Tag
                              color={event.tagColor}
                            >{` ${event.countSend} | ${event.eventName}`}</Tag>
                          </div>
                        }
                        title={event.topic}
                        description={
                          showPayload
                            ? 'Payload: ' +
                              JSON.stringify(event.payload, null, 2)
                            : ''
                        }
                      />
                    </List.Item>
                  )}
                />
              </InfiniteScroll>
            </div>
          </>
        ) : (
          <List>
            <List.Item>
              <List.Item.Meta
                title="No Streams Published"
                description="Publish messages to see them here. Connect to a broker and then choose the streams you want to publish"
              />
            </List.Item>
          </List>
        )}
      </Collapsible>
    </div>
  );
};

export default Stream;
