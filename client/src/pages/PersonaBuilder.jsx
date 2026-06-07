import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createPersona, updatePersona } from '../store/personaSlice';
import { motion } from 'framer-motion';
import { Brain, Sliders, Zap, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const PersonaBuilder = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, personas } = useSelector((state) => state.persona);
  const { user } = useSelector((state) => state.auth);

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    worldview: '',
    speakingStyle: '',
    customPrompt: '',
    traits: '',
    stats: {
      emotionalIntensity: 50,
      intelligence: 50,
      humor: 50,
      aggressiveness: 50,
    }
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      // Find persona from state or fetch it
      const existingPersona = personas.find(p => p._id === id);
      if (existingPersona) {
        populateForm(existingPersona);
      } else {
        // Fetch if not in state
        const fetchPersona = async () => {
          try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/personas/${id}`, config);
            populateForm(data);
          } catch (error) {
            console.error('Failed to fetch persona:', error);
            navigate('/');
          }
        };
        fetchPersona();
      }
    }
  }, [id, isEditMode, personas, user, navigate]);

  const populateForm = (persona) => {
    setFormData({
      name: persona.name || '',
      worldview: persona.worldview || '',
      speakingStyle: persona.speakingStyle || '',
      customPrompt: persona.customPrompt || '',
      traits: (persona.traits || []).join(', '),
      stats: persona.stats || {
        emotionalIntensity: 50,
        intelligence: 50,
        humor: 50,
        aggressiveness: 50,
      }
    });
    if (persona.avatar) {
      setAvatarPreview(persona.avatar);
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSliderChange = (e) => {
    setFormData({
      ...formData,
      stats: {
        ...formData.stats,
        [e.target.name]: parseInt(e.target.value),
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('worldview', formData.worldview);
    submitData.append('speakingStyle', formData.speakingStyle);
    submitData.append('customPrompt', formData.customPrompt);
    submitData.append('traits', formData.traits);
    submitData.append('stats', JSON.stringify(formData.stats));
    
    if (avatarFile) {
      submitData.append('avatar', avatarFile);
    }

    if (isEditMode) {
      await dispatch(updatePersona({ id, personaData: submitData }));
    } else {
      await dispatch(createPersona(submitData));
    }
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-20">
      <div className="flex items-center gap-4 mb-8">
        <Brain className="text-[var(--color-neon-blue)]" size={48} />
        <h1 className="text-4xl font-bold neon-text-blue">{isEditMode ? 'Modify Persona' : 'Persona Forge'}</h1>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit} 
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        encType="multipart/form-data"
      >
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
              <Zap className="text-[var(--color-neon-pink)]" size={20} /> Identity Core
            </h2>
            
            {/* Avatar Upload */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative group cursor-pointer mb-2">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-500 overflow-hidden bg-black/30 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-500" size={32} />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <Upload className="text-white" size={24} />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <span className="text-xs text-gray-400">Upload Avatar (Cloudinary)</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Entity Designation (Name)</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-neon-blue)] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Traits (comma-separated)</label>
                <input
                  type="text"
                  name="traits"
                  value={formData.traits}
                  onChange={onChange}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-neon-blue)] transition-colors"
                  placeholder="e.g. analytical, sarcastic, impatient"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Worldview / Beliefs</label>
                <textarea
                  name="worldview"
                  value={formData.worldview}
                  onChange={onChange}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-neon-blue)] transition-colors h-20"
                  placeholder="E.g., A cynical AI that believes technology was a mistake..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Speaking Style</label>
                <textarea
                  name="speakingStyle"
                  value={formData.speakingStyle}
                  onChange={onChange}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-neon-blue)] transition-colors h-20"
                  placeholder="E.g., Formal, sarcastic, uses big words..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">System Override Prompt (Optional)</label>
                <textarea
                  name="customPrompt"
                  value={formData.customPrompt}
                  onChange={onChange}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-[var(--color-neon-pink)] transition-colors h-20"
                  placeholder="Direct instructions injected into the AI context..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
              <Sliders className="text-[var(--color-neon-blue)]" size={20} /> Behavioral Matrix
            </h2>
            <div className="space-y-8 flex-grow">
              
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Emotional Intensity</span>
                  <span className="text-[var(--color-neon-pink)]">{formData.stats.emotionalIntensity}%</span>
                </div>
                <input
                  type="range"
                  name="emotionalIntensity"
                  min="0" max="100"
                  value={formData.stats.emotionalIntensity}
                  onChange={onSliderChange}
                  className="w-full accent-[var(--color-neon-pink)] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Intelligence Level</span>
                  <span className="text-[var(--color-neon-blue)]">{formData.stats.intelligence}%</span>
                </div>
                <input
                  type="range"
                  name="intelligence"
                  min="0" max="100"
                  value={formData.stats.intelligence}
                  onChange={onSliderChange}
                  className="w-full accent-[var(--color-neon-blue)] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Humor Protocol</span>
                  <span className="text-yellow-400">{formData.stats.humor}%</span>
                </div>
                <input
                  type="range"
                  name="humor"
                  min="0" max="100"
                  value={formData.stats.humor}
                  onChange={onSliderChange}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Aggressiveness</span>
                  <span className="text-red-500">{formData.stats.aggressiveness}%</span>
                </div>
                <input
                  type="range"
                  name="aggressiveness"
                  min="0" max="100"
                  value={formData.stats.aggressiveness}
                  onChange={onSliderChange}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

            </div>
            <button 
              type="submit" 
              className="w-full btn-neon-blue py-4 mt-8 text-lg flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <Zap size={24} /> {isLoading ? 'Compiling...' : (isEditMode ? 'Update Persona' : 'Initialize Persona')}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default PersonaBuilder;
