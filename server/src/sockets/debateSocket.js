import Debate from '../models/Debate.js';
import Persona from '../models/Persona.js';
import { generateDebateResponseStream } from '../services/aiService.js';

export default function setupDebateSocket(io) {
  const debateNamespace = io.of('/debates');

  debateNamespace.on('connection', (socket) => {
    console.log(`Socket connected to /debates: ${socket.id}`);

    // Join a specific debate room
    socket.on('join_debate', (debateId) => {
      socket.join(debateId);
      console.log(`Socket ${socket.id} joined debate ${debateId}`);
    });

    // Handle starting a debate turn
    socket.on('start_turn', async (data) => {
      const { debateId, activePersonaId, contextHistory, isFirstTurn } = data;
      
      try {
        const persona = await Persona.findById(activePersonaId);
        if (!persona) throw new Error('Persona not found');

        // Update debate status in DB to active if it's the first turn
        await Debate.findByIdAndUpdate(debateId, { status: 'active' });

        // Stream the response back to all clients in the debate room
        let fullResponse = '';
        await generateDebateResponseStream(persona, contextHistory, isFirstTurn, (chunk) => {
          fullResponse += chunk;
          debateNamespace.to(debateId).emit('receive_token', {
            personaId: activePersonaId,
            chunk,
          });
        });

        // Notify that the turn is complete and send the full message to be saved
        const emotionalShift = calculateMockEmotions();

        // Notify that the turn is complete and send the full message to be saved
        debateNamespace.to(debateId).emit('turn_complete', {
          personaId: activePersonaId,
          fullMessage: fullResponse,
          emotionalShift: emotionalShift, // We can simulate emotional shift
        });

        // Save the message to the DB
        await Debate.findByIdAndUpdate(debateId, {
          $push: {
            messages: {
              senderId: activePersonaId,
              text: fullResponse,
              emotionalState: emotionalShift
            }
          }
        });

      } catch (error) {
        console.error('Debate turn error:', error);
        debateNamespace.to(debateId).emit('debate_error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected from /debates: ${socket.id}`);
    });
  });
}

function calculateMockEmotions() {
  return {
    anger: Math.floor(Math.random() * 20) - 10,
    confidence: Math.floor(Math.random() * 20) - 10,
    frustration: Math.floor(Math.random() * 20) - 10,
    persuasion: Math.floor(Math.random() * 20) - 10,
    excitement: Math.floor(Math.random() * 20) - 10,
  };
}
