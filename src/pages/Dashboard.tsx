import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // මේ CSS එක අනිවාර්යයි


const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ],
};

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  const { user, logout } = useAuth();

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const url = searchTerm ? `/notes/search?q=${searchTerm}` : '/notes';
      const res = await API.get(url);
      console.log(searchTerm)
      setNotes(res.data);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => { fetchNotes(); }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSave = async () => {
    if (!title.trim()) return toast.warning("Title is required!");
    try {
      if (selectedNote) {
        await API.put(`/notes/${selectedNote._id}`, { title, content });
        toast.success("Note updated!");
      } else {
        await API.post('/notes', { title, content });
        toast.success("Note saved!");
      }
      closeEditor();
      fetchNotes();
    } catch (error) {
      toast.error("Error saving note");
    }
  };

  useEffect(() => {
    let interval: any;

    if (isEditorOpen && selectedNote) {
      interval = setInterval(async () => {
        try {
          const res = await API.get(`/notes/${selectedNote._id}`);
          // මම දැනට ටයිප් කරන content එකට වඩා DB එකේ content එක වෙනස් නම් විතරක් update කරන්න
          if (res.data.content !== content) {
            setContent(res.data.content);
            setTitle(res.data.title);
          }
        } catch (err) {
          console.error("Polling error");
        }
      }, 5000); // තත්පර 5කින් 5ට check කරයි
    }

    return () => clearInterval(interval);
  }, [isEditorOpen, selectedNote, content]); // dependencies ගැන සැලකිලිමත් වන්න


  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await API.delete(`/notes/${id}`);
        toast.success("Note deleted successfully!");
        closeEditor(); // Editor එක වහනවා
        fetchNotes();  // List එක refresh කරනවා
      } catch (error) {
        toast.error("Failed to delete note");
      }
    }
  };


  const handleShare = async () => {
      if (!shareEmail.trim()) return toast.warning("Enter an email");

      try {
        const res = await API.post(`/notes/${selectedNote._id}/share`, { email: shareEmail });
        
        // Backend එකෙන් එවන updated note එක අපේ state එකට දානවා
        setSelectedNote(res.data.note); 
        
        toast.success(res.data.message);
        setShareEmail('');
        fetchNotes(); // Dashboard එකේ cards ටිකත් update වෙන්න
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Sharing failed");
      }
    };

      const openEditor = (note: any = null) => {
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
    };

    

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* header nav bar*/}
      <nav className=" flex bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20  justify-between items-center">
        <div className='block md:flex items-center'>
          <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter mr-5 mb-3">NoteCollab</Link>
          
          
          <div className="flex items-center gap-4">
            <input 
              type="text"
              placeholder="Search your notes..."
              className=" w-64 bg-slate-50 rounded-md px-5 py-2 text-sm border border-gray-100 focus:outline-0 focus:border-blue-500 transition-all duration-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button 
              onClick={() => openEditor()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 mr-6 py-1 rounded-full font-bold transition shadow-lg shadow-blue-100 flex items-center gap-2"
            >
              <span className="text-lg">+</span> New Note
            </button>
            
          </div>
          
        </div>

        <div className='flex'>
          <button onClick={logout} className="border border-gray-200 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-full font-bold transition duration-300 shadow-md">Logout</button>
        </div>
      </nav>

      
    </div>
  );
};

export default Dashboard;