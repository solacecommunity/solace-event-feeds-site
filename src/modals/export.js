import React, { useState, useEffect } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Modal, Row, Col, Select, Switch, Button } from 'antd';
import toast from 'react-hot-toast';
import useSettingsStore from '../util/helpers/localStorage';

const ExportEPModal = NiceModal.create(({ specFile }) => {
  const [importDomain, setImportDomain] = useState('');
  const [versionStrategy, setVersionStrategy] = useState('MAJOR');
  const [exportsEventsOnly, setExportEventsOnly] = useState(false);
  const [disableCascadeUpdate, setDisableCascadeUpdate] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [apiLogs, setApiLogs] = useState('');
  const modal = useModal();
  const { epToken, epRegion } = useSettingsStore();
  const [epAppDomains, setEpAppDomain] = useState([]);
  const IMPORTER_URL =
    'https://ep-asyncapi-importer.cfapps.ca10.hana.ondemand.com/importer';

  async function getApplicationDomains() {
    const response = await fetch(
      `${IMPORTER_URL}/appdomains?urlRegion=${epRegion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          epToken: btoa(epToken),
        }),
      }
    );
    if (!response.ok) {
      console.log(response);
      toast.error("Couldn't fetch application domains");
    }
    const domains = (await response.json()).applicationDomains;
    setEpAppDomain(domains);
  }

  const isEPTokenSet = () => {
    return epToken !== '';
  };

  const exportSpec = () => {
    toast.promise(
      (async function () {
        const appDomainID = epAppDomains.find(
          (domain) => domain.name === importDomain
        )?.id;
        if (!appDomainID) {
          throw new Error('Application Domain ID not found');
        }

        const fetchWithTimeout = (url, options, timeout = 10000) => {
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              reject(new Error('Request timed out'));
            }, timeout);

            fetch(url, options)
              .then((response) => {
                clearTimeout(timer);
                response.json().then((data) => {
                  setApiLogs(JSON.stringify(data, null, 2));
                });
                resolve(response);
              })
              .catch((err) => {
                clearTimeout(timer);
                setApiLogs(err.message);
                reject(err);
              });
          });
        };

        const response = await fetchWithTimeout(
          `${IMPORTER_URL}?appDomainId=${appDomainID}&urlRegion=${epRegion}&newVersionStrategy=${versionStrategy}&eventsOnly=${exportsEventsOnly}&disableCascadeUpdate=${disableCascadeUpdate}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              epToken: btoa(epToken),
              asyncApiSpec: btoa(JSON.stringify(specFile)),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      })(),
      {
        loading: 'Exporting spec file to Event Portal...',
        success: 'Application exported!',
        error: (err) => err.message,
      }
    );
  };

  useEffect(() => {
    isEPTokenSet() ? getApplicationDomains() : null;
  }, []);

  return (
    <Modal
      title="Export to Solace Event Portal"
      open={modal.visible}
      onOk={exportSpec}
      onCancel={() => modal.hide()}
      cancelText="Cancel"
      okText="Export"
      maskClosable={true}
      closable={true}
      width={650}
      okButtonProps={{ disabled: !isEPTokenSet() || importDomain === '' }}
    >
      <Row>
        {!isEPTokenSet() && (
          <p style={{ color: 'red' }}>
            EP Token is not set. Please set it in the settings.
          </p>
        )}
      </Row>
      <Row style={{ padding: '20px 0 0 0' }}>
        <Col>
          <p>Target Application Domain*</p>
        </Col>
        <Col>
          <div style={{ padding: '0 0 0 130px' }}>
            <Select
              placeholder="Select a domain"
              onChange={(value) => setImportDomain(value)}
              options={epAppDomains.map((domain) => ({
                value: domain.name,
                label: domain.name,
              }))}
            />
          </div>
        </Col>
      </Row>
      <Row style={{ padding: '20px 0 0 0' }}>
        <Col>
          <p>Increment version strategy</p>
        </Col>
        <Col>
          <div style={{ padding: '0 0 0 130px' }}>
            <Select
              placeholder="Select Version Increment Strategy"
              defaultValue="Major"
              onChange={(value) => setVersionStrategy(value)}
              options={[
                { value: 'MAJOR', label: 'Major' },
                { value: 'MINOR', label: 'Minor' },
                { value: 'PATCH', label: 'Patch' },
              ]}
            />
          </div>
        </Col>
      </Row>
      <Row style={{ padding: '20px 0 0 0' }}>
        <Col>
          <div style={{ padding: '0 10px 0 0' }}>
            <Switch
              checked={exportsEventsOnly}
              onChange={(value) => setExportEventsOnly(value)}
            />
          </div>
        </Col>
        <Col>
          <p>Export Events only</p>
        </Col>
      </Row>
      <Row style={{ padding: '20px 0 0 0' }}>
        <Col>
          <div style={{ padding: '0 10px 0 0' }}>
            <Switch
              checked={disableCascadeUpdate}
              onChange={(value) => setDisableCascadeUpdate(value)}
            />
          </div>
        </Col>
        <Col>
          <p>Disable cascade update</p>
        </Col>
      </Row>
      <Button
        variant="link"
        color={showLogs ? 'red' : 'primary'}
        onClick={() => setShowLogs((oldValue) => !oldValue)}
      >
        {showLogs ? 'Hide logs' : 'Show logs'}
      </Button>
      {showLogs && (
        <pre className="text-xs  bg-gray-100 p-2 rounded overflow-x-auto">
          {apiLogs}
        </pre>
      )}
    </Modal>
  );
});

export default ExportEPModal;
