
import React from 'react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{note.title || "Untitled Lecture"}</h3>
        <span className="text-xs text-slate-400 font-medium">{new Date(note.date).toLocaleDateString()}</span>
      </div>
      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">
        {note.summary || "No summary available for this session."}
      </p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-semibold">
          {Math.floor(note.duration / 60)}m {note.duration % 60}s
        </span>
        <button className="text-indigo-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          View Notes &rarr;
        </button>
      </div>
    </div>
  );
};
