import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST /api/documents/:id/submit - Submit a document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const documentId = params.id;
    let objectId;
    
    try {
      objectId = new ObjectId(documentId);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    
    // Find the document
    const document = await db.collection('documents').findOne({
      _id: objectId,
      createdBy: session.user.email
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }
    
    // Update the document with new content and change status to 'submitted'
    await db.collection('documents').updateOne(
      { _id: objectId },
      { 
        $set: { 
          content: body.content || {},
          status: 'submitted',
          updatedAt: new Date()
        } 
      }
    );
    
    // Get the updated document
    const updatedDocument = await db.collection('documents').findOne({ _id: objectId });
    
    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error submitting document:', error);
    return NextResponse.json({ error: 'Failed to submit document' }, { status: 500 });
  }
} 