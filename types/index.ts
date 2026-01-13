export type UserRole = 'influencer' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'pending' | 'paid' | 'under_review';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Influencer {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  district: string;
  state: string;
  social_media_handles: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  follower_count: number;
  id_proof_url: string;
  id_proof_type: 'aadhaar' | 'pan';
  upi_id: string;
  approval_status: ApprovalStatus;
  approved_at?: string;
  approved_by?: string;
  video_rate?: number; // Rate per approved video (e.g., 2000-10000)
  created_at: string;
  updated_at: string;
}

export interface VideoSubmission {
  id: string;
  influencer_id: string;
  campaign_id?: string;
  task_assignment_id?: string;
  title: string;
  description: string;
  video_url?: string;
  video_file_url?: string;
  thumbnail_url?: string;
  approval_status: ApprovalStatus;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface PostProof {
  id: string;
  video_submission_id: string;
  influencer_id: string;
  platform: 'instagram' | 'youtube' | 'facebook' | 'other';
  post_url: string;
  screenshot_url: string;
  posted_at: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  influencer_id: string;
  video_submission_id?: string;
  task_assignment_id?: string;
  amount: number;
  payment_type: 'fixed' | 'revenue_share';
  payment_status: PaymentStatus;
  upi_transaction_id?: string;
  paid_at?: string;
  paid_by?: string;
  month?: string;
  follower_band?: FollowerBand;
  lead_revenue?: number;
  performance_share?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PromotionGuidelines {
  id: string;
  title: string;
  content: string;
  dos: string[];
  donts: string[];
  script_template?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InfluencerStats {
  total_videos_submitted: number;
  approved_videos: number;
  rejected_videos: number;
  pending_videos: number;
  total_earnings: number;
  pending_payments: number;
  this_month_posts: number;
  eligible_for_revenue_share: boolean;
}

export interface AdminDashboardStats {
  total_influencers: number;
  pending_approvals: number;
  approved_influencers: number;
  rejected_influencers: number;
  total_videos_submitted: number;
  pending_video_reviews: number;
  total_payments_made: number;
  pending_payments: number;
  district_coverage: { district: string; state: string; count: number }[];
}

export type TaskStatus = 'assigned' | 'in_progress' | 'submitted' | 'completed' | 'rejected';
export type FollowerBand = '0-5k' | '5k-25k' | '25k-100k' | '100k+';
export type FileType = 'pdf' | 'video' | 'image' | 'document';
export type ResourceCategory = 'general' | 'training' | 'guidelines' | 'examples';
export type AccessLevel = 'all' | 'influencer' | 'admin';

export interface MarketingProject {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  target_audience: string;
  deliverables: string[];
  guidelines: string;
  sample_script?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyTask {
  id: string;
  project_id?: string;
  title: string;
  description: string;
  topic: string;
  guidelines: string;
  deliverables_required: string[];
  month: string;
  year: number;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  project?: MarketingProject;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  influencer_id: string;
  assigned_month: string;
  assigned_year: number;
  status: TaskStatus;
  submission_id?: string;
  started_at?: string;
  submitted_at?: string;
  completed_at?: string;
  assigned_by?: string;
  created_at: string;
  updated_at: string;
  task?: MonthlyTask;
  influencer?: Influencer;
  submission?: VideoSubmission;
}

export interface RevenueShare {
  id: string;
  influencer_id: string;
  month: string;
  year: number;
  follower_band: FollowerBand;
  fixed_payout: number;
  leads_generated: number;
  revenue_from_leads: number;
  performance_share_percentage: number;
  performance_share_amount: number;
  total_earning: number;
  videos_approved: number;
  payment_status: 'pending' | 'calculated' | 'paid';
  payment_id?: string;
  calculated_at?: string;
  calculated_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  influencer?: Influencer;
  payment?: Payment;
}

export interface GuidebookResource {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: FileType;
  file_size?: number;
  category: ResourceCategory;
  is_active: boolean;
  access_level: AccessLevel;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedInfluencerStats extends InfluencerStats {
  assigned_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  current_month_revenue: number;
  follower_band: FollowerBand;
  guidebooks_available: number;
}

export interface EnhancedAdminDashboardStats extends AdminDashboardStats {
  active_marketing_projects: number;
  tasks_assigned_this_month: number;
  tasks_completed_this_month: number;
  total_revenue_distributed: number;
  average_completion_rate: number;
}

export interface Brand {
  id: string;
  user_id: string;
  company_name: string;
  website?: string;
  industry?: string;
  description?: string;
  logo_url?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'closed';

export interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  requirements?: string;
  budget?: number;
  status: CampaignStatus;
  deadline?: string;
  created_at: string;
  updated_at: string;
  brand?: Brand;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'negotiating';

export interface CampaignApplication {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: ApplicationStatus;
  cover_message?: string;
  bid_amount?: number;
  applied_at: string;
  updated_at: string;
  campaign?: Campaign;
  influencer?: Influencer;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

