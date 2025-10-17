import { useEffect, useState } from 'react';
import { get } from '../services/api';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    get('/api/projects')
      .then(setProjects)
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      {projects.map(p => (
        <div key={p._id}>{p.title}</div>
      ))}
    </div>
  );
}
