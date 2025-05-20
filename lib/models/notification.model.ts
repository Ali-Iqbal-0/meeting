import { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema({
  type: { type: String, required: true }, // e.g., 'host_request'
  meetingId: { type: Schema.Types.ObjectId, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
});

const Notification = models.Notification || model('Notification', NotificationSchema);

export default Notification;