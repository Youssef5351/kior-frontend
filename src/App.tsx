import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroPage from "./components/HeroPage.jsx";
import AppFeatures from "./components/AppFeatures.jsx";
import SignUp from "./components/SignUp.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ProjectOverview from "./components/ProjectOverview.jsx";
import ScreeningPage from "./components/ScreeningPage.jsx";
import Login from "./components/Login.jsx";
import DuplicateDetection from "./components/DuplicateDetection.jsx";
import WhyUs from "./components/WhyUs.jsx";
import Ending from "./components/Ending.jsx";
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Footer from "./components/Footer.jsx";
import TeamStatistics from './components/TeamStatistics.jsx';
import Fulltext from './components/Full-text.jsx';
function App() {
  return (
    <Router>
      <Routes>
            <Route path="/" element={
      <>
        <HeroPage />
        <AppFeatures />
        <WhyUs />
        <Ending />
        <Footer />
      </>
    } />
        <Route path="/register" element={<SignUp />} />
        <Route path="/login" element={<Login />} />


        
      {/* Protected Routes */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/projects/:id" 
      element={
        <ProtectedRoute>
          <ProjectOverview />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/projects/:id/screening" 
      element={
        <ProtectedRoute>
          <ScreeningPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/projects/:id/duplicates" 
      element={
        <ProtectedRoute>
          <DuplicateDetection />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/projects/:id/team-stats" 
      element={
        <ProtectedRoute>
          <TeamStatistics />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/projects/:id/full-text" 
      element={
        <ProtectedRoute>
          <Fulltext />
        </ProtectedRoute>
      } 
    />
  </Routes>
    </Router>
  );
}

export default App;
