import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Home from './pages/Home';
import CategoryDetail from './pages/CategoryDetail';
import SubCategoryDetail from './pages/SubCategoryDetail';
import { AssessmentProvider } from './contexts/AssessmentContext';
import { CategoryProvider } from './contexts/CategoryContext';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AssessmentProvider>
        <CategoryProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:categoryId" element={<CategoryDetail />} />
              <Route path="/subcategory/:categoryId/:subCategoryId" element={<SubCategoryDetail />} />
            </Routes>
          </Router>
        </CategoryProvider>
      </AssessmentProvider>
    </ThemeProvider>
  );
};

export default App;
