import React, { useState, useEffect, useContext } from 'react';
import '../css/collapsable.css';
import { Row, Col, Form, Input, Button, Radio, Tooltip, Collapse } from 'antd';
import { UploadOutlined, CaretRightOutlined } from '@ant-design/icons';
import solace, { SolclientFactory } from 'solclientjs';
import { SessionContext } from '../util/helpers/solaceSession';

const factoryProps = new solace.SolclientFactoryProperties();
factoryProps.profile = solace.SolclientFactoryProfiles.version10_5;
SolclientFactory.init(factoryProps);
SolclientFactory.setLogLevel(solace.LogLevel.FATAL);

const BrokerConfig = () => {
  const { session, setSession, setSessionProperties, isAnyEventRunning } =
    useContext(SessionContext); // Use context
  const [isConnected, setIsConnected] = useState(session ? true : false);
  const [connecting, setConnecting] = useState(false);
  const [errorConnection, setErrorString] = useState(undefined);
  const [disableForm, setdisableForm] = useState(false);
  const [form] = Form.useForm();
  const [record, setRecord] = useState({
    url: 'ws://localhost:8008',
    vpn: 'default',
    username: 'default',
    password: 'default',
    qos: 'direct',
    msgformat: 'text',
    compression: false,
  });

  useEffect(() => {}, [session, record]);

  const onRecordChange = (value) => {
    setRecord((prevRecord) => ({ ...prevRecord, ...value }));
  };

  const handleConnect = (e) => {
    console.log('Connecting to the solace broker...');
    const { url, vpn, username, password, compression } = record;

    let sessionProperties;
    try {
      new URL(url); // Validate URL
      sessionProperties = {
        url: url,
        vpnName: vpn,
        userName: username,
        password: password,
        connectRetries: 0,
        reconnectRetries: 3,
        payloadCompressionLevel: compression ? 9 : 0,
      };
    } catch (error) {
      setErrorString('Invalid URL: ' + url);
      setConnecting(false);
      return;
    }

    setConnecting(true);
    const newSession = solace.SolclientFactory.createSession(sessionProperties);

    newSession.on(solace.SessionEventCode.UP_NOTICE, () => {
      console.log('Connected to Solace message router.');
      setErrorString(undefined);
      setIsConnected(true);
      setConnecting(false);
      setdisableForm(true);
      setSession(newSession);
      setSessionProperties({
        qos: record.qos,
        msgformat: record.msgformat,
        compression: record.compression,
      });
    });

    newSession.on(
      solace.SessionEventCode.CONNECT_FAILED_ERROR,
      (sessionEvent) => {
        console.log(
          'Connection failed to the message router: ' + sessionEvent.infoStr
        );
        setErrorString(sessionEvent.infoStr);
        setIsConnected(false);
        setConnecting(false);
        setdisableForm(false);
      }
    );

    newSession.on(solace.SessionEventCode.DISCONNECTED, () => {
      console.log('Disconnected From broker.');
      setIsConnected(false);
      setConnecting(false);
      setdisableForm(false);
      setSession(null);
    });

    try {
      newSession.connect();
    } catch (error) {
      setErrorString(
        'Error connecting to Solace message router: ',
        error.toString()
      );
    }
  };

  const handleDisconnect = () => {
    if (session) {
      try {
        console.log('Disconnecting Solace session.');
        session.removeAllListeners();
        session.disconnect();
        setIsConnected(false);
        setConnecting(false);
      } catch (error) {
        setErrorString(
          'Error disconnecting from Solace message router: ',
          error.toString()
        );
      }
    }
  };

  const ConnectionForm = (
    <Form
      layout="vertical"
      form={form}
      name="basic"
      disabled={disableForm}
      initialValues={record}
      onValuesChange={onRecordChange}
    >
      <Row gutter={20}>
        <Col span={6}>
          <Form.Item
            label="URL"
            name="url"
            rules={[
              {
                required: true,
                message: 'Please input the URL',
              },
              {
                type: 'url',
                message: 'Please enter a valid URL',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="VPN" name="vpn">
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Username" name="username">
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Password" name="password">
            <Input.Password />
          </Form.Item>
        </Col>
        <Col span={5}></Col>
        <Col span={6}>
          <Form.Item label="Quality of Service" name="qos">
            <Radio.Group>
              <Radio value="direct">Direct</Radio>
              <Radio value="guaranteed">Guaranteed</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Message Format" name="msgformat">
            <Radio.Group>
              <Radio value="text">Text Message</Radio>
              <Radio value="byte">Bytes Message</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={6}>
          {/* <Form.Item label="Payload Compression" name="compression">
            <Switch />
          </Form.Item> */}
        </Col>
        <Col span={3}></Col>
        <Col span={6}>
          <Form.Item>
            <Button
              type="primary"
              shape="round"
              onClick={handleConnect}
              disabled={isConnected}
            >
              {connecting ? 'Connecting...' : 'Connect'}
            </Button>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item>
            <Button
              color="danger"
              variant="solid"
              shape="round"
              onClick={handleDisconnect}
              disabled={!isConnected || isAnyEventRunning}
            >
              Disconnect
            </Button>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item>
            <Tooltip
              title={
                <pre>
                  {JSON.stringify(
                    {
                      url: 'web_url',
                      vpn: 'msg_vpn',
                      username: 'username',
                      password: 'password',
                    },
                    null,
                    2
                  )}
                </pre>
              }
            >
              <Button
                type="primary"
                shape="round"
                icon={<UploadOutlined />}
                onClick={() => document.getElementById('fileInput').click()}
              >
                Load Config File
              </Button>
            </Tooltip>
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const config = JSON.parse(event.target.result);
                    if (
                      typeof config !== 'object' ||
                      !config.url ||
                      !config.vpn ||
                      !config.username ||
                      !config.password
                    ) {
                      throw new Error('Invalid configuration file format.');
                    }
                    setRecord(config);
                    form.setFieldsValue(config);
                  } catch (error) {
                    let errorString = 'Error parsing config file: ' + error;
                    setErrorString(errorString);
                  }
                };
                reader.readAsText(file);
              }}
            />
          </Form.Item>
        </Col>
        {errorConnection && (
          <Col span={24}>
            <Form.Item>
              <div style={{ color: 'red' }}>{errorConnection}</div>
            </Form.Item>
          </Col>
        )}
      </Row>
    </Form>
  );

  return (
    <div>
      <Collapse
        items={[
          {
            key: 'config',
            label: 'Configure Broker',
            children: ConnectionForm,
          },
        ]}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: '20px', padding: '15px 0 0 0' }}
            rotate={isActive ? 90 : 0}
          />
        )}
        size="medium"
        defaultActiveKey={['config']}
      />
    </div>
  );
};

export default BrokerConfig;
