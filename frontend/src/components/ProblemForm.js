// src/components/ProblemForm.js

import React, { useEffect, useState } from 'react';
import { createProblem, getProblem, updateProblem, getTags, getSources } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function ProblemForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    difficulty: '',
    estimated_time: '',
    keywords: '',
    author: '',
    solution_text: '',
    status: 'Unsolved',
    latex_content: '',
    tags: [],
    sources: [],
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);

  const fetchAvailableTags = async () => {
    try {
      const response = await getTags();
      setAvailableTags(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch tags.');
    }
  };

  const fetchAvailableSources = async () => {
    try {
      const response = await getSources();
      setAvailableSources(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch sources.');
    }
  };

  const fetchProblem = async () => {
    try {
      const response = await getProblem(id);
      const data = response.data;
      setFormData({
        title: data.title,
        difficulty: data.difficulty,
        estimated_time: data.estimated_time,
        keywords: data.keywords.join(', '),
        author: data.author,
        solution_text: data.solution_text,
        status: data.status,
        latex_content: data.latex_content,
        tags: data.tags.map(tag => tag.id),
        sources: data.sources.map(source => source.id),
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch problem details.');
    }
  };

  useEffect(() => {
    fetchAvailableTags();
    fetchAvailableSources();
    if (isEditMode) {
      fetchProblem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => parseInt(option.value));
    setFormData({ ...formData, [name]: selectedValues });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.difficulty) {
      toast.error('Title and Difficulty are required.');
      return;
    }

    const payload = {
      title: formData.title,
      difficulty: formData.difficulty,
      estimated_time: formData.estimated_time,
      keywords: formData.keywords.split(',').map(kw => kw.trim()).filter(kw => kw),
      author: formData.author,
      solution_text: formData.solution_text,
      status: formData.status,
      latex_content: formData.latex_content,
      tags: availableTags
        .filter(tag => formData.tags.includes(tag.id))
        .map(tag => tag.name),
      sources: availableSources
        .filter(source => formData.sources.includes(source.id))
        .map(source => source.name),
    };

    try {
      if (isEditMode) {
        await updateProblem(id, payload);
        toast.success('Problem updated successfully.');
      } else {
        await createProblem(payload);
        toast.success('Problem created successfully.');
      }
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save the problem.');
    }
  };

  return (
    <div>
      <h2>{isEditMode ? 'Edit Problem' : 'Add New Problem'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title *</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Difficulty */}
        <div className="mb-3">
          <label htmlFor="difficulty" className="form-label">Difficulty *</label>
          <select
            className="form-select"
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
          >
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Estimated Time */}
        <div className="mb-3">
          <label htmlFor="estimated_time" className="form-label">Estimated Time</label>
          <input
            type="text"
            className="form-control"
            id="estimated_time"
            name="estimated_time"
            value={formData.estimated_time}
            onChange={handleChange}
            placeholder="e.g., 20 minutes"
          />
        </div>

        {/* Keywords */}
        <div className="mb-3">
          <label htmlFor="keywords" className="form-label">Keywords</label>
          <input
            type="text"
            className="form-control"
            id="keywords"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            placeholder="Comma-separated keywords"
          />
        </div>

        {/* Author */}
        <div className="mb-3">
          <label htmlFor="author" className="form-label">Author</label>
          <input
            type="text"
            className="form-control"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Author's name"
          />
        </div>

        {/* Solution Text */}
        <div className="mb-3">
          <label htmlFor="solution_text" className="form-label">Solution Text</label>
          <textarea
            className="form-control"
            id="solution_text"
            name="solution_text"
            rows="4"
            value={formData.solution_text}
            onChange={handleChange}
            placeholder="Provide the solution here..."
          ></textarea>
        </div>

        {/* Status */}
        <div className="mb-3">
          <label htmlFor="status" className="form-label">Status</label>
          <select
            className="form-select"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Unsolved">Unsolved</option>
            <option value="Solved">Solved</option>
          </select>
        </div>

        {/* LaTeX Content */}
        <div className="mb-3">
          <label htmlFor="latex_content" className="form-label">LaTeX Content</label>
          <textarea
            className="form-control"
            id="latex_content"
            name="latex_content"
            rows="4"
            value={formData.latex_content}
            onChange={handleChange}
            placeholder="Enter LaTeX content here..."
          ></textarea>
        </div>

        {/* Tags */}
        <div className="mb-3">
          <label htmlFor="tags" className="form-label">Tags</label>
          <select
            multiple
            className="form-select"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleMultiSelectChange}
          >
            {availableTags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        </div>

        {/* Sources */}
        <div className="mb-3">
          <label htmlFor="sources" className="form-label">Sources</label>
          <select
            multiple
            className="form-select"
            id="sources"
            name="sources"
            value={formData.sources}
            onChange={handleMultiSelectChange}
          >
            {availableSources.map(source => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-success">{isEditMode ? 'Update' : 'Create'} Problem</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>Cancel</button>
      </form>
    </div>
  );
}

export default ProblemForm;
