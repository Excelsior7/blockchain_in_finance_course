import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { courses } from '../data/courses';
import CourseCard from '../components/CourseCard';

const CoursesPage: React.FC = () => {
  const { user, completedCourses } = useContext(AuthContext);

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>Veuillez vous connecter pour voir les cours.</div>;
  }

  // Get the list of completed course IDs
  const completedCourseIds = completedCourses.map(course => course.course_id);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>Nos Formations Data</h1>
        <p style={{ color: '#4b5563' }}>
          Explorez nos formations en data science et obtenez des certifications vérifiables sur blockchain.
        </p>
      </div>

      <div className="grid grid-cols-3">
        {courses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            isCompleted={completedCourseIds.includes(course.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CoursesPage; 