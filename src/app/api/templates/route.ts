import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/lib/mongodb';
import { Template } from '@/types/template';
import { ObjectId } from 'mongodb';

// GET /api/templates - List templates with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const nameFilter = searchParams.get('name');
    const visibilityFilter = searchParams.get('visibility');
    
    // Build the query
    const query: any = {
      createdBy: session.user.email, // Default filter by user
    };
    
    if (nameFilter) {
      query.name = { $regex: nameFilter, $options: 'i' }; // Case-insensitive search
    }
    
    if (visibilityFilter) {
      query.visibility = visibilityFilter;
    }
    
    // Also include shared templates
    const templates = await db.collection('templates').find({
      $or: [
        query,
        { visibility: 'shared' } // Include all shared templates
      ]
    }).toArray();
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    
    const now = new Date();
    
    // Create the template object
    const templateData: Omit<Template, '_id'> = {
      name: body.name,
      description: body.description || '',
      createdBy: session.user.email!,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      fields: body.fields || [],
      visibility: body.visibility || 'private',
      metadata: body.metadata || {}
    };
    
    const result = await db.collection('templates').insertOne(templateData);
    
    return NextResponse.json({ 
      ...templateData, 
      _id: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
} 