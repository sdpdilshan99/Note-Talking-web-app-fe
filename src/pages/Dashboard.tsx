import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { logout, user } = useAuth();

  // 1. සියලුම Notes ලබා ගැනීම
  const fetchNotes = async () => {
    const res = await API.get('/notes');
    setNotes(res.data);
  };

  useEffect(() => { fetchNotes(); }, []);

  // 2. Note එකක් Save කිරීම (Create හෝ Update)
  const handleSave = async () => {
    if (selectedNote) {
      await API.put(`/notes/${selectedNote._id}`, { title, content });
    } else {
      await API.post('/notes', { title, content });
    }
    setSelectedNote(null);
    setTitle('');
    setContent('');
    fetchNotes();
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar: Notes List */}
      <div className="w-1/4 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
          <h1 className="font-bold">My Notes</h1>
          <button onClick={logout} className="text-xs bg-red-500 p-1 rounded">Logout</button>
        </div>
        <div className="overflow-y-auto flex-1">
          <button 
            onClick={() => { setSelectedNote(null); setTitle(''); setContent(''); }}
            className="w-full p-4 text-left border-b hover:bg-slate-100 font-medium text-blue-600"
          >
            + New Note
          </button>
          {notes.map((note: any) => (
            <div 
              key={note._id} 
              onClick={() => { setSelectedNote(note); setTitle(note.title); setContent(note.content); }}
              className={`p-4 border-b cursor-pointer hover:bg-slate-100 ${selectedNote?._id === note._id ? 'bg-blue-50' : ''}`}
            >
              <h3 className="font-semibold truncate">{note.title}</h3>
              <p className="text-xs text-slate-500">Last updated: {new Date(note.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Editor */}
      <div className="flex-1 flex flex-col p-8">
        <input 
          className="text-4xl font-bold mb-4 outline-none bg-transparent"
          placeholder="Note Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden border">
          <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent} 
            className="h-full border-none"
            placeholder="Start writing your thoughts..."
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {selectedNote ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;