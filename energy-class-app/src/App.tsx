import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CategoryProvider } from './contexts/CategoryContext';
import { AssessmentProvider } from './contexts/AssessmentContext';
import { ProjectProvider } from './contexts/ProjectContext';
import theme from './theme';
import Home from './pages/Home';
import CategoryDetail from './pages/CategoryDetail';
import SubCategoryDetail from './pages/SubCategoryDetail';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProjectProvider>
        <CategoryProvider>
          <AssessmentProvider>
            <Router>
              <Routes>
                <Route path="/" element={<ProjectList />} />
                <Route path="/projects/new" element={<ProjectForm />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/projects/:projectId/edit" element={<ProjectForm />} />
                <Route path="/projects/:projectId/assessment" element={<Home />} />
                <Route path="/projects/:projectId/category/:categoryId" element={<CategoryDetail />} />
                <Route path="/projects/:projectId/category/:categoryId/subcategory/:subCategoryId" element={<SubCategoryDetail />} />
              </Routes>
            </Router>
          </AssessmentProvider>
        </CategoryProvider>
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;
