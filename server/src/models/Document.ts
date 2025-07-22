import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  // Basic Information
  title: string;
  description?: string;
  category: 'academic' | 'administrative' | 'personal' | 'financial' | 'legal' | 'medical' | 'research';
  subcategory?: string;
  
  // File Information
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  
  // Cloudinary Information
  cloudinaryId: string;
  cloudinaryUrl: string;
  cloudinarySecureUrl: string;
  cloudinaryFolder: string;
  
  // Document Processing
  ocrText?: string; // Extracted text from OCR
  extractedMetadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
    creationDate?: Date;
    modificationDate?: Date;
    pageCount?: number;
    language?: string;
  };
  
  // Indexing and Search
  tags: string[];
  searchableText: string; // Combined text for full-text search
  
  // Access Control
  accessLevel: 'public' | 'restricted' | 'confidential' | 'classified';
  permissions: {
    canView: mongoose.Types.ObjectId[];
    canEdit: mongoose.Types.ObjectId[];
    canDelete: mongoose.Types.ObjectId[];
  };
  
  // Ownership and Relations
  uploadedBy: mongoose.Types.ObjectId;
  relatedTo?: {
    type: 'Student' | 'Staff' | 'Department' | 'Course' | 'Project';
    id: mongoose.Types.ObjectId;
    name?: string;
  };
  
  // Document Lifecycle
  status: 'draft' | 'pending-review' | 'approved' | 'rejected' | 'archived';
  reviewHistory: [{
    reviewedBy: mongoose.Types.ObjectId;
    reviewDate: Date;
    status: 'approved' | 'rejected' | 'needs-revision';
    comments?: string;
  }];
  
  // Version Control
  version: number;
  parentDocument?: mongoose.Types.ObjectId;
  versions: [{
    version: number;
    cloudinaryId: string;
    uploadDate: Date;
    uploadedBy: mongoose.Types.ObjectId;
    changes: string;
  }];
  
  // Security and Compliance
  encryptionStatus: 'none' | 'encrypted' | 'password-protected';
  retentionPolicy?: {
    retainUntil: Date;
    autoDelete: boolean;
    reason: string;
  };
  
  // Audit Trail
  auditLog: [{
    action: 'created' | 'viewed' | 'downloaded' | 'modified' | 'deleted' | 'shared';
    performedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
  }];
  
  // Analytics
  analytics: {
    viewCount: number;
    downloadCount: number;
    shareCount: number;
    lastAccessed?: Date;
    popularityScore: number;
  };
  
  // Backup and Recovery
  backupStatus: 'pending' | 'backed-up' | 'failed';
  lastBackup?: Date;
  backupLocation?: string;
  
  // Status
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['academic', 'administrative', 'personal', 'financial', 'legal', 'medical', 'research'],
    required: [true, 'Document category is required']
  },
  subcategory: String,
  originalName: {
    type: String,
    required: [true, 'Original file name is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  cloudinaryId: {
    type: String,
    required: [true, 'Cloudinary ID is required'],
    unique: true
  },
  cloudinaryUrl: {
    type: String,
    required: [true, 'Cloudinary URL is required']
  },
  cloudinarySecureUrl: {
    type: String,
    required: [true, 'Cloudinary secure URL is required']
  },
  cloudinaryFolder: {
    type: String,
    required: [true, 'Cloudinary folder is required']
  },
  ocrText: String,
  extractedMetadata: {
    author: String,
    subject: String,
    keywords: [String],
    creationDate: Date,
    modificationDate: Date,
    pageCount: Number,
    language: String
  },
  tags: [String],
  searchableText: String,
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential', 'classified'],
    default: 'restricted'
  },
  permissions: {
    canView: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    canEdit: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    canDelete: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['Student', 'Staff', 'Department', 'Course', 'Project']
    },
    id: Schema.Types.ObjectId,
    name: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending-review', 'approved', 'rejected', 'archived'],
    default: 'pending-review'
  },
  reviewHistory: [{
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'needs-revision'],
      required: true
    },
    comments: String
  }],
  version: { type: Number, default: 1 },
  parentDocument: { type: Schema.Types.ObjectId, ref: 'Document' },
  versions: [{
    version: { type: Number, required: true },
    cloudinaryId: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changes: { type: String, required: true }
  }],
  encryptionStatus: {
    type: String,
    enum: ['none', 'encrypted', 'password-protected'],
    default: 'none'
  },
  retentionPolicy: {
    retainUntil: Date,
    autoDelete: { type: Boolean, default: false },
    reason: String
  },
  auditLog: [{
    action: {
      type: String,
      enum: ['created', 'viewed', 'downloaded', 'modified', 'deleted', 'shared'],
      required: true
    },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    details: String
  }],
  analytics: {
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    lastAccessed: Date,
    popularityScore: { type: Number, default: 0 }
  },
  backupStatus: {
    type: String,
    enum: ['pending', 'backed-up', 'failed'],
    default: 'pending'
  },
  lastBackup: Date,
  backupLocation: String,
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for performance and search
documentSchema.index({ title: 'text', description: 'text', searchableText: 'text' });
documentSchema.index({ category: 1, subcategory: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ 'relatedTo.type': 1, 'relatedTo.id': 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ accessLevel: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ createdAt: -1 });

documentSchema.index({ isActive: 1, isArchived: 1 });

// Pre-save middleware to update searchable text and analytics
documentSchema.pre('save', function(next) {
  // Combine text fields for search
  this.searchableText = [
    this.title,
    this.description,
    this.originalName,
    this.tags.join(' '),
    this.ocrText
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Update popularity score based on analytics
  const { viewCount, downloadCount, shareCount } = this.analytics;
  this.analytics.popularityScore = (viewCount * 1) + (downloadCount * 3) + (shareCount * 5);
  
  next();
});

// Method to add audit log entry
documentSchema.methods.addAuditLog = function(action: string, performedBy: mongoose.Types.ObjectId, details?: any) {
  this.auditLog.push({
    action,
    performedBy,
    timestamp: new Date(),
    ipAddress: details?.ipAddress,
    userAgent: details?.userAgent,
    details: details?.details
  });
  return this.save();
};

// Method to increment analytics
documentSchema.methods.incrementView = function() {
  this.analytics.viewCount += 1;
  this.analytics.lastAccessed = new Date();
  return this.save();
};

documentSchema.methods.incrementDownload = function() {
  this.analytics.downloadCount += 1;
  this.analytics.lastAccessed = new Date();
  return this.save();
};

documentSchema.methods.incrementShare = function() {
  this.analytics.shareCount += 1;
  return this.save();
};

export default mongoose.model<IDocument>('Document', documentSchema);