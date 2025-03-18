'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Edit, 
  Download, 
  Share, 
  Calendar, 
  Clock, 
  User,
  CheckCircle,
  AlertCircle,
  Copy,
  CheckCheck
} from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

interface DocumentField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };
  config?: {
    options?: { label: string; value: string }[];
  };
}

interface Document {
  _id: string;
  title: string;
  description?: string;
  fields: DocumentField[];
  content: Record<string, any>;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  derivedFromTemplate?: {
    templateId: string;
  } | null;
}

function getStatusColor(status: string): string {
  switch(status.toLowerCase()) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-blue-100 text-blue-800';
    case 'submitted':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-green-200 text-green-900';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function DocumentDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (status === 'authenticated') {
        try {
          setLoading(true);
          const response = await fetch(`/api/documents/${params.id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch document');
          }
          
          const data = await response.json();
          setDocument(data);
          setError(null);
        } catch (err) {
          console.error('Error fetching document:', err);
          setError('Failed to load document. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDocument();
  }, [params.id, status]);

  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading document...</span>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || 'Document not found'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/documents')}>
              Back to Documents
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isEditable = document.status === 'draft';
  
  const handleDownload = () => {
    window.open(`/api/documents/${params.id}/download`, '_blank');
  };
  
  const handleShare = async () => {
    const url = `${window.location.origin}/documents/${params.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Document link copied to clipboard",
      });
      
      // Reset copied status after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-background">
      <div className="container max-w-5xl py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/documents')}
                className="rounded-full hover:bg-background/80"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
                  <Badge className={getStatusColor(document.status)}>
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </Badge>
                </div>
                {document.description && (
                  <p className="text-muted-foreground mt-1">
                    {document.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isEditable && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/documents/edit/${params.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">
                <FileText className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="fields">
                <User className="h-4 w-4 mr-2" />
                Fields
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Document Information</CardTitle>
                  <CardDescription>
                    Details about this document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Created By</div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{document.createdBy}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Status</div>
                      <Badge className={getStatusColor(document.status)}>
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Created On</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(document.createdAt), 'PPP')}
                          {' '}
                          <span className="text-muted-foreground">
                            ({formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })})
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(document.updatedAt), 'PPP')}
                          {' '}
                          <span className="text-muted-foreground">
                            ({formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })})
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {(() => {
                    const templateId = document.derivedFromTemplate?.templateId;
                    return templateId ? (
                      <div className="pt-4 mt-4 border-t">
                        <div className="text-sm font-medium mb-2">Source Template</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/templates/${templateId}`)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Template
                        </Button>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Document Actions</CardTitle>
                  <CardDescription>
                    Available actions for this document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditable ? (
                      <>
                        <Button 
                          onClick={() => router.push(`/documents/edit/${params.id}`)}
                          className="w-full"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Document
                        </Button>
                      </>
                    ) : (
                      <div className="p-4 rounded-md bg-muted">
                        <p className="text-muted-foreground text-sm">
                          This document has been submitted and can no longer be edited.
                        </p>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" onClick={handleShare}>
                      {copied ? (
                        <>
                          <CheckCheck className="mr-2 h-4 w-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share className="mr-2 h-4 w-4" />
                          Share Document
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="fields" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Document Fields</CardTitle>
                  <CardDescription>
                    View the form fields and their values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {document.fields && document.fields.length > 0 ? (
                    <div className="divide-y">
                      {document.fields.map((field) => (
                        <div key={field.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                            <div>
                              <h4 className="font-medium">{field.label}</h4>
                              <p className="text-sm text-muted-foreground">
                                {field.type.charAt(0).toUpperCase() + field.type.slice(1)} field
                                {field.required && ' (Required)'}
                              </p>
                            </div>
                            <div className="p-2 bg-muted/50 rounded border min-w-[200px]">
                              {document.content[field.id] ? (
                                field.type === 'signature' ? (
                                  <div className="italic">Signed by {session?.user?.name}</div>
                                ) : (
                                  <div>{document.content[field.id]}</div>
                                )
                              ) : (
                                <div className="text-muted-foreground text-sm italic">
                                  No value provided
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      This document has no fields to display.
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {isEditable && (
                    <Button 
                      onClick={() => router.push(`/documents/edit/${params.id}`)}
                      variant="outline"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Fields
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}