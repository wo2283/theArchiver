// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProblemList from './components/ProblemList';
import ProblemView from './components/ProblemView';
import ProblemForm from './components/ProblemForm';
import TagManagement from './components/TagManagement';
import SourceManagement from './components/SourceManagement';
import ProblemUpload from './components/ProblemUpload';
import { MathJaxContext } from 'better-react-mathjax';
import { ToastContainer } from 'react-toastify';

function App() {
  const mathJaxConfig = {
    loader: { load: ['input/tex', 'output/chtml'] },
    tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
    svg: { fontCache: 'global' },
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <Router>
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<ProblemList />} />
            <Route path="/problems/new" element={<ProblemForm />} />
            <Route path="/problems/upload" element={<ProblemUpload />} />
            <Route path="/problems/:id" element={<ProblemView />} />
            <Route path="/problems/:id/edit" element={<ProblemForm />} />
            <Route path="/tags" element={<TagManagement />} />
            <Route path="/sources" element={<SourceManagement />} />
          </Routes>
        </div>
        <ToastContainer />
      </Router>
    </MathJaxContext>
  );
}

export default App;
