
import React, { useState, useEffect, useRef } from 'react';
import { Message, UserProfile, Location } from './types';
import { INTEREST_SUGGESTIONS } from './constants';
import { getLumiResponse } from './services/geminiService';
import ChatMessage from './components/ChatMessage';

const SPA_SERVICES = [
  "Abhyanga (Traditional Oil Massage)",
  "Shirodhara (Oil Flow Ritual)",
  "Udwarthanam (Herbal Scrub)",
  "Ayurvedic Facial",
  "Padabhyanga (Foot Massage)"
];

const TIME_SLOTS = [
  "09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM", "07:00 PM"
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Location | undefined>();
  
  // Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'selection' | 'confirmation'>('selection');
  const [selectedSpaService, setSelectedSpaService] = useState(SPA_SERVICES[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.warn("Location permission not granted, using hotel default.", err)
      );
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleOnboarding = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profile: UserProfile = {
      name: formData.get('name') as string,
      interest: formData.get('interest') as any,
      stayDays: parseInt(formData.get('days') as string) || 3
    };
    setUser(profile);
    
    setMessages([{
      role: 'model',
      text: `Vanakkam and good morning, ${profile.name}. Welcome to The Lumiere Grand Erode. It is a distinct pleasure to have you with us in the heart of Tamil Nadu. 

As you have noted an interest in ${profile.interest}, I have curated a selection of local experiences—from historic temple circuits to the world's most vibrant textile hubs. 

How may I assist you with your itinerary today?`,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user) return;

    const userMsg: Message = { role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await getLumiResponse(text, user, location);
      setMessages(prev => [...prev, {
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        groundingUrls: response.groundingUrls
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I apologize for the interruption, but our internal systems are currently updating. One moment, please.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpaBooking = () => {
    const bookingMessage = `I would like to finalize my booking for ${selectedSpaService} at the Lotus Spa for ${selectedTimeSlot} tomorrow. Please confirm this appointment.`;
    setIsBookingModalOpen(false);
    setBookingStep('selection');
    handleSendMessage(bookingMessage);
  };

  const openBookingModal = () => {
    setBookingStep('selection');
    setIsBookingModalOpen(true);
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-blue-100 p-12 border border-slate-100 animate-in zoom-in duration-700">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#0F172A] rounded-3xl flex items-center justify-center text-white text-4xl font-light mx-auto mb-6 shadow-2xl float">L</div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">The Lumiere Experience</h1>
            <p className="text-sm text-slate-400 mt-3 font-medium">Identify yourself to enter our secure concierge</p>
          </div>
          <form onSubmit={handleOnboarding} className="space-y-6">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 block ml-1">Full Guest Name</label>
              <input required name="name" type="text" placeholder="Julian Vane" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all text-sm font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 block ml-1">Length of Stay</label>
                <input required name="days" type="number" min="1" placeholder="Days" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 block ml-1">Travel Focus</label>
                <select name="interest" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all text-sm font-medium appearance-none cursor-pointer">
                  <option value="Culinary">Culinary</option>
                  <option value="Business">Business</option>
                  <option value="Relaxation">Relaxation</option>
                  <option value="Exploration">Exploration</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] mt-4 uppercase tracking-widest">
              Access Concierge
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[340px] bg-slate-50 border-r border-slate-200 flex-col overflow-y-auto custom-scrollbar">
        <div className="p-10 flex flex-col gap-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white font-light text-2xl shadow-xl border border-white/10">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{user.name}</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-[0.2em]">Diamond Elite</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200/60">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Current Residence</h4>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-2xl font-bold text-slate-900">Suite 402</p>
                <p className="text-[12px] text-slate-500 font-medium">Erode, Tamil Nadu</p>
              </div>
              <div className="bg-slate-900 text-white p-2.5 rounded-xl">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400 font-medium">Duration</span>
                <span className="text-slate-900 font-bold">{user.stayDays} Nights</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-slate-400 font-medium">Checkout</span>
                <span className="text-slate-900 font-bold">11:00 AM</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3.5 text-[11px] font-bold text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest">
              Guest Services
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-5 px-1">
               <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Curated for {user.interest}</h4>
               <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">Personalized</span>
            </div>
            <div className="space-y-4">
              {INTEREST_SUGGESTIONS[user.interest].map((s, i) => {
                const isSpa = s.title === "Ayurvedic Healing" || s.desc.toLowerCase().includes("lotus spa");
                return (
                  <div key={i} className="group flex flex-col gap-2">
                    <button 
                      onClick={() => handleSendMessage(`I am interested in ${s.title}. Please provide more details.`)} 
                      className="w-full bg-white p-5 rounded-[22px] border border-slate-200/60 text-left hover:border-slate-900 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-xl group-hover:scale-110 transition-transform">{s.icon}</span>
                        <p className="text-sm font-bold text-slate-900">{s.title}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed ml-9 font-medium">{s.desc}</p>
                    </button>
                    {isSpa && (
                      <button 
                        onClick={openBookingModal}
                        className="mx-9 py-3 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Book Appointment
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white relative">
        <header className="px-10 py-7 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white text-2xl font-light shadow-xl">L</div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Lumi Concierge</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">Active Registry</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
             <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#FBFCFE]">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white px-6 py-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Analyzing Request</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-10 bg-white border-t border-slate-100">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
            className="max-w-4xl mx-auto flex gap-5"
          >
            <div className="flex-1 relative group">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask for recommendations in Erode, Tamil Nadu...`}
                className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-8 py-6 text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all pr-16 font-medium placeholder:text-slate-400"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className="bg-[#0F172A] text-white p-6 rounded-[24px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-95"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
          <div className="max-w-4xl mx-auto flex justify-between items-center mt-8">
            <div className="flex gap-6">
               {['Temple Tours', 'Textile Hub', 'Luxury Car', 'City Map'].map(tag => (
                 <button key={tag} onClick={() => handleSendMessage(`Help me with ${tag}`)} className="text-[11px] text-slate-400 hover:text-slate-900 font-bold uppercase tracking-[0.15em] transition-colors">{tag}</button>
               ))}
            </div>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Concierge Ver. 2.5 • Erode TN</p>
          </div>
        </div>

        {/* Booking Modal */}
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 bg-[#0F172A] text-white">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Lotus Spa Appointment</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Lumiere Grand Erode</p>
                  </div>
                  <button onClick={() => setIsBookingModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="w-full h-[1px] bg-white/10 mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🌿</div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {bookingStep === 'selection' ? 'Choose your preferred treatment and time.' : 'Please review your appointment details.'}
                  </p>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                {bookingStep === 'selection' ? (
                  <>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Select Treatment</label>
                      <select 
                        value={selectedSpaService} 
                        onChange={(e) => setSelectedSpaService(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        {SPA_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Preferred Time Slot</label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map(t => (
                          <button 
                            key={t}
                            onClick={() => setSelectedTimeSlot(t)}
                            className={`py-3 rounded-xl text-[10px] font-bold transition-all border ${
                              selectedTimeSlot === t 
                                ? 'bg-orange-600 border-orange-600 text-white' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button 
                        onClick={() => setIsBookingModalOpen(false)}
                        className="flex-1 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => setBookingStep('confirmation')}
                        className="flex-1 py-4 text-[11px] font-bold text-white uppercase tracking-widest bg-[#0F172A] rounded-2xl shadow-lg shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95"
                      >
                        Review
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      {/* Summary Section */}
                      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-lg">🌿</span>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Selected Treatment</p>
                             <p className="text-sm font-bold text-slate-900 leading-tight">{selectedSpaService}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-lg">⏰</span>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Preferred Time</p>
                             <p className="text-sm font-bold text-orange-600 leading-tight">{selectedTimeSlot} tomorrow</p>
                          </div>
                        </div>

                        <div className="w-full h-px bg-slate-200"></div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                            <span className="text-lg">📍</span>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location & Operating Hours</p>
                             <p className="text-xs font-bold text-slate-900 leading-tight">Lotus Spa, The Lumiere Grand Erode</p>
                             <p className="text-[10px] text-slate-500 font-medium mt-1">124 Brough Road, Erode, Tamil Nadu 638001</p>
                             <p className="text-[10px] text-slate-500 font-medium italic mt-1">Operating Hours: 8:00 AM - 8:00 PM</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 text-center font-medium px-4">
                        Upon confirmation, Lumi will register your request with the Spa Desk. A confirmation alert will appear in your chat.
                      </p>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => setBookingStep('selection')}
                        className="flex-1 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Edit
                      </button>
                      <button 
                        onClick={handleSpaBooking}
                        className="flex-1 py-4 text-[11px] font-bold text-white uppercase tracking-widest bg-orange-600 rounded-2xl shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95"
                      >
                        Confirm Appointment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
