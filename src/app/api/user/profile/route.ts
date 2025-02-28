import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/mongodb';
import { compare, hash } from 'bcrypt';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Schema for profile update validation
const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(), // Add confirmPassword field to match frontend
}).refine(data => {
  // If one password field is provided, all password fields must be provided
  const hasCurrentPassword = !!data.currentPassword;
  const hasNewPassword = !!data.newPassword;
  const hasConfirmPassword = !!data.confirmPassword;
  
  if (hasCurrentPassword || hasNewPassword || hasConfirmPassword) {
    return hasCurrentPassword && hasNewPassword;
  }
  return true;
}, {
  message: "Both current and new password are required to change password",
  path: ["currentPassword"],
}).refine(data => {
  // If new password is provided, it must be at least 8 characters
  if (data.newPassword) {
    return data.newPassword.length >= 8;
  }
  return true;
}, {
  message: "New password must be at least 8 characters",
  path: ["newPassword"],
}).refine(data => {
  // If both new password and confirm password are provided, they must match
  if (data.newPassword && data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function PUT(req: Request) {
  try {
    // Get the current session to verify the user is authenticated
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = profileUpdateSchema.parse(body);
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Find the user by email
    const user = await db.collection('users').findOne({ 
      email: session.user.email 
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {
      name: validatedData.name,
    };
    
    // Handle password change if requested
    if (validatedData.currentPassword && validatedData.newPassword) {
      // Verify current password
      const isPasswordValid = await compare(
        validatedData.currentPassword,
        user.password
      );
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      
      // Hash the new password
      updateData.password = await hash(validatedData.newPassword, 12);
    }
    
    // Update the user in the database
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(user._id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Failed to update profile' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    
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