import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const LecturerRegistration = () => {
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    university: '',
    faculty: '',
    department: ''
  });
  const { registerLecturer } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerLecturer(formData);
    if (result.success) {
      navigate('/login');
    } else {
      alert('Registration failed');
    }
  };

  return (
    <div className="registration">
      <h1>Lecturer Registration</h1>
      <form onSubmit={handleSubmit}>
        <input name="employee_id" placeholder="Employee ID" onChange={handleChange} required />
        <input name="first_name" placeholder="First Name" onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="university" placeholder="University" onChange={handleChange} required />
        <input name="faculty" placeholder="Faculty" onChange={handleChange} required />
        <input name="department" placeholder="Department" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default LecturerRegistration;