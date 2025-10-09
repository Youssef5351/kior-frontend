import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  Wand2,
  Sparkles,
  Merge,
  Split,
  BookOpen,
  UserCheck,
  Calendar,
  Zap,
  Sliders,
  ChevronDown,
  Star,
  Crown,
  GitCompare,
  Scale,
  ArrowUpDown,
  ExternalLink,
  Clock,
  Hash,
  Type,
  Layers,
  TrendingUp,
  Database,
  Shield,
  Brain,
  Rocket,
  Palette,
  Grid,
  List,
  Settings,
  Bookmark,
  Flag,
  Cpu
} from 'lucide-react';

// Helper functions defined outside the component
const getConfidenceColor = (confidence) => {
  if (confidence >= 95) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200';
  if (confidence >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

const getSimilarityColor = (score) => {
  if (score >= 0.95) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (score >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 0.8) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (score >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};



// Enhanced Duplicate Group Card Component
const DuplicateGroupCard = ({ group, viewMode, onCompare }) => {
  const isGrid = viewMode === 'grid';

  return (
    <div className={`
      bg-white rounded-xl border border-gray-200 
      shadow-sm hover:shadow-md transition-all duration-300 hover:border-purple-300
      ${isGrid ? 'p-6' : 'p-6'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${getConfidenceColor(group.confidence)}`}>
            {group.confidence}% Confidence
          </div>

          {group.similarArticles.some(similar => similar.scores.doi === 1) && (
            <div className="px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
              <CheckCircle className="w-3 h-3 inline mr-1" />
              Exact DOI Match
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
          {group.similarArticles.length + 1} articles
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-gray-900 text-lg leading-relaxed mb-3 line-clamp-3">
        {group.mainArticle.title}
      </h4>
      
      {/* Authors */}
      <div className="flex items-center text-gray-600 mb-3">
        <Users className="w-4 h-4 mr-2 text-gray-400" />
        <span className="text-sm">
          {group.mainArticle.authors?.slice(0, 3).map(a => a.name).join(', ')}
          {group.mainArticle.authors?.length > 3 && ` +${group.mainArticle.authors.length - 3} more`}
        </span>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <BookOpen className="w-4 h-4 text-gray-400" />
          {group.mainArticle.journal}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          {new Date(group.mainArticle.date).getFullYear()}
        </span>
      </div>

      {/* Similarity Scores */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className={`px-2 py-1 rounded-md text-xs font-semibold border ${getSimilarityColor(group.similarArticles[0]?.scores.title || 0)}`}>
          📝 Title: {Math.round((group.similarArticles[0]?.scores.title || 0) * 100)}%
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-semibold border ${getSimilarityColor(group.similarArticles[0]?.scores.authors || 0)}`}>
          👥 Authors: {Math.round((group.similarArticles[0]?.scores.authors || 0) * 100)}%
        </div>
        {group.similarArticles[0]?.scores.doi === 1 && (
          <div className="px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
            🔗 DOI: 100%
          </div>
        )}
      </div>

      {/* Comparison Buttons */}
      <div className="flex gap-2">
        {group.similarArticles.map((similar, idx) => (
          <button
            key={idx}
            onClick={() => onCompare(group, idx)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 font-medium text-sm hover:shadow-sm"
          >
            <Scale className="w-4 h-4" />
            Compare {idx + 1}
            {similar.scores.doi === 1 && (
              <CheckCircle className="w-4 h-4 text-green-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Comparison Dialog Component
const ComparisonDialog = ({ group, similarArticleIndex, onClose, onResolve, projectId, onResolveAll, fetchDuplicates, fetchResolutionSummary }) => {
  const mainArticle = group.mainArticle;
  const similarArticle = group.similarArticles[similarArticleIndex];
  const similarityScores = similarArticle.scores;
  const [resolvingAll, setResolvingAll] = useState(false);

  // Improved journal similarity calculation
  const calculateJournalSimilarity = (journal1, journal2) => {
    if (!journal1 || !journal2) return 0;
    
    const j1 = journal1.toLowerCase().trim();
    const j2 = journal2.toLowerCase().trim();
    
    // Exact match
    if (j1 === j2) return 1;
    
    // Common journal abbreviations and variations
    const journalVariations = {
      'j.': 'journal',
      'proc.': 'proceedings',
      'trans.': 'transactions',
      'int.': 'international',
      'conf.': 'conference',
      'symp.': 'symposium',
      'ieee': 'ieee',
      'acm': 'acm',
      'springer': 'springer',
      'elsevier': 'elsevier'
    };
    
    let score1 = j1;
    let score2 = j2;
    
    // Replace common abbreviations
    Object.keys(journalVariations).forEach(abbr => {
      const full = journalVariations[abbr];
      score1 = score1.replace(new RegExp(abbr, 'g'), full);
      score2 = score2.replace(new RegExp(abbr, 'g'), full);
    });
    
    // Remove common words that don't affect similarity
    const commonWords = ['the', 'of', 'and', 'in', 'on', 'for', 'with', '&', 'and'];
    commonWords.forEach(word => {
      score1 = score1.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
      score2 = score2.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    });
    
    // Clean up multiple spaces
    score1 = score1.replace(/\s+/g, ' ').trim();
    score2 = score2.replace(/\s+/g, ' ').trim();
    
    // Calculate similarity using Levenshtein distance
    const similarity = calculateStringSimilarity(score1, score2);
    
    return Math.max(similarity, similarityScores.journal || 0);
  };

  // Improved date similarity calculation
  const calculateDateSimilarity = (date1, date2) => {
    if (!date1 || !date2) return 0;
    
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      // Check if dates are exactly the same
      if (d1.getTime() === d2.getTime()) return 1;
      
      // Check if same year and month
      if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()) return 0.8;
      
      // Check if same year
      if (d1.getFullYear() === d2.getFullYear()) return 0.6;
      
      // Check if within 1 year
      const yearDiff = Math.abs(d1.getFullYear() - d2.getFullYear());
      if (yearDiff === 1) return 0.4;
      if (yearDiff === 2) return 0.2;
      
      return 0;
    } catch (error) {
      return 0;
    }
  };

  // Get date comparison label
  const getDateComparisonLabel = (date1, date2) => {
    if (!date1 || !date2) return 'Unknown dates';
    
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      if (d1.getTime() === d2.getTime()) return 'Same publication date';
      
      return 'Different publication dates';
    } catch (error) {
      return 'Date comparison unavailable';
    }
  };

  // Improved authors similarity calculation
  const calculateAuthorsSimilarity = (authors1, authors2) => {
    if (!authors1 || !authors2 || authors1.length === 0 || authors2.length === 0) return 0;
    
    const names1 = authors1.map(a => a.name?.toLowerCase().trim()).filter(Boolean);
    const names2 = authors2.map(a => a.name?.toLowerCase().trim()).filter(Boolean);
    
    if (names1.length === 0 || names2.length === 0) return 0;
    
    // Extract last names for better comparison
    const lastNames1 = names1.map(name => {
      const parts = name.split(' ');
      return parts[parts.length - 1];
    });
    
    const lastNames2 = names2.map(name => {
      const parts = name.split(' ');
      return parts[parts.length - 1];
    });
    
    // Calculate Jaccard similarity for last names
    const set1 = new Set(lastNames1);
    const set2 = new Set(lastNames2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    const jaccardSimilarity = union.size === 0 ? 0 : intersection.size / union.size;
    
    // Also calculate overall name similarity
    const overallSimilarity = calculateStringSimilarity(
      names1.join(', '),
      names2.join(', ')
    );
    
    return Math.max(jaccardSimilarity, overallSimilarity, similarityScores.authors || 0);
  };

  // Improved abstract similarity calculation
  const calculateAbstractSimilarity = (abstract1, abstract2) => {
    if (!abstract1 || !abstract2) return 0;
    
    const cleanAbstract1 = abstract1.toLowerCase().trim();
    const cleanAbstract2 = abstract2.toLowerCase().trim();
    
    // If abstracts are exactly the same
    if (cleanAbstract1 === cleanAbstract2) return 1;
    
    // Calculate similarity using multiple methods
    const directSimilarity = calculateStringSimilarity(cleanAbstract1, cleanAbstract2);
    
    // Calculate word overlap similarity
    const words1 = new Set(cleanAbstract1.split(/\s+/).filter(word => word.length > 3));
    const words2 = new Set(cleanAbstract2.split(/\s+/).filter(word => word.length > 3));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    const wordOverlapSimilarity = union.size === 0 ? 0 : intersection.size / union.size;
    
    // Return the maximum of all calculated similarities
    return Math.max(directSimilarity, wordOverlapSimilarity, similarityScores.abstract || 0);
  };

  // Levenshtein distance calculation for string similarity
  const calculateStringSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;
    
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - track[str2.length][str1.length] / maxLength;
  };

  const getDifferenceLevel = (score) => {
    if (score >= 0.9) return { color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Very Similar' };
    if (score >= 0.7) return { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'Similar' };
    if (score >= 0.5) return { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Somewhat Similar' };
    return { color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Different' };
  };

const ComparisonSection = ({ title, leftContent, rightContent, similarity, icon: Icon, isTextContent = false, customSimilarity = null, customLabel = null }) => {
  const displaySimilarity = customSimilarity !== null ? customSimilarity : similarity;
  const displayLabel = customLabel !== null ? customLabel : `${Math.round(displaySimilarity * 100)}% - ${getDifferenceLevel(displaySimilarity).label}`;
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-600" />}
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium border ${getDifferenceLevel(displaySimilarity).bg} ${getDifferenceLevel(displaySimilarity).color}`}>
          {displayLabel}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Primary Article</h5>
          <div className={`text-gray-900 ${isTextContent ? 'text-sm leading-relaxed max-h-32 overflow-y-auto' : 'text-sm'}`}>
            {leftContent || <span className="text-gray-500 italic text-xs">Not available</span>}
          </div>
        </div>
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Comparison Article</h5>
          <div className={`text-gray-900 ${isTextContent ? 'text-sm leading-relaxed max-h-32 overflow-y-auto' : 'text-sm'}`}>
            {rightContent || <span className="text-gray-500 italic text-xs">Not available</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

  // Calculate improved similarities
  const improvedJournalSimilarity = calculateJournalSimilarity(mainArticle.journal, similarArticle.article.journal);
  const improvedDateSimilarity = calculateDateSimilarity(mainArticle.date, similarArticle.article.date);
  const improvedAuthorsSimilarity = calculateAuthorsSimilarity(mainArticle.authors, similarArticle.article.authors);
  const improvedAbstractSimilarity = calculateAbstractSimilarity(mainArticle.abstract, similarArticle.article.abstract);
  const dateComparisonLabel = getDateComparisonLabel(mainArticle.date, similarArticle.article.date);

const handleResolveAll = async () => {
  if (!projectId) return;

  if (!confirm('This will automatically detect and resolve all duplicate groups by keeping the highest quality articles and removing duplicates. Continue?')) {
    return;
  }

  setResolvingAll(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://kior-backend.vercel.app/api/duplicates/projects/${projectId}/resolve-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      alert(`✅ Success! Resolved ${data.data.summary.duplicateGroupsFound} duplicate groups.\n\n📊 Results:\n• Removed ${data.data.statistics.duplicatesRemoved} duplicates\n• Final article count: ${data.data.statistics.finalArticles}\n• Reduction: ${data.data.statistics.reduction}`);
      
      // Force refresh the duplicates data immediately
      if (fetchDuplicates) {
        await fetchDuplicates(); // Wait for the fetch to complete
      }
      if (fetchResolutionSummary) {
        await fetchResolutionSummary(); // Wait for the fetch to complete
      }
      
      // Trigger screening page refresh
      setTimeout(() => {
        if (window.refreshScreeningPage) {
          window.refreshScreeningPage();
        }
      }, 500);
      
      onClose(); // Close dialog after successful resolution
    } else {
      const errorData = await response.json();
      alert(`❌ Failed to resolve all duplicates: ${errorData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error resolving all duplicates:', error);
    alert('❌ Error resolving all duplicates');
  } finally {
    setResolvingAll(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 font-bricolage">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-300">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Resolve Duplicates</h2>
                <p className="text-gray-300 text-sm">
                  Comparing {similarArticleIndex + 1} of {group.similarArticles.length} potential duplicates
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Overall Similarity */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">AI Similarity Analysis</h3>
                <p className="text-gray-600 text-xs">
                  Detection Confidence: <span className="font-semibold">{group.confidence}%</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(similarityScores.overall * 100)}%
                </div>
                <div className="text-xs text-gray-600">Overall Match</div>
              </div>
            </div>
          </div>

          {/* Comparison Sections */}
          <ComparisonSection
            title="Title"
            leftContent={mainArticle.title}
            rightContent={similarArticle.article.title}
            similarity={similarityScores.title}
            icon={Type}
          />

          <ComparisonSection
            title="Authors"
            leftContent={mainArticle.authors?.map(a => a.name).join(', ')}
            rightContent={similarArticle.article.authors?.map(a => a.name).join(', ')}
            similarity={similarityScores.authors}
            customSimilarity={improvedAuthorsSimilarity}
            icon={Users}
          />

          <ComparisonSection
            title="Journal"
            leftContent={mainArticle.journal}
            rightContent={similarArticle.article.journal}
            similarity={similarityScores.journal}
            customSimilarity={improvedJournalSimilarity}
            icon={BookOpen}
          />

          <ComparisonSection
            title="Publication Date"
            leftContent={new Date(mainArticle.date).toLocaleDateString()}
            rightContent={new Date(similarArticle.article.date).toLocaleDateString()}
            similarity={similarityScores.date}
            customSimilarity={improvedDateSimilarity}
            customLabel={dateComparisonLabel}
            icon={Calendar}
          />

          {/* Abstract Comparison */}
          {(mainArticle.abstract || similarArticle.article.abstract) && (
            <ComparisonSection
              title="Abstract"
              leftContent={mainArticle.abstract}
              rightContent={similarArticle.article.abstract}
              similarity={similarityScores.abstract}
              customSimilarity={improvedAbstractSimilarity}
              icon={FileText}
              isTextContent={true}
            />
          )}

          {/* DOI Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-600" />
                <h4 className="font-semibold text-gray-900 text-sm">DOI Comparison</h4>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold border ${
                similarityScores.doi === 1 
                  ? 'bg-green-50 text-green-600 border-green-200' 
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {similarityScores.doi === 1 ? '✅ Exact Match' : '❌ Different DOI'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded border border-gray-200 p-3">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Primary Article</h5>
                <code className="text-xs text-gray-900 bg-white px-2 py-1 rounded border border-gray-300 font-mono">
                  {mainArticle.doi || 'No DOI available'}
                </code>
              </div>
              <div className="bg-gray-50 rounded border border-gray-200 p-3">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Comparison Article</h5>
                <code className="text-xs text-gray-900 bg-white px-2 py-1 rounded border border-gray-300 font-mono">
                  {similarArticle.article.doi || 'No DOI available'}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 border-t border-gray-300 p-6">
          <div className="flex flex-col gap-3">
            {/* Individual Resolution Buttons */}

            
            {/* Resolve All Button */}
            <button
              onClick={handleResolveAll}
              disabled={resolvingAll}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resolvingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Resolving All...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Resolve All Duplicates Automatically
                </>
              )}
            </button>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-xs text-gray-600">
              Review all comparison sections before making a decision
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
const DuplicateDetection = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [comparisonDialog, setComparisonDialog] = useState(null);
  const [resolutionSummary, setResolutionSummary] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    confidence: 'all',
    similarity: 'all',
    dateRange: 'all',
    journal: 'all',
    authorCount: 'all',
    hasAbstract: 'all',
    citationRange: 'all',
    articleType: 'all',
    language: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('confidence');

  // Navigation buttons configuration
  const navigationButtons = [
    { label: 'Project Dashboard', path: `/projects/${projectId}` },
    { label: 'Duplicate Detection', path: `/projects/${projectId}/duplicates` },
    { label: 'Abstract Screening', path: `/projects/${projectId}/screening` },
    { label: 'Full-Text Review', path: `/projects/${projectId}/full-text` },
    { label: 'Team Statistics', path: `/projects/${projectId}/team-stats` }
  ];

  const fetchResolutionSummary = async () => {
    if (!projectId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kior-backend.vercel.app/api/duplicates/projects/${projectId}/resolution-summary`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResolutionSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching resolution summary:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchDuplicates();
      fetchResolutionSummary();
    }
  }, [projectId]);

  const resolveAllDuplicates = async () => {
    if (!projectId) return;

    if (!confirm('This will automatically detect and resolve all duplicate groups by keeping the highest quality articles and removing duplicates. Continue?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      setDetecting(true);
      
      const response = await fetch(`https://kior-backend.vercel.app/api/duplicates/projects/${projectId}/resolve-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDuplicates([]);
        alert(`✅ Success! Resolved ${data.data.summary.duplicateGroupsFound} duplicate groups.\n\n📊 Results:\n• Removed ${data.data.statistics.duplicatesRemoved} duplicates\n• Final article count: ${data.data.statistics.finalArticles}\n• Reduction: ${data.data.statistics.reduction}`);
        fetchResolutionSummary();
        
        setTimeout(() => {
          if (window.refreshScreeningPage) {
            window.refreshScreeningPage();
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to resolve all duplicates: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error resolving all duplicates:', error);
      alert('❌ Error resolving all duplicates');
    } finally {
      setDetecting(false);
    }
  };

  const fetchDuplicates = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kior-backend.vercel.app/api/duplicates/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDuplicates(data.results || []);
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

  const detectDuplicates = async () => {
    if (!projectId) {
      alert('No project ID available');
      return;
    }

    setDetecting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kior-backend.vercel.app/api/duplicates/projects/${projectId}/detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDuplicates(data.duplicates || []);
        alert(`🎉 Found ${data.summary.totalGroups} duplicate groups with ${data.summary.totalArticles} articles`);
      } else {
        alert('❌ Failed to detect duplicates');
      }
    } catch (error) {
      console.error('❌ Error detecting duplicates:', error);
      alert('❌ Error detecting duplicates');
    } finally {
      setDetecting(false);
    }
  };

  const resolveDuplicates = async (articleIds, resolution) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kior-backend.vercel.app/api/duplicates/projects/${projectId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleIds, resolution }),
      });

      if (response.ok) {
        fetchDuplicates();
        setComparisonDialog(null);
        alert('✅ Resolution saved successfully!');
      } else {
        alert('❌ Failed to resolve duplicates');
      }
    } catch (error) {
      console.error('Error resolving duplicates:', error);
      alert('❌ Error resolving duplicates');
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const openComparisonDialog = (group, similarArticleIndex = 0) => {
    setComparisonDialog({
      group,
      similarArticleIndex
    });
  };

  const filteredDuplicates = Array.isArray(duplicates) ? duplicates.filter(group => {
    if (!group || !group.mainArticle) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        group.mainArticle.title?.toLowerCase().includes(searchLower) ||
        group.mainArticle.authors?.some(a => a.name?.toLowerCase().includes(searchLower)) ||
        group.mainArticle.journal?.toLowerCase().includes(searchLower) ||
        group.similarArticles?.some(sa => 
          sa.article?.title?.toLowerCase().includes(searchLower) ||
          sa.article?.authors?.some(a => a.name?.toLowerCase().includes(searchLower)) ||
          sa.article?.journal?.toLowerCase().includes(searchLower)
        );
      if (!matchesSearch) return false;
    }

    if (filters.status !== 'all') {
      if (filters.status === 'resolved' && group.mainArticle.duplicateStatus !== 'resolved') return false;
      if (filters.status === 'unresolved' && group.mainArticle.duplicateStatus) return false;
    }

    if (filters.confidence !== 'all') {
      const confidenceThreshold = parseInt(filters.confidence);
      if (group.confidence < confidenceThreshold) return false;
    }

    if (filters.similarity !== 'all') {
      const similarityThreshold = parseInt(filters.similarity) / 100;
      const hasHighSimilarity = group.similarArticles?.some(similar => 
        similar.scores?.title >= similarityThreshold || similar.scores?.doi === 1
      );
      if (!hasHighSimilarity) return false;
    }

    if (filters.dateRange !== 'all' && group.mainArticle.date) {
      const currentYear = new Date().getFullYear();
      const articleYear = new Date(group.mainArticle.date).getFullYear();
      
      switch (filters.dateRange) {
        case 'recent': if (currentYear - articleYear > 2) return false; break;
        case 'last5': if (currentYear - articleYear > 5) return false; break;
        case 'last10': if (currentYear - articleYear > 10) return false; break;
        case 'old': if (currentYear - articleYear <= 10) return false; break;
      }
    }

    if (filters.authorCount !== 'all') {
      const authorCount = group.mainArticle.authors?.length || 0;
      switch (filters.authorCount) {
        case 'single': if (authorCount !== 1) return false; break;
        case 'few': if (authorCount < 2 || authorCount > 5) return false; break;
        case 'many': if (authorCount <= 5) return false; break;
      }
    }

    if (filters.hasAbstract !== 'all') {
      const hasAbstract = group.mainArticle.abstract && group.mainArticle.abstract.length > 50;
      if (filters.hasAbstract === 'yes' && !hasAbstract) return false;
      if (filters.hasAbstract === 'no' && hasAbstract) return false;
    }

    return true;
  }) : [];

  const sortedDuplicates = Array.isArray(filteredDuplicates) ? [...filteredDuplicates].sort((a, b) => {
    if (!a || !b) return 0;
    
    switch (sortBy) {
      case 'confidence':
        return (b.confidence || 0) - (a.confidence || 0);
      case 'date':
        const dateA = a.mainArticle?.date ? new Date(a.mainArticle.date) : new Date(0);
        const dateB = b.mainArticle?.date ? new Date(b.mainArticle.date) : new Date(0);
        return dateB - dateA;
      case 'similarity':
        const aMaxSimilarity = a.similarArticles?.length ? Math.max(...a.similarArticles.map(s => s.scores?.overall || 0)) : 0;
        const bMaxSimilarity = b.similarArticles?.length ? Math.max(...b.similarArticles.map(s => s.scores?.overall || 0)) : 0;
        return bMaxSimilarity - aMaxSimilarity;
      default:
        return 0;
    }
  }) : [];

  const resetFilters = () => {
    setFilters({
      status: 'all',
      confidence: 'all',
      similarity: 'all',
      dateRange: 'all',
      journal: 'all',
      authorCount: 'all',
      hasAbstract: 'all',
      citationRange: 'all',
      articleType: 'all',
      language: 'all'
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-bricolage">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading AI-Powered Duplicate Detection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-bricolage">
      {/* Navigation Buttons */}
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
      
      {/* Enhanced Header */}
      <div className="relative bg-white border-b border-gray-200 shadow-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Duplicate Detection
                </h1>
                <p className="text-gray-600 text-sm mt-1 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  AI-Powered Article Similarity Analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={fetchDuplicates}
                className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                onClick={detectDuplicates}
                disabled={detecting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 text-sm font-medium"
              >
                {detecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Detect Duplicates</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Stats Cards */}
        {duplicates && duplicates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Duplicate Groups</h3>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{duplicates?.length || 0}</div>
              <p className="text-xs text-gray-600">Potential Issues</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Total Articles</h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {duplicates?.reduce((sum, group) => 
                  sum + (group?.similarArticles?.length || 0) + 1, 0) || 0
                }
              </div>
              <p className="text-xs text-gray-600">In Analysis</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">High Confidence</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {duplicates?.filter(g => g?.confidence >= 90).length || 0}
              </div>
              <p className="text-xs text-gray-600">90%+ Accuracy</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">DOI Matches</h3>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {duplicates?.filter(g => g?.similarArticles?.some(s => s?.scores?.doi === 1)).length || 0}
              </div>
              <p className="text-xs text-gray-600">Exact Matches</p>
            </div>
          </div>
        )}

        {/* Enhanced Controls Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, author, journal, or DOI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-200 text-sm"
                />
              </div>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
              >
                <option value="confidence">Sort by Confidence</option>
                <option value="date">Sort by Date</option>
                <option value="similarity">Sort by Similarity</option>
              </select>
              <TrendingUp className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={resolveAllDuplicates}
              disabled={duplicates.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Wand2 className="w-4 h-4" />
              Resolve All
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
            >
              <Sliders className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Reset
            </button>
          </div>

          {/* Enhanced Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Confidence Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confidence Level</label>
                  <select
                    value={filters.confidence}
                    onChange={(e) => updateFilter('confidence', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
                  >
                    <option value="all">All Confidence Levels</option>
                    <option value="95">95%+ (Very High)</option>
                    <option value="90">90%+ (High)</option>
                    <option value="80">80%+ (Medium)</option>
                    <option value="70">70%+ (Low)</option>
                  </select>
                </div>

                {/* Similarity Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Similarity Score</label>
                  <select
                    value={filters.similarity}
                    onChange={(e) => updateFilter('similarity', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
                  >
                    <option value="all">Any Similarity</option>
                    <option value="95">95%+ (Nearly Identical)</option>
                    <option value="90">90%+ (Very Similar)</option>
                    <option value="80">80%+ (Similar)</option>
                    <option value="70">70%+ (Somewhat Similar)</option>
                    <option value="50">50%+ (Slightly Similar)</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Publication Date</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => updateFilter('dateRange', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
                  >
                    <option value="all">All Dates</option>
                    <option value="recent">Last 2 Years</option>
                    <option value="last5">Last 5 Years</option>
                    <option value="last10">Last 10 Years</option>
                    <option value="old">Older than 10 Years</option>
                  </select>
                </div>

                {/* Author Count Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Author Count</label>
                  <select
                    value={filters.authorCount}
                    onChange={(e) => updateFilter('authorCount', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
                  >
                    <option value="all">Any Number</option>
                    <option value="single">Single Author</option>
                    <option value="few">2-5 Authors</option>
                    <option value="many">6+ Authors</option>
                  </select>
                </div>

                {/* Abstract Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Has Abstract</label>
                  <select
                    value={filters.hasAbstract}
                    onChange={(e) => updateFilter('hasAbstract', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm"
                  >
                    <option value="all">With or Without</option>
                    <option value="yes">With Abstract</option>
                    <option value="no">Without Abstract</option>
                  </select>
                </div>
              </div>

              {/* Quick Action Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status === 'unresolved'}
                    onChange={(e) => updateFilter('status', e.target.checked ? 'unresolved' : 'all')}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700 font-medium text-sm">Show Only Unresolved</span>
                </label>

                <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showHighConfidence}
                    onChange={(e) => updateFilter('showHighConfidence', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700 font-medium text-sm">High Confidence Only</span>
                </label>
              </div>

              {/* Results Counter */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-gray-600 text-sm">
                  <span className="font-semibold text-gray-900">{sortedDuplicates.length}</span> of <span className="font-semibold text-gray-900">{duplicates.length}</span> groups match your filters
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Filtering</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Duplicates List */}
        {sortedDuplicates && sortedDuplicates.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-200">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {(!duplicates || duplicates.length === 0) ? 'No Duplicates Detected' : 'No Matching Results'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              {(!duplicates || duplicates.length === 0) 
                ? 'Ready to unleash the power of AI? Start duplicate detection to analyze your research articles with advanced machine learning algorithms.'
                : 'Try adjusting your filters or search terms. Our AI can help you find exactly what you\'re looking for.'
              }
            </p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' 
              : 'space-y-4'
          }`}>
            {sortedDuplicates?.map((group, index) => (
              <DuplicateGroupCard
                key={index}
                group={group}
                viewMode={viewMode}
                onCompare={openComparisonDialog}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comparison Dialog */}
      {comparisonDialog && (
        <ComparisonDialog
          group={comparisonDialog.group}
          similarArticleIndex={comparisonDialog.similarArticleIndex}
          onClose={() => setComparisonDialog(null)}
          onResolve={resolveDuplicates}
          projectId={projectId} 
        />
      )}
    </div>
  );
};

export default DuplicateDetection;
