import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { InspectionDraft, SectionState } from '../features/inspection/db';
import { sections as templateSections } from '../features/inspection/schema';

interface PdfOptions {
  includePhotos: boolean;
  includeNotes: boolean;
  includeWarnings: boolean;
  includePassItems: boolean;
  includeSummary: boolean;
}

interface PdfData {
  draft: InspectionDraft;
  summary?: any;
  options: PdfOptions;
}

// Helper function to convert status to readable text
const getStatusText = (status: string): string => {
  switch(status) {
    case 'ok': return 'Good';
    case 'warn': return 'Caution';
    case 'fail': return 'Problem';
    case 'na': return 'N/A';
    default: return 'Unknown';
  }
};

// Helper function to get color for status
const getStatusColor = (status: string) => {
  switch(status) {
    case 'ok': return rgb(0.2, 0.7, 0.2); // Green
    case 'warn': return rgb(0.95, 0.6, 0); // Orange
    case 'fail': return rgb(0.9, 0.2, 0.2); // Red
    default: return rgb(0.5, 0.5, 0.5); // Gray
  }
};

// Helper function to format the date
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export async function createPdf({ draft, summary, options }: PdfData): Promise<void> {
  const pdf = await PDFDocument.create();
  
  // Embed fonts
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);
  
  // Add title page
  const titlePage = pdf.addPage([612, 792]);
  let y = 700;
  
  // Title
  titlePage.drawText('PRE-PURCHASE INSPECTION REPORT', {
    x: 306 - helveticaBold.widthOfTextAtSize('PRE-PURCHASE INSPECTION REPORT', 24) / 2,
    y,
    size: 24,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1)
  });
  y -= 60;
  
  // Vehicle info box
  titlePage.drawRectangle({
    x: 106,
    y: y - 180,
    width: 400,
    height: 180,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
    color: rgb(0.97, 0.97, 0.97)
  });
  
  // Vehicle details
  titlePage.drawText('VEHICLE DETAILS', {
    x: 306 - helveticaBold.widthOfTextAtSize('VEHICLE DETAILS', 16) / 2,
    y: y - 30,
    size: 16,
    font: helveticaBold,
    color: rgb(0.3, 0.3, 0.3)
  });
  
  y -= 50;
  
  const vehicleYear = draft.vehicle.year || '—';
  const vehicleMake = draft.vehicle.make || '—';
  const vehicleModel = draft.vehicle.model || '—';
  
  titlePage.drawText(`${vehicleYear} ${vehicleMake} ${vehicleModel}`, {
    x: 306 - helvetica.widthOfTextAtSize(`${vehicleYear} ${vehicleMake} ${vehicleModel}`, 18) / 2,
    y,
    size: 18,
    font: helvetica
  });
  
  y -= 40;
  
  // Vehicle details in two columns
  const leftCol = 140;
  const rightCol = 350;
  
  titlePage.drawText('VIN:', { x: leftCol, y, size: 12, font: helveticaBold });
  titlePage.drawText(draft.vehicle.vin || '—', { x: leftCol + 100, y, size: 12, font: helvetica });
  
  y -= 25;
  
  titlePage.drawText('Odometer:', { x: leftCol, y, size: 12, font: helveticaBold });
  titlePage.drawText(draft.vehicle.odo ? `${draft.vehicle.odo} km` : '—', { x: leftCol + 100, y, size: 12, font: helvetica });
  
  y -= 25;
  
  titlePage.drawText('Province:', { x: leftCol, y, size: 12, font: helveticaBold });
  titlePage.drawText(draft.vehicle.province || '—', { x: leftCol + 100, y, size: 12, font: helvetica });
  
  y -= 25;
  
  // Add report date
  titlePage.drawText('Inspection Date:', { x: leftCol, y, size: 12, font: helveticaBold });
  titlePage.drawText(formatDate(new Date()), { x: leftCol + 100, y, size: 12, font: helvetica });
  
  y -= 100;
  
  // Footer
  titlePage.drawText('This report provides a professional assessment of the vehicle condition at the time of inspection.', {
    x: 306 - helvetica.widthOfTextAtSize('This report provides a professional assessment of the vehicle condition at the time of inspection.', 10) / 2,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4)
  });
  
  y -= 20;
  
  titlePage.drawText('PPI Canada - True North Inspections', {
    x: 306 - helvetica.widthOfTextAtSize('PPI Canada - True North Inspections', 10) / 2,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4)
  });
  
  // Loop through each section and create pages for them
  for (const templateSection of templateSections) {
    const sectionData = draft.sections.find(s => s.slug === templateSection.slug);
    if (!sectionData) continue;
    
    // Count items by status
    const statusCount = {
      ok: sectionData.items.filter(item => item.status === 'ok').length,
      warn: sectionData.items.filter(item => item.status === 'warn').length,
      fail: sectionData.items.filter(item => item.status === 'fail').length,
      na: sectionData.items.filter(item => item.status === 'na').length
    };
    
    // Skip sections with no issues if option is set
    if (!options.includePassItems && 
        statusCount.warn === 0 && 
        statusCount.fail === 0 &&
        templateSection.slug !== 'vehicle') {
      continue;
    }
    
    let sectionPage = pdf.addPage([612, 792]);
    y = 750;
    
    // Section header
    sectionPage.drawText(templateSection.name.toUpperCase(), {
      x: 306 - helveticaBold.widthOfTextAtSize(templateSection.name.toUpperCase(), 16) / 2,
      y,
      size: 16,
      font: helveticaBold
    });
    
    y -= 30;
    
    // Section status summary
    sectionPage.drawText('Inspection Results:', {
      x: 48,
      y,
      size: 12,
      font: helveticaBold
    });
    
    y -= 20;
    
    if (statusCount.fail > 0) {
      sectionPage.drawText(`${statusCount.fail} Problem${statusCount.fail !== 1 ? 's' : ''}`, {
        x: 60,
        y,
        size: 11,
        font: helvetica,
        color: rgb(0.9, 0.2, 0.2)
      });
      y -= 18;
    }
    
    if (statusCount.warn > 0) {
      sectionPage.drawText(`${statusCount.warn} Caution${statusCount.warn !== 1 ? 's' : ''}`, {
        x: 60,
        y,
        size: 11,
        font: helvetica,
        color: rgb(0.95, 0.6, 0)
      });
      y -= 18;
    }
    
    if (statusCount.ok > 0) {
      sectionPage.drawText(`${statusCount.ok} Good`, {
        x: 60,
        y,
        size: 11,
        font: helvetica,
        color: rgb(0.2, 0.7, 0.2)
      });
      y -= 18;
    }
    
    y -= 10;
    
    // Draw horizontal line
    sectionPage.drawLine({
      start: { x: 48, y },
      end: { x: 564, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    
    y -= 20;
    
    // List items
    for (const item of templateSection.items) {
      const itemData = sectionData.items.find(i => i.id === item.id);
      if (!itemData) continue;
      
      // Skip if item is "ok" and we're not including pass items
      if (itemData.status === 'ok' && !options.includePassItems && templateSection.slug !== 'vehicle') {
        continue;
      }
      
      // Skip if item is "warn" or "fail" and we're not including warnings
      if ((itemData.status === 'warn' || itemData.status === 'fail') && !options.includeWarnings) {
        continue;
      }
      
      // Check if we need a new page
      if (y < 100) {
        // Add a new page
        sectionPage = pdf.addPage([612, 792]);
        y = 750;
        
        sectionPage.drawText(`${templateSection.name.toUpperCase()} (continued)`, {
          x: 306 - helveticaBold.widthOfTextAtSize(`${templateSection.name.toUpperCase()} (continued)`, 16) / 2,
          y,
          size: 16,
          font: helveticaBold
        });
        
        y -= 30;
      }
      
      // Item label with status
      sectionPage.drawText(item.label, {
        x: 48,
        y,
        size: 12,
        font: helveticaBold
      });
      
      // Status pill
      const statusText = getStatusText(itemData.status);
      const statusWidth = helvetica.widthOfTextAtSize(statusText, 10) + 20;
      
      sectionPage.drawRectangle({
        x: 48 + helveticaBold.widthOfTextAtSize(item.label, 12) + 10,
        y: y - 3,
        width: statusWidth,
        height: 16,
        borderColor: getStatusColor(itemData.status),
        borderWidth: 1,
        color: rgb(1, 1, 1),
        opacity: 0.1
      });
      
      sectionPage.drawText(statusText, {
        x: 48 + helveticaBold.widthOfTextAtSize(item.label, 12) + 20,
        y: y + 2,
        size: 10,
        font: helvetica,
        color: getStatusColor(itemData.status)
      });
      
      y -= 25;
      
      // Item notes
      if (options.includeNotes && itemData.notes) {
        const noteLines = itemData.notes.split('\n');
        for (const line of noteLines) {
          // Wrap text at 80 characters
          const chunks = [];
          for (let i = 0; i < line.length; i += 80) {
            chunks.push(line.substring(i, i + 80));
          }
          
          for (const chunk of chunks) {
            sectionPage.drawText(chunk, {
              x: 60,
              y,
              size: 10,
              font: helveticaOblique,
              color: rgb(0.3, 0.3, 0.3)
            });
            
            y -= 15;
          }
        }
      }
      
      // Item photos
      if (options.includePhotos && itemData.photos && itemData.photos.length > 0) {
        for (let i = 0; i < Math.min(itemData.photos.length, 2); i++) { // Limit to 2 photos per item
          try {
            // Check if we need a new page for the photo
            if (y < 200) {
              sectionPage = pdf.addPage([612, 792]);
              y = 750;
              
              sectionPage.drawText(`${templateSection.name.toUpperCase()} (continued)`, {
                x: 306 - helveticaBold.widthOfTextAtSize(`${templateSection.name.toUpperCase()} (continued)`, 16) / 2,
                y,
                size: 16,
                font: helveticaBold
              });
              
              y -= 30;
            }
            
            // Convert base64 image to embed in PDF
            const photoData = itemData.photos[i];
            // Extract base64 data without the header
            const base64Data = photoData.split(',')[1];
            
            if (base64Data) {
              const photoBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              const photo = await pdf.embedJpg(photoBytes);
              
              // Calculate dimensions to fit within page
              const maxWidth = 250;
              const maxHeight = 180;
              
              let width = photo.width;
              let height = photo.height;
              
              if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
              }
              
              if (height > maxHeight) {
                const ratio = maxHeight / height;
                height = maxHeight;
                width = width * ratio;
              }
              
              // Draw the photo
              sectionPage.drawImage(photo, {
                x: 48,
                y: y - height,
                width,
                height
              });
              
              y -= (height + 20);
            }
          } catch (err) {
            console.error("Error embedding photo", err);
            // Continue without the photo
          }
        }
      }
      
      y -= 15;
    }
  }
  
  // Add summary page if requested
  if (options.includeSummary && summary) {
    let summaryPage = pdf.addPage([612, 792]);
    y = 750;
    
    // Summary header
    summaryPage.drawText('INSPECTION SUMMARY', {
      x: 306 - helveticaBold.widthOfTextAtSize('INSPECTION SUMMARY', 16) / 2,
      y,
      size: 16,
      font: helveticaBold
    });
    
    y -= 40;
    
    // Overall summary
    if (summary.summary) {
      // Wrap text
      const summaryChunks = [];
      for (let i = 0; i < summary.summary.length; i += 80) {
        summaryChunks.push(summary.summary.substring(i, Math.min(i + 80, summary.summary.length)));
      }
      
      for (const chunk of summaryChunks) {
        summaryPage.drawText(chunk, {
          x: 48,
          y,
          size: 11,
          font: helvetica
        });
        
        y -= 20;
      }
    }
    
    y -= 20;
    
    // Red flags
    if (summary.redFlags && summary.redFlags.length > 0) {
      summaryPage.drawText('Major Concerns:', {
        x: 48,
        y,
        size: 14,
        font: helveticaBold,
        color: rgb(0.9, 0.2, 0.2)
      });
      
      y -= 25;
      
      for (const flag of summary.redFlags) {
        summaryPage.drawText('•', {
          x: 48,
          y,
          size: 12,
          font: helvetica
        });
        
        const flagChunks = [];
        for (let i = 0; i < flag.length; i += 75) {
          flagChunks.push(flag.substring(i, Math.min(i + 75, flag.length)));
        }
        
        for (let i = 0; i < flagChunks.length; i++) {
          summaryPage.drawText(flagChunks[i], {
            x: i === 0 ? 60 : 65,
            y: i === 0 ? y : y - (i * 15),
            size: 11,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3)
          });
        }
        
        y -= (15 * (flagChunks.length || 1) + 10);
        
        // Check if we need a new page
        if (y < 100) {
          summaryPage = pdf.addPage([612, 792]);
          y = 750;
          
          summaryPage.drawText('INSPECTION SUMMARY (continued)', {
            x: 306 - helveticaBold.widthOfTextAtSize('INSPECTION SUMMARY (continued)', 16) / 2,
            y,
            size: 16,
            font: helveticaBold
          });
          
          y -= 40;
        }
      }
      
      y -= 10;
    }
    
    // Yellow flags
    if (summary.yellowFlags && summary.yellowFlags.length > 0) {
      summaryPage.drawText('Caution Items:', {
        x: 48,
        y,
        size: 14,
        font: helveticaBold,
        color: rgb(0.95, 0.6, 0)
      });
      
      y -= 25;
      
      for (const flag of summary.yellowFlags) {
        summaryPage.drawText('•', {
          x: 48,
          y,
          size: 12,
          font: helvetica
        });
        
        const flagChunks = [];
        for (let i = 0; i < flag.length; i += 75) {
          flagChunks.push(flag.substring(i, Math.min(i + 75, flag.length)));
        }
        
        for (let i = 0; i < flagChunks.length; i++) {
          summaryPage.drawText(flagChunks[i], {
            x: i === 0 ? 60 : 65,
            y: i === 0 ? y : y - (i * 15),
            size: 11,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3)
          });
        }
        
        y -= (15 * (flagChunks.length || 1) + 10);
        
        // Check if we need a new page
        if (y < 100) {
          summaryPage = pdf.addPage([612, 792]);
          y = 750;
          
          summaryPage.drawText('INSPECTION SUMMARY (continued)', {
            x: 306 - helveticaBold.widthOfTextAtSize('INSPECTION SUMMARY (continued)', 16) / 2,
            y,
            size: 16,
            font: helveticaBold
          });
          
          y -= 40;
        }
      }
      
      y -= 10;
    }
    
    // Green notes
    if (summary.greenNotes && summary.greenNotes.length > 0) {
      summaryPage.drawText('Positive Notes:', {
        x: 48,
        y,
        size: 14,
        font: helveticaBold,
        color: rgb(0.2, 0.7, 0.2)
      });
      
      y -= 25;
      
      for (const note of summary.greenNotes) {
        summaryPage.drawText('•', {
          x: 48,
          y,
          size: 12,
          font: helvetica
        });
        
        const noteChunks = [];
        for (let i = 0; i < note.length; i += 75) {
          noteChunks.push(note.substring(i, Math.min(i + 75, note.length)));
        }
        
        for (let i = 0; i < noteChunks.length; i++) {
          summaryPage.drawText(noteChunks[i], {
            x: i === 0 ? 60 : 65,
            y: i === 0 ? y : y - (i * 15),
            size: 11,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3)
          });
        }
        
        y -= (15 * (noteChunks.length || 1) + 10);
        
        // Check if we need a new page
        if (y < 100) {
          summaryPage = pdf.addPage([612, 792]);
          y = 750;
          
          summaryPage.drawText('INSPECTION SUMMARY (continued)', {
            x: 306 - helveticaBold.widthOfTextAtSize('INSPECTION SUMMARY (continued)', 16) / 2,
            y,
            size: 16,
            font: helveticaBold
          });
          
          y -= 40;
        }
      }
      
      y -= 10;
    }
    
    // Estimated repair costs
    if (summary.estRepairTotalCAD) {
      summaryPage.drawText('Estimated Repair Cost:', {
        x: 48,
        y,
        size: 14,
        font: helveticaBold
      });
      
      y -= 25;
      
      summaryPage.drawText(`$${summary.estRepairTotalCAD} CAD`, {
        x: 60,
        y,
        size: 12,
        font: helvetica
      });
      
      y -= 30;
    }
    
    // Negotiation points
    if (summary.suggestedAdjustments && summary.suggestedAdjustments.length > 0) {
      summaryPage.drawText('Suggested Negotiation Points:', {
        x: 48,
        y,
        size: 14,
        font: helveticaBold
      });
      
      y -= 25;
      
      for (const point of summary.suggestedAdjustments) {
        summaryPage.drawText('•', {
          x: 48,
          y,
          size: 12,
          font: helvetica
        });
        
        const pointChunks = [];
        for (let i = 0; i < point.length; i += 75) {
          pointChunks.push(point.substring(i, Math.min(i + 75, point.length)));
        }
        
        for (let i = 0; i < pointChunks.length; i++) {
          summaryPage.drawText(pointChunks[i], {
            x: i === 0 ? 60 : 65,
            y: i === 0 ? y : y - (i * 15),
            size: 11,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3)
          });
        }
        
        y -= (15 * (pointChunks.length || 1) + 10);
      }
    }
  }
  
  // Generate PDF as blob
  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `inspection_${draft.vehicle.make || 'vehicle'}_${draft.vehicle.model || ''}_${formatDate(new Date())}.pdf`;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(link.href);
}

// Legacy function for backward compatibility
export async function buildPdf({ vehicle, sections }: any) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let y = 760;
  page.drawText('PPI Canada – Inspection Report', { x: 48, y, size: 16, font }); y -= 24;
  page.drawText(`${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}  VIN: ${vehicle.vin || ''}`, { x: 48, y, size: 10, font }); y -= 20;
  sections.forEach((s: any) => {
    page.drawText(s.slug.toUpperCase(), { x: 48, y, size: 12, font }); y -= 14;
    s.items.slice(0,5).forEach((it: any) => {
      const line = `- ${it.id}: ${it.status}${it.notes ? ' – ' + it.notes.slice(0,60):''}`;
      page.drawText(line, { x: 60, y, size: 9, font }); y -= 12;
    });
    y -= 6;
  });
  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
