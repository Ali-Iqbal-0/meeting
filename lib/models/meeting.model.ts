import { Schema, model, models } from 'mongoose';

const ParticipantSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String }, // Made optional
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isHost: { type: Boolean, default: false }, // Used for both main host and co-hosts
  
});

const MeetingSchema = new Schema({
  callId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  creatorId: { type: String, required: true },
  meetingLink: { type: String, required: true },
  meetingType: { 
    type: String, 
    required: true,
    enum: ['Instant Meeting', 'Scheduled Meeting'] 
  },
  isPersonalRoom: { type: Boolean, default: false },
  requiresJoinRequest: { type: Boolean, default: true },
  participants: [ParticipantSchema],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Meeting = models.Meeting || model('Meeting', MeetingSchema);

export default Meeting;