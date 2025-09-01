/**
 * Shared data sanitization utilities for both client and server
 */
import { InspectionData, InspectionSection, InspectionItem, AISummary } from './types';

/**
 * Options for sanitization functions
 */
export interface SanitizationOptions {
  /** Whether to convert from client format to server format */
  clientToServer?: boolean;
}

/**
 * Processes a photo array to ensure it only contains valid strings
 * @param photos - The photos array to process
 * @returns An array of string photos
 */
export function sanitizePhotos(photos?: unknown): string[] {
  if (!Array.isArray(photos)) {
    return [];
  }
  return photos.filter(photo => typeof photo === 'string');
}

/**
 * Sanitizes an inspection item
 * @param item - The item to sanitize
 * @returns A sanitized inspection item
 */
export function sanitizeInspectionItem(item: unknown): InspectionItem {
  const itemObj = item as Record<string, unknown>;
  return {
    id: typeof itemObj.id === 'string' || typeof itemObj.id === 'number' 
      ? String(itemObj.id) 
      : '',
    status: typeof itemObj.status === 'string' && ['ok', 'warn', 'fail', 'na'].includes(itemObj.status) 
      ? itemObj.status as 'ok' | 'warn' | 'fail' | 'na'
      : 'na',
    notes: typeof itemObj.notes === 'string' ? itemObj.notes : '',
    photos: sanitizePhotos(itemObj.photos)
  };
}

/**
 * Sanitizes an inspection section
 * @param section - The section to sanitize
 * @param options - Sanitization options
 * @returns A sanitized inspection section
 */
export function sanitizeInspectionSection(
  section: unknown, 
  options: SanitizationOptions = {}
): InspectionSection {
  const { clientToServer = false } = options;
  const sectionObj = section as Record<string, unknown>;
  
  const sanitizedSection: InspectionSection = {
    name: typeof sectionObj.name === 'string' 
      ? sectionObj.name 
      : (clientToServer && typeof sectionObj.slug === 'string' ? sectionObj.slug : ''),
    items: Array.isArray(sectionObj.items) 
      ? sectionObj.items.map(item => sanitizeInspectionItem(item)) 
      : []
  };
  
  // If we're not converting from client to server, keep the slug if it exists
  if (!clientToServer && typeof sectionObj.slug === 'string') {
    sanitizedSection.slug = sectionObj.slug;
  }
  
  return sanitizedSection;
}

/**
 * Sanitizes an entire inspection data object
 * @param data - The inspection data to sanitize
 * @param options - Sanitization options
 * @returns A sanitized inspection data object
 */
export function sanitizeInspectionData(
  data: unknown, 
  options: SanitizationOptions = {}
): InspectionData {
  const { clientToServer = false } = options;
  
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid inspection data');
  }
  
  const dataObj = data as Record<string, unknown>;
  
  // Ensure vehicle object exists
  const vehicle = typeof dataObj.vehicle === 'object' && dataObj.vehicle !== null 
    ? dataObj.vehicle as Record<string, unknown>
    : {};
  
  // Sanitize sections
  const sections = Array.isArray(dataObj.sections)
    ? dataObj.sections.map((section: unknown) => sanitizeInspectionSection(section, { clientToServer }))
    : [];
  
  // Handle dates
  let createdAt = dataObj.createdAt;
  let updatedAt = dataObj.updatedAt;
  
  // Convert numeric timestamps to ISO strings if clientToServer is true
  if (clientToServer) {
    if (typeof createdAt === 'number') {
      createdAt = new Date(createdAt).toISOString();
    }
    if (typeof updatedAt === 'number') {
      updatedAt = new Date(updatedAt).toISOString();
    }
  }
  
  return {
    vehicle,
    sections,
    createdAt: typeof createdAt === 'string' || typeof createdAt === 'number' 
      ? createdAt 
      : undefined,
    updatedAt: typeof updatedAt === 'string' || typeof updatedAt === 'number'
      ? updatedAt
      : undefined,
    aiSummary: dataObj.aiSummary && 
      typeof dataObj.aiSummary === 'object' && 
      (dataObj.aiSummary as Record<string, unknown>).summary
      ? dataObj.aiSummary as AISummary
      : null
  };
}
