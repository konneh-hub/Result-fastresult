import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

axios.defaults.baseURL = API_BASE_URL;

export const api = {
  // Auth
  login: (data) => axios.post('/auth/login/', data),
  registerStudent: (data) => axios.post('/auth/register/student/', data),
  registerLecturer: (data) => axios.post('/auth/register/lecturer/', data),
  forgotPassword: (data) => axios.post('/auth/forgot-password/', data),
  profile: () => axios.get('/auth/profile/'),

  // Universities
  getUniversities: () => axios.get('/universities/'),

  // University Admin
  getFaculties: (universityId) => axios.get(`/universities/${universityId}/faculties/`),
  createFaculty: (universityId, data) => axios.post(`/universities/${universityId}/faculties/`, data),
  getDepartments: (facultyId) => axios.get(`/faculties/${facultyId}/departments/`),
  createDepartment: (facultyId, data) => axios.post(`/faculties/${facultyId}/departments/`, data),
  getPrograms: (departmentId) => axios.get(`/departments/${departmentId}/programs/`),
  createProgram: (departmentId, data) => axios.post(`/departments/${departmentId}/programs/`, data),
  getCourses: (departmentId) => axios.get(`/departments/${departmentId}/courses/`),
  createCourse: (departmentId, data) => axios.post(`/departments/${departmentId}/courses/`, data),
  uploadStudents: (universityId, data) => axios.post(`/universities/${universityId}/upload-students/`, data),
  uploadLecturers: (universityId, data) => axios.post(`/universities/${universityId}/upload-lecturers/`, data),
  getAcademicSessions: (universityId) => axios.get(`/universities/${universityId}/sessions/`),
  createAcademicSession: (universityId, data) => axios.post(`/universities/${universityId}/sessions/`, data),
  getSemesters: (sessionId) => axios.get(`/sessions/${sessionId}/semesters/`),
  createSemester: (sessionId, data) => axios.post(`/sessions/${sessionId}/semesters/`, data),
  assignRole: (userId, data) => axios.post(`/users/${userId}/assign-role/`, data),

  // Exam Officer
  getSubmittedResults: (universityId) => axios.get(`/universities/${universityId}/results/submitted/`),
  verifyResult: (resultId, data) => axios.patch(`/results/${resultId}/verify/`, data),
  publishResults: (universityId, data) => axios.post(`/universities/${universityId}/results/publish/`, data),
  lockResults: (universityId, data) => axios.post(`/universities/${universityId}/results/lock/`, data),
  getReports: (universityId) => axios.get(`/universities/${universityId}/reports/`),

  // Dean
  getFacultyResults: (facultyId) => axios.get(`/faculties/${facultyId}/results/`),
  approveResults: (facultyId, data) => axios.post(`/faculties/${facultyId}/results/approve/`, data),

  // HOD
  assignCourse: (courseId, data) => axios.post(`/courses/${courseId}/assign/`, data),
  getDepartmentResults: (departmentId) => axios.get(`/departments/${departmentId}/results/`),
  verifyResults: (departmentId, data) => axios.post(`/departments/${departmentId}/results/verify/`, data),

  // Lecturer
  getAssignedCourses: (lecturerId) => axios.get(`/lecturers/${lecturerId}/courses/`),
  uploadScores: (courseId, data) => axios.post(`/courses/${courseId}/scores/`, data),
  editResult: (resultId, data) => axios.patch(`/results/${resultId}/`, data),
  submitResults: (courseId) => axios.post(`/courses/${courseId}/submit-results/`),

  // Student
  getResults: (studentId) => axios.get(`/students/${studentId}/results/`),
  getGPA: (studentId) => axios.get(`/students/${studentId}/gpa/`),
  getAcademicHistory: (studentId) => axios.get(`/students/${studentId}/history/`),
  downloadResultSlip: (resultId) => axios.get(`/results/${resultId}/download/`, { responseType: 'blob' }),
  updateProfile: (studentId, data) => axios.patch(`/students/${studentId}/profile/`, data),
};

export default api;