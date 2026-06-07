import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Mic, Activity, ShieldAlert, Cpu } from 'lucide-react';
import axios from 'axios';

const DebateArena = () => {
  const { id } = useParams(); // debate ID
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [socket, setSocket] = useState(null);
  const [debate, setDebate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentStream, setCurrentStream] = useState('');
  const [activePersona, setActivePersona] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  // Fetch debate details
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDebate = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/debates/${id}`, config);
        setDebate(data);
        if (data.messages && data.messages.length > 0) {
          const formattedMessages = data.messages.map(m => ({
            senderId: m.senderId,
            text: m.text,
            emotionalShift: m.emotionalState
          }));
          setMessages(formattedMessages);
          setActivePersona(data.messages[data.messages.length - 1].senderId);
        } else if (data.participants && data.participants.length === 2) {
          // Initialize active persona to the SECOND participant, so the FIRST participant goes first when triggered
          setActivePersona(data.participants[1]._id);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching debate:', err);
        setError('Failed to load debate data.');
        setIsLoading(false);
      }
    };

    fetchDebate();
  }, [id, user, navigate]);

  useEffect(() => {
    if (!debate) return;

    // Connect to specific namespace
    const newSocket = io('http://localhost:5000/debates');
    setSocket(newSocket);

    // Join room
    newSocket.emit('join_debate', debate._id);

    newSocket.on('receive_token', (data) => {
      setActivePersona(data.personaId);
      setCurrentStream((prev) => prev + data.chunk);
    });

    newSocket.on('turn_complete', (data) => {
      setMessages((prev) => [...prev, {
        senderId: data.personaId,
        text: data.fullMessage,
        emotionalShift: data.emotionalShift
      }]);
      setCurrentStream('');
    });
    
    newSocket.on('debate_error', (data) => {
      console.error('Debate error:', data);
      alert('Debate Error: ' + data.message);
    });

    return () => newSocket.close();
  }, [debate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

  if (isLoading) {
    return <div className="text-center mt-20 text-xl neon-text-blue animate-pulse">Initializing Debate Arena...</div>;
  }

  if (error || !debate || !debate.participants || debate.participants.length < 2) {
    return (
      <div className="text-center mt-20">
        <ShieldAlert size={64} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl text-white">{error || 'Invalid Debate Data'}</h2>
      </div>
    );
  }

  const personaA = debate.participants[0];
  const personaB = debate.participants[1];

  const triggerNextTurn = () => {
    const nextPersonaId = activePersona === personaA._id ? personaB._id : personaA._id;
    
    // Convert previous messages to string context for AI
    const contextHistory = messages.map(m => `${m.senderId === personaA._id ? personaA.name : personaB.name}: ${m.text}`).join('\n');

    socket.emit('start_turn', {
      debateId: debate._id,
      activePersonaId: nextPersonaId,
      contextHistory: `Topic: ${debate.topic} \n\n${contextHistory}`,
      isFirstTurn: messages.length === 0
    });
  };

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex flex-col mt-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold neon-text-pink flex items-center gap-2">
          <Activity size={32} /> Arena: {debate.topic}
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={triggerNextTurn}
            className="btn-neon-blue flex items-center gap-2"
            disabled={!!currentStream}
          >
            <Cpu size={18} /> Initiate Next Turn
          </button>
        </div>
      </div>

      <div className="flex justify-center h-full pb-8">
        {/* Chat / Stream Area */}
        <div className="glass-panel w-full max-w-4xl p-6 overflow-y-auto flex flex-col gap-6 relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          
          {messages.length === 0 && !currentStream && (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
               <ShieldAlert size={48} className="mb-4 opacity-50" />
               <p>Awaiting debate initialization...</p>
             </div>
          )}

          {messages.map((msg, index) => {
            const isA = msg.senderId === personaA._id;
            const persona = isA ? personaA : personaB;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: isA ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex w-full ${isA ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${isA ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div 
                    className="flex-shrink-0 cursor-pointer mt-1" 
                    onClick={() => navigate(`/builder/${persona._id}`)}
                    title={`View ${persona.name}'s profile`}
                  >
                    <img src={persona.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} alt={persona.name} className={`w-10 h-10 rounded-full border-2 ${isA ? 'border-[var(--color-neon-blue)]' : 'border-[var(--color-neon-pink)]'} bg-black/40 hover:scale-110 transition-transform object-cover`} />
                  </div>
                  <div className={`rounded-xl p-4 ${isA ? 'bg-[var(--color-neon-blue)]/10 border border-[var(--color-neon-blue)]/30' : 'bg-[var(--color-neon-pink)]/10 border border-[var(--color-neon-pink)]/30'} shadow-lg backdrop-blur-sm`}>
                    <p 
                      className={`text-sm font-bold mb-1 cursor-pointer transition-colors ${isA ? 'text-[var(--color-neon-blue)] hover:text-white' : 'text-[var(--color-neon-pink)] hover:text-white'} text-${isA ? 'left' : 'right'}`}
                      onClick={() => navigate(`/builder/${persona._id}`)}
                    >
                      {persona.name}
                    </p>
                    <p className="text-gray-100 leading-relaxed text-[15px]">{msg.text}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Active Streamer */}
          {currentStream && (() => {
             const isA = activePersona === personaA._id;
             const persona = isA ? personaA : personaB;
             return (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className={`flex w-full ${isA ? 'justify-start' : 'justify-end'}`}
               >
                 <div className={`flex gap-3 max-w-[85%] ${isA ? 'flex-row' : 'flex-row-reverse'}`}>
                   <div 
                     className="flex-shrink-0 cursor-pointer mt-1" 
                     onClick={() => navigate(`/builder/${persona._id}`)}
                   >
                     <img src={persona.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} alt={persona.name} className={`w-10 h-10 rounded-full border-2 ${isA ? 'border-[var(--color-neon-blue)]' : 'border-[var(--color-neon-pink)]'} bg-black/40 object-cover animate-pulse`} />
                   </div>
                   <div className={`rounded-xl p-4 border ${isA ? 'bg-[var(--color-neon-blue)]/20 border-[var(--color-neon-blue)]/60' : 'bg-[var(--color-neon-pink)]/20 border-[var(--color-neon-pink)]/60'} shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md`}>
                     <p 
                       className={`text-sm font-bold mb-2 flex items-center gap-2 cursor-pointer transition-colors ${isA ? 'text-[var(--color-neon-blue)] hover:text-white' : 'text-[var(--color-neon-pink)] hover:text-white'} justify-${isA ? 'start' : 'end'}`}
                       onClick={() => navigate(`/builder/${persona._id}`)}
                     >
                       <Mic size={14} className="animate-pulse" />
                       {persona.name} is speaking...
                     </p>
                     <p className="text-gray-100 leading-relaxed whitespace-pre-wrap text-[15px]">{currentStream}<span className="animate-pulse inline-block w-2 h-4 bg-white ml-1 align-middle"></span></p>
                   </div>
                 </div>
               </motion.div>
             )
          })()}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default DebateArena;
