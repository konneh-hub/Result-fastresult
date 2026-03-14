import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get(`/lecturers/${user.id}/courses/`).then(response => setCourses(response.data));
  }, [user]);

  return (
    <div className="dashboard">
      <h1>Lecturer Dashboard</h1>
      <div className="stats">
        <div>Assigned Courses: {courses.length}</div>
      </div>
      <nav>
        <ul>
          <li><a href="/lecturer/courses">Assigned Courses</a></li>
          <li><a href="/lecturer/upload-scores">Upload Scores</a></li>
          <li><a href="/lecturer/edit-results">Edit Results</a></li>
          <li><a href="/lecturer/submit-results">Submit Results</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;