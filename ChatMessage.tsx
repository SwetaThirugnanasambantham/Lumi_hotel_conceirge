
import React, { useState, useRef } from 'react';
import { Message } from '../types';
import { getLumiAudioTour } from '../services/geminiService';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isLumi = message.role === 'model';
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePlayTour = async () => {
    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }
    
    setIsAudioLoading(true);
    try {
      const base64Data = await getLumiAudioTour(message.text);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const decode = (base64: string) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      };

      const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
        const dataInt16 = new Int16Array(data.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        return buffer;
      };

      const audioBuffer = await decodeAudioData(decode(base64Data), audioCtx);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      };

      audioSourceRef.current = source;
      setIsPlaying(true);
      source.start();
    } catch (err) {
      console.error("Audio tour error:", err);
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isLumi ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-2 duration-300'}`}>
      <div className={`max-w-[80%] flex flex-col ${isLumi ? 'items-start' : 'items-end'}`}>
        <div className={`px-5 py-4 rounded-2xl shadow-sm border relative overflow-hidden ${
          isLumi 
            ? 'bg-white border-slate-100 text-slate-800 rounded-bl-none' 
            : 'bg-blue-600 border-blue-500 text-white rounded-br-none'
        }`}>
          {isLumi && (
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">L</div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Lumi AI</span>
              </div>
              <div className="flex items-center gap-3">
                {isPlaying && (
                  <div className="flex items-end gap-[2px] h-3">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="w-[2px] bg-orange-400 animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
                    ))}
                  </div>
                )}
                <button 
                  onClick={handlePlayTour}
                  disabled={isAudioLoading}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter transition-all ${
                    isPlaying ? 'bg-orange-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {isAudioLoading ? (
                    <div className="w-2 h-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                  )}
                  {isAudioLoading ? 'Loading' : isPlaying ? 'Stop Tour' : 'Audio Tour'}
                </button>
              </div>
            </div>
          )}
          <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {message.text}
          </div>
          
          {message.groundingUrls && message.groundingUrls.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100/50 flex flex-wrap gap-2">
              {message.groundingUrls.map((link, idx) => (
                <a
                  key={idx}
                  href={link.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[10px] px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                    isLumi ? 'bg-slate-50 text-slate-600 hover:bg-slate-100' : 'bg-blue-700 text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  {link.title}
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="mt-1 text-[9px] text-slate-400 uppercase font-semibold tracking-tighter">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
