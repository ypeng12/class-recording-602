
import React from 'react';
import { Note } from '../types';

interface NoteEditorProps {
  note: Note;
  onClose: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onClose }) => {
  const renderInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="text-indigo-800 font-bold bg-indigo-50/70 px-2 py-0.5 rounded-lg border-b-2 border-indigo-200 mx-0.5">{part.slice(2, -2)}</span>;
      }
      const subParts = part.split(/(\*.*?\*)/g);
      return subParts.map((sub, j) => {
        if (sub.startsWith('*') && sub.endsWith('*')) {
          return <span key={`${i}-${j}`} className="italic text-emerald-800 font-bold decoration-emerald-200 underline underline-offset-4">{sub.slice(1, -1)}</span>;
        }
        return sub;
      });
    });
  };

  const renderFormattedNotes = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (line.startsWith('# ')) return <h1 key={i} className="text-5xl font-black text-slate-900 mt-12 mb-10 pb-6 border-b-4 border-slate-50">{line.substring(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-3xl font-black text-indigo-700 mt-16 mb-8 flex items-center"><span className="w-4 h-8 bg-indigo-600 rounded-lg mr-4"></span>{line.substring(3)}</h2>;
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={i} className="flex items-start space-x-5 mb-6 ml-6">
            <div className="mt-3.5 w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 shadow-md"></div>
            <p className="text-xl text-slate-700 leading-relaxed font-medium">{renderInlineStyles(trimmed.substring(2))}</p>
          </div>
        );
      }
      
      if (!trimmed) return <div key={i} className="h-6" />;
      return <p key={i} className="text-slate-600 text-xl leading-[1.8] mb-8 font-medium">{renderInlineStyles(line)}</p>;
    });
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden flex flex-col h-[90vh] animate-in slide-in-from-bottom-10 duration-700">
      {/* Clean Header */}
      <div className="bg-slate-900 text-white px-12 py-10 flex items-center justify-between border-b-4 border-indigo-600">
        <div className="flex items-center space-x-8">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-black text-4xl shadow-2xl">
            {note.title.charAt(0)}
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">{note.title}</h2>
            <p className="text-xs text-indigo-400 font-black uppercase tracking-[0.4em] flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              DIRECT DATA SCIENCE RECORD • {new Date(note.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-white p-4 rounded-2xl hover:bg-slate-800 transition-all border-2 border-slate-800"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden bg-white">
        {/* Main: Direct Content */}
        <div className="flex-grow p-16 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-20">
               {renderFormattedNotes(note.formattedNotes)}
            </div>
            
            {/* Direct Conclusion / Summary */}
            <div className="mt-32 pt-16 border-t-2 border-slate-50 relative">
              <div className="bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.4em] mb-6">Direct Conclusion</h3>
                <p className="text-3xl italic text-slate-800 leading-tight font-black">
                  "{note.summary}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verbatim Sidebar */}
        <div className="w-full lg:w-[28rem] bg-slate-50 p-12 overflow-y-auto flex flex-col border-l border-slate-200">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 border-b border-slate-200 pb-3">Raw Transcript Reference</h4>
          <div className="bg-white/70 p-8 rounded-[2rem] border border-slate-200/50">
            <p className="text-base text-slate-500 leading-relaxed italic font-medium">
              {note.rawTranscript}
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-16 py-8 flex justify-between items-center">
        <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No-Symbol Render v2.3 • Pure Knowledge Flow</div>
        <div className="flex space-x-6">
          <button className="bg-indigo-600 text-white px-14 py-4 rounded-[1.25rem] font-black hover:bg-indigo-700 transition-all shadow-xl hover:scale-105 active:scale-95 text-sm tracking-widest">
            SAVE AS PDF
          </button>
        </div>
      </div>
    </div>
  );
};
