import React, { useState, useEffect, useContext, useRef } from 'react';
import { InputGroup } from 'react-bootstrap';
import { SessionContext } from '../util/helpers/solaceSession';
import { Button, List, Tag } from 'antd';
import Collapsible from 'react-collapsible';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CopyOutlined } from '@ant-design/icons';

const MAX_RENDERED_MESSAGES = 100;

const Stream = () => {
  const { streamedEvents, setStreamedEvents } = useContext(SessionContext); // Use context
  const [fadeClass, setFadeClass] = useState('');
  const [showPayload, setShowPayload] = useState(false);
  const [copyText, setCopyText] = useState(null);
  const scrollableDivRef = useRef(null);
  const [search, setSearch] = useState('');

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
    if (streamedEvents.length > MAX_RENDERED_MESSAGES) {
      setStreamedEvents(streamedEvents.slice(MAX_RENDERED_MESSAGES));
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
            <div>
              <InputGroup className="mt3 mb3" style={{ maxWidth: '500px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter published streams on event name, payload, and topics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value.toLowerCase())}
                />
              </InputGroup>
            </div>
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
                    <Tag>
                      Displaying the last {MAX_RENDERED_MESSAGES} published
                      messages
                    </Tag>,
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
                  dataSource={streamedEvents.filter(
                    (item) =>
                      item.eventName
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      JSON.stringify(item.payload)
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      item.topic.toLowerCase().includes(search.toLowerCase())
                  )}
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
                          showPayload ? (
                            <pre
                              style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          ) : (
                            ''
                          )
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
