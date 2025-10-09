// components/ProjectLayout.jsx
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Filter, 
  Eye,
  UserPlus,
  Sparkles,
  Shield,
  Globe,
  Cpu
} from "lucide-react";

const ProjectLayout = ({ children, project, currentUser, isOwner, showInviteModal, setShowInviteModal }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "overview", label: "Project Dashboard", icon: Eye, color: "from-blue-500 to-cyan-500" },
    { id: "duplicates", label: "Duplicate Detection", icon: Filter, color: "from-orange-500 to-red-500" },
    { id: "screening", label: "Abstract Screening", icon: Filter, color: "from-purple-500 to-pink-500" },
    { id: "full-text", label: "Full-Text Review", icon: FileText, color: "from-green-500 to-emerald-500" },
    { id: "team-stats", label: "Team Statistics", icon: Users, color: "from-indigo-500 to-blue-500" },
  ];

  // Determine active tab from URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/screening')) return 'screening';
    if (path.includes('/duplicates')) return 'duplicates';
    if (path.includes('/full-text')) return 'full-text';
    if (path.includes('/team-stats')) return 'team-stats';
    return 'overview';
  };

  const activeTab = getActiveTabFromUrl();

  const handleTabChange = (tabId) => {
    const basePath = `/projects/${id}`;
    let newPath = basePath;
    
    switch (tabId) {
      case 'screening':
        newPath = `${basePath}/screening`;
        break;
      case 'duplicates':
        newPath = `${basePath}/duplicates`;
        break;
      case 'full-text':
        newPath = `${basePath}/full-text`;
        break;
      case 'team-stats':
        newPath = `${basePath}/team-stats`;
        break;
      default:
        newPath = basePath;
    }
    
    navigate(newPath);
  };

  const getUserRole = () => {
    if (!currentUser || !project) return "Guest";
    if (project.ownerId === currentUser.id) return "Owner";
    const member = project.members?.find((m) => m.user.id === currentUser.id);
    return member?.role || "Guest";
  };

  return (
   
  <div className="min-h-screen bg-gray-50 font-bricolage">
    {/* Manually include just the header from ProjectLayout */}
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Copy the header content from your ProjectLayout */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project?.title}
              </h1>
              <div className="flex items-center space-x-3 text-gray-600 text-sm mt-1">
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                  <Cpu className="w-3 h-3" />
                  {project?.type}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                  <Globe className="w-3 h-3" />
                  {project?.domain}
                </span>
                <span className="flex items-center gap-1 bg-green-500 px-2 py-1 rounded-lg text-white">
                  <Shield className="w-3 h-3" />
                  {getUserRole()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-2 text-gray-700 text-sm">
              <Sparkles className="w-4 h-4" />
              Shortcuts
            </button>
            {isOwner && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all flex items-center gap-2 text-white text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Invite Team
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-sm`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default ProjectLayout;