import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AcademicProgress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get('/auth/academic-progress/');
        setProgress(response.data);
      } catch (error) {
        console.error('Error fetching academic progress:', error);
        setError('Failed to load academic progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return <div className="loading">Loading academic progress...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!progress) {
    return <div className="no-data">No progress data available</div>;
  }

  return (
    <div className="academic-progress-page">
      <h1>Academic Progress</h1>
      <p className="page-description">Track your completed courses, credits, and graduation requirements.</p>

      <div className="progress-overview">
        <div className="progress-card">
          <h3>Credit Progress</h3>
          <div className="progress-circle">
            <div className="progress-value">{Math.round(progress.progressPercentage)}%</div>
          </div>
          <p>{progress.completedCredits} / {progress.totalCredits} Credits Completed</p>
        </div>

        <div className="progress-card">
          <h3>Current Level</h3>
          <p className="level-number">Level {progress.currentLevel}</p>
          <p>Academic Year</p>
        </div>

        <div className="progress-card">
          <h3>Status</h3>
          <p className={`status ${progress.progressPercentage >= 75 ? 'good' : progress.progressPercentage >= 50 ? 'average' : 'poor'}`}>
            {progress.progressPercentage >= 75 ? 'On Track' : progress.progressPercentage >= 50 ? 'Needs Improvement' : 'At Risk'}
          </p>
        </div>
      </div>

      <div className="progress-details">
        <div className="detail-section">
          <h3>Progress Breakdown</h3>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-labels">
              <span>0 Credits</span>
              <span>{progress.totalCredits} Credits</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Requirements Check</h3>
          <ul className="requirements-list">
            <li className={progress.completedCredits >= progress.totalCredits * 0.75 ? 'completed' : 'pending'}>
              Complete 75% of total credits ({Math.round(progress.totalCredits * 0.75)} credits)
            </li>
            <li className={progress.currentLevel >= 4 ? 'completed' : 'pending'}>
              Reach final year (Level 4+)
            </li>
            <li className="pending">
              Maintain minimum GPA of 2.0
            </li>
            <li className="pending">
              Complete all core courses
            </li>
          </ul>
        </div>
      </div>

      <div className="progress-actions">
        <button className="btn-primary">View Detailed Transcript</button>
        <button className="btn-secondary">Download Progress Report</button>
      </div>
    </div>
  );
};

export default AcademicProgress;
