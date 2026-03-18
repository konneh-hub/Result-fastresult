import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    api.get('/universities/').then(response => setUniversities(response.data));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-inner">
          <h1>FastResult — Student Result Management</h1>
          <p className="lead">A lightweight platform to publish, review and manage student results across universities and colleges.</p>
          <div className="hero-buttons">
            <Link to="/register/student" className="btn btn-primary btn-sm">Get Started</Link>
            <Link to="/about" className="btn btn-outline">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="featured">
        <h2>Featured Universities</h2>
        <ul>
          {universities.map(univ => (
            <li key={univ.id}>{univ.name}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Home;