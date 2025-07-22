import mongoose, { Document, Schema } from 'mongoose';

export interface ITranscriptRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  requestDate: Date;
  reason: string;
  destination: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  processedBy?: mongoose.Types.ObjectId;
  processedDate?: Date;
}

const TranscriptRequestSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  requestDate: { type: Date, default: Date.now },
  reason: { type: String, required: true },
  destination: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedDate: { type: Date },
}, { timestamps: true });

export default mongoose.model<ITranscriptRequest>('TranscriptRequest', TranscriptRequestSchema);
