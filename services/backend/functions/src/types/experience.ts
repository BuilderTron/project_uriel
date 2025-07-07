/**
 * Professional experience data model interfaces for Project Uriel
 * 
 * Defines work history, education, skills, and career timeline.
 */

import { BaseDocument, TimestampFields } from "./index";

/**
 * Professional experience entry
 */
export interface Experience extends BaseDocument {
  /** Job title or position */
  title: string;
  
  /** Company or organization name */
  company: string;
  
  /** Company website URL */
  companyUrl?: string;
  
  /** Company logo URL */
  companyLogo?: string;
  
  /** Experience type */
  type: ExperienceType;
  
  /** Job description */
  description: string;
  
  /** Key responsibilities and achievements */
  responsibilities: string[];
  
  /** Technologies and skills used */
  technologies: string[];
  
  /** Employment start date */
  startDate: FirebaseFirestore.Timestamp;
  
  /** Employment end date (null if current) */
  endDate?: FirebaseFirestore.Timestamp;
  
  /** Whether this is current position */
  current: boolean;
  
  /** Location (city, state/country) */
  location: string;
  
  /** Employment type */
  employmentType: EmploymentType;
  
  /** Display order */
  order: number;
  
  /** Whether to show on public resume */
  visible: boolean;
  
  /** Notable achievements */
  achievements?: Achievement[];
  
  /** Skills gained or improved */
  skillsGained?: string[];
  
  /** Projects worked on */
  projects?: ExperienceProject[];
}

/**
 * Experience types
 */
export type ExperienceType = 
  | "work"
  | "education"
  | "certification"
  | "volunteer"
  | "freelance"
  | "internship"
  | "contract";

/**
 * Employment types
 */
export type EmploymentType = 
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "internship"
  | "volunteer";

/**
 * Notable achievement
 */
export interface Achievement {
  /** Achievement title */
  title: string;
  
  /** Achievement description */
  description: string;
  
  /** Achievement date */
  date?: FirebaseFirestore.Timestamp;
  
  /** Impact metrics */
  metrics?: string[];
  
  /** Related technologies */
  technologies?: string[];
}

/**
 * Project worked on during experience
 */
export interface ExperienceProject {
  /** Project name */
  name: string;
  
  /** Project description */
  description: string;
  
  /** Role in project */
  role: string;
  
  /** Technologies used */
  technologies: string[];
  
  /** Project duration */
  duration?: string;
  
  /** Project outcomes */
  outcomes?: string[];
}

/**
 * Education entry
 */
export interface Education extends BaseDocument {
  /** Degree or certification name */
  degree: string;
  
  /** Field of study */
  fieldOfStudy: string;
  
  /** Institution name */
  institution: string;
  
  /** Institution logo URL */
  institutionLogo?: string;
  
  /** Institution website */
  institutionUrl?: string;
  
  /** Location */
  location: string;
  
  /** Start date */
  startDate: FirebaseFirestore.Timestamp;
  
  /** End date */
  endDate?: FirebaseFirestore.Timestamp;
  
  /** Whether currently enrolled */
  current: boolean;
  
  /** GPA or grade */
  grade?: string;
  
  /** Relevant coursework */
  coursework?: string[];
  
  /** Academic achievements */
  achievements?: string[];
  
  /** Activities and societies */
  activities?: string[];
  
  /** Display order */
  order: number;
  
  /** Whether to show publicly */
  visible: boolean;
}

/**
 * Skill definition
 */
export interface Skill extends BaseDocument {
  /** Skill name */
  name: string;
  
  /** Skill category */
  category: SkillCategory;
  
  /** Proficiency level (1-10) */
  level: number;
  
  /** Years of experience */
  yearsOfExperience: number;
  
  /** Whether skill is featured */
  featured: boolean;
  
  /** Skill description */
  description?: string;
  
  /** Related technologies */
  relatedSkills?: string[];
  
  /** Certification URLs */
  certifications?: SkillCertification[];
  
  /** Display order */
  order: number;
  
  /** Whether to show publicly */
  visible: boolean;
  
  /** Skill icon or image URL */
  iconUrl?: string;
}

/**
 * Skill categories
 */
export type SkillCategory = 
  | "programming-languages"
  | "frameworks-libraries"
  | "databases"
  | "tools-platforms"
  | "cloud-services"
  | "methodologies"
  | "soft-skills"
  | "languages"
  | "other";

/**
 * Skill certification
 */
export interface SkillCertification {
  /** Certification name */
  name: string;
  
  /** Issuing organization */
  issuer: string;
  
  /** Certification URL */
  url?: string;
  
  /** Issue date */
  issueDate: FirebaseFirestore.Timestamp;
  
  /** Expiration date */
  expirationDate?: FirebaseFirestore.Timestamp;
  
  /** Credential ID */
  credentialId?: string;
}

/**
 * Timeline event (combines experience, education, certifications)
 */
export interface TimelineEvent {
  /** Event ID */
  id: string;
  
  /** Event type */
  type: ExperienceType;
  
  /** Event title */
  title: string;
  
  /** Organization/company */
  organization: string;
  
  /** Start date */
  startDate: FirebaseFirestore.Timestamp;
  
  /** End date */
  endDate?: FirebaseFirestore.Timestamp;
  
  /** Whether current */
  current: boolean;
  
  /** Brief description */
  description: string;
  
  /** Location */
  location: string;
  
  /** Associated technologies */
  technologies: string[];
  
  /** Display order */
  order: number;
}

/**
 * Resume/CV data
 */
export interface Resume extends TimestampFields {
  /** Personal information */
  personal: PersonalInfo;
  
  /** Professional summary */
  summary: string;
  
  /** Work experiences */
  experiences: Experience[];
  
  /** Education entries */
  education: Education[];
  
  /** Skills */
  skills: Skill[];
  
  /** Additional sections */
  sections?: ResumeSection[];
  
  /** Resume version */
  version: number;
  
  /** Whether resume is public */
  public: boolean;
  
  /** Custom styling */
  styling?: ResumeStyle;
}

/**
 * Personal information for resume
 */
export interface PersonalInfo {
  /** Full name */
  fullName: string;
  
  /** Professional title */
  title: string;
  
  /** Email address */
  email: string;
  
  /** Phone number */
  phone?: string;
  
  /** Location */
  location: string;
  
  /** Website URL */
  website?: string;
  
  /** LinkedIn URL */
  linkedin?: string;
  
  /** GitHub URL */
  github?: string;
  
  /** Profile photo URL */
  photoUrl?: string;
}

/**
 * Custom resume section
 */
export interface ResumeSection {
  /** Section title */
  title: string;
  
  /** Section content */
  content: string;
  
  /** Section type */
  type: "text" | "list" | "timeline";
  
  /** Display order */
  order: number;
  
  /** Whether section is visible */
  visible: boolean;
}

/**
 * Resume styling options
 */
export interface ResumeStyle {
  /** Color scheme */
  colorScheme: "blue" | "green" | "purple" | "red" | "gray";
  
  /** Font family */
  fontFamily: "serif" | "sans-serif" | "monospace";
  
  /** Layout style */
  layout: "single-column" | "two-column" | "modern";
  
  /** Whether to show photos */
  showPhoto: boolean;
  
  /** Whether to show icons */
  showIcons: boolean;
}

/**
 * Experience creation request
 */
export interface CreateExperienceRequest {
  title: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  type: ExperienceType;
  description: string;
  responsibilities: string[];
  technologies: string[];
  startDate: Date | FirebaseFirestore.Timestamp;
  endDate?: Date | FirebaseFirestore.Timestamp;
  current: boolean;
  location: string;
  employmentType: EmploymentType;
  order?: number;
  visible?: boolean;
  achievements?: Achievement[];
  skillsGained?: string[];
  projects?: ExperienceProject[];
}

/**
 * Public experience data (for client display)
 */
export interface PublicExperience {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  type: ExperienceType;
  description: string;
  responsibilities: string[];
  technologies: string[];
  startDate: FirebaseFirestore.Timestamp;
  endDate?: FirebaseFirestore.Timestamp;
  current: boolean;
  location: string;
  employmentType: EmploymentType;
  order: number;
  achievements?: Achievement[];
  projects?: ExperienceProject[];
}

/**
 * Experience filters for queries
 */
export interface ExperienceFilters {
  type?: ExperienceType | ExperienceType[];
  employmentType?: EmploymentType | EmploymentType[];
  technologies?: string[];
  current?: boolean;
  company?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Experience sort options
 */
export type ExperienceSortBy = 
  | "startDate"
  | "endDate"
  | "order"
  | "company"
  | "title";

export interface ExperienceQueryOptions {
  filters?: ExperienceFilters;
  sortBy?: ExperienceSortBy;
  sortDirection?: "asc" | "desc";
  limit?: number;
  visible?: boolean;
}