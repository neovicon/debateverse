import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Persona',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    emotionalState: {
      anger: { type: Number, default: 0 },
      confidence: { type: Number, default: 50 },
      frustration: { type: Number, default: 0 },
      persuasion: { type: Number, default: 50 },
      excitement: { type: Number, default: 0 },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const debateSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Persona',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'aborted'],
      default: 'pending',
    },
    settings: {
      totalRounds: { type: Number, default: 3 },
      currentRound: { type: Number, default: 0 },
      temperature: { type: Number, default: 0.7 },
      isPublic: { type: Boolean, default: false },
    },
    messages: [messageSchema],
    analytics: {
      winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona' },
      longestResponse: { type: Number, default: 0 }, // in characters
      topicShifts: { type: Number, default: 0 },
      logicalConsistencyScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Debate = mongoose.model('Debate', debateSchema);
export default Debate;
