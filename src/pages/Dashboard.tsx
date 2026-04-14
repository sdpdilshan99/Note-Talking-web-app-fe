import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import Sidebar from '../components/Sidebar';

// --- Interfaces ---
interface Collaborator {
  _id: string;
  email: string;
  name?: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  folder: string;
  owner: string;
  collaborators: Collaborator[];
  updatedAt: string;
}

// --- React Quill Modules ---
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['clean']
  ],
};

const Dashboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<string[]>(['Work', 'Personal', 'Study']);
  const [activeFolder, setActiveFolder] = useState('All');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shareEmail, setShareEmail] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, logout } = useAuth();

  const filteredNotes = activeFolder === 'All' 
    ? notes 
    : notes.filter(note => {
        const noteFolder = note.folder || 'General';
        return noteFolder === activeFolder;
      });

  // 1. Fetch Notes (Initial load & Search only)
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = searchTerm ? `/notes/search?q=${searchTerm}` : '/notes';
      const res = await API.get<Note[]>(url);
      setNotes(res.data);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);
  
  
  // 2. Optimized Auto-save (Silent Update)
  const autoSave = async () => {
    const currentFolder = activeFolder === 'All' ? 'General' : activeFolder;
  
    // Updated ALreday hAve NOtes
    if (selectedNote?._id && (title !== selectedNote.title || content !== selectedNote.content)) {
      try {
        setSaving(true);
        await API.put(`/notes/${selectedNote._id}`, { title, content, folder: currentFolder });
        
        //Not Fetching whole list again, just updating the relevant note in local state
        setNotes(prev => prev.map(n => 
          n._id === selectedNote._id ? { ...n, title, content,folder: currentFolder, updatedAt: new Date().toISOString() } : n
        ));
        setSaving(false);
      } catch (error) {
        console.error("Auto-save update failed");
        setSaving(false);
      }
    } 
    // Create a new note only if there,s no existing note
    else if (!selectedNote && !saving && title.trim().length > 2) {
      try {
        setSaving(true);
        const res = await API.post<Note>('/notes', { title, content, folder: currentFolder });
        const newNote = res.data;

        // we don't need to fetch the whole list again, just add the new note to the top of the list and set it as selected
        setNotes(prev => [newNote, ...prev]);
        setSelectedNote(newNote);
        setSaving(false);
      } catch (error) {
        console.error("Initial auto-save failed");
        setSaving(false);
      }
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      autoSave();
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [title, content]);


// Search effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => { fetchNotes(); }, 500);
    return () => clearTimeout(delayDebounce);
  }, [fetchNotes]);

  const handleSave = async () => {
    if (!title.trim()) return toast.warning("Title is required!");
    const currentFolder = activeFolder === 'All' ? 'General' : activeFolder;

    try {
      if (selectedNote) {
        await API.put(`/notes/${selectedNote._id}`, { title, content, folder: currentFolder });
        toast.success("Note updated!");
      } else {
        await API.post('/notes', { title, content, folder: currentFolder });
        toast.success("Note saved!");
      }
      closeEditor();
    } catch (error) {
      toast.error("Error saving note");
    }
  };

  // Polling for collaboration updates
  useEffect(() => {
    let interval: any;

    if (isEditorOpen && selectedNote) {
      interval = setInterval(async () => {
        try {
          const res = await API.get(`/notes/${selectedNote._id}`);
          if (res.data.content !== content) {
            setContent(res.data.content);
            setTitle(res.data.title);
          }
        } catch (err) {
          console.error("Polling error");
        }
      }, 5000); 
    }

    return () => clearInterval(interval);
  }, [isEditorOpen, selectedNote?._id]); 


  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await API.delete(`/notes/${id}`);
        toast.success("Note deleted successfully!");
        closeEditor(); 
      } catch (error) {
        toast.error("Failed to delete note");
      }
    }
  };


  const handleShare = async () => {
      if (!shareEmail.trim()) return toast.warning("Enter an email");

      try {
        const res = await API.post(`/notes/${selectedNote._id}/share`, { email: shareEmail });
        
        setSelectedNote(res.data.note); 
        
        toast.success(res.data.message);
        setShareEmail('');
        fetchNotes(); 
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Sharing failed");
      }
    };

    const openEditor = (note: Note | null = null) => {
      if (note) {
        setSelectedNote(note);
        setTitle(note.title);
        setContent(note.content);
      } else {
        setSelectedNote(null);
        setTitle('');
        setContent('');
      }
      setIsEditorOpen(true);
    };

    const closeEditor = () => {
      setIsEditorOpen(false);
      setSelectedNote(null);
      setTitle('');
      setContent('');
      fetchNotes();
    };

    

  return (
    <div className="w-full flex  overflow-hidden bg-[#F8FAFC]">

      {/* Sidebar එක මෙතනට දාන්න */}
    <Sidebar 
      folders={folders}
      activeFolder={activeFolder}
      onSelectFolder={(folder) => setActiveFolder(folder)}
      onAddFolder={(name) => setFolders([...folders, name])}
      onLogout={logout}
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
    />
      
      
    <div className="flex-1 flex flex-col overflow-hidden">
      <nav className="w-full flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between">
          <button className="md:hidden p-2" onClick={() => setIsSidebarOpen(true)}>
             {/* Mobile Menu Icon */}
             ☰
          </button>
          <input 
            type="text"
            placeholder="Search notes..."
            className="w-64 md:w-96 bg-slate-50 rounded-md px-5 py-2 text-sm border border-gray-100"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => openEditor()} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold">+ New Note</button>
      </nav>

      {/* Dashboard */}
      <main className="max-w-8xl mx-auto p-8 w-11/12">

        
        {!isEditorOpen ? (
          
          // Dashboard notes View
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Welcome back, {user?.name}!</h2>
              <p className="text-slate-500">Here are your latest thoughts and notes.</p>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your gallery...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note: any) => (
                  <div 
                    key={note._id}
                    onClick={() => openEditor(note)}
                    className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-50 transition-all cursor-pointer group flex flex-col h-64"
                  >
                    
                    {/* Folder tag */}
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                          {note.folder || 'General'}
                        </span>
                        <span className='text-sm text-gray-800'>Set Color <button className=''>K</button></span>
                      </div>

                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 truncate mb-3">{note.title || "Untitled"}</h3>

                    <div className="mt-2 text-slate-600 text-sm overflow-hidden">
                      <div 
                        className="line-clamp-6 prose prose-sm max-w-none" 
                        dangerouslySetInnerHTML={{ __html: note.content }} 
                      />
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      <span className="bg-slate-50 px-2 py-1 rounded">View Note</span>

                      
                      
                      {note.owner !== user._id ? (
                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Shared with me</span>
                      ) : (
                        <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">My Note</span>
                      )}


                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <p>No notes found. Create your first one!</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          
          // Editor
          <div className="w-130 md:w-full px-5 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50/50 gap-4">
              <div className="flex items-center gap-4">
                <button onClick={closeEditor} className="p-1">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-white bg-blue-500 hover:bg-blue-700 p-2 rounded-full transition duration-300 shadow-md"
                  >
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                
             
                {selectedNote && (
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-4 pr-1 py-1">
                    <input 
                      type="email" 
                      placeholder="Share with email..." 
                      className="bg-transparent outline-none text-sm w-40 md:w-64"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <button 
                      onClick={handleShare}
                      className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full font-bold hover:bg-blue-700 transition"
                    >
                      Share
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button 
                    onClick={() => handleDelete(selectedNote._id)}
                    className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-full font-bold text-sm transition"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-green-600 text-white px-8 rounded-full font-bold hover:bg-green-700 transition shadow-lg"
                  >
                    {selectedNote ? 'Update Note' : 'Save Note'}
                  </button>
              </div>
            </div>

            
            <div className="p-5 flex flex-col min-h-[40vh]">

              <div className="h-5 mb-1">
                {saving && (
                  <span className="text-[10px] text-blue-500 italic animate-pulse font-semibold">
                    Saving changes...
                  </span>
                )}
              </div>  

              <input 
                className="text-4xl font-black mb-8 outline-none text-slate-900 placeholder-slate-200"
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              
              <div className="flex-1 bg-white ">
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  modules={modules}
                  placeholder="Tell your story..."
                  className=" mb-4" 
                />
              </div>

              {selectedNote && selectedNote.collaborators && selectedNote.collaborators.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Collaborators
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.collaborators.map((collab: any) => (
                      <div 
                        key={collab._id} 
                        className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-1 pr-3 py-1 rounded-full group hover:border-blue-200 transition-colors"
                        title={collab.email}
                      >
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                          {collab.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-600 font-semibold truncate max-w-[150px]">
                          {collab.email}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {filteredNotes.map(note => (
            <div key={note._id} onClick={() => openEditor(note)}> 
               {/* Note Card Content */}
               
            </div>
         ))}
      </main>

    </div>      

    </div>
  );
};

export default Dashboard;