import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/templates/:id - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    const templateId = params.id;
    let objectId;
    
    try {
      objectId = new ObjectId(templateId);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }
    
    const template = await db.collection('templates').findOne({
      _id: objectId,
      $or: [
        { createdBy: session.user.email },
        { visibility: 'shared' }
      ]
    });
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

// PUT /api/templates/:id - Update a template
export async function PUT(
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
    
    const templateId = params.id;
    let objectId;
    
    try {
      objectId = new ObjectId(templateId);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }
    
    // Check if template exists and user has permission to update it
    const existingTemplate = await db.collection('templates').findOne({
      _id: objectId,
      createdBy: session.user.email // Only creator can update
    });
    
    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found or unauthorized' }, { status: 404 });
    }
    
    // Prepare update data
    const updateData = {
      name: body.name || existingTemplate.name,
      description: body.description || existingTemplate.description,
      updatedAt: new Date(),
      isActive: body.isActive !== undefined ? body.isActive : existingTemplate.isActive,
      fields: body.fields || existingTemplate.fields,
      visibility: body.visibility || existingTemplate.visibility,
      metadata: body.metadata || existingTemplate.metadata
    };
    
    // Update the template
    await db.collection('templates').updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    return NextResponse.json({
      ...existingTemplate,
      ...updateData
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

// DELETE /api/templates/:id - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    const templateId = params.id;
    let objectId;
    
    try {
      objectId = new ObjectId(templateId);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }
    
    // Check if template exists and user has permission to delete it
    const existingTemplate = await db.collection('templates').findOne({
      _id: objectId,
      createdBy: session.user.email // Only creator can delete
    });
    
    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found or unauthorized' }, { status: 404 });
    }
    
    // Delete the template
    await db.collection('templates').deleteOne({ _id: objectId });
    
    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
} 