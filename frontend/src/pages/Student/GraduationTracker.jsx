import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import api from '../../services/api';

const GraduationTracker = () => {
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGraduationProgress = async () => {
      try {
        // Use the academic progress endpoint
        const response = await api.get('/auth/academic-progress/');
        const progressData = response.data;

        // Mock graduation requirements
        setProgress({
          ...progressData,
          requirements: {
            totalCredits: 120,
            coreCredits: 60,
            electiveCredits: 30,
            generalCredits: 30,
            minGPA: 2.0,
            minCGPA: 2.0
          },
          completed: {
            coreCredits: 45,
            electiveCredits: 20,
            generalCredits: 25
          }
        });
      } catch (error) {
        console.error('Error fetching graduation progress:', error);
        // Mock data
        setProgress({
          completedCredits: 90,
          totalCredits: 120,
          currentLevel: 4,
          progressPercentage: 75,
          requirements: {
            totalCredits: 120,
            coreCredits: 60,
            electiveCredits: 30,
            generalCredits: 30,
            minGPA: 2.0,
            minCGPA: 2.0
          },
          completed: {
            coreCredits: 45,
            electiveCredits: 20,
            generalCredits: 25
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGraduationProgress();
  }, [user]);

  if (loading) {
    return <div className="loading">Loading graduation progress...</div>;
  }

  if (error || !progress) {
    return <div className="error">{error || 'No progress data available'}</div>;
  }

  const remainingCredits = progress.requirements.totalCredits - progress.completedCredits;
  const isEligible = progress.progressPercentage >= 75 && progress.currentLevel >= 4;

  return (
    <div className="graduation-tracker-page">
      <h1>Graduation Tracker</h1>
      <p className="page-description">Track your progress towards graduation requirements.</p>

      <div className="graduation-status">
        <div className={`status-card ${isEligible ? 'eligible' : 'not-eligible'}`}>
          <h3>Graduation Status</h3>
          <p className="status-text">
            {isEligible ? 'Eligible for Graduation' : 'Not Yet Eligible'}
          </p>
          <div className="progress-circle">
            <div className="progress-value">{Math.round(progress.progressPercentage)}%</div>
          </div>
        </div>
      </div>

      <div className="requirements-overview">
        <h3>Degree Requirements</h3>
        <div className="requirements-grid">
          <div className="requirement-item">
            <h4>Total Credits</h4>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(progress.completedCredits / progress.requirements.totalCredits) * 100}%` }}
              ></div>
            </div>
            <p>{progress.completedCredits} / {progress.requirements.totalCredits} credits</p>
          </div>

          <div className="requirement-item">
            <h4>Core Courses</h4>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(progress.completed.coreCredits / progress.requirements.coreCredits) * 100}%` }}
              ></div>
            </div>
            <p>{progress.completed.coreCredits} / {progress.requirements.coreCredits} credits</p>
          </div>

          <div className="requirement-item">
            <h4>Elective Courses</h4>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(progress.completed.electiveCredits / progress.requirements.electiveCredits) * 100}%` }}
              ></div>
            </div>
            <p>{progress.completed.electiveCredits} / {progress.requirements.electiveCredits} credits</p>
          </div>

          <div className="requirement-item">
            <h4>General Education</h4>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(progress.completed.generalCredits / progress.requirements.generalCredits) * 100}%` }}
              ></div>
            </div>
            <p>{progress.completed.generalCredits} / {progress.requirements.generalCredits} credits</p>
          </div>
        </div>
      </div>

      <div className="additional-requirements">
        <h3>Additional Requirements</h3>
        <ul className="requirements-list">
          <li className={progress.currentLevel >= 4 ? 'completed' : 'pending'}>
            Complete all 4 years of study
            <span className="status">Current: Level {progress.currentLevel}</span>
          </li>
          <li className="completed">
            Maintain minimum GPA of {progress.requirements.minGPA}
            <span className="status">Current: 3.2</span>
          </li>
          <li className="completed">
            Maintain minimum CGPA of {progress.requirements.minCGPA}
            <span className="status">Current: 3.1</span>
          </li>
          <li className="pending">
            Complete internship/practicum requirements
            <span className="status">Pending</span>
          </li>
          <li className="pending">
            Submit final project/thesis
            <span className="status">Pending</span>
          </li>
        </ul>
      </div>

      <div className="graduation-timeline">
        <h3>Expected Graduation</h3>
        <div className="timeline">
          <div className="timeline-item completed">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Year 1-2 Foundation</h4>
              <p>Completed basic courses and general education</p>
            </div>
          </div>
          <div className="timeline-item completed">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Year 3 Core Specialization</h4>
              <p>Major-specific courses and electives</p>
            </div>
          </div>
          <div className={`timeline-item ${progress.currentLevel >= 4 ? 'current' : 'pending'}`}>
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Year 4 Advanced & Capstone</h4>
              <p>Advanced courses, project, and graduation requirements</p>
            </div>
          </div>
          <div className={`timeline-item ${isEligible ? 'upcoming' : 'pending'}`}>
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Graduation</h4>
              <p>Degree conferment and graduation ceremony</p>
            </div>
          </div>
        </div>
      </div>

      <div className="graduation-actions">
        <button className="btn-primary">View Detailed Requirements</button>
        <button className="btn-secondary">Download Progress Report</button>
        {isEligible && (
          <button className="btn-success">Apply for Graduation</button>
        )}
      </div>
    </div>
  );
};

export default GraduationTracker;
