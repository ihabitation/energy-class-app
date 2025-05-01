import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, Toolbar } from '@mui/material';
import { CategoryProvider } from './contexts/CategoryContext';
import { AssessmentProvider } from './contexts/AssessmentContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TechnicalSolutionProvider } from './contexts/TechnicalSolutionContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AppBar } from './components/AppBar';
import theme from './theme';
import Home from './pages/Home';
import CategoryDetail from './pages/CategoryDetail';
import SubCategoryDetail from './pages/SubCategoryDetail';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { AdminPanel } from './pages/AdminPanel';
import Breadcrumb from './components/Breadcrumb';
import PageTransition from './components/PageTransition';
import MobileNavigation from './components/MobileNavigation';

const AppContent = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <AppBar />
      <Toolbar /> {/* Espace pour l'AppBar */}
      <Container>
        <Breadcrumb />
        <Box pb={8}>
          <PageTransition>
            <Routes location={location}>
              {/* Routes publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Routes protégées */}
              <Route path="/" element={
                <PrivateRoute>
                  <Navigate to="/projects" replace />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute>
                  <AdminPanel />
                </PrivateRoute>
              } />
              <Route path="/projects" element={
                <PrivateRoute>
                  <ProjectList />
                </PrivateRoute>
              } />
              <Route path="/projects/new" element={
                <PrivateRoute>
                  <ProjectForm />
                </PrivateRoute>
              } />
              <Route path="/projects/:projectId" element={
                <PrivateRoute>
                  <ProjectDetail />
                </PrivateRoute>
              } />
              <Route path="/projects/:projectId/edit" element={
                <PrivateRoute>
                  <ProjectForm />
                </PrivateRoute>
              } />
              <Route path="/projects/:projectId/assessment" element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } />
              <Route path="/projects/:projectId/category/:categoryId" element={
                <PrivateRoute>
                  <CategoryDetail />
                </PrivateRoute>
              } />
              <Route path="/projects/:projectId/category/:categoryId/subcategory/:subCategoryId" element={
                <PrivateRoute>
                  <SubCategoryDetail />
                </PrivateRoute>
              } />
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
      <AuthProvider>
        <ProjectProvider>
          <AssessmentProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
