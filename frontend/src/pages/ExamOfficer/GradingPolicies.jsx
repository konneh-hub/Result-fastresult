import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './ExamOfficer.css';

const GradingPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ grade: '', min_score: '', max_score: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await api.get('/management/grading-policies/');
      setPolicies(response.data);
    } catch (err) {
      setError('Failed to load grading policies.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/management/grading-policies/', form);
      setSuccess('Grading policy added successfully!');
      setForm({ grade: '', min_score: '', max_score: '', description: '' });
      fetchPolicies();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add policy.');
    } finally {
      setLoading(false);
    }
  };

  const deletePolicy = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await api.delete(`/management/grading-policies/${id}/`);
        fetchPolicies();
      } catch (err) {
        setError('Failed to delete policy.');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Grading Policies</h1>
        </div>
        <div className="grading-policies-container">
          <div className="policy-form">
            <h2>Add New Grading Policy</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Grade</label>
                <input name="grade" value={form.grade} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Min Score</label>
                <input name="min_score" type="number" value={form.min_score} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Max Score</label>
                <input name="max_score" type="number" value={form.max_score} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
              </div>
              <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Policy'}</button>
            </form>
            {success && <div className="success">{success}</div>}
            {error && <div className="error">{error}</div>}
          </div>
          <div className="policies-list">
            <h2>Current Grading Policies</h2>
            <table>
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Min Score</th>
                  <th>Max Score</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map(policy => (
                  <tr key={policy.id}>
                    <td>{policy.grade}</td>
                    <td>{policy.min_score}</td>
                    <td>{policy.max_score}</td>
                    <td>{policy.description}</td>
                    <td>
                      <button onClick={() => deletePolicy(policy.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingPolicies;
