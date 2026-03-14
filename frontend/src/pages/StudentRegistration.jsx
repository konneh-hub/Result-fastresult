import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    university: '',
    faculty: '',
    department: '',
    program: ''
  });
  const { registerStudent } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerStudent(formData);
    if (result.success) {
      navigate('/login');
    } else {
      alert('Registration failed');
    }
  };

  return (
    <div className="registration">
      <h1>Student Registration</h1>
      <form onSubmit={handleSubmit}>
        <input name="student_id" placeholder="Student ID" onChange={handleChange} required />
        <input name="first_name" placeholder="First Name" onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="university" placeholder="University" onChange={handleChange} required />
        <input name="faculty" placeholder="Faculty" onChange={handleChange} required />
        <input name="department" placeholder="Department" onChange={handleChange} required />
        <input name="program" placeholder="Program" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default StudentRegistration;