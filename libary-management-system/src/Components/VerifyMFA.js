import React, { useState } from 'react';
import axios from 'axios';

const VerifyMFA = ({ userId }) => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleVerifyMFA = async (e) => {
    e.preventDefault();

    try {
      // Send the token to the backend for verification
      const response = await axios.post('http://localhost:8080/api/user/mfa/verify', {
        id: userId,
        token
      });

      setMessage(response.data.message);
      setError('');
    } catch (err) {
      console.error('Error verifying MFA', err);
      setMessage('');
      setError(err.response.data.message || 'Error verifying MFA');
    }
  };

  return (
    <div>
      <h2>Verify MFA</h2>
      <form onSubmit={handleVerifyMFA}>
        <div>
          <label htmlFor="token">Enter the MFA Token</label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter MFA Token"
            required
          />
        </div>
        <button type="submit">Verify Token</button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default VerifyMFA;
