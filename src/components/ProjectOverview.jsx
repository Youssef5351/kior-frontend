import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TeamStatistics from './TeamStatistics';
import swal from 'sweetalert';

import { 
  FileText, 
  Users, 
  Filter, 
  Database, 
  Eye,
  UserPlus,
  Upload,
  BarChart3,
  Shield,
  Play,
  Edit3,
  Sparkles,
  Target,
  Zap,
  Globe,
  Cpu,
  Workflow,
  Rocket,
  X
} from "lucide-react";

export default function ProjectOverview() {
  const { id } = useParams();
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Determine active tab from URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/screening')) return 'screening';
    if (path.includes('/duplicates')) return 'duplicates';
    if (path.includes('/full-text')) return 'full-text';
    if (path.includes('/team-stats')) return 'team-stats';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  const [detecting, setDetecting] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    emails: '',
    role: '',
    message: '',
  });
  const [sendingInvites, setSendingInvites] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState(null);

  const [duplicatesDetected, setDuplicatesDetected] = useState(() => {
    return localStorage.getItem(`duplicatesDetected_${id}`) === 'true';
  });
  const [articlesBeforeDuplicates, setArticlesBeforeDuplicates] = useState(() => {
    const saved = localStorage.getItem(`articlesBeforeDuplicates_${id}`);
    return saved ? parseInt(saved) : 0;
  });
const [articlesAfterDuplicates, setArticlesAfterDuplicates] = useState(() => {
  const saved = localStorage.getItem(`articlesAfterDuplicates_${id}`);
  return saved ? parseInt(saved) : articlesBeforeDuplicates; // Default to before count if not saved
});
  const [duplicateGroupsFound, setDuplicateGroupsFound] = useState(() => {
    const saved = localStorage.getItem(`duplicateGroupsFound_${id}`);
    return saved ? parseInt(saved) : 0;
  });
  const [totalDuplicateArticles, setTotalDuplicateArticles] = useState(() => {
    const saved = localStorage.getItem(`totalDuplicateArticles_${id}`);
    return saved ? parseInt(saved) : 0;
  });

  const [analysis, setAnalysis] = useState({
    importedReferences: 0,
    totalArticles: 0,
    totalDuplicates: 0,
    unresolved: 0,
    resolved: 0,
    notDuplicate: 0,
    deleted: 0,
    duplicates: [],
    articles: []
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`duplicatesDetected_${id}`, duplicatesDetected.toString());
  }, [duplicatesDetected, id]);

  useEffect(() => {
    localStorage.setItem(`articlesBeforeDuplicates_${id}`, articlesBeforeDuplicates.toString());
  }, [articlesBeforeDuplicates, id]);

  useEffect(() => {
    localStorage.setItem(`articlesAfterDuplicates_${id}`, articlesAfterDuplicates.toString());
  }, [articlesAfterDuplicates, id]);

  useEffect(() => {
    localStorage.setItem(`duplicateGroupsFound_${id}`, duplicateGroupsFound.toString());
  }, [duplicateGroupsFound, id]);

  useEffect(() => {
    localStorage.setItem(`totalDuplicateArticles_${id}`, totalDuplicateArticles.toString());
  }, [totalDuplicateArticles, id]);

  // Update URL when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Update URL without navigating away
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
    
    // Only update URL if it's different from current
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
  };

  // Update active tab when URL changes (back/forward navigation)
  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendInvites = async () => {
    if (!formData.emails || !formData.role) {
      swal({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Validate emails
    const emailList = formData.emails.split(',').map(email => email.trim()).filter(email => email);
    
    if (emailList.length === 0) {
      swal({
        icon: 'warning',
        title: 'No Emails',
        text: 'Please enter at least one valid email address',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      swal({
        icon: 'error',
        title: 'Invalid Emails',
        text: `Invalid email format: ${invalidEmails.join(', ')}`,
        confirmButtonColor: '#d33',
      });
      return;
    }

    setSendingInvites(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: formData.emails,
          role: formData.role,
          message: formData.message,
          projectId: id
        })
      });

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        
        if (response.ok) {
          const successCount = data.results ? data.results.filter(r => r.status === 'success').length : 1;
          swal({
            icon: 'success',
            title: 'Invitations Sent!',
            text: `${successCount} invitation(s) sent successfully!`,
            confirmButtonColor: '#3085d6',
          });
          setShowInviteModal(false);
          setFormData({ emails: '', role: '', message: '' });
          // Refresh project data to show new members
          fetchProjectData();
        } else {
          swal({
            icon: 'error',
            title: 'Failed to Send',
            text: `Failed to send invitations: ${data.error || 'Unknown error'}`,
            confirmButtonColor: '#d33',
          });
        }
      } catch (parseError) {
        console.error('Server response (not JSON):', responseText);
        if (responseText.includes('<!DOCTYPE')) {
          swal({
            icon: 'error',
            title: 'Server Error',
            text: 'The invite endpoint is not properly configured. Check server logs.',
            confirmButtonColor: '#d33',
          });
        } 
      }

    } catch (error) {
      console.error('Error sending invites:', error);
      swal({
        icon: 'error',
        title: 'Network Error',
        text: `Network error: ${error.message}`,
        confirmButtonColor: '#d33',
      });
    } finally {
      setSendingInvites(false);
    }
  };

  // Reset form when modal closes
  const handleCloseModal = () => {
    setShowInviteModal(false);
    setFormData({ emails: '', role: '', message: '' });
  };

const fetchProjectData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem("token");

    console.log("🔄 Fetching project data...");

    // Fetch project and analysis in parallel for better performance
    const [projectRes, analysisRes] = await Promise.all([
      fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}`, {
        headers: { "Authorization": `Bearer ${token}` },
      }),
      fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/analysis`, {
        headers: { "Authorization": `Bearer ${token}` },
      })
    ]);

    if (!projectRes.ok) throw new Error(`Project fetch failed: ${projectRes.status}`);
    if (!analysisRes.ok) throw new Error(`Analysis fetch failed: ${analysisRes.status}`);

    const projectData = await projectRes.json();
    const analysisData = await analysisRes.json();

    setProject(projectData);
    setAnalysis(analysisData);
    
    console.log("📊 Analysis data:", analysisData);

    const totalArticles = analysisData.totalArticles || 0;
    
    // Always update articlesBeforeDuplicates with the actual total
    setArticlesBeforeDuplicates(totalArticles);
    
    // Only update articlesAfterDuplicates if we don't have a valid count from duplicate detection
    // OR if no duplicates were detected
    if (!duplicatesDetected || articlesAfterDuplicates === 0) {
      setArticlesAfterDuplicates(totalArticles);
    }

    console.log("✅ Final counts - Before:", totalArticles, "After:", articlesAfterDuplicates);
    
  } catch (err) {
    console.error("❌ Error fetching project:", err);
    setError("Error loading project or analysis");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/user", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchProjectData();
    fetchCurrentUser();
  }, [id]);

  // Detect duplicates function with SweetAlert and state management
  const detectDuplicates = async () => {
    if (!projectId) {
      swal({
        icon: 'error',
        title: 'Error',
        text: 'No project ID available',
        confirmButtonColor: '#d33',
      });
      return;
    }

    if (detecting) {
      return; // Prevent multiple clicks while detecting
    }

    if (duplicatesDetected) {
      swal({
        icon: 'info',
        title: 'Already Detected',
        text: 'Duplicates have already been detected for this project.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    setDetecting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/duplicates/projects/${projectId}/detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

if (response.ok) {
  const data = await response.json();
  setDuplicates(data.duplicates || []);
  
  // Update duplicate detection state
  setDuplicatesDetected(true);
  setDuplicateGroupsFound(data.summary?.totalGroups || 0);
  setTotalDuplicateArticles(data.summary?.totalArticles || 0);
  
  // Calculate articles after duplicates
// This subtracts only the duplicates that will be removed
const totalArticlesBefore = articlesBeforeDuplicates; // 655
const totalGroups = data.summary?.totalGroups || 0; // 3
const totalArticlesInDuplicateGroups = data.summary?.totalArticles || 0; // This might be 9, not 6!

// If each group has multiple duplicates, the calculation is:
const articlesToRemove = totalArticlesInDuplicateGroups - totalGroups;
const remainingArticles = totalArticlesBefore - articlesToRemove;

console.log(`📊 Calculation: ${totalArticlesBefore} - (${totalArticlesInDuplicateGroups} - ${totalGroups}) = ${remainingArticles}`);

setArticlesAfterDuplicates(remainingArticles);
  // Refresh the analysis data to get updated counts from backend
  await fetchProjectData();
  
  swal({
    icon: 'success',
    title: 'Duplicates Detected!',
    html: `
      <div class="text-left">
        <p>🎉 Found <strong>${data.summary?.totalGroups}</strong> duplicate groups with <strong>${data.summary?.totalArticles}</strong> articles</p>
        <p class="mt-2">📊 Articles before duplicates: <strong>${articlesBeforeDuplicates}</strong></p>
        <p>📊 Articles after duplicates: <strong>${remainingArticles}</strong></p>
      </div>
    `,
    confirmButtonColor: '#3085d6',
  });
} else {
        swal({
          icon: 'error',
          title: 'Detection Failed',
          text: 'Failed to detect duplicates',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      console.error('❌ Error detecting duplicates:', error);
      swal({
        icon: 'error',
        title: 'Error',
        text: 'Error detecting duplicates',
        confirmButtonColor: '#d33',
      });
    } finally {
      setDetecting(false);
    }
  };

  // const fetchResolutionSummary = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const response = await fetch(`https://kior-backend.vercel.app/api/projects/${id}/resolution-summary`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //       },
  //     });
      
  //     if (response.ok) {
  //       const data = await response.json();
  //       setResolutionSummary(data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching resolution summary:', error);
  //   }
  // };
  
  // Call this in your useEffect
  useEffect(() => {
    if (projectId) {
      fetchDuplicates();
      // fetchResolutionSummary();
    }
  }, [projectId]);

const resolveAllDuplicates = async () => {
  if (!projectId) return;

  const confirmed = await swal({
    title: 'Resolve All Duplicates?',
    text: 'This will automatically detect and resolve all duplicate groups by keeping the highest quality articles and removing duplicates.',
    icon: 'warning',
    buttons: ['Cancel', 'Yes, resolve them!'],
    dangerMode: true,
  });

  if (!confirmed) return;

  try {
    const token = localStorage.getItem('token');
    setDetecting(true);

    const response = await fetch(https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/duplicates/projects/${projectId}/resolve-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();

      setDuplicates([]);
      setDuplicatesDetected(false);

      await swal({
        icon: 'success',
        title: 'Success!',
        text: `✅ Resolved ${data.data.summary.duplicateGroupsFound} duplicate groups.

Removed ${data.data.statistics.duplicatesRemoved} duplicates.
Final article count: ${data.data.statistics.finalArticles}.
Reduction: ${data.data.statistics.reduction}.

Redirecting to screening page...`,
        buttons: false,
        timer: 2500,
      });

      setArticlesAfterDuplicates(data.data.statistics.finalArticles);
      await fetchResolutionSummary();
    await fetchProjectData(); // Refresh to get updated counts

      setTimeout(() => {
        console.log('🚀 Redirecting to screening page...');
        navigate(`/projects/${projectId}/screening`);
      }, 2500);
    } else {
      const errorData = await response.json();
      swal({
        icon: 'error',
        title: 'Failed',
        text: `Failed to resolve all duplicates: ${errorData.error}`,
        button: 'OK',
      });
      setDetecting(false);
    }
  } catch (error) {
    console.error('Error resolving all duplicates:', error);
    swal({
      icon: 'error',
      title: 'Error',
      text: 'Error resolving all duplicates',
      button: 'OK',
    });
    setDetecting(false);
  }
};

  const fetchDuplicates = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/duplicates/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDuplicates(data.results || []);
        // If duplicates exist, mark as detected
        if (data.results && data.results.length > 0) {
          setDuplicatesDetected(true);
        }
      } else {
        console.error('❌ API Error:', response.status);
        setDuplicates([]);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setDuplicates([]);
    } finally {
      setLoading(false);
    }
  };

  const testImport = async () => {
  // You'll need to get your .nbib file content here
  const nbibContent = `...paste your .nbib content here...`;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/debug-import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: nbibContent })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("🔍 Import Debug Results:", data);
      swal({
        icon: 'info',
        title: 'Import Debug Results',
        html: `
          <div class="text-left text-sm">
            <p><strong>Parsed Articles:</strong> ${data.parsedCount}</p>
            <p><strong>With Titles:</strong> ${data.withTitles}</p>
            <p><strong>With Authors:</strong> ${data.withAuthors}</p>
            <p><strong>Sample Import Results:</strong></p>
            <ul class="mt-2">
              ${data.sampleImport.map(result => 
                `<li>${result.success ? '✅' : '❌'} ${result.title || 'No title'}</li>`
              ).join('')}
            </ul>
          </div>
        `,
        confirmButtonColor: '#3085d6',
      });
    }
  } catch (error) {
    console.error('Debug import error:', error);
  }
};

  const getUserRole = () => {
    if (!currentUser || !project) return "Guest";
    if (project.ownerId === currentUser.id) return "Owner";
    const member = project.members?.find((m) => m.user.id === currentUser.id);
    return member?.role || "Guest";
  };

  const isOwner = getUserRole() === "Owner";

  const tabs = [
    { id: "overview", label: "Project Dashboard", icon: Eye, color: "from-blue-500 to-cyan-500" },
    { id: "duplicates", label: "Duplicate Detection", icon: Target, color: "from-orange-500 to-red-500" },
    { id: "screening", label: "Abstract Screening", icon: Filter, color: "from-purple-500 to-pink-500" },
    { id: "full-text", label: "Full-Text Review", icon: FileText, color: "from-green-500 to-emerald-500" },
    { id: "team-stats", label: "Team Statistics", icon: Users, color: "from-indigo-500 to-blue-500" },
  ];

  const duplicateCount = analysis.totalDuplicates || 0;
  const totalArticles = analysis.totalArticles || 0;
  const unresolved = analysis.unresolved || duplicateCount;
  const resolved = analysis.resolved || 0;

  const startScreening = () => {
    navigate(`/projects/${id}/screening`);
  };

  const startFullTextReview = () => {
    navigate(`/projects/${id}/full-text`);
  };

  // Function to navigate to duplicates page
  const goToDuplicatesPage = () => {
    navigate(`/projects/${id}/duplicates`);
  };

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Articles Count Box - Updated */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Research Library</h3>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{articlesBeforeDuplicates}</div>
                    <p className="text-[15px] text-gray-500">Total Articles</p>
                  </div>
                </div>
              </div>
              {/* Quality Control Box - Updated */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Quality Control</h3>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {duplicatesDetected ? duplicateGroupsFound : duplicateCount}
                </div>
                <p className="text-sm text-gray-600">Duplicate Groups Found</p>
                <button
                  onClick={detectDuplicates}
                  disabled={detecting || duplicatesDetected}
                  className="mt-4 cursor-pointer px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 w-full justify-center"
                >
                  {detecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm">Analyzing...</span>
                    </>
                  ) : duplicatesDetected ? (
                    <>
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Duplicates Detected</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      <span className="text-sm">Detect Duplicates</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Research Team</h3>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {1 + (project.members?.length || 0)}
                </div>
                <p className="text-sm text-gray-600">Collaborators</p>
              </div>
            </div>

            {/* Rest of your overview content remains the same */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Project Details
                  </h2>
                  {isOwner && (
                    <button className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg transition-all">
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Research Title</label>
                    <p className="text-gray-900 font-medium">{project.title}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Academic Domain</label>
                    <p className="text-gray-900">{project.domain || 'Cross-disciplinary Research'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Methodology</label>
                    <p className="text-gray-900">{project.type || 'Systematic Review'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                    <p className="text-gray-900 text-sm">{project.description || 'none'}</p>
                  </div>
                </div>
              </div>

              {/* Research Actions */}
              <div className="space-y-6">
                {/* Workflow Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Workflow className="w-5 h-5" />
                    Research Workflow
                  </h2>
                  
                  {totalArticles > 0 ? (
                    <div className="space-y-3">
                      {/* Duplicate Resolution */}
                      {duplicateCount > 0 && (
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Target className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">Quality Assurance</h4>
                              <p className="text-gray-600 text-xs">{unresolved} potential duplicates need review</p>
                            </div>
                          </div>
                          <button 
                            onClick={resolveAllDuplicates}
                            className="px-3 cursor-pointer py-1.5 bg-orange-500 hover:bg-orange-600 rounded-md text-white font-medium transition-all flex items-center gap-1 text-sm"
                          >
                            <Zap className="w-3 h-3" />
                            Resolve
                          </button>
                        </div>
                      )}

                      {/* Abstract Screening */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">Literature Screening</h4>
                            <p className="text-gray-600 text-xs">
                              {articlesAfterDuplicates} articles awaiting review
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={startScreening}
                          className="px-3 cursor-pointer py-1.5 bg-blue-500 hover:bg-blue-600 rounded-md text-white font-medium transition-all flex items-center gap-1 text-sm"
                        >
                          <Play className="w-3 h-3" />
                          Start
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-200">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Begin Your Research</h3>
                      <p className="text-gray-600 mb-4 text-sm">Start by importing your research literature</p>
                      <button className="px-4 cursor-pointer py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-all flex items-center gap-2 mx-auto">
                        <Upload className="w-4 h-4" />
                        Import Research Data
                      </button>
                    </div>
                  )}
                </div>

                {/* Research Team */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      Research Team
                    </h2>
                    {isOwner && (
                      <button 
                        onClick={() => setShowInviteModal(true)}
                        className="p-1.5 cursor-pointer bg-green-100 hover:bg-green-200 rounded-md transition-all"
                      >
                        <UserPlus className="w-3 h-3 text-green-600" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Principal Investigator */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {project.owner?.firstName?.[0]}{project.owner?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {project.owner?.firstName} {project.owner?.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{project.owner?.email}</p>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-bold border border-blue-200">
                        PI
                      </span>
                    </div>

                    {/* Research Team */}
                    {project.members?.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {member.user.firstName} {member.user.lastName}
                            </p>
                            <p className="text-xs text-gray-600">{member.user.email}</p>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-bold border border-green-200">
                          {member.role}
                        </span>
                      </div>
                    ))}

                    {(!project.members || project.members.length === 0) && (
                      <div className="text-center py-4 text-gray-600">
                        <Users className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs">Build your research team</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'duplicates':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Duplicate Detection</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800">Articles Before</h3>
                  <p className="text-2xl font-bold text-blue-600">{articlesBeforeDuplicates}</p>
                  <p className="text-xs text-blue-600 mt-1">Number of articles before duplicates</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800">Duplicate Groups</h3>
                  <p className="text-2xl font-bold text-orange-600">{duplicatesDetected ? duplicateGroupsFound : duplicateCount}</p>
                  <p className="text-xs text-orange-600 mt-1">Duplicate groups found</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800">Articles After</h3>
                  <p className="text-2xl font-bold text-green-600">{articlesAfterDuplicates}</p>
                  <p className="text-xs text-green-600 mt-1">Number of articles after duplicates</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-800">Duplicates Found</h3>
                  <p className="text-2xl font-bold text-purple-600">{totalDuplicateArticles}</p>
                  <p className="text-xs text-purple-600 mt-1">Total duplicate articles</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={detectDuplicates}
                  disabled={detecting || duplicatesDetected}
                  className="px-6 cursor-pointer py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Rocket className="w-5 h-5" />
                  {detecting ? 'Detecting...' : duplicatesDetected ? 'Duplicates Detected' : 'Detect Duplicates'}
                </button>
                
                {duplicateCount > 0 && (
                  <button
                    onClick={resolveAllDuplicates}
                    disabled={detecting}
                    className="px-6 cursor-pointer py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Zap className="w-5 h-5" />
                    Resolve All Duplicates
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      case 'screening':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Abstract Screening</h2>
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                <Filter className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Start Screening Articles</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Begin the abstract screening process to evaluate articles for inclusion in your systematic review.
              </p>
              <button 
                onClick={startScreening}
                className="px-8 cursor-pointer py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-all flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Start Screening Session
              </button>
            </div>
          </div>
        );

      case 'full-text':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Full-Text Review</h2>
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200">
                <FileText className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Full-Text Assessment</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Review full-text articles for detailed analysis and data extraction.
              </p>
              <button 
                onClick={startFullTextReview}
                className="px-8 cursor-pointer py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-all flex items-center gap-2 mx-auto"
              >
                <FileText className="w-5 h-5" />
                Start Full-Text Review
              </button>
            </div>
          </div>
        );

      case 'team-stats':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Statistics</h2>
            <TeamStatistics projectId={id} />
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
              {tabs.find(t => t.id === activeTab)?.icon && 
                React.createElement(tabs.find(t => t.id === activeTab).icon, { 
                  className: "w-10 h-10 text-blue-600" 
                })
              }
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Advanced research features coming soon with AI-powered insights and collaboration tools.
            </p>
            <button 
              onClick={() => handleTabChange('overview')}
              className="px-6 cursor-pointer py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        );
    }
  };

  // Remove error state and just use project state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-bricolage">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your research dashboard...</p>
        </div>
      </div>
    );
  }

  // Double check - both error state AND project existence
  // Only show error if we have an actual error AND finished loading
  if (!loading && (error || !project)) {
    console.log('Error state:', error, 'Project state:', project);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-bricolage">
        {/* <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-lg">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Project not found"}
          </h2>
          <p className="text-gray-600 mb-4">
            The project could not be loaded. This may be due to network issues or insufficient permissions.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
          >
            Return to Dashboard
          </button>
        </div> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-bricolage">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.title}
                </h1>
                <div className="flex items-center space-x-3 text-gray-600 text-sm mt-1">
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                    <Cpu className="w-3 h-3" />
                    {project.type}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                    <Globe className="w-3 h-3" />
                    {project.domain}
                  </span>
                  <span className="flex items-center gap-1 bg-green-500 px-2 py-1 rounded-lg text-white">
                    <Shield className="w-3 h-3" />
                    {getUserRole()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
                            <a href="/dashboard">
              <button className="px-3 cursor-pointer py-2 bg-blue-500 rounded-lg transition-all flex items-center gap-2 text-white text-sm">

                Return to Dashboard
                
              </button>
              </a>
              {isOwner && (
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="px-3 cursor-pointers py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all flex items-center gap-2 text-white text-sm"
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
                className={`flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
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

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-white/80 bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 font-bricolage">
                Invite Team Members
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6 font-bricolage">
                <h3 className="text-base font-semibold text-gray-900 font-bricolage">Invite Members</h3>
                <p className="text-sm text-gray-600">Invite collaborators to work with you.</p>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">User Email*</label>
                  <input
                    type="text"
                    placeholder="Enter emails separated by commas"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-800 text-sm"
                    value={formData.emails}
                    onChange={(e) => handleFormChange('emails', e.target.value)}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium mb-2 font-bricolage">User Role*</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-gray-800 text-sm"
                    value={formData.role}
                    onChange={(e) => handleFormChange('role', e.target.value)}
                  >
                    <option value="">Select role</option>
                    <option value="Collaborator">Collaborator</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    rows="3"
                    placeholder="Optional message"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg resize-none focus:ring-1 focus:ring-gray-800 text-sm"
                    value={formData.message}
                    onChange={(e) => handleFormChange('message', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="flex-1 cursor-pointer px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={sendInvites}
                disabled={sendingInvites || !formData.emails || !formData.role}
                className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingInvites ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Send Invites
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}
