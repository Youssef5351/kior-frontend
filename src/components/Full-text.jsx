import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Upload, 
  CheckCircle, 
  Clock, 
  Search,
  User,
  Calendar,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import swal from 'sweetalert';

const FullTextReview = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingFile, setUploadingFile] = useState(null);

  // Navigation buttons configuration
  const navigationButtons = [
    { label: 'Project Dashboard', path: `/projects/${projectId}` },
    { label: 'Duplicate Detection', path: `/projects/${projectId}/duplicates` },
    { label: 'Abstract Screening', path: `/projects/${projectId}/screening` },
    { label: 'Full-Text Review', path: `/projects/${projectId}/full-text` },
    { label: 'Team Statistics', path: `/projects/${projectId}/team-stats` }
  ];

  useEffect(() => {
    if (projectId) {
      fetchIncludedArticles();
    }
  }, [projectId]);

  const fetchIncludedArticles = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kior-backend.vercel.app/api/projects/${projectId}/fulltext-articles`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      } else {
        console.error('Failed to fetch included articles');
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching included articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (articleId, file) => {
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      swal({
        icon: 'warning',
        title: 'Invalid File Type',
        text: 'Please upload only PDF files',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      swal({
        icon: 'warning',
        title: 'File Too Large',
        text: 'File size must be less than 10MB',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    setUploadingFile(articleId);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('fullText', file); // ✅ CORRECT FIELD NAME
      formData.append('articleId', articleId);

      console.log('Uploading file:', file.name, 'for article:', articleId);

      const response = await fetch(`https://kior-backend.vercel.app/api/projects/${projectId}/upload-fulltext`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh the articles list to get updated data
        await fetchIncludedArticles();
        swal({
          icon: 'success',
          title: 'Success!',
          text: 'PDF uploaded successfully!',
          confirmButtonColor: '#3085d6',
        });
      } else {
        const errorData = await response.json();
        swal({
          icon: 'error',
          title: 'Upload Failed',
          text: errorData.error || 'Unknown error',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      swal({
        icon: 'error',
        title: 'Upload Error',
        text: 'Error uploading file. Please try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setUploadingFile(null);
    }
  };

const downloadFile = (articleId, filename) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    swal({
      icon: 'warning',
      title: 'Authentication Required',
      text: 'Please log in to download files',
      confirmButtonColor: '#3085d6',
    });
    return;
  }
  
  // Add token to the URL as a query parameter
  const downloadUrl = `https://kior-backend.vercel.app/api/projects/${projectId}/download-fulltext/${articleId}?token=${encodeURIComponent(token)}`;
  
  console.log('Creating direct download link with token');
  
  // Create a temporary invisible link element
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename || 'fulltext.pdf';
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}; 

const getStatusBadge = (status) => {
    switch (status) {
      case 'include':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'include':
        return <CheckCircle className="w-4 h-4" />;
      case 'maybe':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Filter articles based on search
  const filteredArticles = articles.filter(article => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      article.title?.toLowerCase().includes(searchLower) ||
      article.authors?.some(author => 
        author.name?.toLowerCase().includes(searchLower)
      ) ||
      article.journal?.toLowerCase().includes(searchLower)
    );
  });

  // RefreshCw icon component
  const RefreshCw = ({ className = "w-4 h-4" }) => (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
      />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-bricolage">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading full-text articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-bricolage">
      {/* Navigation Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {navigationButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => navigate(button.path)}
              className="px-5 py-3 text-xs font-medium cursor-pointer text-black hover:text-black hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Full-Text Review</h1>
            <p className="text-gray-600 mt-2">
              Review and upload full-text PDFs for included articles
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <button
              onClick={fetchIncludedArticles}
              className="px-4 cursor-pointer py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Full-Text</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => a.fullTextFile).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Upload</p>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.filter(a => !a.fullTextFile).length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Articles for Full-Text Review ({filteredArticles.length})
            </h3>
          </div>

          <div className="overflow-hidden">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {articles.length === 0 ? 'No articles included for full-text review yet' : 'No articles match your search'}
                </p>
                <p className="text-gray-400 text-sm">
                  {articles.length === 0 
                    ? 'Articles marked as "Include" or "Maybe" in screening will appear here'
                    : 'Try adjusting your search terms'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Article Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(article.screeningDecision)}`}>
                            {getStatusIcon(article.screeningDecision)}
                            {article.screeningDecision}
                          </span>
                          {article.fullTextFile && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="w-3 h-3" />
                              PDF Available
                            </span>
                          )}
                        </div>

                        {/* Article Title */}
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {article.title}
                        </h4>

                        {/* Article Metadata */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>
                              {article.authors?.slice(0, 2).map(a => a.name).join(', ')}
                              {article.authors?.length > 2 && ` +${article.authors.length - 2} more`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{article.journal}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{article.date ? new Date(article.date).getFullYear() : 'N/A'}</span>
                          </div>
                        </div>

                        {/* Abstract Preview */}
                        {article.abstract && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                            {article.abstract}
                          </p>
                        )}
                      </div>

                      {/* File Actions */}
                      <div className="ml-6 flex flex-col gap-2 min-w-[200px]">
                        {article.fullTextFile ? (
                          <div className="space-y-2">
                            <button
                              onClick={() => downloadFile(article.id, article.fullTextFile?.filename)}
                              className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download PDF
                            </button>
                            <div className="text-xs text-gray-500 text-center">
                              Uploaded by: {article.fullTextFile.uploadedBy?.firstName} {article.fullTextFile.uploadedBy?.lastName}
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              {article.fullTextFile.uploadedAt && new Date(article.fullTextFile.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              id={`file-upload-${article.id}`}
                              accept=".pdf"
                              onChange={(e) => handleFileUpload(article.id, e.target.files[0])}
                              className="hidden"
                              disabled={uploadingFile === article.id}
                            />
                            <label
                              htmlFor={`file-upload-${article.id}`}
                              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                uploadingFile === article.id 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                              }`}
                            >
                              {uploadingFile === article.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Upload PDF
                                </>
                              )}
                            </label>
                            <div className="text-xs text-gray-500 text-center mt-1">
                              PDF only, max 10MB
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullTextReview;
