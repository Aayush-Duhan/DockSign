'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // If any password field is filled, all password fields must be filled
  const hasCurrentPassword = !!data.currentPassword;
  const hasNewPassword = !!data.newPassword;
  const hasConfirmPassword = !!data.confirmPassword;
  
  // If any password field is filled, all must be filled
  if (hasCurrentPassword || hasNewPassword || hasConfirmPassword) {
    return hasCurrentPassword && hasNewPassword && hasConfirmPassword;
  }
  
  return true;
}, {
  message: "All password fields are required to change password",
  path: ["newPassword"],
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

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update form values when session data is available
  useEffect(() => {
    if (session?.user) {
      reset({
        name: session.user.name || '',
        email: session.user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [session, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create the update payload
      const updateData: any = {
        name: data.name,
      };

      // Only include password fields if the user is trying to change password
      if (data.currentPassword && data.newPassword && data.confirmPassword) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
        updateData.confirmPassword = data.confirmPassword;
      }

      // Send the update request to the API
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Update the session with the new user data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
        },
      });

      setSuccess('Profile updated successfully');
      
      // Clear password fields
      reset({
        ...data,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message || 'An error occurred while updating your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center mb-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-white hover:text-gray-200"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="rounded-md bg-red-500/30 p-4">
                  <div className="flex">
                    <div className="text-sm text-white">{error}</div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="rounded-md bg-green-500/30 p-4">
                  <div className="flex">
                    <div className="text-sm text-white">{success}</div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    {...register('name')}
                    className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-300">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    disabled
                    {...register('email')}
                    className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-500 bg-gray-100 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-white/70">Email cannot be changed</p>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      {...register('currentPassword')}
                      className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-300">{errors.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      {...register('newPassword')}
                      className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-300">{errors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                      className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-300">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}