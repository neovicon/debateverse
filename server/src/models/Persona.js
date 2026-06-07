import mongoose from 'mongoose';

const personaSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'default_avatar.png',
    },
    traits: {
      type: [String],
      default: [],
    },
    worldview: {
      type: String,
      default: '',
    },
    speakingStyle: {
      type: String,
      default: '',
    },
    customPrompt: {
      type: String,
      default: '',
    },
    stats: {
      emotionalIntensity: { type: Number, default: 50, min: 0, max: 100 },
      intelligence: { type: Number, default: 50, min: 0, max: 100 },
      humor: { type: Number, default: 50, min: 0, max: 100 },
      aggressiveness: { type: Number, default: 50, min: 0, max: 100 },
    },
  },
  { timestamps: true }
);

const Persona = mongoose.model('Persona', personaSchema);
export default Persona;
