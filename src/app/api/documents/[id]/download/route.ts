import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import PDFDocument from 'pdfkit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate document ID
    let documentId;
    try {
      documentId = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    // Connect to the database
    const { db } = await connectToDatabase();
    const documentsCollection = db.collection('documents');

    // Find the document created by the authenticated user
    const document = await documentsCollection.findOne({
      _id: documentId,
      createdBy: session.user.email,
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    // Create a PDF document
    const pdfBuffer = await generatePDF(document);

    // Return the PDF as a download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating document download:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}

async function generatePDF(document: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const pdf = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      // Capture the PDF data
      pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', reject);

      // Add document title
      pdf.fontSize(25).text(document.title, { align: 'center' });
      pdf.moveDown();

      // Add document description if available
      if (document.description) {
        pdf.fontSize(12).text(document.description, { align: 'center' });
        pdf.moveDown();
      }

      // Add status and dates
      pdf.fontSize(10).text(`Status: ${document.status}`, { align: 'right' });
      pdf.fontSize(10).text(`Created: ${new Date(document.createdAt).toLocaleString()}`, { align: 'right' });
      pdf.fontSize(10).text(`Last updated: ${new Date(document.updatedAt).toLocaleString()}`, { align: 'right' });
      pdf.moveDown();

      // Add a horizontal line
      pdf.moveTo(50, pdf.y).lineTo(pdf.page.width - 50, pdf.y).stroke();
      pdf.moveDown();

      // Add document content fields
      pdf.fontSize(16).text('Document Fields', { underline: true });
      pdf.moveDown();

      // Check if fields exist and are not empty
      if (document.fields && document.fields.length > 0) {
        // Group fields by page
        const fieldsByPage = document.fields.reduce((acc: Record<string, any[]>, field: any) => {
          const page = field.position?.page || 1;
          if (!acc[page]) acc[page] = [];
          acc[page].push(field);
          return acc;
        }, {});

        // Add fields by page
        Object.keys(fieldsByPage).forEach((page, pageIndex) => {
          if (pageIndex > 0) pdf.addPage();
          
          pdf.fontSize(14).text(`Page ${page}`, { underline: true });
          pdf.moveDown();
          
          fieldsByPage[page].forEach((field: any) => {
            // Add field label with normal formatting
            pdf.fontSize(12).text(`${field.label}: `, { continued: true });
            
            // Add field value from document content
            const value = document.content[field.id] || 'Not provided';
            pdf.text(value);
            
            pdf.moveDown(0.5);
          });
        });
      } else {
        pdf.text('No fields found in this document.');
      }

      // Finalize the PDF
      pdf.end();
    } catch (error) {
      reject(error);
    }
  });
} 