import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Plus, Trash2, Edit3, 
  Sparkles, Layers, Moon, Sun, Search,
  ChevronRight, Play, Check, X, ArrowLeft, RefreshCw, Save,
  Shuffle, Award, Upload, Image as ImageIcon
} from 'lucide-react';

export default function App() {
  // --- App State ---
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('chris_studies_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'note-1',
        title: 'CS 101: Data Structures & Algorithms',
        content: `# Computer Science Core\n\n- **Binary Search Tree** :: A node-based binary tree data structure with logarithmic lookup time.\n- **Hash Table** :: Data structure that maps keys to values for O(1) average lookup.\n\nQ: What is a Stack?\nA: A LIFO (Last In First Out) linear collection where elements are added and removed from the top.\n\nQ: What is a Queue?\nA: A FIFO (First In First Out) linear collection where elements are inserted at the rear and removed from the front.\n\nConcept: **Recursion** is the technique of making a function call itself directly or indirectly.\nConcept: **Space Complexity** refers to the total amount of memory space used by an algorithm.\n\nFill-in: A __[Linked List]__ consists of nodes where each node contains data and a reference to the next node.`,
        deckId: 'deck-1',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'note-2',
        title: 'Biology: Cell Structure & Metabolism',
        content: `# Cell Energy Systems\n\n- **ATP** :: Adenosine Triphosphate, the primary energy currency of the cell.\n- **Glycolysis** :: The breakdown of glucose by enzymes, releasing energy and pyruvic acid.\n\nQ: Where does photosynthesis occur?\nA: In the chloroplasts of plant cells.\n\n- **Mitochondria** are known as the powerhouse of eukaryotic cells.\n\nMC: What is the primary function of ribosomes?\nA) Energy production\nB) Protein synthesis*\nC) DNA storage\nD) Lipid destruction`,
        deckId: 'deck-2',
        updatedAt: new Date().toISOString()
      }
    ];
  });

  const [decks, setDecks] = useState(() => {
    const saved = localStorage.getItem('chris_studies_decks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'deck-1', name: 'Computer Science', color: 'bg-violet-500' },
      { id: 'deck-2', name: 'Biology & Health', color: 'bg-emerald-500' },
      { id: 'deck-3', name: 'World History', color: 'bg-amber-500' }
    ];
  });

  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem('chris_studies_cards');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [activeNoteId, setActiveNoteId] = useState('note-1');
  const [activeDeckId, setActiveDeckId] = useState('all');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'cards', 'study'
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Editor specific states
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorDeckId, setEditorDeckId] = useState('deck-1');

  // Deck modal & card modal
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [cardModalState, setCardModalState] = useState({ isOpen: false, card: null });

  // Save state to Local Storage
  useEffect(() => {
    localStorage.setItem('chris_studies_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('chris_studies_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('chris_studies_cards', JSON.stringify(flashcards));
  }, [flashcards]);

  // Sync editor on note change
  useEffect(() => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
      setEditorTitle(activeNote.title);
      setEditorContent(activeNote.content);
      setEditorDeckId(activeNote.deckId || decks[0]?.id || 'deck-1');
    }
  }, [activeNoteId, notes, decks]);

  // Dark mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial Card Auto Generation
  useEffect(() => {
    if (flashcards.length === 0 && notes.length > 0) {
      let initialCards = [];
      notes.forEach(note => {
        const extracted = parseNotesToFlashcards(note.content, note.id, note.deckId);
        initialCards = [...initialCards, ...extracted];
      });
      setFlashcards(initialCards);
    }
  }, []);

  // --- Comprehensive Flashcard Parser & Extractor ---
  function parseNotesToFlashcards(text, noteId, deckId) {
    const lines = text.split('\n');
    const cards = [];

    // Helper image suggestions based on deck/content
    const getImageForTopic = (queryText) => {
      const textLower = queryText.toLowerCase();
      if (textLower.includes('cell') || textLower.includes('biology') || textLower.includes('atp') || textLower.includes('mitochondria')) {
        return 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&auto=format&fit=crop&q=80';
      }
      if (textLower.includes('code') || textLower.includes('data') || textLower.includes('tree') || textLower.includes('stack') || textLower.includes('binary')) {
        return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80';
      }
      if (textLower.includes('history') || textLower.includes('war') || textLower.includes('century')) {
        return 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80';
      }
      if (textLower.includes('math') || textLower.includes('equation') || textLower.includes('space')) {
        return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80';
      }
      return null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Pattern 1: Multiple Choice Question (MC:)
      if (line.startsWith('MC:') || line.startsWith('mc:')) {
        const mcQuestion = line.replace(/^[mM][cC]:\s*/, '').trim();
        const options = [];
        let correctAnswer = '';
        
        let j = i + 1;
        while (j < lines.length && lines[j].trim().match(/^[A-Da-d][\):.-]\s*/)) {
          const optLine = lines[j].trim();
          const isCorrect = optLine.includes('*');
          const cleanOption = optLine.replace(/^[A-Da-d][\):.-]\s*/, '').replace('*', '').trim();
          options.push(cleanOption);
          if (isCorrect) correctAnswer = cleanOption;
          j++;
        }

        if (mcQuestion && options.length >= 2) {
          cards.push({
            id: 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            noteId,
            deckId,
            type: 'multiple-choice',
            front: mcQuestion,
            back: correctAnswer || options[0],
            options: options,
            image: getImageForTopic(mcQuestion),
            status: 'new',
            box: 1
          });
          i = j - 1;
          continue;
        }
      }

      // Pattern 2: Fill-in-the-blank (Fill-in: text __[answer]__ text)
      const fillMatch = line.match(/(.*)__\[(.*?)\]__(.*)/);
      if (fillMatch) {
        const frontText = `${fillMatch[1]} ________ ${fillMatch[3]}`.trim();
        const blankAnswer = fillMatch[2].trim();
        cards.push({
          id: 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          noteId,
          deckId,
          type: 'fill-blank',
          front: frontText.replace(/^[Ff]ill-in:\s*/, ''),
          back: blankAnswer,
          image: getImageForTopic(frontText),
          status: 'new',
          box: 1
        });
        continue;
      }

      // Pattern 3: Double Colon `Term :: Definition`
      if (line.includes('::')) {
        const parts = line.split('::');
        if (parts.length >= 2) {
          const front = parts[0].replace(/^[-*]?\s*\*\*/, '').replace(/\*\*\s*$/, '').replace(/^[-*]\s*/, '').trim();
          const back = parts.slice(1).join('::').trim();
          if (front && back) {
            cards.push({
              id: 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
              noteId,
              deckId,
              type: 'concept',
              front: `What is ${front}?`,
              back: back,
              image: getImageForTopic(front),
              status: 'new',
              box: 1
            });
            continue;
          }
        }
      }

      // Pattern 4: Q: Question / A: Answer
      if (line.toLowerCase().startsWith('q:') || line.toLowerCase().startsWith('q-')) {
        const question = line.replace(/^[qQ][:-]\s*/, '').trim();
        let answer = '';
        if (i + 1 < lines.length && (lines[i+1].trim().toLowerCase().startsWith('a:') || lines[i+1].trim().toLowerCase().startsWith('a-'))) {
          answer = lines[i+1].trim().replace(/^[aA][:-]\s*/, '').trim();
          i++;
        }
        if (question && answer) {
          cards.push({
            id: 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            noteId,
            deckId,
            type: 'qa',
            front: question,
            back: answer,
            image: getImageForTopic(question),
            status: 'new',
            box: 1
          });
          continue;
        }
      }

      // Pattern 5: Markdown Bold `- **Term**: Definition`
      const boldMatch = line.match(/^[-*]?\s*\*\*(.*?)\*\*[:\s\-\u2013\u2014]+(.*)/);
      if (boldMatch) {
        const front = boldMatch[1].trim();
        const back = boldMatch[2].trim();
        if (front && back) {
          cards.push({
            id: 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            noteId,
            deckId,
            type: 'concept',
            front: `What is ${front}?`,
            back: back,
            image: getImageForTopic(front),
            status: 'new',
            box: 1
          });
          continue;
        }
      }

      // Pattern 6: Key concept phrasing "Concept: Term is Definition"
      const conceptMatch = line.match(/^(Concept|Key Factor|Fact)?[:\s]*([-*]?\s*)([A-Z][A-Za-z0-9\s]{2,35})\s+(is|are|means|refers to)\s+(.+)/i);
      if (conceptMatch && !line.startsWith('#')) {
        const front = conceptMatch[3].trim();
        const verb = conceptMatch[4].trim();
        const back = conceptMatch[5].trim();
        if (front && back && back.length > 5) {
          cards.push({
            id: 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            noteId,
            deckId,
            type: 'concept',
            front: `What ${verb} ${front}?`,
            back: back,
            image: getImageForTopic(front),
            status: 'new',
            box: 1
          });
        }
      }
    }

    return cards;
  }

  // --- Laptop File Upload Handler ---
  const handleFileUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileText = e.target.result;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, "");
      
      const newNote = {
        id: 'note-' + Date.now(),
        title: cleanFileName || 'Uploaded Note',
        content: fileText,
        deckId: activeDeckId !== 'all' ? activeDeckId : (decks[0]?.id || 'deck-1'),
        updatedAt: new Date().toISOString()
      };

      // Extract flashcards automatically from uploaded file
      const autoCards = parseNotesToFlashcards(fileText, newNote.id, newNote.deckId);
      
      setNotes(prev => [newNote, ...prev]);
      setFlashcards(prev => [...prev, ...autoCards]);
      setActiveNoteId(newNote.id);
      setActiveTab('editor');
    };

    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  // --- Actions ---
  const handleCreateNewNote = () => {
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'New Study Note',
      content: '',
      deckId: activeDeckId !== 'all' ? activeDeckId : (decks[0]?.id || 'deck-1'),
      updatedAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setActiveTab('editor');
  };

  const handleSaveCurrentNote = () => {
    setNotes(notes.map(n => {
      if (n.id === activeNoteId) {
        return {
          ...n,
          title: editorTitle || 'Untitled Note',
          content: editorContent,
          deckId: editorDeckId,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    }));
  };

  const handleAutoGenerateFlashcards = () => {
    handleSaveCurrentNote();
    const extracted = parseNotesToFlashcards(editorContent, activeNoteId, editorDeckId);
    const existingOtherCards = flashcards.filter(c => c.noteId !== activeNoteId);
    setFlashcards([...existingOtherCards, ...extracted]);
  };

  const handleDeleteNote = (id, e) => {
    e.stopPropagation();
    const filteredNotes = notes.filter(n => n.id !== id);
    setNotes(filteredNotes);
    setFlashcards(flashcards.filter(c => c.noteId !== id));
    if (activeNoteId === id && filteredNotes.length > 0) {
      setActiveNoteId(filteredNotes[0].id);
    }
  };

  const handleCreateDeck = (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    const colors = ['bg-violet-500', 'bg-purple-500', 'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newDeck = {
      id: 'deck-' + Date.now(),
      name: newDeckName.trim(),
      color: randomColor
    };
    setDecks([...decks, newDeck]);
    setNewDeckName('');
    setShowNewDeckModal(false);
  };

  const handleSaveCardModal = (cardData) => {
    if (cardData.id) {
      setFlashcards(flashcards.map(c => c.id === cardData.id ? cardData : c));
    } else {
      const newCard = {
        ...cardData,
        id: 'card-' + Date.now(),
        noteId: activeNoteId,
        deckId: editorDeckId,
        status: 'new',
        box: 1
      };
      setFlashcards([newCard, ...flashcards]);
    }
    setCardModalState({ isOpen: false, card: null });
  };

  // Filtered lists
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesDeck = activeDeckId === 'all' || note.deckId === activeDeckId;
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDeck && matchesSearch;
    });
  }, [notes, activeDeckId, searchQuery]);

  const filteredCards = useMemo(() => {
    return flashcards.filter(card => {
      if (activeDeckId === 'all') return true;
      return card.deckId === activeDeckId;
    });
  }, [flashcards, activeDeckId]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Header Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Chris Studies
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">File Note Uploader & Comprehensive Flashcard Generator</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'editor'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Notes & Uploads</span>
          </button>
          
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'cards'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Deck Cards ({filteredCards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('study')}
            disabled={filteredCards.length === 0}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'study'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : filteredCards.length === 0 
                  ? 'text-slate-400 opacity-50 cursor-not-allowed'
                  : 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 hover:bg-violet-100'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Interactive Study Mode</span>
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar: Decks & Notes */}
        <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
          
          {/* Deck List Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Decks / Subjects</span>
              <button 
                onClick={() => setShowNewDeckModal(true)}
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> New Deck
              </button>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto">
              <button
                onClick={() => setActiveDeckId('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeDeckId === 'all'
                    ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Decks</span>
                </div>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                  {notes.length}
                </span>
              </button>

              {decks.map(deck => (
                <button
                  key={deck.id}
                  onClick={() => setActiveDeckId(deck.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    activeDeckId === deck.id
                      ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full ${deck.color}`}></span>
                    <span className="truncate">{deck.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                    {notes.filter(n => n.deckId === deck.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* New Note, Laptop File Upload & Search */}
          <div className="p-4 space-y-3 border-b border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCreateNewNote}
                className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Note</span>
              </button>

              <label className="flex items-center justify-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-violet-500" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv,.pdf,.docx"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 block">
              Notes & Documents ({filteredNotes.length})
            </span>
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No notes in this deck
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    if (activeTab !== 'editor') setActiveTab('editor');
                  }}
                  className={`group relative flex flex-col p-3 rounded-xl cursor-pointer transition ${
                    activeNoteId === note.id && activeTab === 'editor'
                      ? 'bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs truncate pr-4 text-slate-800 dark:text-slate-200">
                      {note.title || 'Untitled Note'}
                    </h4>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-normal">
                    {note.content.replace(/[#*`]/g, '') || 'Empty note...'}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-violet-500 font-semibold">
                      <Layers className="w-3 h-3" />
                      {flashcards.filter(c => c.noteId === note.id).length} cards
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* View 1: Notes Editor, Laptop File Drop & Flashcard Generator */}
        {activeTab === 'editor' && (
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex-1 flex flex-col h-full overflow-hidden relative transition-colors ${
              isDraggingFile ? 'bg-violet-500/10 border-2 border-dashed border-violet-500' : 'bg-slate-50 dark:bg-slate-950'
            }`}
          >
            {/* File Drag Overlay Prompt */}
            {isDraggingFile && (
              <div className="absolute inset-0 bg-violet-950/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-white pointer-events-none">
                <Upload className="w-16 h-16 text-violet-400 animate-bounce mb-4" />
                <h3 className="text-xl font-bold">Drop your laptop notes file here</h3>
                <p className="text-xs text-violet-300 mt-1">Supports .txt, .md, .json, .csv, .pdf, .docx notes</p>
              </div>
            )}
            
            {/* Editor Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-4 items-center justify-between">
              <input
                type="text"
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.target.value)}
                placeholder="Note Title..."
                className="text-lg font-extrabold bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 flex-1 min-w-[200px]"
              />

              <div className="flex items-center space-x-3">
                <select
                  value={editorDeckId}
                  onChange={(e) => setEditorDeckId(e.target.value)}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
                >
                  {decks.map(deck => (
                    <option key={deck.id} value={deck.id}>{deck.name}</option>
                  ))}
                </select>

                <button
                  onClick={handleSaveCurrentNote}
                  className="flex items-center space-x-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>

                <button
                  onClick={handleAutoGenerateFlashcards}
                  className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-violet-500/20 transition active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Comprehensive Flashcards</span>
                </button>
              </div>
            </div>

            {/* Split Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* Text Area & Drag Target */}
              <div className="flex-1 p-6 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Notes Text / Upload File</span>
                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">Term :: Def</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">Q: / A:</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">MC: Q / A) B)</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">__[Blank]__</span>
                  </div>
                </div>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder={`Write or drag & drop notes from your laptop here...\n\nSupported auto-generation syntax:\n1. Term :: Definition\n2. Q: What is Mitochondria?\n   A: The powerhouse of the cell.\n3. MC: What is the primary energy currency?\n   A) Glucose\n   B) ATP*\n   C) Water\n4. Fill-in: The __[Ribosome]__ synthesizes proteins.`}
                  className="flex-1 w-full resize-none bg-transparent text-slate-800 dark:text-slate-100 font-mono text-sm leading-relaxed focus:outline-none"
                />
              </div>

              {/* Side Extracted Flashcard Preview Panel */}
              <div className="w-80 p-4 bg-slate-50 dark:bg-slate-950 flex flex-col border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    Cards in this Note
                  </h3>
                  <span className="text-xs bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-full font-bold">
                    {flashcards.filter(c => c.noteId === activeNoteId).length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {flashcards.filter(c => c.noteId === activeNoteId).length === 0 ? (
                    <div className="text-center py-10 px-4 text-slate-400 text-xs leading-relaxed">
                      Click <strong className="text-violet-400">Generate Comprehensive Flashcards</strong> or upload a note file to extract study cards.
                    </div>
                  ) : (
                    flashcards.filter(c => c.noteId === activeNoteId).map((card, idx) => (
                      <div key={card.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-violet-500">
                            Card #{idx + 1} ({card.type || 'standard'})
                          </span>
                          {card.image && (
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                              <ImageIcon className="w-2.5 h-2.5" /> Has Image
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          {card.front}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {card.back}
                        </div>
                        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition bg-white/90 dark:bg-slate-900/90 p-0.5 rounded-lg shadow">
                          <button
                            onClick={() => setCardModalState({ isOpen: true, card })}
                            className="p-1 text-slate-400 hover:text-violet-500"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setFlashcards(flashcards.filter(c => c.id !== card.id))}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Deck Manager & Manual Fine-Tuning */}
        {activeTab === 'cards' && (
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                    Flashcard Deck Manager
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Review, edit images, questions, and fine-tune your generated cards.
                  </p>
                </div>
                <button
                  onClick={() => setCardModalState({ isOpen: true, card: null })}
                  className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-violet-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Card & Image</span>
                </button>
              </div>

              {filteredCards.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Flashcards in Deck</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    Upload notes or click "Generate Comprehensive Flashcards" to create study decks.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCards.map((card) => (
                    <div key={card.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-violet-500/50 transition">
                      <div className="space-y-2 mb-3">
                        {card.image && (
                          <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-2">
                            <img src={card.image} alt="Card preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-violet-500 tracking-wider">
                            {card.type || 'Question / Concept'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {card.front}
                        </p>
                        <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider pt-1">
                          Answer / Explanation
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {card.back}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          card.status === 'mastered' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {card.status === 'mastered' ? 'Mastered' : 'To Review'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setCardModalState({ isOpen: true, card })}
                            className="p-1.5 text-slate-400 hover:text-violet-500 rounded-lg"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setFlashcards(flashcards.filter(c => c.id !== card.id))}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View 3: Flashcard Study Deck (3D Flip, Questions & Image View) */}
        {activeTab === 'study' && (
          <StudyDeckView 
            cards={filteredCards} 
            onUpdateCard={(updatedCard) => {
              setFlashcards(flashcards.map(c => c.id === updatedCard.id ? updatedCard : c));
            }}
            onExit={() => setActiveTab('editor')}
          />
        )}

      </div>

      {/* Modal: Create Deck */}
      {showNewDeckModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-4">Create Subject Deck</h3>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deck Name</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="e.g. Organic Chemistry, Physics 101"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDeckModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-500/20"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit or Add Manual Card with Image Support */}
      {cardModalState.isOpen && (
        <CardEditorModal 
          card={cardModalState.card}
          onSave={handleSaveCardModal}
          onClose={() => setCardModalState({ isOpen: false, card: null })}
        />
      )}

    </div>
  );
}

// --- Card Edit Modal Component with Image Upload / Presets ---
function CardEditorModal({ card, onSave, onClose }) {
  const [front, setFront] = useState(card ? card.front : '');
  const [back, setBack] = useState(card ? card.back : '');
  const [type, setType] = useState(card ? card.type || 'concept' : 'concept');
  const [image, setImage] = useState(card ? card.image || '' : '');

  const presetImages = [
    { label: 'Biology', url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&auto=format&fit=crop&q=80' },
    { label: 'Code', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80' },
    { label: 'History', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80' },
    { label: 'Math', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImage(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    onSave({
      ...(card || {}),
      front: front.trim(),
      back: back.trim(),
      type: type,
      image: image
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-4">
          {card ? 'Edit Flashcard & Image' : 'Add Custom Card & Image'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
            >
              <option value="concept">Concept Definition</option>
              <option value="qa">Direct Question & Answer</option>
              <option value="multiple-choice">Multiple Choice Question</option>
              <option value="fill-blank">Fill-in-the-blank</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Front (Question / Prompt)</label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Question, concept, or prompt..."
              className="w-full p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Back (Answer / Explanation)</label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Correct answer or explanation..."
              className="w-full p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={3}
              required
            />
          </div>

          {/* Image Upload & Presets */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flashcard Image (Optional)</label>
            {image && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-2 border border-slate-200 dark:border-slate-800">
                <img src={image} alt="Selected" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700">
                <ImageIcon className="w-3.5 h-3.5 text-violet-500" />
                <span>Upload Image File</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[10px] text-slate-400">Or Preset:</span>
              {presetImages.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setImage(p.url)}
                  className="text-[10px] bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 px-2 py-1 rounded-lg border border-violet-200 dark:border-violet-900"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-500/20"
            >
              Save Flashcard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Interactive 3D Flip Study Deck View ---
function StudyDeckView({ cards: initialCards, onUpdateCard, onExit }) {
  const [deck, setDeck] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ mastered: 0, review: 0 });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setDeck(initialCards);
    setCurrentIndex(0);
    setIsFinished(false);
    setStats({ mastered: 0, review: 0 });
  }, [initialCards]);

  const currentCard = deck[currentIndex];

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleResponse = (status) => {
    if (!currentCard) return;

    onUpdateCard({
      ...currentCard,
      status: status
    });

    setStats(prev => ({
      ...prev,
      [status]: prev[status] + 1
    }));

    setIsFlipped(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setStats({ mastered: 0, review: 0 });
  };

  const accuracyRate = stats.mastered + stats.review > 0 
    ? Math.round((stats.mastered / (stats.mastered + stats.review)) * 100) 
    : 0;

  if (isFinished || !currentCard) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Deck Session Completed!</h2>
            <p className="text-xs text-slate-400 mt-1">Here is your study summary for this deck</p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Mastery Score</span>
              <span className="text-2xl font-black text-emerald-500">{accuracyRate}%</span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Mastered Cards</span>
              <span className="text-2xl font-black text-indigo-500">{stats.mastered} / {deck.length}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-3 rounded-2xl font-bold text-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Study Again</span>
            </button>
            <button
              onClick={onExit}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-2xl font-bold text-xs shadow-md shadow-violet-500/25 transition"
            >
              Return to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 max-w-4xl mx-auto w-full bg-slate-50 dark:bg-slate-950">
      
      {/* Top Header & Deck Controls */}
      <div className="w-full flex flex-col space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <button onClick={onExit} className="flex items-center space-x-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Study Session</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleShuffle}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-violet-400 transition"
              title="Shuffle Deck"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
            <span className="font-mono text-slate-400">Card {currentIndex + 1} of {deck.length}</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={handleFlip}
        className="w-full max-w-2xl h-96 my-auto cursor-pointer perspective-1000 select-none"
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Card Front */}
          <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-between backface-hidden overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500 bg-violet-50 dark:bg-violet-950/50 px-3 py-1 rounded-full">
              {currentCard.type || 'Question'}
            </span>

            {/* Optional Attached Image */}
            {currentCard.image && (
              <div className="w-full max-h-36 rounded-2xl overflow-hidden my-2 border border-slate-100 dark:border-slate-800 shrink-0">
                <img src={currentCard.image} alt="Card visual" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="text-lg md:text-xl font-bold text-center text-slate-800 dark:text-slate-100 leading-relaxed max-w-lg my-auto">
              {currentCard.front}
            </div>

            {currentCard.options && currentCard.options.length > 0 && (
              <div className="w-full grid grid-cols-2 gap-2 my-2 text-left">
                {currentCard.options.map((opt, i) => (
                  <div key={i} className="text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-violet-500 mr-1.5">{String.fromCharCode(65 + i)}.</span> {opt}
                  </div>
                ))}
              </div>
            )}

            <span className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
              <RefreshCw className="w-3.5 h-3.5" /> Click or tap card to flip answer
            </span>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 border border-violet-900/50 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-between backface-hidden rotate-y-180 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full">
              Answer & Explanation
            </span>

            <div className="text-base md:text-lg font-medium text-center text-slate-100 leading-relaxed max-w-lg my-auto">
              {currentCard.back}
            </div>

            <span className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
              <RefreshCw className="w-3.5 h-3.5" /> Click or tap card to flip back
            </span>
          </div>

        </div>
      </div>

      {/* Bottom Rating Controls */}
      <div className="w-full flex flex-col items-center space-y-4">
        {isFlipped ? (
          <div className="flex items-center space-x-4 w-full max-w-md">
            <button
              onClick={() => handleResponse('review')}
              className="flex-1 flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 py-3.5 rounded-2xl font-bold text-xs border border-rose-500/30 transition shadow-lg"
            >
              <X className="w-4 h-4" />
              <span>Review Again</span>
            </button>
            <button
              onClick={() => handleResponse('mastered')}
              className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 py-3.5 rounded-2xl font-bold text-xs border border-emerald-500/30 transition shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Mark Mastered</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full max-w-md">
            <button
              onClick={() => {
                setIsFlipped(false);
                if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
              }}
              disabled={currentIndex === 0}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold ${
                currentIndex === 0 
                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleFlip}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs px-8 py-3 rounded-2xl shadow-lg shadow-violet-500/25 transition active:scale-95"
            >
              Show Answer
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                if (currentIndex < deck.length - 1) setCurrentIndex(currentIndex + 1);
              }}
              disabled={currentIndex === deck.length - 1}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold ${
                currentIndex === deck.length - 1 
                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}