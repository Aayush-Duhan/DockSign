import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/categories - List all categories
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Parse query parameters for filtering
    const url = new URL(req.url);
    const parentId = url.searchParams.get('parentId') || undefined;
    
    // Build query
    const query: any = {};
    if (parentId) {
      try {
        query.parentId = new ObjectId(parentId);
      } catch (e) {
        // Invalid ObjectId format
        return NextResponse.json(
          { error: 'Invalid parent ID format' },
          { status: 400 }
        );
      }
    } else if (parentId === 'null') {
      // Handle "root" categories (no parent)
      query.parentId = { $exists: false };
    }
    
    // Fetch categories
    const categories = await db.collection('categories')
      .find(query)
      .sort({ name: 1 })
      .toArray();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get request body
    const body = await req.json();
    
    // Validate request
    if (!body.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Validate color if provided
    if (body.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(body.color)) {
      return NextResponse.json(
        { error: 'Invalid color format. Use hex color (e.g., #FF5733)' },
        { status: 400 }
      );
    }
    
    // Validate parent category if provided
    if (body.parentId) {
      try {
        const parentId = new ObjectId(body.parentId);
        const parentExists = await db.collection('categories').findOne({ _id: parentId });
        if (!parentExists) {
          return NextResponse.json(
            { error: 'Parent category not found' },
            { status: 400 }
          );
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid parent ID format' },
          { status: 400 }
        );
      }
    }
    
    // Create new category
    const now = new Date();
    const category = {
      name: body.name,
      description: body.description,
      color: body.color || '#6366F1', // Default color (indigo)
      parentId: body.parentId ? new ObjectId(body.parentId) : undefined,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection('categories').insertOne(category);
    
    return NextResponse.json({ 
      ...category, 
      _id: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 