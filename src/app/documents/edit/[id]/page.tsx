'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Download,
  Send,
  Pencil,
  Eye
} from "lucide-react";

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
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minValue?: number;
    maxValue?: number;
    format?: string;
    defaultValue?: any;
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
  };
}

export default function EditDocument({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

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
          
          // Initialize field values from existing content
          setFieldValues(data.content || {});
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

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSave = async () => {
    if (!document) return;
    
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      const response = await fetch(`/api/documents/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: fieldValues,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!document) return;
    
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/documents/${params.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: fieldValues,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit document');
      }
      
      router.push(`/documents/${params.id}`);
    } catch (err) {
      console.error('Error submitting document:', err);
      setError('Failed to submit document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: DocumentField) => {
    const value = fieldValues[field.id] !== undefined ? fieldValues[field.id] : field.config?.defaultValue || '';
    
    switch (field.type) {
      case 'text':
        return (
          <Input 
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            minLength={field.config?.minLength}
            maxLength={field.config?.maxLength}
            pattern={field.config?.pattern}
          />
        );
        
      case 'textarea':
        return (
          <Textarea 
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            minLength={field.config?.minLength}
            maxLength={field.config?.maxLength}
          />
        );
        
      case 'checkbox':
        return (
          <Checkbox 
            id={field.id}
            checked={value}
            onCheckedChange={(checked: boolean | 'indeterminate') => handleFieldChange(field.id, checked === true)}
          />
        );
        
      case 'dropdown':
      case 'select':
        return (
          <Select 
            value={value}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.config?.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'date':
        return (
          <div className="relative">
            <Input 
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );
        
      case 'signature':
        return (
          <div className="border border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
            <div className="text-sm text-gray-500 mb-2">Click to sign</div>
            {value ? (
              <div className="p-2 bg-white rounded border">
                <div className="italic text-sm">{session?.user?.name || 'Signature'}</div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => handleFieldChange(field.id, new Date().toISOString())}
              >
                Sign here
              </Button>
            )}
          </div>
        );
        
      default:
        return (
          <Input 
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
    }
  };

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
                <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
                <p className="text-muted-foreground mt-1">
                  Edit document details and fill out fields
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/documents/${params.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
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
              <TabsTrigger value="edit">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Fields
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-4">
              <Card className="shadow">
                <CardHeader>
                  <CardTitle>Document Fields</CardTitle>
                  <CardDescription>
                    Fill out the fields below to complete your document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {document.fields && document.fields.length > 0 ? (
                    document.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="text-sm font-medium flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-destructive">*</span>}
                        </label>
                        {renderField(field)}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      This document has no fields to fill out.
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/documents/${params.id}`)}
                  >
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      variant="outline"
                      disabled={isSaving}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSaving}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <Card className="shadow">
                <CardHeader>
                  <CardTitle>Document Preview</CardTitle>
                  <CardDescription>
                    Preview how your document will look when completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-8 bg-white">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold">{document.title}</h2>
                      {document.description && (
                        <p className="text-muted-foreground mt-1">{document.description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      {document.fields && document.fields.length > 0 ? (
                        document.fields.map((field) => (
                          <div key={field.id} className="space-y-1">
                            <div className="text-sm font-medium">{field.label}</div>
                            <div className="p-2 border rounded bg-muted/30">
                              {fieldValues[field.id] ? (
                                field.type === 'signature' ? (
                                  <div className="italic">Signed by {session?.user?.name}</div>
                                ) : (
                                  <div>{fieldValues[field.id]}</div>
                                )
                              ) : (
                                <div className="text-muted-foreground text-sm italic">
                                  No value provided
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          This document has no fields to display.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    disabled={isSaving}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Preview
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
} 