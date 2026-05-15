import React, { useState } from 'react';
import './Employee.css';
import './Git.css';
import HeaderSidebar_admin from './HeaderSidebar_admin.jsx';
import ClaimForm from './ClaimForm.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002';

const ClaimDetail = () => {
  const [searchClaimNumber, setSearchClaimNumber] = useState('');
  const [claim, setClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const fetchClaimDetail = async (claimNumber) => {
    const url = `/api/claim-details?claimNumber=${encodeURIComponent(claimNumber)}`;
    try {
      const response = await fetch(url);
      setDebugInfo(`${url} -> ${response.status}`);
      if (response.status === 404) {
        return { notFound: true };
      }
      if (!response.ok) {
        return { error: new Error(`Unable to fetch claim details (${response.status}) from ${url}`) };
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      setDebugInfo(`${url} -> ERROR: ${error.message}`);
      return { error };
    }
  };

  const handleSearch = async () => {
    setError('');
    setClaim(null);
    const trimmedClaimNumber = searchClaimNumber.trim();

    if (!trimmedClaimNumber) {
      setError('Please enter Claim Number');
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchClaimDetail(trimmedClaimNumber);

      if (result && result.data) {
        setClaim(result.data);
      } else if (result && result.notFound) {
        setError('Claim not found');
      } else {
         setError(result.error?.message || 'Claim not found');
      }
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to fetch claim details');
    } finally {
      setIsLoading(false);
    }
  };

  const searchSection = (
    <div className="search-wrapper">
      <h1 className="portal-title">Claim Detail</h1>
      <div className="search-section no-print" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '240px' }}>
          <label htmlFor="claimNumberSearch">Claim Number</label>
          <input
            id="claimNumberSearch"
            type="text"
            value={searchClaimNumber}
            onChange={(e) => setSearchClaimNumber(e.target.value)}
            placeholder="Enter Claim No"
          />
        </div>
        <button className="claimform" onClick={handleSearch} disabled={isLoading} style={{ minWidth: '130px' }}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        <button className="claimform" onClick={() => { setClaim(null); setError(''); setSearchClaimNumber(''); }} style={{ minWidth: '130px' }}>
          Clear
        </button>
      </div>

      {error && <div style={{ color: '#d9534f', marginBottom: '20px' }}>{error}</div>}
      {debugInfo && (
        <div style={{ color: '#555', marginBottom: '20px', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
          <strong>Debug:</strong>
          <div>{debugInfo}</div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {claim ? (
        <ClaimForm 
           initialData={claim} 
           isReadOnly={true} 
           customSidebar={<HeaderSidebar_admin />} 
           headerComponent={searchSection} 
        />
      ) : (
        <div className="dashboard-container">
          <HeaderSidebar_admin />
          <main className="main-content">
             {searchSection}
             <div style={{ marginTop: '20px', color: '#555' }}>
               Enter a claim number and click Search to view the claim details.
             </div>
          </main>
        </div>
      )}
    </>
  );
};

export default ClaimDetail;
