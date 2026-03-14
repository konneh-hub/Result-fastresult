import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.getFacultyResults(user.faculty_id).then(response => setResults(response.data));
  }, [user]);

  return (
    <div className="dashboard">
      <h1>Dean Dashboard</h1>
      <div className="stats">
        <div>Pending Results: {results.filter(r => r.status === 'pending').length}</div>
      </div>
      <nav>
        <ul>
          <li><a href="/dean/faculty-results">Faculty Results</a></li>
          <li><a href="/dean/approve-results">Approve Faculty Results</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;