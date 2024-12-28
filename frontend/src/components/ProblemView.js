// src/components/ProblemView.js

import React, { useEffect, useState } from 'react';
import { getProblem } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { MathJax } from 'better-react-mathjax';
import { toast } from 'react-toastify';

function ProblemView() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);

  const fetchProblem = async () => {
    try {
      const response = await getProblem(id);
      setProblem(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch problem details.');
    }
  };

  useEffect(() => {
    fetchProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!problem) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{problem.title}</h2>
      <p><strong>Difficulty:</strong> {problem.difficulty}</p>
      <p><strong>Estimated Time:</strong> {problem.estimated_time}</p>
      <p><strong>Keywords:</strong> {problem.keywords.join(', ')}</p>
      <p><strong>Author:</strong> {problem.author}</p>
      <p><strong>Status:</strong> {problem.status}</p>
      <div>
        <strong>LaTeX Content:</strong>
        <MathJax>{problem.latex_content}</MathJax>
      </div>
      <div className="mt-3">
        <Link to={`/problems/${problem.id}/edit`} className="btn btn-warning me-2">Edit</Link>
        <Link to="/" className="btn btn-secondary">Back to List</Link>
      </div>
    </div>
  );
}

export default ProblemView;
