import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, FileText, Users, Calendar, Settings, Bell, User, Home, FolderOpen, Archive, Trash2, X, ChevronDown } from 'lucide-react';
import logo from "../assets/kior.webp"
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const handleUploadSuccess = (projectId) => {
    navigate(`/projects/${projectId}`);
  };
  const [formData, setFormData] = useState({
  title: '',
  type: '',
  domain: '',
  description: '',
  query: '',
  files: [],
  emails: '',
  role: '',
  message: '',
});
const [invitedMembers, setInvitedMembers] = useState([]);
const [currentProjectId, setCurrentProjectId] = useState(null);
const [inviteLoading, setInviteLoading] = useState(false);
const [projectCreating, setProjectCreating] = useState(false);

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);

  

  // Simulate fetching user data and projects from your API
useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Token from localStorage:', token ? token.substring(0, 50) + '...' : 'MISSING');
      
      if (!token) {
        // Redirect to login if no token
        window.location.href = '/login';
        return;
      }
 console.log('📡 Making request to /api/user with Authorization header');
      // Fetch user data
      const userResponse = await fetch('http://localhost:5000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser({ name: userData.name, email: userData.email });
      }

      // Fetch user's projects
      const projectsResponse = await fetch('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      } else {
        console.error('Failed to fetch projects');
        setProjects([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || project.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };
const handleFileUpload = (e) => {
  const newFiles = Array.from(e.target.files);

  setFormData((prev) => {
    // filter out duplicates by file name
    const existingNames = prev.files.map((f) => f.name);
    const filtered = newFiles.filter((file) => !existingNames.includes(file.name));

    return {
      ...prev,
      files: [...prev.files, ...filtered],
    };
  });
};


  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

// UPDATE: handleInviteSubmit to work with the stored project ID
const handleCreateReview = async () => {
  console.log('Current step:', currentStep);
  console.log('Form data:', formData);

  if (currentStep === 1) {
    // Validate step 1 fields
    if (!formData.title || !formData.type || !formData.domain) {
      swal({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields (Title, Type, and Domain)',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      setProjectCreating(true);
      console.log('Creating project...');

      const token = localStorage.getItem('token');
      if (!token) {
        swal({
          icon: 'warning',
          title: 'Authentication Required',
          text: 'Please log in to create a project',
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          domain: formData.domain,
          description: formData.description || ''
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        swal({
          icon: 'error',
          title: 'Creation Failed',
          text: error.error || error.message || 'Failed to create project',
          confirmButtonColor: '#d33',
        });
        return;
      }

      const newProject = await response.json();
      console.log('New project created:', newProject);
      
      // Store project ID for invitations
      setCurrentProjectId(newProject.id);
      
      // Update projects list
      setProjects(prev => [newProject, ...prev]);
      
      // Move to next step
      setCurrentStep(2);
      
    } catch (error) {
      console.error('Error creating project:', error);
      swal({
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to create project. Please check your connection and try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setProjectCreating(false);
    }
} else if (currentStep === 2) {
  if (!formData.files || formData.files.length === 0) {
    swal({
      icon: 'warning',
      title: 'Files Required',
      text: 'Please upload at least one article file to continue.',
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  try {
    setProjectCreating(true);
    const token = localStorage.getItem("token");

    const formDataToSend = new FormData();
    formData.files.forEach(file => formDataToSend.append("files", file));

    const response = await fetch(`http://localhost:5000/api/projects/${currentProjectId}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formDataToSend
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Upload failed");
    }

    const data = await response.json();
    console.log("Uploaded files:", data.files);

    // Continue
    setCurrentStep(3);
  } catch (error) {
    console.error("Error uploading files:", error);
    swal({
      icon: 'error',
      title: 'Upload Failed',
      text: error.message,
      confirmButtonColor: '#d33',
    });
  } finally {
    setProjectCreating(false);
  }
  } else if (currentStep === 3) {
    // Final step - send invitations if any, then redirect to project
    try {
      if (formData.emails && formData.role && currentProjectId) {
        console.log('Sending invitations...');
        await handleInviteSubmit();
      }
      
      // Close modal and redirect to project
      handleCloseModal();
      
      if (currentProjectId) {
        // Show success message before redirecting
        swal({
          icon: 'success',
          title: 'Project Created!',
          text: 'Your review project has been created successfully.',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          // Use React Router navigation instead of window.location
          navigate(`/projects/${currentProjectId}`);
        });
      } else {
        console.error('No project ID available for redirect');
        swal({
          icon: 'error',
          title: 'Redirect Failed',
          text: 'Project was created but redirect failed. Please check your projects list.',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      console.error('Error in final step:', error);
      swal({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while completing the project creation.',
        confirmButtonColor: '#d33',
      });
    }
  }
};

// FIXED handleInviteSubmit function
const handleInviteSubmit = async () => {
  if (!formData.emails || !formData.role || !currentProjectId) {
    console.log('Missing invitation data:', { 
      emails: !!formData.emails, 
      role: !!formData.role, 
      projectId: !!currentProjectId 
    });
    return;
  }

  const emailsArr = formData.emails
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

  if (emailsArr.length === 0) {
    swal({
      icon: 'warning',
      title: 'No Emails',
      text: 'Please enter at least one valid email.',
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  if (emailsArr.length > 25) {
    swal({
      icon: 'warning',
      title: 'Too Many Emails',
      text: 'Please invite up to 25 users at a time.',
      confirmButtonColor: '#3085d6',
    });
    return;
  }

  try {
    setInviteLoading(true);

    const token = localStorage.getItem('token');
    const res = await fetch("http://localhost:5000/api/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        emails: emailsArr.join(','),
        role: formData.role,
        message: formData.message || '',
        projectId: currentProjectId
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Invite error:", err);
      swal({
        icon: 'error',
        title: 'Invitation Failed',
        text: err?.error || err?.message || "Failed to send invites",
        confirmButtonColor: '#d33',
      });
      return;
    }

    console.log("Invitations sent successfully!");
    swal({
      icon: 'success',
      title: 'Invitations Sent!',
      text: 'Team members have been invited successfully.',
      confirmButtonColor: '#3085d6',
    });
  } catch (error) {
    console.error("Network error sending invites:", error);
    swal({
      icon: 'error',
      title: 'Network Error',
      text: 'Network error while sending invites.',
      confirmButtonColor: '#d33',
    });
  } finally {
    setInviteLoading(false);
  }
};

const handleUpload = async (projectId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`http://localhost:5000/api/projects/${projectId}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log("Analysis result:", data);

  if (data.success) {
    // redirect to project overview
    navigate(`/projects/${projectId}`);
  }
};

// Update the button to show loading state
// In your JSX, update the button:
<button
  onClick={handleCreateReview}
  disabled={
    (currentStep === 1 && (!formData.title || !formData.type || !formData.domain)) ||
    projectCreating ||
    inviteLoading
  }
  className="px-8 py-2.5 mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
>
  {projectCreating ? 'Creating Project...' : 
   inviteLoading ? 'Sending Invitations...' :
   currentStep === 1 ? 'Create & Continue' : 
   currentStep === 2 ? 'Continue to Invitations' : 
   'Send Invites & Open Project'}
</button>
// UPDATE: handleCloseModal to reset project ID
const handleCloseModal = () => {
  setShowCreateModal(false);
  setCurrentStep(1);
  setFormData({ 
    title: '', 
    type: '', 
    domain: '', 
    description: '', 
    query: '', 
    files: [], 
    emails: '', 
    role: '', 
    message: '' 
  });
  setCurrentProjectId(null); // 🔥 RESET PROJECT ID
  setShowTypeDropdown(false);
  setShowDomainDropdown(false);
};
  const reviewTypes = [
    { value: 'systematic', label: 'Systematic Review' },
    { value: 'meta-analysis', label: 'Meta-Analysis' },
    { value: 'scoping', label: 'Scoping Review' },
    { value: 'narrative', label: 'Narrative Review' },
    { value: 'rapid', label: 'Rapid Review' }
  ];

  const reviewDomains = [
    { value: 'not-applicable', label: 'Not applicable' },
    { value: 'biomedical', label: 'Biomedical' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'social-science', label: 'Social Science' },
    { value: 'electrical-engineering', label: 'Electrical Engineering' },
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'psychology', label: 'Psychology' }
  ];

const handleProjectClick = (projectId) => {
  window.location.href = `/projects/${projectId}`;
};
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-bricolage">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
          <div className="mx-auto w-60 flex items-center justify-center mb-4">
            <span><img src={logo} className='h-14 mt-4 w-24' alt="" /></span>
          </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button> */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back {user?.name}!
              </h2>
              <p className="text-gray-600">
                Manage your systematic reviews and research projects
              </p>
            </div>

            {/* Create Review Button */}
            <button
              onClick={handleCreateProject}
              className="
                relative
                overflow-hidden
                group
                text-black
                cursor-pointer
                bg-[#F5F5DC]
                px-4 py-2
                rounded-lg
                font-medium
                flex items-center
                space-x-2
                transition-all duration-300 ease-in-out
                hover:scale-105 hover:shadow-lg
              "
            >
              <Plus className="w-4 h-4" />
              <span>Create Review</span>
            </button>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span>Active Reviews</span>
                </h3>
                {/* <button className="
                  relative
                  overflow-hidden
                  group
                  text-[#70316c] 
                  rounded-l 
                  ml-1.5
                  px-4 py-2 
                  text-sm font-medium 
                  transition-all 
                  duration-300 
                  ease-in-out
                  hover:bg-[#4335b5]
                  hover:text-white
                ">
                  <span className="relative z-10">Show More</span>
                </button> */}
              </div>
            </div>

            {/* Projects Table Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-black ">
                <div className="col-span-4">Title</div>
                <div className="col-span-2">Date Created</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-2">N. of Articles</div>
              </div>
            </div>

            {/* Projects List or Empty State */}
            {filteredProjects.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No projects yet!</h4>
                <p className="text-gray-600 mb-6">
                  Create your first systematic review to get started with your research.
                </p>
                <button
                  onClick={handleCreateProject}
                  className="bg-[#F5F5DC] text-black px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First Review
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
             {filteredProjects.map((project) => (
  <div
    key={project.id}
    className="px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
    onClick={() => handleProjectClick(project.id)}
  >
    <div className="grid grid-cols-12 gap-4 items-center">
      <div className="col-span-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{project.title}</h4>
            <p className="text-sm text-gray-600">{project.description}</p>
          </div>
        </div>
      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">{project.owner}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-900">{project.articleCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activity to show</p>
                <p className="text-sm">Your project activities will appear here</p>
              </div>
            </div>
          </div>
        </main>
      </div>

{showCreateModal && (
  <div className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 font-bricolage">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-blue-200 animate-in slide-in-from-bottom-4 duration-300">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-blue-200 bg-white font-bricolage">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 font-bricolage">Create New Review</h2>
        </div>
        <button
          onClick={handleCloseModal}
          className="w-8 h-8 flex items-center justify-center rounded-md text-blue-500 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Steps */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 font-bricolage">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-500'
                }`}>
                  {step}
                </div>
                <span className={`text-xs mt-1 ${
                  step <= currentStep ? 'text-blue-700 font-medium' : 'text-blue-500'
                }`}>
                  {step === 1 ? 'Details' : step === 2 ? 'Upload' : 'Invite'}
                </span>
              </div>
              {step < 3 && (
                <div className={`w-10 h-0.5 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-blue-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh] text-gray-800 font-bricolage">
        {currentStep === 1 && (
          <div className="space-y-6 font-bricolage">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-800">Review Title*</label>
              <input
                type="text"
                placeholder="Enter a title for your review"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all cursor-text"
              />
            </div>

            {/* Type & Domain */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-blue-800">Review Type*</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">Select Type</option>
                  {reviewTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-blue-800">Review Domain*</label>
                <select
                  value={formData.domain}
                  onChange={(e) => handleFormChange('domain', e.target.value)}
                  className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-pointer"
                >
                  <option value="">Select Domain</option>
                  {reviewDomains.map((domain) => (
                    <option key={domain.value} value={domain.value}>{domain.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-800">Description</label>
              <textarea
                rows={4}
                placeholder="Briefly describe your review..."
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="w-full px-4 py-2.5 border border-blue-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-text"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 font-bricolage">
            <h3 className="text-base font-semibold text-blue-800">Upload Articles</h3>
            <p className="text-sm text-blue-600">Upload research files for your review</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-800">Supported Formats</h4>
                <ul className="space-y-1 text-sm text-blue-600">
                  <li>.nbib • .ris • .csv • .zip</li>
                </ul>
              </div>

              {/* Right */}
              <div className="md:col-span-2 border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-blue-800">Upload Files</h4>
                  <label className="text-blue-600 hover:text-blue-700 hover:underline text-sm cursor-pointer font-medium">
                    Select Files
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setFormData((prev) => ({
                          ...prev,
                          files: [...prev.files, ...files],
                        }));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  {formData.files.length === 0 ? (
                    <p className="text-sm text-blue-400">No files uploaded.</p>
                  ) : (
                    formData.files.map((file, i) => (
                      <div key={i} className="flex justify-between items-center border border-blue-200 rounded px-3 py-2 text-sm bg-white">
                        <span className="text-blue-800">{file.name}</span>
                        <button
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              files: prev.files.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="text-blue-400 hover:text-red-500 transition cursor-pointer"
                        >
                          🗑
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 font-bricolage">
            <h3 className="text-base font-semibold text-blue-800">Invite Members</h3>
            <p className="text-sm text-blue-600">Invite collaborators to work with you.</p>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-800">User Email*</label>
              <input
                type="text"
                placeholder="Enter emails separated by commas"
                className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm cursor-text"
                value={formData.emails || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, emails: e.target.value }))
                }
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-800">User Role*</label>
              <select
                className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm cursor-pointer"
                value={formData.role || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value="">Select role</option>
                <option value="Collaborator">Collaborator</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2 text-blue-800">Message</label>
              <textarea
                rows="3"
                placeholder="Optional message"
                className="w-full px-4 py-2.5 border border-blue-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm cursor-text"
                value={formData.message || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t border-blue-200 flex items-center justify-between">
        <button
          onClick={currentStep === 1 ? handleCloseModal : handlePrevStep}
          className="px-5 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
        >
          {currentStep === 1 ? 'Cancel' : ''}
        </button>
        
        <div className="flex items-center gap-3">
          {/* Skip Button for Steps 2 and 3 */}
          {(currentStep === 2 || currentStep === 3) && (
            <button
              onClick={() => {
                if (currentStep === 3) {
                  handleCreateReview();
                } else {
                  handleNextStep();
                }
              }}
              className="px-5 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              {currentStep === 3 ? 'Skip & Create' : 'Skip this step'}
            </button>
          )}
          
          <button
            onClick={handleCreateReview}
            disabled={currentStep === 1 && (!formData.title || !formData.type || !formData.domain)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed cursor-pointer"
          >
            {currentStep === 3 ? 'Create Review' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Dashboard;