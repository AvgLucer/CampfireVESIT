export type CustomFieldType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'price'
  | 'datetime'
  | 'url'
  | 'location'
  | 'boolean'
  | 'contact';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: CustomFieldType;
  value: string | number | boolean;
  required?: boolean;
}

export type UpdateCategory =
  | 'All'
  | 'Hackathon'
  | 'Workshop'
  | 'Club Activity'
  | 'Lost & Found'
  | 'Opportunity'
  | 'Competition'
  | 'Sports & Cultural'
  | 'Academic Notice'
  | 'General';

export type UpdateModerationStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'declined'
  | 'changes_requested'
  | 'expired'
  | 'withdrawn';

export interface AuditLogEntry {
  id: string;
  action:
    | 'submitted'
    | 'approved'
    | 'declined'
    | 'changes_requested'
    | 'edited'
    | 'resubmitted'
    | 'withdrawn'
    | 'expired';
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  feedback?: string;
}

export interface DailyUpdate {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  additionalImageUrls?: string[];
  category: string;
  tags: string[];

  // Host information
  hostId: string;
  hostName: string;
  hostUsername: string;
  hostAvatarUrl?: string;
  hostDepartment?: string;
  hostYear?: string;
  hostRole?: 'student' | 'admin';

  // Optional contact & location
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  externalLink?: string;

  // Dynamic Custom Fields
  customFields: CustomFieldDefinition[];

  // Application settings
  acceptsApplications: boolean;
  maxApplicants?: number;
  applicationQuestions?: string[];

  // Moderation & Lifecyle
  status: UpdateModerationStatus;
  moderationFeedback?: string; // Reason or requested changes
  moderatedBy?: string;
  moderatedAt?: string;
  publishedAt?: string;
  expiresAt: string; // ISO date-time string
  createdAt: string;
  updatedAt: string;

  // Audit history
  auditLog?: AuditLogEntry[];
}

export type UpdateApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'changes_requested';

export interface UpdateApplicationAnswer {
  question: string;
  answer: string;
}

export interface UpdateApplication {
  id: string;
  updateId: string;
  updateTitle: string;
  updateCategory: string;

  // Applicant info
  applicantId: string;
  applicantName: string;
  applicantUsername: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantDepartment?: string;
  applicantYear?: string;
  applicantRollNumber?: string;
  applicantAvatarUrl?: string;

  // Response details
  statement?: string; // Why apply / introduction
  answers?: UpdateApplicationAnswer[];

  // Review Status
  status: UpdateApplicationStatus;
  hostFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
}
