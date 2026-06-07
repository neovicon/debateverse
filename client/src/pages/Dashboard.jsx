import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getPersonas } from '../store/personaSlice';
import { motion } from 'framer-motion';
import { BrainCircuit, Plus, Zap, Users, ShieldAlert, Edit2 } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { personas, isLoading, isError, message } = useSelector((state) => state.persona);

  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [topic, setTopic] = useState('');
  const [isStartingDebate, setIsStartingDebate] = useState(false);

  useEffect(() => {
    if (isError) {
      console.error(message);
    }
    if (user) {
      dispatch(getPersonas());
    }
  }, [user, isError, message, dispatch]);

  const togglePersonaSelection = (id) => {
    if (selectedPersonas.includes(id)) {
      setSelectedPersonas(selectedPersonas.filter(p => p !== id));
    } else {
      if (selectedPersonas.length < 2) {
        setSelectedPersonas([...selectedPersonas, id]);
      }
    }
  };

  const startDebate = async () => {
    if (selectedPersonas.length !== 2 || !topic) return;
    setIsStartingDebate(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await axios.post('http://localhost:5000/api/debates', {
        topic,
        personaAId: selectedPersonas[0],
        personaBId: selectedPersonas[1]
      }, config);
      navigate(`/debate/${response.data._id}`);
    } catch (error) {
      console.error('Error starting debate:', error);
      alert('Failed to start debate');
      setIsStartingDebate(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-20">
        <h1 className="text-5xl font-bold neon-text-blue mb-6">Welcome to DebateVerse</h1>
        <p className="text-xl text-gray-400 mb-8">Where Artificial Minds Clash</p>
        <Link to="/login" className="btn-neon-blue py-3 px-8 text-lg inline-block">Initialize Session</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold neon-text-blue flex items-center gap-3">
            <BrainCircuit size={40} /> Command Center
          </h1>
          <p className="text-gray-400 mt-2">Manage your AI entities and coordinate debates</p>
        </div>
        <Link to="/builder" className="btn-neon-blue flex items-center gap-2">
          <Plus size={20} /> Forge Persona
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personas List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-[var(--color-neon-pink)]" /> Your Entities
          </h2>
          
          {isLoading ? (
            <p className="text-gray-400">Loading entities...</p>
          ) : personas.length === 0 ? (
             <div className="glass-panel p-8 text-center flex flex-col items-center justify-center border-dashed border-2 border-gray-600">
               <ShieldAlert size={48} className="text-gray-500 mb-4" />
               <h3 className="text-xl text-white mb-2">No Personas Found</h3>
               <p className="text-gray-400 mb-6">You need at least two personas to initiate a debate.</p>
               <Link to="/builder" className="btn-neon-pink flex items-center gap-2">
                 <Plus size={20} /> Forge Your First Persona
               </Link>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personas.map(persona => {
                const isSelected = selectedPersonas.includes(persona._id);
                return (
                  <motion.div 
                    key={persona._id}
                    whileHover={{ scale: 1.02 }}
                    className={`glass-panel p-5 cursor-pointer transition-all duration-300 relative ${isSelected ? 'ring-2 ring-[var(--color-neon-blue)] bg-[var(--color-neon-blue)]/10 shadow-[0_0_15px_var(--color-neon-blue)]' : ''}`}
                    onClick={() => togglePersonaSelection(persona._id)}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/builder/${persona._id}`); }}
                      className="absolute top-3 right-3 text-gray-400 hover:text-[var(--color-neon-pink)] transition-colors p-2"
                      title="Edit Persona"
                    >
                      <Edit2 size={16} />
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                      <img src={persona.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} alt={persona.name} className="w-16 h-16 rounded-full border border-gray-600 bg-white/5" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{persona.name}</h3>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{persona.worldview}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Intelligence</span>
                        <span>{persona.stats.intelligence}%</span>
                      </div>
                      <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-neon-blue)]" style={{ width: `${persona.stats.intelligence}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 pt-1">
                        <span>Aggressiveness</span>
                        <span>{persona.stats.aggressiveness}%</span>
                      </div>
                      <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${persona.stats.aggressiveness}%` }}></div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Debate Launcher Panel */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="text-yellow-400" /> Debate Setup
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Selected Participants ({selectedPersonas.length}/2)</label>
                <div className="flex gap-4">
                  {[0, 1].map(index => {
                    const pId = selectedPersonas[index];
                    const p = personas.find(p => p._id === pId);
                    return (
                      <div key={index} className="flex-1 h-24 border border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center bg-black/30 overflow-hidden relative">
                        {p ? (
                          <>
                            <img src={p.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.name}`} alt={p.name} className="w-10 h-10 rounded-full mb-1 bg-white/5" />
                            <span className="text-xs font-bold text-white truncate px-2 w-full text-center">{p.name}</span>
                            <div className={`absolute inset-0 border-2 rounded-lg ${index === 0 ? 'border-[var(--color-neon-blue)]' : 'border-[var(--color-neon-pink)]'}`}></div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 text-center px-2">Select a Persona</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Debate Topic</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-neon-blue)] transition-colors h-24 resize-none"
                  placeholder="e.g. Is Artificial General Intelligence a threat to humanity?"
                />
              </div>

              <button 
                onClick={startDebate}
                disabled={selectedPersonas.length !== 2 || !topic || isStartingDebate}
                className={`w-full py-4 text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  selectedPersonas.length === 2 && topic && !isStartingDebate
                  ? 'btn-neon-blue' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed rounded-lg font-medium'
                }`}
              >
                <Zap size={24} /> {isStartingDebate ? 'Initializing...' : 'Launch Debate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
