import Debate from '../models/Debate.js';

export const createDebate = async (req, res) => {
  try {
    const { topic, personaAId, personaBId } = req.body;

    if (!topic || !personaAId || !personaBId) {
      return res.status(400).json({ message: 'Topic and both personas are required' });
    }

    const debate = await Debate.create({
      owner: req.user._id,
      topic,
      participants: [personaAId, personaBId],
      status: 'pending'
    });

    res.status(201).json(debate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDebateById = async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id).populate('participants');
    
    if (!debate) {
      return res.status(404).json({ message: 'Debate not found' });
    }

    res.status(200).json(debate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserDebates = async (req, res) => {
  try {
    const debates = await Debate.find({ owner: req.user._id })
      .populate('participants')
      .sort({ createdAt: -1 });
    res.status(200).json(debates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
