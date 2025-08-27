import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function buildPdf({ vehicle, sections }: any){
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
