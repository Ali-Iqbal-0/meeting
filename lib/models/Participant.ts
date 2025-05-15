import mongoose from 'mongoose';

const InviteParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const InviteParticipants =
  mongoose.models.InviteParticipants ||
  mongoose.model('InviteParticipants', InviteParticipantSchema);

export default InviteParticipants;
