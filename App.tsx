
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Recorder } from './components/Recorder';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';
import { Note } from './types';
import { formatNotes } from './services/geminiService';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load notes from local storage
  useEffect(() => {
    const savedNotes = localStorage.getItem('lumina_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to local storage
  useEffect(() => {
    localStorage.setItem('lumina_notes', JSON.stringify(notes));
  }, [notes]);

  const handleRecordingComplete = async (transcript: string) => {
    setIsRecording(false);
    if (!transcript || transcript.trim().length < 10) return;

    setIsProcessing(true);
    try {
      const result = await formatNotes(transcript);
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: result.title,
        date: Date.now(),
        rawTranscript: transcript,
        formattedNotes: result.formattedNotes,
        summary: result.summary,
        duration: 0, // In a real app we'd pass this through
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
    } catch (error) {
      console.error("Note processing failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-12">
        {/* Hero Section */}
        {!isRecording && !selectedNote && !isProcessing && (
          <div className="text-center max-w-2xl mx-auto space-y-6 pt-10">
            <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Master your classes with <span className="text-indigo-600">AI precision.</span>
            </h2>
            <p className="text-xl text-slate-500 leading-relaxed">
              Real-time academic note-taking that captures every word, summarizes every key concept, and organizes it perfectly.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => setIsRecording(true)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-indigo-700 hover:scale-105 transform transition-all shadow-xl"
              >
                Start Recording Lecture
              </button>
            </div>
          </div>
        )}

        {/* Recording / Processing / Editor Overlay */}
        {(isRecording || isProcessing || selectedNote) && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-5xl">
              {isRecording && (
                <div className="animate-in fade-in zoom-in duration-300">
                  <Recorder onComplete={handleRecordingComplete} />
                  <button 
                    onClick={() => setIsRecording(false)}
                    className="mt-6 mx-auto block text-white/80 hover:text-white font-medium"
                  >
                    Cancel Session
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-2xl space-y-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Organizing Your Notes...</h2>
                  <p className="text-slate-500">Gemini is analyzing the lecture to create a structured, professional outline.</p>
                </div>
              )}

              {selectedNote && !isProcessing && (
                <div className="animate-in slide-in-from-bottom duration-500">
                  <NoteEditor 
                    note={selectedNote} 
                    onClose={() => setSelectedNote(null)} 
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {!isRecording && !selectedNote && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-2xl font-bold text-slate-800">Your Library</h3>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Search notes..." 
                  className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
            
            {notes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-slate-800 font-bold text-lg">No notes yet</h4>
                <p className="text-slate-500">Your recorded lecture notes will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onClick={() => setSelectedNote(note)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
