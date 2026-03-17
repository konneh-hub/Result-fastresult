import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import './Management.css';

const initialState = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  role: '',
  staff_id: '',
  password: '',
  faculty_id: '',
  department_id: '',
};

const roles = [
  { value: 'exam_officer', label: 'Exam Officer' },
  { value: 'dean', label: 'Dean' },
  { value: 'hod', label: 'Head of Department' },
];

const AdminAccountCreation = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFacultyChange = (e) => {
    const facultyId = e.target.value;
    setForm({ ...form, faculty_id: facultyId, department_id: '' });
    if (facultyId) {
      fetchDepartments(facultyId);
    } else {
      setDepartments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/admin/create/', form);
      setSuccess('Account created successfully!');
      setForm(initialState);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (facultyId) => {
    try {
      const response = await api.get(`/departments/?faculty=${facultyId}`);
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setError('Failed to load departments');
    }
  };

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const response = await api.get('/faculties/');
        setFaculties(response.data);
      } catch (err) {
        console.error('Failed to fetch faculties:', err);
        setError('Failed to load faculties');
      }
    };
    loadFaculties();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="management-header">
          <h1>Create Administrator Account</h1>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>


          {/* Exam Officer Fields */}
          {form.role === 'exam_officer' && (
            <>
              <div className="form-group">
                <label>First Name</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input name="username" value={form.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Staff ID</label>
                <input name="staff_id" value={form.staff_id} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>
            </>
          )}


          {/* HOD Fields */}
          {form.role === 'hod' && (
            <>
              <div className="form-group">
                <label>First Name</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input name="username" value={form.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Staff ID</label>
                <input name="staff_id" value={form.staff_id} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Faculty</label>
                <select name="faculty_id" value={form.faculty_id} onChange={handleFacultyChange} required>
                  <option value="">Select Faculty</option>
                  {faculties.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="department_id" value={form.department_id} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}


          {/* Dean Fields */}
          {form.role === 'dean' && (
            <>
              <div className="form-group">
                <label>First Name</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input name="username" value={form.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Staff ID</label>
                <input name="staff_id" value={form.staff_id} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Faculty ID</label>
                <input name="faculty_id" value={form.faculty_id} onChange={handleChange} required />
              </div>
            </>
          )}
          <div className="form-actions">
            <button className="btn-edit" style={{background:'var(--btn-primary)',color:'white'}} type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          </div>
          {success && <div className="upload-result success">{success}</div>}
          {error && <div className="upload-result error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminAccountCreation;
