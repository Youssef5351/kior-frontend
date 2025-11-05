import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScreeningSession } from '../hooks/useScreeningSession';
import ProjectLayout from '../components/ProjectLayout';

const Screening = ({ projectId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(0);
  const [notes, setNotes] = useState({});
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    yearRange: [2000, 2024],
    reviewerCount: 'all'
  });
  const [blindMode, setBlindMode] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [project, setProject] = useState(null); 
  const [projectOwnerId, setProjectOwnerId] = useState(null);
  const [collaborativeData, setCollaborativeData] = useState({
    decisions: [],
    notes: []
  });
  const [accessError, setAccessError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const currentArticle = articles[selectedArticle];
  useScreeningSession(projectId);

    const navigationButtons = [
    { label: 'Project Dashboard', path: `/projects/${id}` },
    { label: 'Duplicate Detection', path: `/projects/${id}/duplicates` },
    { label: 'Abstract Screening', path: `/projects/${id}/screening` },
    { label: 'Full-Text Review', path: `/projects/${id}/full-text` },
    { label: 'Team Statistics', path: `/projects/${id}/team-stats` }
  ];

  const getStatusColor = (articleStatus) => {
    const colors = {
      'include': 'bg-green-100 text-green-800 border border-green-300',
      'exclude': 'bg-red-100 text-red-800 border border-red-300',
      'maybe': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'unscreened': 'bg-gray-100 text-gray-700 border border-gray-300'
    };
    return colors[articleStatus] || colors['unscreened'];
  };

  const loadLocalStorageData = () => {
    try {
      const savedNotes = localStorage.getItem(`screening-notes-${id}`);
      const savedDecisions = localStorage.getItem(`screening-decisions-${id}`);
      const savedBlindMode = localStorage.getItem(`screening-blindmode-${id}`);
      const savedSelectedArticle = localStorage.getItem(`screening-selected-${id}`);
      
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedDecisions) setDecisions(JSON.parse(savedDecisions));
      if (savedBlindMode !== null) setBlindMode(JSON.parse(savedBlindMode));
      
      if (savedSelectedArticle !== null) setSelectedArticle(parseInt(savedSelectedArticle));
    } catch (error) {
      console.error('Error loading local storage data:', error);
      
    }
  };

  const getArticleStatus = (articleId) => {
    return decisions[articleId] || 'unscreened';
  };

  const getOtherDecisions = (articleId) => {
    if (!collaborativeData.decisions) return [];
    
    const otherDecisions = collaborativeData.decisions.filter(
      decision => decision.articleId === articleId && decision.userId !== currentUser?.id
    );
    
    return otherDecisions;
  };

  useEffect(() => {
    if (id && !loading && currentUser) {
      startScreeningSession();
    }

    return () => {
      if (currentSessionId) {
        endScreeningSession();
      }
    };
  }, [id, loading, currentUser]);

  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      if (currentSessionId && id) {
        const token = localStorage.getItem('token');
        const url = `https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/screening-sessions/${currentSessionId}/end`;
        const blob = new Blob([JSON.stringify({})], { type: 'application/json' });
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, blob);
        } else {
          fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            keepalive: true
          }).catch(err => console.error('Failed to end session on unload:', err));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentSessionId, id]);

  const startScreeningSession = async () => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/screening-sessions/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(data.sessionId);
        setIsSessionActive(true);
      }
    } catch (error) {
      console.error('Error starting screening session:', error);
    }
  };

  const endScreeningSession = async () => {
    if (!currentSessionId || !id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/screening-sessions/${currentSessionId}/end`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(null);
        setIsSessionActive(false);
      }
    } catch (error) {
      console.error('Error ending screening session:', error);
    }
  };

  useEffect(() => {
    if (!loading && currentUser) {
      reloadScreeningData();
    }
  }, [blindMode, currentUser, loading]);

  const getArticleConflicts = (articleId) => {
    if (blindMode) {
      return null;
    }

    const myDecision = getArticleStatus(articleId);
    const otherDecisions = getOtherDecisions(articleId);
    
    if (myDecision === 'unscreened' || otherDecisions.length === 0) {
      return null;
    }

    const otherStatuses = [...new Set(otherDecisions.map(d => d.status).filter(s => s !== 'unscreened'))];
    const hasConflicts = otherStatuses.some(status => status !== myDecision);
    
    if (!hasConflicts) {
      return null;
    }

    return {
      myDecision,
      otherDecisions: otherStatuses,
      reviewerCount: otherDecisions.length,
      conflictType: otherStatuses.length > 1 ? 'multiple' : 'simple'
    };
  };

const IncludeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const MaybeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const ExcludeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const ConflictIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

  const hasConflicts = (articleId) => {
    return getArticleConflicts(articleId) !== null;
  };

  const getConflictCount = () => {
    return articles.filter(article => hasConflicts(article.id)).length;
  };

  const getStatusCount = () => {
    const counts = { 
      include: 0, 
      exclude: 0, 
      maybe: 0, 
      unscreened: 0, 
      conflicts: 0,
      duplicates: 0
    };
    
    articles.forEach(article => {
      const articleStatus = getArticleStatus(article.id);
      counts[articleStatus] = (counts[articleStatus] || 0) + 1;
      
      if (hasConflicts(article.id)) {
        counts.conflicts = (counts.conflicts || 0) + 1;
      }
      
      if (article.duplicateStatus === 'duplicate') {
        counts.duplicates = (counts.duplicates || 0) + 1;
      }
    });
    
    return counts;
  };

  const refreshScreeningData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !currentUser) return;

      const articlesResponse = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/articles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        const nonDuplicateArticles = articlesData.filter(article => 
          article.duplicateStatus !== 'duplicate'
        );
        
        setArticles(nonDuplicateArticles);
        
        const screeningResponse = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/screening-data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (screeningResponse.ok) {
          const screeningData = await screeningResponse.json();
          setCollaborativeData(screeningData);
          
          const userDecisions = {};
          const userNotes = {};
          
          screeningData.decisions?.forEach(decision => {
            if (decision.userId === currentUser.id) {
              userDecisions[decision.articleId] = decision.status;
            }
          });
          
          screeningData.notes?.forEach(note => {
            if (note.userId === currentUser.id) {
              userNotes[note.articleId] = note.notes;
            }
          });
          
          setDecisions(userDecisions);
          setNotes(userNotes);
        }
      }
    } catch (error) {
      console.error('Error refreshing screening data:', error);
    }
  };

  useEffect(() => {
    window.refreshScreeningPage = refreshScreeningData;
    
    return () => {
      delete window.refreshScreeningPage;
    };
  }, [id, currentUser]);

  const connectWebSocket = () => {
    if (!currentUser || !id) return;

    const token = localStorage.getItem('token');
    const wsUrl = `ws://localhost:5000/?projectId=${id}&userId=${currentUser.id}&token=${token}`;
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'SCREENING_UPDATE':
            handleScreeningUpdate(data.decision);
            break;
          case 'USER_JOINED':
            setOnlineUsers(data.users || []);
            break;
          case 'USER_LEFT':
            setOnlineUsers(data.users || []);
            break;
          case 'USERS_LIST':
            setOnlineUsers(data.users || []);
            break;
          case 'BLIND_MODE_UPDATED':
          case 'BLIND_MODE_UPDATE':
            if (data.projectId === id) {
              setBlindMode(data.blindMode);
              localStorage.setItem(`screening-blindmode-${id}`, JSON.stringify(data.blindMode));
              reloadScreeningData();
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    wsRef.current.onclose = (event) => {
      if (event.code !== 1001 && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleScreeningUpdate = (decision) => {
    setCollaborativeData(prev => {
      const newDecisions = prev.decisions.filter(d => 
        !(d.userId === decision.userId && d.articleId === decision.articleId)
      );
      newDecisions.push(decision);
      
      return {
        ...prev,
        decisions: newDecisions
      };
    });

    if (decision.userId === currentUser?.id) {
      setDecisions(prev => ({
        ...prev,
        [decision.articleId]: decision.status
      }));
      
      if (decision.notes) {
        setNotes(prev => ({
          ...prev,
          [decision.articleId]: decision.notes
        }));
      }
    }
  };

  const isProjectOwner = () => {
    return currentUser && projectOwnerId && currentUser.id === projectOwnerId;
  };

  const toggleBlindMode = async () => {
    if (!isProjectOwner()) {
      alert('Only project owner can change blind mode settings');
      return;
    }

    const newBlindMode = !blindMode;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/blind-mode`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ blindMode: newBlindMode })
      });

      if (response.ok) {
        setBlindMode(newBlindMode);
        localStorage.setItem(`screening-blindmode-${id}`, JSON.stringify(newBlindMode));
        reloadScreeningData();
        
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'BLIND_MODE_UPDATED',
            projectId: id,
            blindMode: newBlindMode,
            userId: currentUser.id
          }));
        }
      } else {
        throw new Error('Failed to update blind mode');
      }
    } catch (error) {
      console.error('Error updating blind mode:', error);
      setBlindMode(newBlindMode);
      localStorage.setItem(`screening-blindmode-${id}`, JSON.stringify(newBlindMode));
    }
  };

  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      try {
        setLoading(true);
        
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const token = localStorage.getItem('token') || tokenFromUrl;

        if (!token) {
          setAccessError('No authentication token found');
          navigate('/login');
          return;
        }

        if (tokenFromUrl) {
          localStorage.setItem('token', token);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const userResponse = await fetch('https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!userResponse.ok) {
          setAccessError('Authentication failed');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        const userData = await userResponse.json();
        setCurrentUser(userData);

        try {
          const accessResponse = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/check-access`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (!accessResponse.ok) {
            setAccessError('You do not have access to this project');
            setLoading(false);
            return;
          }

          const projectResponse = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });

          if (projectResponse.ok) {
            const projectData = await projectResponse.json();
             setProject(projectData);
            setProjectOwnerId(projectData.ownerId || projectData.owner?.id);
            
            if (projectData.blindMode !== undefined) {
              setBlindMode(projectData.blindMode);
              localStorage.setItem(`screening-blindmode-${id}`, JSON.stringify(projectData.blindMode));
            }
          }
        } catch (accessError) {
          console.error('Access check error:', accessError);
        }

        await loadProjectData(token, userData);

      } catch (error) {
        console.error('Error checking access:', error);
        setAccessError('Error loading project');
        setLoading(false);
      }
    };

    checkAccessAndLoadData();
  }, [id, navigate]);

  const isOwner = () => {
    return currentUser && projectOwnerId && currentUser.id === projectOwnerId;
  };
const loadProjectData = async (token, userData) => {
  try {
    const articlesResponse = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/articles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!articlesResponse.ok) {
      throw new Error('Failed to load articles');
    }

    const articlesData = await articlesResponse.json();
    const nonDuplicateArticles = articlesData.filter(article => 
      article.duplicateStatus !== 'duplicate'
    );
    
    setArticles(nonDuplicateArticles);

    try {
      const screeningResponse = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/screening-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (screeningResponse.ok) {
        const screeningData = await screeningResponse.json();
        
        console.log('🔍 DEBUG - First decision object:', screeningData.decisions[0]);
        console.log('🔍 DEBUG - All keys in first decision:', Object.keys(screeningData.decisions[0]));
        
        setCollaborativeData(screeningData);
        
        const userDecisions = {};
        const userNotes = {};
        
        // Since decisions don't have userId, assume all belong to current user
        // This works for single-user projects, but you'll need to fix the backend later
        screeningData.decisions?.forEach(decision => {
          userDecisions[decision.articleId] = decision.status;
          console.log(`✅ Added decision for article ${decision.articleId}: ${decision.status}`);
        });
        
        console.log('🔍 DEBUG - Final userDecisions:', userDecisions);
        
        setDecisions(userDecisions);
        setNotes(userNotes);
        
        // DON'T call loadLocalStorageData here - it overwrites our API data
        // Only load localStorage as fallback if API fails
      } else {
        console.log('⚠️ Screening API failed, loading from localStorage');
        loadLocalStorageData();
      }
    } catch (error) {
      console.error('Error loading screening data:', error);
      loadLocalStorageData(); // Only fallback to localStorage on error
    }

    setLoading(false);
  } catch (error) {
    console.error('Error loading project data:', error);
    setLoading(false);
  }
};  const saveScreeningData = async (articleId, status, noteText) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/screening-decisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          articleId: articleId,
          status: status,
          notes: noteText || ''
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        setDecisions(prev => ({ ...prev, [articleId]: status }));
        setNotes(prev => ({ ...prev, [articleId]: noteText || '' }));
        
        const newDecision = {
          id: result.decision?.id || Date.now(),
          userId: currentUser.id,
          articleId: articleId,
          status: status,
          notes: noteText,
          user: currentUser,
          createdAt: new Date().toISOString()
        };
        
        setCollaborativeData(prev => ({
          ...prev,
          decisions: [...prev.decisions.filter(d => 
            !(d.userId === currentUser.id && d.articleId === articleId)
          ), newDecision]
        }));

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'SCREENING_UPDATE',
            decision: newDecision,
            projectId: id
          }));
        }

        const newDecisions = { ...decisions, [articleId]: status };
        const newNotes = { ...notes, [articleId]: noteText || '' };
        localStorage.setItem(`screening-decisions-${id}`, JSON.stringify(newDecisions));
        localStorage.setItem(`screening-notes-${id}`, JSON.stringify(newNotes));

      } else {
        const errorText = await response.text();
        console.error('Backend save failed:', response.status, errorText);
        throw new Error(`Backend save failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving screening data:', error);
      
      const newDecisions = { ...decisions, [articleId]: status };
      const newNotes = { ...notes, [articleId]: noteText || '' };
      setDecisions(newDecisions);
      setNotes(newNotes);
      localStorage.setItem(`screening-decisions-${id}`, JSON.stringify(newDecisions));
      localStorage.setItem(`screening-notes-${id}`, JSON.stringify(newNotes));
    }
  };

  const reloadScreeningData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !currentUser) return;

      const screeningResponse = await fetch(`https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/projects/${id}/screening-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (screeningResponse.ok) {
        const screeningData = await screeningResponse.json();
        
        setCollaborativeData(screeningData);
        
        const userDecisions = {};
        const userNotes = {};
        
        screeningData.decisions?.forEach(decision => {
          if (decision.userId === currentUser.id) {
            userDecisions[decision.articleId] = decision.status;
          }
        });
        
        screeningData.notes?.forEach(note => {
          if (note.userId === currentUser.id) {
            userNotes[note.articleId] = note.notes;
          }
        });
        
        setDecisions(userDecisions);
        setNotes(userNotes);
      }
    } catch (error) {
      console.error('Error reloading screening data:', error);
    }
  };

  const setArticleStatus = (articleId, newStatus) => {
    const currentNote = notes[articleId] || '';
    saveScreeningData(articleId, newStatus, currentNote);
    goToNextArticle();
  };

  const addNote = (text) => {
    if (!currentArticle) return;
    const currentStatus = decisions[currentArticle.id] || 'unscreened';
    
    setNotes(prev => ({ ...prev, [currentArticle.id]: text }));
    
    if (addNote.timeout) clearTimeout(addNote.timeout);
    addNote.timeout = setTimeout(() => {
      saveScreeningData(currentArticle.id, currentStatus, text);
    }, 1000);
  };

  const goToNextArticle = () => {
    if (selectedArticle < articles.length - 1) {
      setSelectedArticle(prev => prev + 1);
    }
  };

  const getAllDecisionsForArticle = (articleId) => {
    const allDecisions = [];
    
    if (decisions[articleId] && decisions[articleId] !== 'unscreened') {
      allDecisions.push({
        userId: currentUser?.id,
        status: decisions[articleId],
        user: currentUser
      });
    }
    
    const otherDecisions = getOtherDecisions(articleId);
    allDecisions.push(...otherDecisions);
    
    return allDecisions;
  };

  const filteredArticles = articles.filter(article => {
    if (article.duplicateStatus === 'duplicate') {
      return false;
    }
    
    const matchesSearch = searchTerm === '' || 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.abstract?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const articleStatus = getArticleStatus(article.id);
    const matchesStatus = filters.status === 'all' || filters.status === articleStatus;
    
    const articleYear = article.date ? new Date(article.date).getFullYear() : 0;
    const matchesYear = articleYear >= filters.yearRange[0] && articleYear <= filters.yearRange[1];
    
    const reviewerDecisions = getAllDecisionsForArticle(article.id);
    const uniqueUserIds = new Set();
    reviewerDecisions.forEach(decision => {
      if (decision.userId) {
        uniqueUserIds.add(decision.userId);
      } else if (decision.user?.id) {
        uniqueUserIds.add(decision.user.id);
      }
    });
    
    const uniqueReviewerCount = uniqueUserIds.size;
    
    let matchesReviewerCount = true;
    
    switch (filters.reviewerCount) {
      case 'single-reviewer':
        matchesReviewerCount = uniqueReviewerCount === 1;
        break;
      case 'multiple-reviewers':
        matchesReviewerCount = uniqueReviewerCount >= 2;
        break;
      case 'unscreened':
        matchesReviewerCount = uniqueReviewerCount === 0;
        break;
      default:
        matchesReviewerCount = true;
    }
    
    return matchesSearch && matchesStatus && matchesYear && matchesReviewerCount;
  });

  if (accessError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-bricolage">
        <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-black mb-2">Access Denied</h2>
          <p className="text-gray-700 mb-4">{accessError}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-bricolage">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading articles...</p>
      </div>
    </div>
  );

  if (!articles.length) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-bricolage">
      <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
        <div className="text-4xl mb-4">📚</div>
        <h2 className="text-xl font-bold text-black mb-2">No articles imported yet</h2>
        <p className="text-gray-700">Import some articles to get started with screening.</p>
      </div>
    </div>
  );

  const statusCount = getStatusCount();
  const totalArticles = articles.length;
  const conflictCount = getConflictCount();
  const userIsOwner = isProjectOwner();

  return (
    <div className="h-screen flex bg-white font-bricolage text-black">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-2 bg-white border border-gray-200  -mr-12 rounded-lg p-1 shadow-sm">
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

      {/* LEFT: Article list */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-lg font-bold text-black">Collaborative Screening</h1>
            <button
              onClick={toggleBlindMode}
              disabled={!userIsOwner}
              className={`flex items-center cursor-pointer gap-2 px-3 py-1 rounded text-xs font-medium ${
                blindMode 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              } ${!userIsOwner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={userIsOwner ? 'Toggle blind mode' : 'Only project owner can change blind mode'}
            >
              <span className={`w-2 h-2 rounded-full ${blindMode ? 'bg-white' : 'bg-yellow-500'}`}></span>
              {blindMode ? 'Blind Mode On' : 'Blind Mode Off'}
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-xs mb-3 text-gray-600">
            <div className={`w-2 h-2 rounded-full ${wsRef.current?.readyState === WebSocket.OPEN ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>{wsRef.current?.readyState === WebSocket.OPEN ? 'Real-time Active' : 'Connecting...'}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="bg-gray-200 px-2 py-1 rounded">{totalArticles} total</span>
            <div className="flex gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{statusCount.include}</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{statusCount.maybe}</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">{statusCount.exclude}</span>
              {!blindMode && conflictCount > 0 && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  <ConflictIcon className='h-3 w-3 inline-block' /> {conflictCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black bg-white"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
          </div>
        </div>

        {/* Article List */}
        <div className="flex-1 overflow-y-auto">
          {filteredArticles.map((article, index) => {
            const articleStatus = getArticleStatus(article.id);
            const otherDecisions = getOtherDecisions(article.id);
            const conflict = getArticleConflicts(article.id);
            const isSelected = selectedArticle === articles.findIndex(a => a.id === article.id);
            
            return (
              <div
                key={article.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  isSelected ? 'bg-gray-50 border-l-2 border-l-black' : ''
                } ${!blindMode && conflict ? 'border-l-2 border-l-orange-500' : ''}`}
                onClick={() => {
                  const realIndex = articles.findIndex(a => a.id === article.id);
                  setSelectedArticle(realIndex);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {articleStatus !== 'unscreened' && (
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(articleStatus)}`}>
                        {articleStatus} (You)
                      </span>
                    )}
                    
                    {!blindMode && otherDecisions.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {otherDecisions.slice(0, 3).map(decision => (
                          <span 
                            key={decision.id}
                            className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(decision.status)}`}
                            title={`${decision.user?.firstName || 'User'}: ${decision.status}`}
                          >
                            {decision.user?.firstName || 'U'}: {decision.status}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {!blindMode && conflict && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800 border border-orange-300">
                        <ConflictIcon  className='h-3 w-3 inline-block' /> Conflict
                      </span>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {article.date ? new Date(article.date).getFullYear() : 'N/A'}
                  </span>
                </div>
                
                <div className="text-sm font-semibold text-black mb-2 line-clamp-2">
                  {article.title}
                </div>
                <div className="text-xs text-gray-700 mb-1">
                  {article.authors?.slice(0, 2).map(a => a.name).join(", ")}
                  {article.authors?.length > 2 && ' et al.'}
                </div>
                <div className="text-xs text-gray-600">{article.journal}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER: Article details */}
    <div className="flex-1 flex flex-col p-6 mt-12">
  <div className="bg-white border border-gray-200 rounded-lg flex-1 flex flex-col overflow-hidden relative">
    {currentArticle ? (
      <>
        {/* Compact Header Section */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-black line-clamp-2 mb-1">{currentArticle.title}</h1>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Article {selectedArticle + 1} of {totalArticles}</span>
              </div>
            </div>
          </div>

          {/* Compact Info Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <span className="font-medium text-black text-xs">Authors</span>
              <p className="mt-0.5 text-gray-700 ">{currentArticle.authors?.slice(0, 2).map(a => a.name).join(", ") || "No authors"}{currentArticle.authors?.length > 2 && '...'}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <span className="font-medium text-black text-xs">Journal</span>
              <p className="mt-0.5 text-gray-700 ">{currentArticle.journal || "N/A"}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <span className="font-medium text-black text-xs">Date</span>
              <p className="mt-0.5 text-gray-700">{currentArticle.date ? new Date(currentArticle.date).getFullYear() : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {!blindMode && (() => {
              const conflict = getArticleConflicts(currentArticle.id);
              if (!conflict) return null;

              return (
                <div className="p-3 bg-orange-50 rounded border border-orange-200">
                  <div className="flex items-start gap-3">
                    <ConflictIcon className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-orange-800">Conflict Detected</h4>
                        <div className="flex gap-2 text-xs">
                          <span className={`px-2 py-1 rounded border ${getStatusColor(conflict.myDecision)}`}>
                            You: {conflict.myDecision}
                          </span>
                          <span className="px-2 py-1 rounded bg-red-100 text-red-800 border border-red-300">
                            {conflict.reviewerCount} other{conflict.reviewerCount > 1 ? 's' : ''} disagree
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-orange-700">
                        <span className="font-medium">Other decisions:</span>
                        {' '}
                        {conflict.otherDecisions.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {!blindMode && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">All Reviewers' Decisions</h4>
                <div className="space-y-2">
                  {decisions[currentArticle.id] && decisions[currentArticle.id] !== 'unscreened' && (
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-green-200">
                      <span className="font-medium text-green-800 text-xs">
                        {currentUser?.firstName} {currentUser?.lastName} (You)
                      </span>
                      <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(decisions[currentArticle.id])}`}>
                        {decisions[currentArticle.id]}
                      </span>
                    </div>
                  )}
                  
                  {getOtherDecisions(currentArticle.id).map(decision => (
                    <div key={decision.id} className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                      <span className="font-medium text-blue-800 text-xs">
                        {decision.user?.firstName} {decision.user?.lastName}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(decision.status)}`}>
                        {decision.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-md font-semibold text-black mb-2">Abstract</h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                  {currentArticle.abstract || "No abstract available."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <h4 className="font-medium text-black text-sm mb-1">URL</h4>
                <a href={currentArticle.url} target="_blank" rel="noreferrer" 
                   className="text-blue-600 hover:text-blue-800 underline break-all text-xs">
                  {currentArticle.url || "N/A"}
                </a>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <h4 className="font-medium text-black text-sm mb-1">Topics</h4>
                <p className="text-xs text-gray-700">{currentArticle.topics?.map(t => t.value).join(", ") || "N/A"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-black mb-2">Screening Notes</h3>
              <textarea
                placeholder="Add your screening notes here..."
                value={notes[currentArticle.id] || ""}
                onChange={(e) => addNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black resize-none bg-white text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>
              {/* Sticky Decision Buttons - Bottom Center */}
              <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
  <div className="flex gap-3 justify-center">
    {(() => {
      const currentArticleStatus = getArticleStatus(currentArticle.id);
      return (
        <>
          {/* Include Button */}
          <div className="relative group">
            <button 
              onClick={() => setArticleStatus(currentArticle.id, 'include')}
              className={`px-6 py-3 rounded-lg font-medium text-lg transition-all flex items-center gap-2 ${
                currentArticleStatus === 'include' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
              }`}
            >
              <IncludeIcon className="w-30 h-5" />
              {currentArticleStatus === 'include' ? `` : ''}
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
              Include
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Maybe Button */}
          <div className="relative group">
            <button 
              onClick={() => setArticleStatus(currentArticle.id, 'maybe')}
              className={`px-6 py-3 rounded-lg font-medium text-lg transition-all flex items-center gap-2 ${
                currentArticleStatus === 'maybe' 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300'
              }`}
            >
              <MaybeIcon className="w-30 h-5" />
              {currentArticleStatus === 'maybe' ? `` : ''}
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
              Maybe
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Exclude Button */}
          <div className="relative group">
            <button 
              onClick={() => setArticleStatus(currentArticle.id, 'exclude')}
              className={`px-6 py-3 rounded-lg font-medium text-lg transition-all flex items-center gap-2 ${
                currentArticleStatus === 'exclude' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
              }`}
            >
              <ExcludeIcon className="w-30 h-5" />
              {currentArticleStatus === 'exclude' ? `` : ''}
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
              Exclude
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </>
      );
    })()}
  </div>
</div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">📖</div>
                <p className="text-lg">Select an article to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

    {/* RIGHT: Filters & Progress */}
<div className="w-80 bg-white border-l border-gray-200 flex flex-col">
  {/* Progress Section - Fixed Height */}
  <div className="p-6 border-b border-gray-200 flex-shrink-0">
    <h3 className="font-bold text-lg text-black mb-4">Screening Progress</h3>
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-700 font-medium">Included</span>
          <span>{statusCount.include}/{totalArticles}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${(statusCount.include / totalArticles) * 100}%` }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-yellow-700 font-medium">Maybe</span>
          <span>{statusCount.maybe}/{totalArticles}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full" 
            style={{ width: `${(statusCount.maybe / totalArticles) * 100}%` }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-red-700 font-medium">Excluded</span>
          <span>{statusCount.exclude}/{totalArticles}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-500 h-2 rounded-full" 
            style={{ width: `${(statusCount.exclude / totalArticles) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {statusCount.conflicts > 0 && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-orange-700 font-medium">Conflicts</span>
            <span>{statusCount.conflicts}/{totalArticles}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full" 
              style={{ width: `${(statusCount.conflicts / totalArticles) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700 font-medium">Unscreened</span>
          <span>{statusCount.unscreened}/{totalArticles}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gray-500 h-2 rounded-full" 
            style={{ width: `${(statusCount.unscreened / totalArticles) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  </div>

  {/* Filters Section - Scrollable */}
  <div className="flex-1 flex flex-col min-h-0">
    <div className="p-6 flex-shrink-0">
      <h3 className="font-bold text-lg text-black mb-4">Filters</h3>
    </div>
    
    <div className="flex-1 overflow-y-auto px-6 pb-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-black mb-3">Publication Year</label>
          <div className="px-2">
            <input 
              type="range" 
              min="2000" 
              max="2024" 
              value={filters.yearRange[1]}
              onChange={(e) => setFilters(prev => ({ ...prev, yearRange: [prev.yearRange[0], parseInt(e.target.value)] }))}
              className="w-full accent-black"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>2000</span>
              <span className="font-medium">{filters.yearRange[1]}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-3">Screening Status</label>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Articles' },
              { value: 'include', label: 'Included' },
              { value: 'exclude', label: 'Excluded' },
              { value: 'maybe', label: 'Maybe' },
              { value: 'unscreened', label: 'Unscreened' }
            ].map(filter => (
              <label key={filter.value} className="flex items-center text-sm text-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="status"
                  checked={filters.status === filter.value}
                  onChange={() => setFilters(prev => ({ ...prev, status: filter.value }))}
                  className="mr-3 text-black focus:ring-black"
                />
                <span className="font-medium">{filter.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-3">Reviewer Count</label>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Articles' },
              { value: 'single-reviewer', label: 'Only 1 Reviewer' },
              { value: 'multiple-reviewers', label: '2+ Reviewers' },
              { value: 'unscreened', label: 'Not Screened' }
            ].map(filter => (
              <label key={filter.value} className="flex items-center text-sm text-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="reviewerCount"
                  checked={filters.reviewerCount === filter.value}
                  onChange={() => setFilters(prev => ({ ...prev, reviewerCount: filter.value }))}
                  className="mr-3 text-black focus:ring-black"
                />
                <span className="font-medium">{filter.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default Screening;
