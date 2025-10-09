import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroPage from "./components/HeroPage";
import AppFeatures from "./components/AppFeatures";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import ProjectOverview from "./components/ProjectOverview";
import ScreeningPage from "./components/ScreeningPage";
import Login from "./components/Login";
import DuplicateDetection from "./components/DuplicateDetection";
import WhyUs from "./components/WhyUs";
import Ending from "./components/Ending";
import ProtectedRoute from './components/ProtectedRoute';
import Footer from "./components/Footer";
import TeamStatistics from './components/TeamStatistics';
import Fulltext from './components/Full-text';
import { useParams } from "react-router-dom";
function App() {
  const { id } = useParams();
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
          <ScreeningPage  projectId={id} />
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
