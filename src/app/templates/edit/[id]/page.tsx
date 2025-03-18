'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Pencil, 
  Calendar, 
  CheckSquare,
  Type,
  Loader2 
} from "lucide-react";
import { Template, TemplateField } from '@/types/template';
import { v4 as uuidv4 } from 'uuid';

// Custom Signature icon
function SignatureSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 16.5c2.5 2.5 6.5-1.5 9 1.5" />
      <path d="M3.5 13c4.5 3 7.5-2 11 2" />
      <path d="M4 9.5c2 2 5-1 7 1 1.5 1.5 4.5-1.5 7 1.5" />
    </svg>
  );
}

interface EditTemplateProps {
  params: {
    id: string;
  };
}

export default function EditTemplate({ params }: EditTemplateProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'shared'>('private');
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [currentField, setCurrentField] = useState<TemplateField | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reference to the document canvas for positioning
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchTemplate = async () => {
      if (status === 'authenticated') {
        try {
          setLoading(true);
          const response = await fetch(`/api/templates/${params.id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch template');
          }
          
          const data = await response.json();
          setTemplate(data);
          setTemplateName(data.name);
          setTemplateDescription(data.description || '');
          setVisibility(data.visibility);
          setFields(data.fields || []);
          setError(null);
        } catch (err) {
          console.error('Error fetching template:', err);
          setError('Failed to load template. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplate();
  }, [params.id, status]);

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
  
  const fieldTypes = [
    { id: 'signature', name: 'Signature', icon: <SignatureSVG /> },
    { id: 'text', name: 'Text Field', icon: <Type className="h-5 w-5" /> },
    { id: 'date', name: 'Date', icon: <Calendar className="h-5 w-5" /> },
    { id: 'checkbox', name: 'Checkbox', icon: <CheckSquare className="h-5 w-5" /> },
  ];
  
  const handleAddField = (type: string) => {
    // Create a new field with default position
    const newField: TemplateField = {
      id: uuidv4(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: '',
      required: false,
      position: {
        x: 100,
        y: 100,
        width: 150,
        height: 40,
        page: 1
      }
    };
    
    setFields([...fields, newField]);
    setCurrentField(newField);
  };
  
  const handleFieldSelect = (field: TemplateField) => {
    setCurrentField(field);
  };
  
  const handleFieldUpdate = (updatedField: TemplateField) => {
    setFields(fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
    setCurrentField(updatedField);
  };
  
  const handleFieldDelete = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
    if (currentField && currentField.id === id) {
      setCurrentField(null);
    }
  };
  
  const handleSubmit = async () => {
    if (!templateName) {
      setError("Template name is required");
      return;
    }
    
    if (!template) {
      setError("Template not found");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/templates/${template._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          visibility,
          fields
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update template');
      }
      
      router.push(`/templates/${template._id}`);
    } catch (error: any) {
      console.error('Error updating template:', error);
      setError(error.message || 'There was a problem updating your template. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Template Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The template you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Button onClick={() => router.push('/templates')}>
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-col w-full">
        {/* Header */}
        <div className="border-b">
          <div className="container flex h-16 items-center px-4">
            <div className="flex items-center gap-4 mr-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/templates/${template._id}`)}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Edit Template</h1>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !templateName}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-1">
          {/* Left sidebar - Template properties */}
          <div className="w-64 border-r p-4 flex flex-col">
            <div className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-red-100 text-red-600 rounded-md">
                  {error}
                </div>
              )}
            
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="templateDescription">Description</Label>
                <Textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Enter description"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={visibility}
                  onValueChange={(value: 'private' | 'shared') => setVisibility(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Field Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {fieldTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant="outline"
                      className="flex flex-col items-center justify-center h-20 p-2"
                      onClick={() => handleAddField(type.id)}
                    >
                      <div className="text-primary">{type.icon}</div>
                      <span className="mt-1 text-xs">{type.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4">
              <p className="text-sm text-muted-foreground">
                Drag fields onto the document to position them.
              </p>
            </div>
          </div>
          
          {/* Main canvas */}
          <div className="flex-1 p-6 overflow-auto">
            <div 
              ref={canvasRef}
              className="bg-white shadow-lg rounded-lg p-8 min-h-[842px] w-[595px] mx-auto relative"
            >
              {/* Document canvas for template design */}
              <div className="absolute top-2 left-2 right-2 text-center text-sm text-muted-foreground">
                Document Template Preview
              </div>
              
              {/* Placeholder content */}
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
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={`absolute border-2 rounded p-2 cursor-move ${
                    currentField?.id === field.id ? 'border-primary' : 'border-gray-300'
                  }`}
                  style={{
                    left: `${field.position.x}px`,
                    top: `${field.position.y}px`,
                    width: `${field.position.width}px`,
                    height: `${field.position.height}px`,
                  }}
                  onClick={() => handleFieldSelect(field)}
                >
                  <div className="text-xs font-medium truncate">{field.label}</div>
                  <div className="text-xs text-muted-foreground">{field.type}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right sidebar - Field properties */}
          <div className="w-80 border-l p-4">
            {currentField ? (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center justify-between">
                  Field Properties
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFieldDelete(currentField.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </h3>
                
                <div>
                  <Label htmlFor="fieldLabel">Label</Label>
                  <Input
                    id="fieldLabel"
                    value={currentField.label}
                    onChange={(e) => handleFieldUpdate({
                      ...currentField,
                      label: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                  <Input
                    id="fieldPlaceholder"
                    value={currentField.placeholder || ''}
                    onChange={(e) => handleFieldUpdate({
                      ...currentField,
                      placeholder: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fieldRequired"
                    checked={currentField.required}
                    onChange={(e) => handleFieldUpdate({
                      ...currentField,
                      required: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <Label htmlFor="fieldRequired">Required Field</Label>
                </div>
                
                <div>
                  <Label>Position</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <Label htmlFor="fieldX" className="text-xs">X</Label>
                      <Input
                        id="fieldX"
                        type="number"
                        value={currentField.position.x}
                        onChange={(e) => handleFieldUpdate({
                          ...currentField,
                          position: {
                            ...currentField.position,
                            x: parseInt(e.target.value) || 0
                          }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldY" className="text-xs">Y</Label>
                      <Input
                        id="fieldY"
                        type="number"
                        value={currentField.position.y}
                        onChange={(e) => handleFieldUpdate({
                          ...currentField,
                          position: {
                            ...currentField.position,
                            y: parseInt(e.target.value) || 0
                          }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldWidth" className="text-xs">Width</Label>
                      <Input
                        id="fieldWidth"
                        type="number"
                        value={currentField.position.width}
                        onChange={(e) => handleFieldUpdate({
                          ...currentField,
                          position: {
                            ...currentField.position,
                            width: parseInt(e.target.value) || 0
                          }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldHeight" className="text-xs">Height</Label>
                      <Input
                        id="fieldHeight"
                        type="number"
                        value={currentField.position.height}
                        onChange={(e) => handleFieldUpdate({
                          ...currentField,
                          position: {
                            ...currentField.position,
                            height: parseInt(e.target.value) || 0
                          }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Pencil className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <h3 className="font-medium mb-1">No Field Selected</h3>
                <p className="text-sm">Click on a field to edit its properties or add a new field from the sidebar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 