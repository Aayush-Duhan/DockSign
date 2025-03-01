'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold">Welcome, {session?.user?.name}!</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors font-medium"
              >
                Logout
              </button>
            </div>
            <p className="text-xl opacity-80 mb-8">{session?.user?.email}</p>
            
            <div className="bg-white/20 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-semibold mb-4">Your Dashboard</h2>
              <p className="mb-4">This is your personal dashboard where you can manage your documents and signatures.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/20 p-4 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">Documents</h3>
                  <p>Manage and sign your documents</p>
                  <button 
                    onClick={() => router.push('/documents')}
                    className="mt-4 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-opacity-90 transition-colors font-medium"
                  >
                    View Documents
                  </button>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">Profile</h3>
                  <p>Update your personal information</p>
                  <button 
                    onClick={() => router.push('/profile')}
                    className="mt-4 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-opacity-90 transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm opacity-70">You're now signed in to DocSign. Start managing your documents securely.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}