import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Universities = () => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    api.get('/universities/').then(response => setUniversities(response.data));
  }, []);

  return (
    <div className="universities">
      <h1>Universities</h1>
      <div className="university-list">
        {universities.map(univ => (
          <div key={univ.id} className="university-card">
            <h2>{univ.name}</h2>
            <p>{univ.city}, {univ.country}</p>
            <p>{univ.contact_email}</p>
            {univ.website && <a href={univ.website} target="_blank" rel="noopener noreferrer">Visit Website</a>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Universities;