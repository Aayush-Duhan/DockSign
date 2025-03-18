import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST /api/documents/from-template/:templateId - Create document from template
export async function POST(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const templateId = params.templateId;
    let objectId;
    
    try {
      objectId = new ObjectId(templateId);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }
    
    // Find the template
    const template = await db.collection('templates').findOne({
      _id: objectId,
      $or: [
        { createdBy: session.user.email },
        { visibility: 'shared' }
      ]
    });
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found or unauthorized' }, { status: 404 });
    }
    
    const now = new Date();
    
    // Create a new document based on the template
    const documentData = {
      title: body.title || `${template.name} Document`,
      description: body.description || template.description || '',
      createdBy: session.user.email,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      content: body.content || {},
      fields: template.fields,
      signers: body.signers || [],
      derivedFromTemplate: {
        templateId: template._id.toString()
      }
    };
    
    // Insert the new document
    const result = await db.collection('documents').insertOne(documentData);
    
    return NextResponse.json({
      ...documentData,
      _id: result.insertedId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating document from template:', error);
    return NextResponse.json({ error: 'Failed to create document from template' }, { status: 500 });
  }
} 