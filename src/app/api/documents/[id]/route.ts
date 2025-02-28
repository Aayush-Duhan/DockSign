import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

// GET handler for retrieving a single document by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate document ID
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid document ID' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Find document by ID and ensure it belongs to the current user
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });
    
    if (!document) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Transform ObjectId to string for JSON serialization
    const serializedDocument = {
      ...document,
      _id: document._id.toString(),
    };
    
    return NextResponse.json(serializedDocument);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a document
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate document ID
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid document ID' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Find document first to ensure it exists and belongs to the user
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });
    
    if (!document) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Delete the document
    await db.collection('documents').deleteOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });
    
    // TODO: In a real implementation, we would also delete the file from storage
    
    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH handler for updating a document
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate document ID
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid document ID' },
        { status: 400 }
      );
    }
    
    // Get request body
    const body = await req.json();
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Find document first to ensure it exists and belongs to the user
    const document = await db.collection('documents').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id
    });
    
    if (!document) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: Record<string, any> = {};
    
    // Only update fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    // Update the document
    await db.collection('documents').updateOne(
      { _id: new ObjectId(params.id), userId: session.user.id },
      { $set: updateData }
    );
    
    return NextResponse.json(
      { message: 'Document updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}