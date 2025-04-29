import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import { CategoryProvider } from './contexts/CategoryContext';
import { AssessmentProvider } from './contexts/AssessmentContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TechnicalSolutionProvider } from './contexts/TechnicalSolutionContext';
import { NavigationProvider } from './contexts/NavigationContext';
import theme from './theme';
import Home from './pages/Home';
import CategoryDetail from './pages/CategoryDetail';
import SubCategoryDetail from './pages/SubCategoryDetail';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import Breadcrumb from './components/Breadcrumb';
import PageTransition from './components/PageTransition';
import MobileNavigation from './components/MobileNavigation';

const AppContent = () => {
  const location = useLocation();

  return (
    <>
      <Container>
        <Breadcrumb />
        <Box pb={8}>
          <PageTransition>
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/new" element={<ProjectForm />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/projects/:projectId/edit" element={<ProjectForm />} />
              <Route path="/projects/:projectId/assessment" element={<Home />} />
              <Route path="/projects/:projectId/category/:categoryId" element={<CategoryDetail />} />
              <Route path="/projects/:projectId/category/:categoryId/subcategory/:subCategoryId" element={<SubCategoryDetail />} />
            </Routes>
          </PageTransition>
        </Box>
      </Container>
      <MobileNavigation />
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProjectProvider>
        <AssessmentProvider>
          <Router future={{ v7_startTransition: true }}>
            <CategoryProvider>
              <TechnicalSolutionProvider>
                <NavigationProvider>
                  <AppContent />
                </NavigationProvider>
              </TechnicalSolutionProvider>
            </CategoryProvider>
          </Router>
        </AssessmentProvider>
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;
