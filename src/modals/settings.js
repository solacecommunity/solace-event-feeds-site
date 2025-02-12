import React, { useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Modal, Button } from 'antd';
import toast from 'react-hot-toast';
import useSettingsStore from '../util/helpers/localStorage';

const SettingsModal = NiceModal.create(() => {
  const modal = useModal();
  const { epToken, epRegion, setEpToken, setEpRegion } = useSettingsStore();
  const [maskedToken, setMaskedToken] = useState('*'.repeat(epToken.length));
  const IMPORTER_URL =
    'https://ep-asyncapi-importer.cfapps.ca10.hana.ondemand.com/importer';

  const handleTokenChange = (e) => {
    const newToken = e.target.value;
    setEpToken(newToken);
    setMaskedToken('*'.repeat(newToken.length));
  };

  const handleRegionChange = (e) => {
    setEpRegion(e.target.value);
  };

  const handleClearStorage = () => {
    localStorage.removeItem('feeds-settings');
    setEpToken('');
    setMaskedToken('');
  };

  return (
    <Modal
      title="Solace Event Portal Configuration"
      open={modal.visible}
      onOk={() => modal.hide()}
      onCancel={() => modal.hide()}
      cancelText="Cancel"
      okText="Save"
      maskClosable={true}
      closable={true}
    >
      <div>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="region">Choose your Solace Cloud Region:</label>
          <select
            id="region"
            name="region"
            style={{ width: '100%', padding: '8px', marginTop: '8px' }}
            onChange={handleRegionChange}
            value={epRegion}
          >
            <option value="US">US</option>
            <option value="SG">SG</option>
            <option value="AU">AU</option>
            <option value="EU">EU</option>
          </select>
        </div>
        <div>
          <label htmlFor="epToken">Input your Solace Event Portal Token:</label>
          <input
            type="text"
            id="epToken"
            name="epToken"
            placeholder={
              epToken !== '' ? maskedToken : 'Solace PubSub+ Event Portal Token'
            }
            style={{ width: '100%', padding: '8px', marginTop: '8px' }}
            onChange={handleTokenChange}
            value={maskedToken}
          />
        </div>
        <Button
          color="cyan"
          variant="solid"
          className="mt-4 font-bold px-4 rounded p-2"
          onClick={() => {
            toast.promise(
              (async () => {
                const response = await fetch(
                  `${IMPORTER_URL}/validate-token?urlRegion=${epRegion}`,
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
                const result = await response.json();
                if (result.msgs[0] !== 'SUCCESS') {
                  throw new Error('Token verification failed');
                }
              })(),
              {
                loading: 'Verifying token...',
                success: 'Token verified!',
                error: 'Token verification failed',
              }
            );
          }}
        >
          Verify Token
        </Button>
        <Button color="volcano" variant="solid" onClick={handleClearStorage}>
          Clear Storage
        </Button>
      </div>
    </Modal>
  );
});

export default SettingsModal;
