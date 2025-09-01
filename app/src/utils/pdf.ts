import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { AISummary } from '../types/summary';

// Define option types
export type PdfOptions = {
  includePhotos?: boolean;
  includeNotes?: boolean;
  includeWarnings?: boolean;
  includePassItems?: boolean;
  includeSummary?: boolean;
};

export async function buildPdf({ 
  vehicle, 
  sections, 
  summary = null, 
  options = {} 
}: { 
  vehicle: any; 
  sections: any[]; 
  summary?: AISummary | string | null; // Properly typed summary
  options?: PdfOptions 
}) {
  const {
    includeNotes = true,
    includeWarnings = true,
    includePassItems = true,
    includeSummary = true,
    includePhotos = false
  } = options;

  const pdf = await PDFDocument.create();
  let page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  
  let y = 760;
  
  // Header
  page.drawText('PPI Canada – Inspection Report', { x: 48, y, size: 16, font: boldFont }); 
  y -= 24;
  
  // Vehicle info
  page.drawText(`${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}  VIN: ${vehicle.vin || ''}`, 
    { x: 48, y, size: 10, font }); 
  y -= 20;
  
  // Add summary if requested
  if (includeSummary && summary) {
    page.drawText('SUMMARY', { x: 48, y, size: 12, font: boldFont }); 
    y -= 16;
    
    // Handle both string and object summary formats
    let summaryText = "";
    if (typeof summary === 'string') {
      summaryText = summary;
    } else if (typeof summary === 'object' && summary !== null) {
      // If it's an AISummary object, use the summary property
      summaryText = summary.summary || '';
    }
    
    // Split by newlines and render
    const summaryLines = summaryText.split('\n');
    summaryLines.slice(0, 5).forEach(line => {
      page.drawText(line.slice(0, 80), { x: 48, y, size: 9, font });
      y -= 12;
    });
    
    // If it's an AISummary object with flags, render those too
    if (typeof summary === 'object' && summary !== null) {
      const aiSummary = summary as AISummary;
      
      // Add red flags
      if (aiSummary.redFlags && aiSummary.redFlags.length > 0) {
        y -= 8;
        page.drawText('RED FLAGS:', { x: 48, y, size: 10, font: boldFont, color: rgb(0.8, 0, 0) });
        y -= 14;
        
        aiSummary.redFlags.forEach(flag => {
          page.drawText(`- ${flag.slice(0, 75)}`, { x: 60, y, size: 9, font, color: rgb(0.8, 0, 0) });
          y -= 12;
        });
      }
      
      // Add yellow flags
      if (aiSummary.yellowFlags && aiSummary.yellowFlags.length > 0) {
        y -= 8;
        page.drawText('CAUTION ITEMS:', { x: 48, y, size: 10, font: boldFont, color: rgb(0.8, 0.4, 0) });
        y -= 14;
        
        aiSummary.yellowFlags.forEach(flag => {
          page.drawText(`- ${flag.slice(0, 75)}`, { x: 60, y, size: 9, font, color: rgb(0.8, 0.4, 0) });
          y -= 12;
        });
      }
      
      // Add score if available
      if (typeof aiSummary.inspectionScore === 'number') {
        y -= 8;
        page.drawText(`INSPECTION SCORE: ${aiSummary.inspectionScore}/100`, { 
          x: 48, y, size: 10, font: boldFont 
        });
        y -= 12;
      }
    }
    
    y -= 16;
  }
  
  // Add each section
  sections.forEach((s: any) => {
    page.drawText(s.slug.toUpperCase(), { x: 48, y, size: 12, font: boldFont }); 
    y -= 14;
    
    // Filter items based on options
    const itemsToShow = s.items.filter((it: any) => {
      if (it.status === 'ok' && !includePassItems) return false;
      if (it.status === 'warn' && !includeWarnings) return false;
      return true;
    });
    
    if (itemsToShow.length === 0) {
      page.drawText('No issues to report', { x: 60, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) }); 
      y -= 12;
    } else {
      itemsToShow.forEach((it: any) => {
        // Status color
        let statusColor = rgb(0, 0, 0);
        if (it.status === 'fail') statusColor = rgb(0.8, 0, 0);
        if (it.status === 'warn') statusColor = rgb(0.8, 0.4, 0);
        if (it.status === 'ok') statusColor = rgb(0, 0.6, 0);
        
        // Item line with colored status
        const line = `- ${it.id}: ${it.status.toUpperCase()}`;
        page.drawText(line, { x: 60, y, size: 9, font, color: statusColor }); 
        y -= 12;
        
        // Notes if requested
        if (includeNotes && it.notes) {
          const notes = `  ${it.notes.slice(0, 60)}${it.notes.length > 60 ? '...' : ''}`;
          page.drawText(notes, { x: 70, y, size: 8, font }); 
          y -= 10;
        }
        
        // Add space for next item
        y -= 2;
      });
    }
    
    // Space between sections
    y -= 10;
    
    // Add a new page if we're running out of space
    if (y < 100) {
      page = pdf.addPage([612, 792]);
      y = 760;
    }
  });
  
  // Add footer with date
  const dateText = `Report generated: ${new Date().toLocaleString()}`;
  page.drawText(dateText, { x: 48, y: 40, size: 8, font });
  
  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
