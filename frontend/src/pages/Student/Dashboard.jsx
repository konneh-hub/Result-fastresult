import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [gpa, setGpa] = useState(0);

  useEffect(() => {
    api.get(`/students/${user.id}/gpa/`).then(response => {
      // Assuming the response contains GPA records, get the latest one
      const gpaRecords = response.data;
      if (gpaRecords.length > 0) {
        setGpa(gpaRecords[gpaRecords.length - 1].gpa);
      }
    });
  }, [user]);

  return (
    <div className="dashboard">
      <h1>Student Dashboard</h1>
      <div className="stats">
        <div>Current GPA: {gpa}</div>
      </div>
      <nav>
        <ul>
          <li><a href="/student/results">View Results</a></li>
          <li><a href="/student/download-slip">Download Result Slip</a></li>
          <li><a href="/student/gpa-cgpa">View GPA and CGPA</a></li>
          <li><a href="/student/history">Academic History</a></li>
          <li><a href="/student/profile">Profile</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;