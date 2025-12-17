import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Ticket } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  generateTicketPDF(ticket: Ticket, customerName: string): Blob {
    const doc = new jsPDF();
    
    // Add ticket design
    doc.setFillColor(30, 41, 59); // Dark blue header
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('EVENT TICKET', 105, 15, { align: 'center' });
    
    // Event info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Event: ${ticket.eventTitle}`, 20, 50);
    doc.text(`Date: ${this.formatDate(ticket.eventDate)}`, 20, 60);
    doc.text(`Venue: ${ticket.venue}`, 20, 70);
    doc.text(`Ticket Type: ${ticket.type}`, 20, 80);
    
    if (ticket.seatInfo) {
      doc.text(`Seat: ${ticket.seatInfo.section} - Row ${ticket.seatInfo.row}, Seat ${ticket.seatInfo.number}`, 20, 90);
    }
    
    // Customer info
    doc.text(`Customer: ${customerName}`, 20, 110);
    doc.text(`Ticket ID: ${ticket.id}`, 20, 120);
    
    // Add QR code placeholder
    doc.text('QR Code', 150, 50);
    doc.rect(140, 40, 50, 50);
    
    // Terms
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Terms & Conditions: This ticket is non-transferable and non-refundable.', 20, 180);
    
    // Get PDF as blob
    const pdfOutput = doc.output('blob');
    return pdfOutput;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}