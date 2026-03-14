import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.getSubmittedResults(user.university_id).then(response => setResults(response.data));
  }, [user]);

  return (
    <div className="dashboard">
      <h1>Exam Officer Dashboard</h1>
      <div className="stats">
        <div>Submitted Results: {results.length}</div>
      </div>
      <nav>
        <ul>
          <li><a href="/exam-officer/verify-results">Verify Results</a></li>
          <li><a href="/exam-officer/publish-results">Publish Results</a></li>
          <li><a href="/exam-officer/lock-results">Lock Results</a></li>
          <li><a href="/exam-officer/reports">Generate Reports</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;