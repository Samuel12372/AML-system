import React, { useState } from 'react';
import axios from 'axios';

const EnableMFA = ({ userId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');

  const handleGenerateMFA = async () => {
    try {
      // Call the backend to generate the MFA secret and QR code
      const response = await axios.post(`http://localhost:8080/api/user/mfa/generate/${userId}`);

      // Set the QR code URL to display it on the frontend
      setQrCodeUrl(response.data.qrCodeUrl);
    } catch (err) {
      console.error('Error generating MFA', err);
      setError('Failed to generate MFA. Please try again.');
    }
  };

  return (
    <div>
      <h2>Enable MFA</h2>
      <button onClick={handleGenerateMFA}>Generate MFA QR Code</button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {qrCodeUrl && (
        <div>
          <h3>Scan the QR code with your authenticator app</h3>
          <img src={qrCodeUrl} alt="MFA QR Code" />
        </div>
      )}
    </div>
  );
};

export default EnableMFA;
