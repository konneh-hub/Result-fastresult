import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Home = () => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    api.getUniversities().then(response => setUniversities(response.data));
  }, []);

  return (
    <div className="home">
      <h1>Welcome to Student Result Management System</h1>
      <p>Manage academic results efficiently across multiple universities.</p>
      <h2>Featured Universities</h2>
      <ul>
        {universities.map(univ => (
          <li key={univ.id}>{univ.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;