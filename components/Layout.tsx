
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Lumina Notes</h1>
          </div>
          <nav className="flex space-x-4">
            <button className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">My Notes</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">
              New Session
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="bg-slate-50 border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        &copy; 2024 Lumina AI Notes • Intelligence for the Classroom
      </footer>
    </div>
  );
};
