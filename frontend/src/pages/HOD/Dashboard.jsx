import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch department courses
    api.get(`/departments/${user.department_id}/courses/`).then(response => setCourses(response.data));
  }, [user]);

  return (
    <div className="dashboard">
      <h1>Head of Department Dashboard</h1>
      <div className="stats">
        <div>Total Courses: {courses.length}</div>
      </div>
      <nav>
        <ul>
          <li><a href="/hod/assign-courses">Assign Courses</a></li>
          <li><a href="/hod/verify-results">Verify Results</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;