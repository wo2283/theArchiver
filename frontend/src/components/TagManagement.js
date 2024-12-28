// src/components/TagManagement.js

import React, { useEffect, useState } from 'react';
import { getTags, createTag, updateTag, deleteTag } from '../services/api';
import { toast } from 'react-toastify';

function TagManagement() {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [editTagId, setEditTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');

  const fetchTags = async () => {
    try {
      const response = await getTags();
      setTags(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch tags.');
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name cannot be empty.');
      return;
    }

    try {
      await createTag({ name: newTagName.trim() });
      toast.success('Tag added successfully.');
      setNewTagName('');
      fetchTags();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to add tag.');
    }
  };

  const handleEditTag = (id, name) => {
    setEditTagId(id);
    setEditTagName(name);
  };

  const handleUpdateTag = async () => {
    if (!editTagName.trim()) {
      toast.error('Tag name cannot be empty.');
      return;
    }

    try {
      await updateTag(editTagId, { name: editTagName.trim() });
      toast.success('Tag updated successfully.');
      setEditTagId(null);
      setEditTagName('');
      fetchTags();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to update tag.');
    }
  };

  const handleDeleteTag = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await deleteTag(id);
        toast.success('Tag deleted successfully.');
        fetchTags();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.error || 'Failed to delete tag.');
      }
    }
  };

  return (
    <div>
      <h2>Tag Management</h2>
      <div className="mb-3">
        <label htmlFor="newTag" className="form-label">Add New Tag</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            id="newTag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name"
          />
          <button className="btn btn-primary" onClick={handleAddTag}>Add Tag</button>
        </div>
      </div>

      {tags.length === 0 ? (
        <p>No tags available.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Tag Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map(tag => (
              <tr key={tag.id}>
                <td>
                  {editTagId === tag.id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editTagName}
                      onChange={(e) => setEditTagName(e.target.value)}
                    />
                  ) : (
                    tag.name
                  )}
                </td>
                <td>
                  {editTagId === tag.id ? (
                    <>
                      <button className="btn btn-success btn-sm me-2" onClick={handleUpdateTag}>Save</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditTagId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditTag(tag.id, tag.name)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTag(tag.id)}>Delete</button>
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

export default TagManagement;
