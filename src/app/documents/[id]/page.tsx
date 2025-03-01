'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Document = {
  _id: string;
  title: string;
  description?: string;
  file: {
    name: string;
    type: string;
    size: number;
    url: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function DocumentDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document not found');
          }
          const errorData = await response.text();
          throw new Error(errorData || 'Failed to fetch document');
        }
        
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        console.error('Error fetching document:', error);
        setError(error instanceof Error ? error.message : 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated' && params.id) {
      fetchDocument();
    }
  }, [status, params.id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/documents')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            ← Back to Documents
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : document ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{document.title}</h1>
              {document.description && (
                <p className="text-gray-600 mb-4">{document.description}</p>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h2 className="text-lg font-medium mb-2">Document Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">File Name</p>
                    <p className="font-medium">{document.file.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">File Type</p>
                    <p className="font-medium">{document.file.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">File Size</p>
                    <p className="font-medium">{(document.file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {document.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{new Date(document.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{new Date(document.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h2 className="text-lg font-medium mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <button 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => alert('Document viewer will be implemented soon')}
                  >
                    View Document
                  </button>
                  <button 
                    className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => alert('E-signature feature will be implemented soon')}
                  >
                    Sign Document
                  </button>
                  <button 
                    className="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={() => alert('Sharing feature will be implemented soon')}
                  >
                    Share Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">Document not found</p>
          </div>
        )}
      </div>
    </div>
  );
}