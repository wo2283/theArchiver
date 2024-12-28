// src/components/ProblemList.js

import React, { useEffect, useState } from 'react';
import { getProblems, deleteProblem } from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function ProblemList() {
  const [problems, setProblems] = useState([]);

  const fetchProblems = async () => {
    try {
      const response = await getProblems();
      setProblems(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch problems.');
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await deleteProblem(id);
        toast.success('Problem deleted successfully.');
        fetchProblems();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete problem.');
      }
    }
  };

  return (
    <div>
      <h2>Problem List</h2>
      <Link to="/problems/new" className="btn btn-primary mb-3">Add New Problem</Link>
      {problems.length === 0 ? (
        <p>No problems found.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Estimated Time</th>
              <th>Author</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id}>
                <td>{problem.title}</td>
                <td>{problem.difficulty}</td>
                <td>{problem.estimated_time}</td>
                <td>{problem.author}</td>
                <td>{problem.status}</td>
                <td>
                  <Link to={`/problems/${problem.id}`} className="btn btn-info btn-sm me-2">View</Link>
                  <Link to={`/problems/${problem.id}/edit`} className="btn btn-warning btn-sm me-2">Edit</Link>
                  <button onClick={() => handleDelete(problem.id)} className="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProblemList;
