import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/categories/:id - Get a specific category
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Validate ID format
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }
    
    // Find category
    const category = await db.collection('categories').findOne({ _id: objectId });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/:id - Update a category
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Validate ID format
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }
    
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
    
    // Check for circular reference in parent
    if (body.parentId) {
      if (body.parentId === id) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }
      
      // Validate parent exists
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
    
    // Update the category
    const updateData: Record<string, any> = {
      name: body.name,
      description: body.description,
      color: body.color,
      parentId: body.parentId ? new ObjectId(body.parentId) : undefined,
      updatedAt: new Date()
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    await db.collection('categories').updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    // Get updated category
    const updatedCategory = await db.collection('categories').findOne({ _id: objectId });
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/:id - Delete a category
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Validate ID format
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }
    
    // Check if category exists
    const category = await db.collection('categories').findOne({ _id: objectId });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category has children
    const hasChildren = await db.collection('categories').findOne({ parentId: objectId });
    
    if (hasChildren) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories. Please delete or reassign child categories first.' },
        { status: 400 }
      );
    }
    
    // Check if category is used in templates
    const templatesWithCategory = await db.collection('templates').findOne({ categoryId: objectId });
    
    if (templatesWithCategory) {
      return NextResponse.json(
        { error: 'Category is used by one or more templates. Please reassign templates first.' },
        { status: 400 }
      );
    }
    
    // Delete category
    await db.collection('categories').deleteOne({ _id: objectId });
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 