/**
 * TypeScript interfaces for Project Uriel Firestore data models
 * 
 * This module exports all data model interfaces used throughout the application.
 * Based on Firebase Admin SDK best practices and Context7 patterns.
 */

// Base interfaces
export * from './user';
export * from './project';
export * from './blog';
export * from './contact';
export * from './experience';
export * from './analytics';
export * from './config';

// Common types used across multiple models
export interface BaseDocument {
  id: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface TimestampFields {
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

export type DocumentStatus = 'draft' | 'published' | 'archived';
export type UserRole = 'admin' | 'user';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';