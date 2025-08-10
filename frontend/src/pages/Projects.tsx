import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: any;
}

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(
          collection(db, 'projects'), 
          where('isPublished', '==', true),
          orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <h1>Projects</h1>
      <a href="/">← Back to Home</a>
      
      {projects.length === 0 ? (
        <p>No projects available yet.</p>
      ) : (
        <div>
          {projects.map(project => (
            <div key={project.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p><strong>Category:</strong> {project.category}</p>
              <p><strong>Technologies:</strong> {project.technologies.join(', ')}</p>
              {project.isFeatured && <p><em>⭐ Featured Project</em></p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};