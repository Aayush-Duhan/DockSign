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

export default function Documents() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Failed to load documents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchDocuments();
    }
  }, [status]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => router.push('/documents/create')}
        >
          Create New Document
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
      ) : documents.length === 0 ? (
        <div className="bg-white shadow rounded-lg divide-y">
          <div className="p-6 text-center text-gray-500">
            No documents yet. Click "Create New Document" to get started.
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y">
          {documents.map((doc) => (
            <div key={doc._id} className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{doc.title}</h3>
                {doc.description && (
                  <p className="mt-1 text-sm text-gray-600">{doc.description}</p>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="mr-2">{doc.file.name}</span>
                  <span className="mr-2">•</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {doc.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={() => router.push(`/documents/${doc._id}`)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}