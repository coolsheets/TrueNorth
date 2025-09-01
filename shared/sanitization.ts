/**
 * Shared data sanitization utilities for both client and server
 */
import { InspectionData, InspectionSection, InspectionItem } from './types';

/**
 * Processes a photo array to ensure it only contains valid strings
 * @param photos - The photos array to process
 * @returns An array of string photos
 */
export function sanitizePhotos(photos?: any[]): string[] {
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
export function sanitizeInspectionItem(item: any): InspectionItem {
  return {
    id: String(item.id || ''),
    status: ['ok', 'warn', 'fail', 'na'].includes(item.status) ? item.status : 'na',
    notes: typeof item.notes === 'string' ? item.notes : '',
    photos: sanitizePhotos(item.photos)
  };
}

/**
 * Sanitizes an inspection section
 * @param section - The section to sanitize
 * @param clientToServer - Whether to convert from client format to server format
 * @returns A sanitized inspection section
 */
export function sanitizeInspectionSection(section: any, clientToServer = false): InspectionSection {
  const sanitizedSection: InspectionSection = {
    name: section.name || (clientToServer && section.slug ? section.slug : ''),
    items: Array.isArray(section.items) 
      ? section.items.map(sanitizeInspectionItem) 
      : []
  };
  
  // If we're not converting from client to server, keep the slug if it exists
  if (!clientToServer && section.slug) {
    sanitizedSection.slug = section.slug;
  }
  
  return sanitizedSection;
}

/**
 * Sanitizes an entire inspection data object
 * @param data - The inspection data to sanitize
 * @param clientToServer - Whether to convert from client format to server format
 * @returns A sanitized inspection data object
 */
export function sanitizeInspectionData(data: any, clientToServer = false): InspectionData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid inspection data');
  }
  
  // Ensure vehicle object exists
  const vehicle = data.vehicle || {};
  
  // Sanitize sections
  const sections = Array.isArray(data.sections)
    ? data.sections.map(section => sanitizeInspectionSection(section, clientToServer))
    : [];
  
  // Handle dates
  let createdAt = data.createdAt;
  let updatedAt = data.updatedAt;
  
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
    createdAt,
    updatedAt,
    aiSummary: data.aiSummary || null
  };
}
