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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Edit, 
  Trash2, 
  FilePlus, 
  Eye, 
  Settings,
  AlertCircle,
  Tag
} from "lucide-react";
import { Template, TemplateField, Category } from '@/types/template';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TemplateDetailProps {
  params: {
    id: string;
  };
}

export default function TemplateDetail({ params }: TemplateDetailProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingDocument, setCreatingDocument] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated') {
        try {
          setLoading(true);
          
          // Fetch template
          const templateResponse = await fetch(`/api/templates/${params.id}`);
          
          if (!templateResponse.ok) {
            throw new Error('Failed to fetch template');
          }
          
          const templateData = await templateResponse.json();
          setTemplate(templateData);
          setDocumentTitle(templateData.name + ' Document');
          
          // Fetch categories if template has a category
          if (templateData.categoryId) {
            const categoriesResponse = await fetch(`/api/categories`);
            
            if (categoriesResponse.ok) {
              const categoriesData = await categoriesResponse.json();
              setCategories(categoriesData);
            }
          }
          
          setError(null);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load template. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [params.id, status]);
  
  // Get category name by ID
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : null;
  };
  
  // Get category color by ID
  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.color : null;
  };

  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || 'Template not found'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/templates')}>
              Back to Templates
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/templates/${template._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      
      router.push('/templates');
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };
  
  const handleCreateDocument = async () => {
    try {
      setCreatingDocument(true);
      setError(null);
      
      const response = await fetch(`/api/documents/from-template/${template._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: documentTitle
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create document from template');
      }
      
      const data = await response.json();
      router.push(`/documents/${data._id}`);
    } catch (err) {
      console.error('Error creating document:', err);
      setError('Failed to create document. Please try again.');
      setShowCreateDialog(false);
    } finally {
      setCreatingDocument(false);
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
                onClick={() => router.push('/templates')}
                className="rounded-full hover:bg-background/80"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
                  {template.categoryId && getCategoryName(template.categoryId) && (
                    <Badge 
                      className="ml-2"
                      style={{ 
                        backgroundColor: getCategoryColor(template.categoryId) || '#6366F1',
                        color: 'white'
                      }}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {getCategoryName(template.categoryId)}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Created on {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown date'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/templates/edit/${template._id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this template? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete} 
                  className="bg-red-600 text-white hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Template'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Create Document Modal */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Document from Template</DialogTitle>
                <DialogDescription>
                  Create a new document based on this template.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="documentTitle">Document Title</Label>
                  <Input
                    id="documentTitle"
                    placeholder="Enter document title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDocument} disabled={creatingDocument || !documentTitle.trim()}>
                  {creatingDocument ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Document'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Tabs defaultValue="preview">
            <TabsList className="mb-6">
              <TabsTrigger value="preview">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="details">
                <Settings className="mr-2 h-4 w-4" />
                Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Template Preview</CardTitle>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <FilePlus className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                  </div>
                  <CardDescription>
                    Visual representation of the template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-6 min-h-[400px] relative">
                    {/* Template preview */}
                    <div className="border-b border-dashed border-gray-300 pb-2 mb-4">
                      <div className="h-8 bg-gray-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>
                    
                    {/* Template fields */}
                    {template.fields.map((field: TemplateField) => (
                      <div
                        key={field.id}
                        className="absolute border rounded p-2"
                        style={{
                          left: `${field.position.x}px`,
                          top: `${field.position.y}px`,
                          width: `${field.position.width}px`,
                          height: `${field.position.height}px`,
                        }}
                      >
                        <div className="text-xs font-medium truncate">{field.label}</div>
                        <div className="text-xs text-muted-foreground">{field.type}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Description</h3>
                    <p className="text-muted-foreground text-sm">
                      {template.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Visibility</h3>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        template.visibility === 'private' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {template.visibility.charAt(0).toUpperCase() + template.visibility.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Fields ({template.fields.length})</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Label</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Required</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {template.fields.map((field: TemplateField) => (
                            <tr key={field.id}>
                              <td className="py-2 px-3 text-sm">{field.type}</td>
                              <td className="py-2 px-3 text-sm">{field.label}</td>
                              <td className="py-2 px-3 text-sm">
                                {field.required ? 'Yes' : 'No'}
                              </td>
                            </tr>
                          ))}
                          {template.fields.length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-4 text-center text-muted-foreground text-sm">
                                No fields added to this template
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
} 