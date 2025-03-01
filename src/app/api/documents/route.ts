import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Schema for document creation validation
const documentSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  // File handling will be done separately with FormData
});

// POST handler for creating new documents
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Process the form data
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const file = formData.get('file') as File;
    
    // Validate the data
    const validatedData = documentSchema.parse({ title, description });
    
    if (!file) {
      return NextResponse.json(
        { message: 'Document file is required' },
        { status: 400 }
      );
    }
    
    // TODO: Implement file storage (could use AWS S3, Firebase Storage, etc.)
    // For now, we'll just simulate storing the file metadata
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      // In a real implementation, we would upload the file to storage
      // and store the URL or path here
      url: `/uploads/${file.name}`, // Placeholder URL
    };
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Create document record
    const newDocument = {
      title: validatedData.title,
      description: validatedData.description,
      file: fileData,
      userId: session.user.id || session.user.email, // Fallback to email if id is not available
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
    };

    const result = await db.collection('documents').insertOne(newDocument);
    
    // Return the created document with string ID
    return NextResponse.json(
      { 
        message: 'Document created successfully',
        document: {
          ...newDocument,
          _id: result.insertedId.toString(),
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Document creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET handler for retrieving documents
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Get documents for the current user
    const documents = await db.collection('documents')
      .find({ userId: session.user.id || session.user.email }) // Fallback to email if id is not available
      .sort({ createdAt: -1 })
      .toArray();
    
    // Transform ObjectId to string for JSON serialization
    const serializedDocuments = documents.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
    }));
    
    return NextResponse.json(serializedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}