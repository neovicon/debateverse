import Persona from '../models/Persona.js';

export const getPersonas = async (req, res) => {
  try {
    const personas = await Persona.find({ owner: req.user._id });
    res.status(200).json(personas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPersona = async (req, res) => {
  try {
    // If formData sends stats as JSON string, we need to parse it
    let parsedStats = req.body.stats;
    if (typeof parsedStats === 'string') {
      try {
        parsedStats = JSON.parse(parsedStats);
      } catch (e) {
        parsedStats = undefined;
      }
    }
    
    // If traits is a string, split by comma if needed
    let parsedTraits = req.body.traits;
    if (typeof parsedTraits === 'string') {
      parsedTraits = parsedTraits.split(',').map(t => t.trim());
    }

    const { name, worldview, speakingStyle, customPrompt } = req.body;
    let avatarUrl = undefined;
    if (req.file) {
      avatarUrl = req.file.path;
    }

    const persona = await Persona.create({
      owner: req.user._id,
      name,
      avatar: avatarUrl,
      traits: parsedTraits,
      worldview,
      speakingStyle,
      customPrompt,
      stats: parsedStats
    });

    res.status(201).json(persona);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPersonaById = async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
    if (!persona) return res.status(404).json({ message: 'Persona not found' });
    
    res.status(200).json(persona);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePersona = async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
    if (!persona) return res.status(404).json({ message: 'Persona not found' });

    if (persona.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this persona' });
    }

    let parsedStats = req.body.stats;
    if (typeof parsedStats === 'string') {
      try { parsedStats = JSON.parse(parsedStats); } catch (e) { /* ignore */ }
    }
    
    let parsedTraits = req.body.traits;
    if (typeof parsedTraits === 'string') {
      parsedTraits = parsedTraits.split(',').map(t => t.trim());
    } else if (Array.isArray(parsedTraits)) {
      parsedTraits = parsedTraits;
    } else {
      parsedTraits = persona.traits;
    }

    const updatedData = {
      name: req.body.name || persona.name,
      worldview: req.body.worldview || persona.worldview,
      speakingStyle: req.body.speakingStyle || persona.speakingStyle,
      customPrompt: req.body.customPrompt !== undefined ? req.body.customPrompt : persona.customPrompt,
      traits: parsedTraits,
      stats: parsedStats || persona.stats
    };

    if (req.file) {
      updatedData.avatar = req.file.path;
    }

    const updatedPersona = await Persona.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedPersona);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePersona = async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
    if (!persona) return res.status(404).json({ message: 'Persona not found' });

    if (persona.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this persona' });
    }

    await persona.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
