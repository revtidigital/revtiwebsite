import { Role, PostStatus, PageStatus } from "@prisma/client";

export type { Role, PostStatus, PageStatus };

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  seo_title: string;
  seo_description: string;
  social_twitter: string;
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
  footer_text: string;
  posts_per_page: number;
  [key: string]: string | number;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  target: string;
  sortOrder: number;
  children?: NavItem[];
}
