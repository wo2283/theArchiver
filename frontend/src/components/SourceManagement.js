// src/components/SourceManagement.js

import React, { useEffect, useState } from 'react';
import { getSources, createSource, updateSource, deleteSource } from '../services/api';
import { toast } from 'react-toastify';

function SourceManagement() {
  const [sources, setSources] = useState([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [editSourceId, setEditSourceId] = useState(null);
  const [editSourceName, setEditSourceName] = useState('');

  const fetchSources = async () => {
    try {
      const response = await getSources();
      setSources(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch sources.');
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAddSource = async () => {
    if (!newSourceName.trim()) {
      toast.error('Source name cannot be empty.');
      return;
    }

    try {
      await createSource({ name: newSourceName.trim() });
      toast.success('Source added successfully.');
      setNewSourceName('');
      fetchSources();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to add source.');
    }
  };

  const handleEditSource = (id, name) => {
    setEditSourceId(id);
    setEditSourceName(name);
  };

  const handleUpdateSource = async () => {
    if (!editSourceName.trim()) {
      toast.error('Source name cannot be empty.');
      return;
    }

    try {
      await updateSource(editSourceId, { name: editSourceName.trim() });
      toast.success('Source updated successfully.');
      setEditSourceId(null);
      setEditSourceName('');
      fetchSources();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to update source.');
    }
  };

  const handleDeleteSource = async (id) => {
    if (window.confirm('Are you sure you want to delete this source?')) {
      try {
        await deleteSource(id);
        toast.success('Source deleted successfully.');
        fetchSources();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.error || 'Failed to delete source.');
      }
    }
  };

  return (
    <div>
      <h2>Source Management</h2>
      <div className="mb-3">
        <label htmlFor="newSource" className="form-label">Add New Source</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            id="newSource"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            placeholder="Enter source name"
          />
          <button className="btn btn-primary" onClick={handleAddSource}>Add Source</button>
        </div>
      </div>

      {sources.length === 0 ? (
        <p>No sources available.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Source Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map(source => (
              <tr key={source.id}>
                <td>
                  {editSourceId === source.id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editSourceName}
                      onChange={(e) => setEditSourceName(e.target.value)}
                    />
                  ) : (
                    source.name
                  )}
                </td>
                <td>
                  {editSourceId === source.id ? (
                    <>
                      <button className="btn btn-success btn-sm me-2" onClick={handleUpdateSource}>Save</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditSourceId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditSource(source.id, source.name)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSource(source.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SourceManagement;
