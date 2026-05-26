export interface CreateWhizUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  guid: string | null;
  total_credits: number;
  total_debits: number;
  balance: number;
}

export interface CreditTransaction {
  id: number;
  user_id: string;
  agent: string;
  type: "credit" | "debit";
  amount: number;
  product_name: string | null;
  product_package: string | null;
  created_at: string;
}

export interface Deliverable {
  id: number;
  contentItemId: number;
  projectId: number;
  userId: number;
  type: string;
  title: string;
  filename: string;
  fileUrl: string;
  thumbnailUrl?: string;
  aspectRatio?: string;
  duration?: string;
  prompt?: string;
  captionText?: string;
  captionHashtags?: string[];
  captionCta?: string;
  captionPlatform?: string;
  status: string;
  isActive: boolean;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
  [key: string]: unknown;
}
