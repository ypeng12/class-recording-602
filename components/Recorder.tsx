
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RecordingStatus } from '../types';
import { createLiveSession, incrementalFormat } from '../services/geminiService';
import { createBlob } from '../utils/audioUtils';

interface RecorderProps {
  onComplete: (transcript: string) => void;
}

export const Recorder: React.FC<RecorderProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<RecordingStatus>(RecordingStatus.IDLE);
  const [transcript, setTranscript] = useState<string>("");
  const [liveFormatted, setLiveFormatted] = useState<string>("");
  const [isFormatting, setIsFormatting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<{ message: string; sub: string } | null>(null);
  
  const sessionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const lastFormattedLength = useRef(0);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the direct flow
  useEffect(() => {
    if (flowContainerRef.current) {
      flowContainerRef.current.scrollTo({
        top: flowContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [liveFormatted]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus(RecordingStatus.RECORDING);
      setTranscript("");
      setLiveFormatted("");
      setDuration(0);
      lastFormattedLength.current = 0;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const sessionPromise = createLiveSession(
        (text) => setTranscript(prev => prev + (prev ? ' ' : '') + text),
        () => console.log("Stream Interrupted")
      );

      const source = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      
      sessionRef.current = { stream, scriptProcessor, source, sessionPromise, audioContext };

      timerRef.current = window.setInterval(() => setDuration(prev => prev + 1), 1000);

    } catch (err) {
      setError({
        message: "Microphone Required",
        sub: "Enable access to begin the Data Science knowledge capture."
      });
      setStatus(RecordingStatus.IDLE);
    }
  };

  useEffect(() => {
    const transcriptLength = transcript.length;
    if (status === RecordingStatus.RECORDING && 
        transcriptLength - lastFormattedLength.current > 40 && 
        !isFormatting) {
      
      const updateLiveNotes = async () => {
        setIsFormatting(true);
        try {
          const formatted = await incrementalFormat(transcript);
          setLiveFormatted(formatted);
          lastFormattedLength.current = transcriptLength;
        } catch (e) {
          console.error("Format error:", e);
        } finally {
          setIsFormatting(false);
        }
      };
      updateLiveNotes();
    }
  }, [transcript, status, isFormatting]);

  const stopRecording = useCallback(async () => {
    if (sessionRef.current) {
      const { stream, scriptProcessor, source, sessionPromise, audioContext } = sessionRef.current;
      stream.getTracks().forEach((track: any) => track.stop());
      scriptProcessor.disconnect();
      source.disconnect();
      const session = await sessionPromise;
      session.close();
      audioContext.close();
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus(RecordingStatus.IDLE);
      onComplete(transcript);
    }
  }, [transcript, onComplete]);

  const renderCleanText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded mx-0.5">{part.slice(2, -2)}</span>;
      }
      const subParts = part.split(/(\*.*?\*)/g);
      return subParts.map((sub, j) => {
        if (sub.startsWith('*') && sub.endsWith('*')) {
          return <span key={`${i}-${j}`} className="italic text-emerald-600 font-medium border-b border-emerald-100">{sub.slice(1, -1)}</span>;
        }
        return sub;
      });
    });
  };

  const renderDirectFlow = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-slate-900 mb-8 mt-2">{line.substring(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-indigo-700 mt-10 mb-5 border-l-4 border-indigo-600 pl-4">{line.substring(3)}</h2>;
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={i} className="flex items-start space-x-3 mb-4 ml-2">
            <div className="mt-2.5 w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0"></div>
            <div className="text-slate-700 leading-relaxed text-lg">{renderCleanText(trimmed.substring(2))}</div>
          </div>
        );
      }
      if (!trimmed) return <div key={i} className="h-4" />;
      return <p key={i} className="text-slate-600 mb-6 leading-relaxed text-lg font-medium">{renderCleanText(line)}</p>;
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
      {/* Dynamic Header */}
      <div className={`px-10 py-8 flex items-center justify-between transition-colors duration-700 ${status === RecordingStatus.RECORDING ? 'bg-indigo-600' : 'bg-slate-900'}`}>
        <div className="flex items-center space-x-5">
          <div className="relative">
            <div className={`w-5 h-5 rounded-full ${status === RecordingStatus.RECORDING ? 'bg-red-400 animate-ping' : 'bg-slate-700'}`}></div>
            <div className={`absolute inset-0 w-5 h-5 rounded-full ${status === RecordingStatus.RECORDING ? 'bg-red-500' : 'bg-slate-800'}`}></div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Direct Knowledge Flow</h2>
            <p className="text-[10px] text-white/50 font-bold tracking-[0.2em] uppercase mt-0.5">Capturing every detail verbatim</p>
          </div>
        </div>
        <div className="text-3xl font-mono font-black text-white bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-md">
          {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden bg-slate-50/30">
        {/* Continuous Flow View */}
        <div 
          ref={flowContainerRef}
          className="flex-grow p-12 overflow-y-auto bg-white border-r border-slate-100 scroll-smooth"
        >
          <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-50">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Writing</h3>
            </div>
            {isFormatting && <span className="text-[10px] font-black text-indigo-500 animate-pulse tracking-widest uppercase">Writing conclusion...</span>}
          </div>
          
          <div className="max-w-3xl mx-auto pb-20">
            {liveFormatted ? (
              <div className="animate-in fade-in duration-700">
                {renderDirectFlow(liveFormatted)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-slate-200">
                <svg className="w-16 h-16 mb-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                <p className="text-2xl font-black italic text-slate-300">Start the lecture to see direct notes...</p>
              </div>
            )}
          </div>
        </div>

        {/* Verbatim Transcription Side Panel */}
        <div className="w-full lg:w-[26rem] p-10 flex flex-col bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-200">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verbatim Transcript</h3>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">REAL-TIME</span>
          </div>
          <div ref={transcriptContainerRef} className="flex-grow overflow-y-auto text-base text-slate-500 italic leading-relaxed space-y-4 pr-3">
            {transcript || "Speak to begin the direct capture..."}
          </div>
        </div>
      </div>

      {/* Control Surface */}
      <div className="px-12 py-10 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-8">
        <div className="flex items-center space-x-6">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">No Summaries • Direct Capture Active</p>
        </div>
        
        <button
          onClick={status === RecordingStatus.RECORDING ? stopRecording : startRecording}
          className={`group flex items-center space-x-6 px-16 py-6 rounded-[2rem] text-2xl font-black transition-all shadow-xl hover:scale-[1.05] active:scale-95 ${
            status === RecordingStatus.RECORDING 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
          }`}
        >
          {status === RecordingStatus.RECORDING ? (
            <>
              <div className="w-5 h-5 bg-white rounded-md"></div>
              <span>FINISH RECORDING</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              </div>
              <span>START DIRECT NOTES</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
