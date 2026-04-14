import React, { useState } from "react";

interface SidebarProps {
    folders: string[];
    activeFolder: string;
    onSelectFolder: (folder: string) => void;
    onAddFolder: (name: string) => void;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ folders, activeFolder, onSelectFolder, onAddFolder, onLogout, isOpen, onClose }) => {

    const [newFolderName, setNewFolderName] = useState('');

    const handleAddFolder = () => {
        if (newFolderName.trim()) {
            onAddFolder(newFolderName.trim());
            setNewFolderName('');
        }
    };

    return (
        <div>
            {/* Mobile Overlay */}
            {isOpen && <div className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />}

            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
                <div className="p-6 border-b border-slate-50">
                    <h1 className="text-xl font-black text-blue-600 tracking-tighter italic">NoteCollab</h1>
                </div>

                <div className="p-4 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Folders</p>
                    
                    <div className="space-y-1 overflow-y-auto max-h-[60vh]">
                        <button 
                            onClick={() => onSelectFolder('All')}
                            className={`w-full text-left p-3 rounded-xl transition-all ${activeFolder === 'All' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                            📁 All Notes
                        </button>

                        {folders.map((folder) => (
                            <button 
                                key={folder}
                                onClick={() => onSelectFolder(folder)}
                                className={`w-full text-left p-3 rounded-xl transition-all ${activeFolder === folder ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                📁 {folder}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 flex gap-2 p-2 bg-slate-50 rounded-xl">
                        <input 
                            type="text" 
                            placeholder="New Folder..." 
                            className="bg-transparent text-sm outline-none w-full px-2"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                        />
                        <button onClick={handleAddFolder} className="text-blue-600 font-bold">+</button>
                    </div>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors">
                        Logout
                    </button>
                </div>
            </aside>
        </div>
    )
}

export default Sidebar;