import React, { createContext, useContext, useState, useEffect } from 'react'

const NoteContext = createContext()

const initialState = {
  subjects: {
    "sub_001": { 
      id: "sub_001", 
      title: "Neural Architectures", 
      courseCode: "NA101",
      color: "Brown",
      lastModified: new Date().toISOString(),
      notebookIds: ["nb_001"] 
    }
  },
  notebooks: {
    "nb_001": { 
      id: "nb_001", 
      subjectId: "sub_001", 
      title: "Attention Mechanisms",
      level: 1,
      currentExp: 100,
      status: "In Progress",
      taskIds: ["tsk_001"],
      noteIds: ["note_001"],
      revisionDate: null,
      isRevisionComplete: false,
      lastModified: new Date().toISOString()
    }
  },
  tasks: {
    "tsk_001": { 
      id: "tsk_001", 
      notebookId: "nb_001",
      title: "Draft LSTM vs. Self-Attention Report", 
      deadline: "2026-04-10",
      isComplete: false,
      difficulty: 3,
      objectiveIds: ["obj_1", "obj_2", "obj_3"]
    }
  },
  objectives: {
    "obj_1": { id: "obj_1", taskId: "tsk_001", text: "Break down 1997 LSTM paper", isDone: true },
    "obj_2": { id: "obj_2", taskId: "tsk_001", text: "Map Bahdanau attention node graph", isDone: false },
    "obj_3": { id: "obj_3", taskId: "tsk_001", text: "Structure modern self-attention evolution", isDone: false }
  },
  notes: {
    "note_001": {
      id: "note_001",
      notebookId: "nb_001",
      title: "Initial Architecture Research",
      content: "The original LSTM paper by Hochreiter & Schmidhuber (1997) introduced the constant error carousel...",
      lastUpdated: new Date().toISOString()
    }
  },
  recentVisits: []
};

export const StateProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const savedState = localStorage.getItem('magnotes_state')
    return savedState ? JSON.parse(savedState) : initialState
  })

  useEffect(() => {
    localStorage.setItem('magnotes_state', JSON.stringify(state))
  }, [state])

  const generateId = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 11)}`;

  const availableColors = ["Brown", "Black", "Blue", "Green", "Pink", "Purple", "Red", "White"];

  const getRelativeTime = (isoString) => {
    if (!isoString) return "Ancient Record";
    const now = new Date();
    const past = new Date(isoString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return past.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const addSubject = (title, courseCode = "", color = null) => {
    const newId = generateId('sub')
    const assignedColor = color || availableColors[Math.floor(Math.random() * availableColors.length)];
    setState(prev => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [newId]: {
          id: newId,
          title,
          courseCode,
          color: assignedColor,
          lastModified: new Date().toISOString(),
          notebookIds: []
        }
      }
    }))
  }

  const updateSubjectLastModified = (subjectId) => {
    setState(prev => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subjectId]: {
          ...prev.subjects[subjectId],
          lastModified: new Date().toISOString()
        }
      }
    }))
  }

  const getSubjectStats = (subjectId) => {
    const subject = state.subjects[subjectId];
    if (!subject) return { notebooksCount: 0, tasksTotal: 0, tasksCompleted: 0, notesCount: 0 };

    let tasksTotal = 0;
    let tasksCompleted = 0;
    let notesCount = 0;

    subject.notebookIds.forEach(nbId => {
      const notebook = state.notebooks[nbId];
      if (notebook) {
        tasksTotal += (notebook.taskIds || []).length;
        notesCount += (notebook.noteIds || []).length;
        (notebook.taskIds || []).forEach(tId => {
          const task = state.tasks[tId];
          if (task && task.isComplete) tasksCompleted++;
        });
      }
    });

    return {
      notebooksCount: subject.notebookIds.length,
      tasksTotal,
      tasksCompleted,
      notesCount
    };
  };

  const getNotebookStats = (notebookId) => {
    const notebook = state.notebooks[notebookId];
    if (!notebook) return { tasksTotal: 0, tasksCompleted: 0, notesCount: 0 };

    let tasksCompleted = 0;
    const taskIds = notebook.taskIds || [];
    const noteIds = notebook.noteIds || [];

    taskIds.forEach(tId => {
      const task = state.tasks[tId];
      if (task && task.isComplete) tasksCompleted++;
    });

    return {
      tasksTotal: taskIds.length,
      tasksCompleted,
      notesCount: noteIds.length
    };
  };

  const getLevelThreshold = (level) => {
    // Pattern: 1000, 1200, 1600, 1800...
    const thresholds = [1000, 1200, 1600, 1800, 2200, 2400, 2800, 3000];
    return thresholds[level - 1] || (1000 + (level - 1) * 300);
  };

  const getNotebookLevelingData = (notebookId) => {
    const notebook = state.notebooks[notebookId];
    if (!notebook) return { level: 1, currentExp: 0, nextLevelExp: 1000, progress: 0 };

    let totalExp = notebook.currentExp || 0;
    let level = 1;
    let threshold = getLevelThreshold(level);

    // Calculate level by consuming thresholds
    while (totalExp >= threshold) {
      totalExp -= threshold;
      level++;
      threshold = getLevelThreshold(level);
      if (level > 100) break; // Safety cap
    }

    return {
      level,
      currentExp: totalExp, // EXP inside the current level
      nextLevelExp: threshold,
      progress: threshold ? Math.min((totalExp / threshold) * 100, 100) : 0
    };
  };

  const deleteSubject = (subjectId) => {
    setState(prev => {
      const subject = prev.subjects[subjectId]
      if (!subject) return prev

      const newNotebooks = { ...prev.notebooks }
      const newTasks = { ...prev.tasks }
      const newObjectives = { ...prev.objectives }
      const newNotes = { ...prev.notes }

      // Deep clean all children of the subject
      subject.notebookIds.forEach(nbId => {
        const notebook = prev.notebooks[nbId]
        if (notebook) {
          // Clean up notes associated with the notebook
          ;(notebook.noteIds || []).forEach(nId => delete newNotes[nId])

          // Clean up tasks and objectives
          ;(notebook.taskIds || []).forEach(tId => {
            const task = prev.tasks[tId]
            if (task) {
              ;(task.objectiveIds || []).forEach(oId => delete newObjectives[oId])
              delete newTasks[tId]
            }
          })
          delete newNotebooks[nbId]
        }
      })

      const newSubjects = { ...prev.subjects }
      delete newSubjects[subjectId]

      return {
        ...prev,
        subjects: newSubjects,
        notebooks: newNotebooks,
        tasks: newTasks,
        objectives: newObjectives,
        notes: newNotes
      }
    })
  }

  const updateSubject = (subjectId, updates) => {
    setState(prev => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subjectId]: { ...prev.subjects[subjectId], ...updates }
      }
    }))
  }

  const addNotebook = (subjectId, title) => {
    const newId = generateId('nb')
    setState(prev => ({
      ...prev,
      notebooks: {
        ...prev.notebooks,
        [newId]: { 
          id: newId, 
          subjectId, 
          title, 
          level: 1, 
          currentExp: 0, 
          status: "In Progress",
          taskIds: [], 
          noteIds: [],
          revisionDate: null,
          isRevisionComplete: false,
          lastModified: new Date().toISOString() 
        }
      },
      subjects: {
        ...prev.subjects,
        [subjectId]: {
          ...prev.subjects[subjectId],
          lastModified: new Date().toISOString(),
          notebookIds: [...prev.subjects[subjectId].notebookIds, newId]
        }
      }
    }))
  }

  const deleteNotebook = (notebookId) => {
    setState(prev => {
      const notebook = prev.notebooks[notebookId]
      if (!notebook) return prev

      const newTasks = { ...prev.tasks }
      const newObjectives = { ...prev.objectives }
      const newNotes = { ...prev.notes }

      // Clean up notes associated with the notebook
      ;(notebook.noteIds || []).forEach(nId => delete newNotes[nId])

      // Deep clean all tasks and their children
      ;(notebook.taskIds || []).forEach(tId => {
        const task = prev.tasks[tId]
        if (task) {
          ;(task.objectiveIds || []).forEach(oId => delete newObjectives[oId])
          delete newTasks[tId]
        }
      })

      const newNotebooks = { ...prev.notebooks }
      delete newNotebooks[notebookId]

      const newSubjects = { ...prev.subjects }
      const subject = newSubjects[notebook.subjectId]
      if (subject) {
        newSubjects[notebook.subjectId] = {
          ...subject,
          lastModified: new Date().toISOString(), // Propagate recency to subject
          notebookIds: subject.notebookIds.filter(id => id !== notebookId)
        }
      }

      return {
        ...prev,
        subjects: newSubjects,
        notebooks: newNotebooks,
        tasks: newTasks,
        objectives: newObjectives,
        notes: newNotes
      }
    })
  }
  
  const addTask = (notebookId, taskData) => {
    const { title, deadline, difficulty, objectives } = taskData
    const taskId = generateId('tsk')
    
    // Create objective objects
    const objectiveIds = []
    const newObjectives = {}
    
    ;(objectives || []).forEach(text => {
      const objId = generateId('obj')
      objectiveIds.push(objId)
      newObjectives[objId] = { id: objId, taskId, text, isDone: false }
    })

    setState(prev => ({
      ...prev,
      objectives: { ...prev.objectives, ...newObjectives },
      tasks: {
        ...prev.tasks,
        [taskId]: { 
          id: taskId, 
          notebookId, 
          title, 
          deadline: deadline || "", 
          isComplete: false, 
          difficulty: difficulty || 1, 
          objectiveIds 
        }
      },
      notebooks: {
        ...prev.notebooks,
        [notebookId]: {
          ...prev.notebooks[notebookId],
          lastModified: new Date().toISOString(), // Propagate recency to notebook
          taskIds: [...prev.notebooks[notebookId].taskIds, taskId]
        }
      },
      subjects: { // Propagate recency to subject
        ...prev.subjects,
        [prev.notebooks[notebookId].subjectId]: {
          ...prev.subjects[prev.notebooks[notebookId].subjectId],
          lastModified: new Date().toISOString()
        }
      }
    }))
  }

  const deleteTask = (taskId) => {
    setState(prev => {
      const task = prev.tasks[taskId]
      if (!task) return prev

      const newObjectives = { ...prev.objectives }
      ;(task.objectiveIds || []).forEach(id => delete newObjectives[id])

      const newTasks = { ...prev.tasks }
      delete newTasks[taskId]

      const newNotebooks = { ...prev.notebooks }
      const notebook = newNotebooks[task.notebookId]
      if (notebook) {
        newNotebooks[task.notebookId] = {
          ...notebook,
          lastModified: new Date().toISOString(), // Propagate recency to notebook
          taskIds: (notebook.taskIds || []).filter(id => id !== taskId)
        }
      }

      const newSubjects = { ...prev.subjects }
      const subjectId = prev.notebooks[task.notebookId].subjectId
      if (newSubjects[subjectId]) {
        newSubjects[subjectId] = {
          ...newSubjects[subjectId],
          lastModified: new Date().toISOString() // Propagate recency to subject
        }
      }

      // PERSISTENT EXP: We do NOT subtract (task.difficulty * 100) here.
      // Scholars keep their earned knowledge even if the mandate is archived.

      return {
        ...prev,
        subjects: newSubjects,
        notebooks: newNotebooks,
        tasks: newTasks,
        objectives: newObjectives
      }
    })
  }

  const deleteObjective = (objectiveId) => {
    setState(prev => {
      const obj = prev.objectives[objectiveId]
      if (!obj) return prev

      const taskId = obj.taskId
      const task = prev.tasks[taskId]
      if (!task) return prev

      const newObjectives = { ...prev.objectives }
      delete newObjectives[objectiveId]

      const newTasks = {
        ...prev.tasks,
        [taskId]: {
          ...task,
          objectiveIds: (task.objectiveIds || []).filter(id => id !== objectiveId)
        }
      }

      const newNotebooks = { ...prev.notebooks }
      const notebook = newNotebooks[task.notebookId]
      if (notebook) {
        newNotebooks[task.notebookId] = {
          ...notebook,
          lastModified: new Date().toISOString() // Propagate recency to notebook
        }
      }

      const newSubjects = { ...prev.subjects }
      const subjectId = prev.notebooks[task.notebookId].subjectId
      if (newSubjects[subjectId]) {
        newSubjects[subjectId] = {
          ...newSubjects[subjectId],
          lastModified: new Date().toISOString() // Propagate recency to subject
        }
      }

      return {
        ...prev,
        subjects: newSubjects,
        notebooks: newNotebooks,
        objectives: newObjectives,
        tasks: newTasks
      }
    })
  }

  const addObjective = (taskId, text) => {
    const newId = generateId('obj')
    setState(prev => ({
      ...prev,
      objectives: {
        ...prev.objectives,
        [newId]: { id: newId, taskId, text, isDone: false }
      },
      tasks: {
        ...prev.tasks,
        [taskId]: {
          ...prev.tasks[taskId],
          objectiveIds: [...prev.tasks[taskId].objectiveIds, newId]
        }
      },
      notebooks: {
        ...prev.notebooks,
        [prev.tasks[taskId].notebookId]: {
          ...prev.notebooks[prev.tasks[taskId].notebookId],
          lastModified: new Date().toISOString() // Propagate recency to notebook
        }
      },
      subjects: { // Propagate recency to subject
        ...prev.subjects,
        [prev.notebooks[prev.tasks[taskId].notebookId].subjectId]: {
          ...prev.subjects[prev.notebooks[prev.tasks[taskId].notebookId].subjectId],
          lastModified: new Date().toISOString()
        }
      }
    }))
  }

  const toggleObjective = (objectiveId) => {
    setState(prev => {
      const obj = prev.objectives[objectiveId];
      if (!obj) return prev;

      const newIsDone = !obj.isDone;
      const taskId = obj.taskId;
      const task = prev.tasks[taskId];
      
      // Update objectives
      const newObjectives = {
        ...prev.objectives,
        [objectiveId]: { ...obj, isDone: newIsDone }
      };

      // Check if all objectives for this task are now done
      const allDone = task.objectiveIds.every(id => 
        id === objectiveId ? newIsDone : newObjectives[id].isDone
      );

      // Prepare state updates
      const stateUpdates = {
        objectives: newObjectives,
        tasks: { ...prev.tasks },
        notebooks: { ...prev.notebooks },
        subjects: { ...prev.subjects } // Include subjects for recency propagation
      };

      // Handle Task Completion & EXP Award
      if (allDone && !task.isComplete) {
        stateUpdates.tasks[taskId] = { ...task, isComplete: true };
        
        const notebookId = task.notebookId;
        const notebook = prev.notebooks[notebookId];
        if (notebook) {
          const expAward = (task.difficulty || 1) * 100;
          const newTotalExp = (notebook.currentExp || 0) + expAward;
          
          let tempExp = newTotalExp;
          let newLevel = 1;
          let threshold = getLevelThreshold(newLevel);
          while (tempExp >= threshold) {
            tempExp -= threshold;
            newLevel++;
            threshold = getLevelThreshold(newLevel);
            if (newLevel > 100) break;
          }

          stateUpdates.notebooks[notebookId] = {
            ...notebook,
            currentExp: newTotalExp,
            level: newLevel,
            lastModified: new Date().toISOString() // Propagate recency to notebook
          };

          // Propagate recency to subject
          const subjectId = notebook.subjectId;
          stateUpdates.subjects[subjectId] = {
            ...prev.subjects[subjectId],
            lastModified: new Date().toISOString()
          };
        }
      } else if (!allDone && task.isComplete) {
        // Penalty for unchecking: subtract EXP
        stateUpdates.tasks[taskId] = { ...task, isComplete: false };
        
        const notebookId = task.notebookId;
        const notebook = prev.notebooks[notebookId];
        if (notebook) {
          const expPenalty = (task.difficulty || 1) * 100;
          const newTotalExp = Math.max(0, (notebook.currentExp || 0) - expPenalty);
          
          let tempExp = newTotalExp;
          let newLevel = 1;
          let threshold = getLevelThreshold(newLevel);
          while (tempExp >= threshold) {
            tempExp -= threshold;
            newLevel++;
            threshold = getLevelThreshold(newLevel);
            if (newLevel > 100) break;
          }

          stateUpdates.notebooks[notebookId] = {
            ...notebook,
            currentExp: newTotalExp,
            level: newLevel,
            lastModified: new Date().toISOString() // Propagate recency to notebook
          };

          // Propagate recency to subject
          const subjectId = notebook.subjectId;
          stateUpdates.subjects[subjectId] = {
            ...prev.subjects[subjectId],
            lastModified: new Date().toISOString()
          };
        }
      } else {
        // Just update objectives if no task status change, but still propagate recency
        stateUpdates.tasks[taskId] = { ...task }; 
        const notebookId = task.notebookId;
        const notebook = prev.notebooks[notebookId];
        if (notebook) {
          stateUpdates.notebooks[notebookId] = {
            ...notebook,
            lastModified: new Date().toISOString() // Propagate recency to notebook
          };
          const subjectId = notebook.subjectId;
          stateUpdates.subjects[subjectId] = {
            ...prev.subjects[subjectId],
            lastModified: new Date().toISOString()
          };
        }
      }

      return { ...prev, ...stateUpdates };
    });
  }

  const toggleTask = (taskId) => {
    setState(prev => {
      const task = prev.tasks[taskId];
      if (!task) return prev;
      
      const newIsComplete = !task.isComplete;
      
      // Calculate Revision Date (7 days from now) if completing
      let completedAt = task.completedAt || null;
      let revisionDate = task.revisionDate || null;
      
      if (newIsComplete) {
        const now = new Date();
        completedAt = now.toISOString();
        const revDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        revisionDate = revDate.toISOString();
      } else {
        // Reset if unchecking
        completedAt = null;
        revisionDate = null;
      }

      const stateUpdates = {
        tasks: {
          ...prev.tasks,
          [taskId]: { 
            ...task, 
            isComplete: newIsComplete, 
            completedAt, 
            revisionDate,
            isRevisionComplete: false // Reset revision when completion toggles
          }
        },
        notebooks: { ...prev.notebooks },
        subjects: { ...prev.subjects } // Include subjects for recency propagation
      };

      // Symmetric Award/Penalty Logic
      const notebookId = task.notebookId;
      const notebook = prev.notebooks[notebookId];
      if (notebook) {
        const expChange = (task.difficulty || 1) * 100;
        const newTotalExp = newIsComplete 
          ? (notebook.currentExp || 0) + expChange 
          : Math.max(0, (notebook.currentExp || 0) - expChange);

        // Recalculate level for syncing state
        let tempExp = newTotalExp;
        let newLevel = 1;
        let threshold = getLevelThreshold(newLevel);
        while (tempExp >= threshold) {
          tempExp -= threshold;
          newLevel++;
          threshold = getLevelThreshold(newLevel);
          if (newLevel > 100) break;
        }

        stateUpdates.notebooks[notebookId] = {
          ...notebook,
          currentExp: newTotalExp,
          level: newLevel,
          lastModified: new Date().toISOString() // Propagate recency to notebook
        };

        // Propagate recency to subject
        const subjectId = notebook.subjectId;
        stateUpdates.subjects[subjectId] = {
          ...prev.subjects[subjectId],
          lastModified: new Date().toISOString()
        };
      }

      return { ...prev, ...stateUpdates };
    });
  }

  const toggleTaskRevision = (taskId) => {
    setState(prev => {
      const task = prev.tasks[taskId];
      if (!task) return prev;
      
      const newNotebooks = { ...prev.notebooks };
      const notebook = newNotebooks[task.notebookId];
      if (notebook) {
        newNotebooks[task.notebookId] = {
          ...notebook,
          lastModified: new Date().toISOString() // Propagate recency to notebook
        };
      }

      const newSubjects = { ...prev.subjects };
      const subjectId = prev.notebooks[task.notebookId].subjectId;
      if (newSubjects[subjectId]) {
        newSubjects[subjectId] = {
          ...newSubjects[subjectId],
          lastModified: new Date().toISOString() // Propagate recency to subject
        };
      }

      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: { ...task, isRevisionComplete: !task.isRevisionComplete }
        },
        notebooks: newNotebooks,
        subjects: newSubjects
      };
    });
  }

  const addNote = (notebookId, title, content) => {
    const newId = generateId('note')
    setState(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [newId]: { 
          id: newId, 
          notebookId, 
          title, 
          content, 
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString() 
        }
      },
      notebooks: {
        ...prev.notebooks,
        [notebookId]: {
          ...prev.notebooks[notebookId],
          lastModified: new Date().toISOString(), // Propagate recency to notebook
          noteIds: [...(prev.notebooks[notebookId].noteIds || []), newId]
        }
      },
      subjects: { // Propagate recency to subject
        ...prev.subjects,
        [prev.notebooks[notebookId].subjectId]: {
          ...prev.subjects[prev.notebooks[notebookId].subjectId],
          lastModified: new Date().toISOString()
        }
      }
    }))
  }

  const deleteNote = (noteId) => {
    setState(prev => {
      const note = prev.notes[noteId]
      if (!note) return prev

      const newNotes = { ...prev.notes }
      delete newNotes[noteId]

      const newNotebooks = { ...prev.notebooks }
      const notebook = newNotebooks[note.notebookId]
      if (notebook) {
        newNotebooks[note.notebookId] = {
          ...notebook,
          lastModified: new Date().toISOString(), // Propagate recency to notebook
          noteIds: (notebook.noteIds || []).filter(id => id !== noteId)
        }
      }

      const newSubjects = { ...prev.subjects }
      const subjectId = notebook.subjectId
      if (newSubjects[subjectId]) {
        newSubjects[subjectId] = {
          ...newSubjects[subjectId],
          lastModified: new Date().toISOString() // Propagate recency to subject
        }
      }

      return {
        ...prev,
        subjects: newSubjects,
        notebooks: newNotebooks,
        notes: newNotes
      }
    })
  }

  const updateNote = (noteId, updates) => {
    setState(prev => {
      const note = prev.notes[noteId];
      if (!note) return prev;
      const notebook = prev.notebooks[note.notebookId];
      if (!notebook) return prev;

      return {
        ...prev,
        notes: {
          ...prev.notes,
          [noteId]: { 
            ...prev.notes[noteId], 
            ...updates, 
            lastUpdated: new Date().toISOString() 
          }
        },
        subjects: {
          ...prev.subjects,
          [notebook.subjectId]: {
            ...prev.subjects[notebook.subjectId],
            lastModified: new Date().toISOString()
          }
        }
      };
    });
  }

  const trackVisit = (type, id, title) => {
    setState(prev => {
      const newVisit = { type, id, title, time: new Date().toISOString() };
      const filteredVisits = prev.recentVisits.filter(v => v.id !== id);
      return {
        ...prev,
        recentVisits: [newVisit, ...filteredVisits].slice(0, 5)
      };
    });
  };

  const updateNotebookStatus = (notebookId, status) => {
    setState(prev => {
      const notebook = prev.notebooks[notebookId];
      if (!notebook) return prev;

      let revisionDate = notebook.revisionDate || null;
      let isRevisionComplete = notebook.isRevisionComplete || false;

      if (status === "Completed") {
        const now = new Date();
        const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // exactly 7 days later
        revisionDate = future.toISOString();
        isRevisionComplete = false;
      } else {
        // Reset if moving away from Completed
        revisionDate = null;
        isRevisionComplete = false;
      }

      return {
        ...prev,
        notebooks: {
          ...prev.notebooks,
          [notebookId]: {
            ...notebook,
            status,
            revisionDate,
            isRevisionComplete,
            lastModified: new Date().toISOString()
          }
        }
      };
    });
  }

  const availableStatuses = ["In Progress", "Completed", "Archived"];



  return (
    <NoteContext.Provider value={{ 
      state, setState, generateId, 
      addSubject, deleteSubject, updateSubject, getSubjectStats, getNotebookStats,
      getNotebookLevelingData, getLevelThreshold,
      getRelativeTime, updateSubjectLastModified,
      addNotebook, deleteNotebook, updateNotebookStatus, availableStatuses,
      addTask, deleteTask, toggleTask,
      addObjective, toggleObjective, deleteObjective,
      addNote, deleteNote, updateNote,
      toggleTaskRevision,
      trackVisit
    }}>
      {children}
    </NoteContext.Provider>
  )
}

export const useNotes = () => {
  const context = useContext(NoteContext)
  if (!context) {
    throw new Error('useNotes must be used within a StateProvider')
  }
  return context
}
