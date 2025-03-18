'use client';

import { useState, useRef, useEffect } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  Pencil, 
  Calendar, 
  CheckSquare,
  Type,
  Loader2,
  FolderPlus,
  GripHorizontal
} from "lucide-react";
import { TemplateField, Category } from '@/types/template';
import { v4 as uuidv4 } from 'uuid';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core';

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

// Field type components for drag and drop
function DraggableFieldType({ type }: { 
  type: { id: string; name: string; icon: React.ReactNode }; 
}) {
  return (
    <div
      className="flex flex-col items-center justify-center h-20 p-2 border rounded-md bg-background cursor-grab hover:border-primary hover:shadow-sm transition-all group"
    >
      <div className="text-primary group-hover:scale-110 transition-transform">{type.icon}</div>
      <span className="mt-1 text-xs">{type.name}</span>
      <div className="flex items-center mt-1 text-xs text-muted-foreground">
        <GripHorizontal className="w-3 h-3 mr-1" />
        <span>Drag to add</span>
      </div>
    </div>
  );
}

// Create a draggable component
function Draggable({ children, id, data = {} }: { 
  children: React.ReactNode; 
  id: string;
  data?: Record<string, any>;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="touch-none"
    >
      {children}
    </div>
  );
}

// Draggable field item for existing fields
function DraggableField({ field, isActive, onClick }: { 
  field: TemplateField; 
  isActive: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: field.id,
    data: { type: 'field', field }
  });
  
  const style = {
    left: `${field.position.x}px`,
    top: `${field.position.y}px`,
    width: `${field.position.width}px`,
    height: `${field.position.height}px`,
    ...(transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : {})
  };
  
  return (
    <div
      ref={setNodeRef}
      className={`absolute border-2 rounded p-2 cursor-move shadow-sm ${
        isActive ? 'border-primary bg-primary/10 z-10' : 'border-gray-300 bg-white'
      }`}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      {...listeners}
      {...attributes}
    >
      <div className="text-xs font-medium truncate">{field.label}</div>
      <div className="text-xs text-muted-foreground">{field.type}</div>
    </div>
  );
}

// Field overlay for drag and drop
function FieldOverlay({ field, type }: { 
  field?: TemplateField; 
  type?: { id: string; name: string; icon: React.ReactNode };
}) {
  if (field) {
    return (
      <div
        className="border-2 border-primary rounded p-2 bg-white shadow-md opacity-90 z-50"
        style={{
          width: `${field.position.width}px`,
          height: `${field.position.height}px`,
          pointerEvents: 'none',
        }}
      >
        <div className="text-xs font-medium truncate">{field.label}</div>
        <div className="text-xs text-muted-foreground">{field.type}</div>
      </div>
    );
  }
  
  if (type) {
    return (
      <div
        className="border-2 border-primary rounded p-2 bg-white shadow-md opacity-90 z-50 flex flex-col items-center justify-center"
        style={{ 
          width: '150px', 
          height: '40px',
          pointerEvents: 'none',
        }}
      >
        <div className="text-primary mr-2 inline-flex">{type.icon}</div>
        <div className="text-xs text-muted-foreground">New {type.name}</div>
      </div>
    );
  }
  
  return null;
}

// Add a Droppable component
function Droppable({ children, id }: { children: React.ReactNode; id: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id
  });
  
  return (
    <div
      ref={setNodeRef}
      className={`relative ${isOver ? 'ring-2 ring-primary/50' : ''}`}
    >
      {children}
    </div>
  );
}

export default function CreateTemplate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'shared'>('private');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [currentField, setCurrentField] = useState<TemplateField | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Drag and drop state
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [activeFieldType, setActiveFieldType] = useState<{ id: string; name: string; icon: React.ReactNode } | null>(null);
  
  // Reference to the document canvas for positioning
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum distance before drag starts
      },
    })
  );
  
  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/categories');
          
          if (!response.ok) {
            throw new Error('Failed to fetch categories');
          }
          
          const data = await response.json();
          setCategories(data);
        } catch (err) {
          console.error('Error fetching categories:', err);
        } finally {
          setLoadingCategories(false);
        }
      }
    }
    
    fetchCategories();
  }, [status]);
  
  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
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
  
  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id, data } = active;
    
    if (data.current?.type === 'field') {
      setActiveFieldId(id.toString());
      setCurrentField(data.current.field);
    } else if (data.current?.type === 'field-type') {
      setActiveFieldType(data.current.fieldType);
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    const { id, data } = active;
    
    // If dragging an existing field
    if (data.current?.type === 'field' && activeFieldId) {
      setFields(fields.map(field => {
        if (field.id === activeFieldId) {
          return {
            ...field,
            position: {
              ...field.position,
              x: Math.max(0, field.position.x + delta.x),
              y: Math.max(0, field.position.y + delta.y),
            }
          };
        }
        return field;
      }));
      setActiveFieldId(null);
    }
    
    // If dragging a field type and dropping on the canvas
    if (data.current?.type === 'field-type' && over && over.id === 'document-canvas' && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const { clientX, clientY } = event.activatorEvent as PointerEvent;
      
      // Calculate position relative to canvas
      const x = Math.max(0, clientX - canvasRect.left);
      const y = Math.max(0, clientY - canvasRect.top);
      
      if (activeFieldType && x >= 0 && y >= 0 && x <= canvasRect.width && y <= canvasRect.height) {
        const newField: TemplateField = {
          id: uuidv4(),
          type: activeFieldType.id,
          label: `${activeFieldType.id.charAt(0).toUpperCase() + activeFieldType.id.slice(1)} Field`,
          placeholder: '',
          required: false,
          position: {
            x,
            y,
            width: 150,
            height: 40,
            page: 1
          }
        };
        
        setFields([...fields, newField]);
        setCurrentField(newField);
      }
    }
    
    setActiveFieldType(null);
  };
  
  const handleSubmit = async () => {
    if (!templateName) {
      setError("Template name is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          visibility,
          categoryId: categoryId || undefined,
          fields: Object.values(fields),
          isActive: true,
          metadata: {}
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create template');
      }
      
      const data = await response.json();
      
      router.push(`/templates/${data._id}`);
    } catch (error: any) {
      console.error('Error creating template:', error);
      setError(error.message || 'There was a problem creating your template. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getCategoryName = (id?: string) => {
    if (!id) return 'None';
    const category = categories.find(cat => cat._id === id);
    return category ? category.name : 'Unknown';
  };
  
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={true}
      collisionDetection={closestCenter}
    >
      <div className="flex min-h-screen bg-background">
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="border-b">
            <div className="container flex h-16 items-center px-4">
              <div className="flex items-center gap-4 mr-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-semibold">Create Template</h1>
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
                    Save Template
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
                  <Label htmlFor="category">Category</Label>
                  {loadingCategories ? (
                    <div className="flex items-center mt-1 h-10">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading categories...</span>
                    </div>
                  ) : (
                    <Select
                      value={categoryId || "none"}
                      onValueChange={(value) => setCategoryId(value === "none" ? undefined : value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id || `category-${category.name}`}>
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: category.color || '#6366F1' }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start mt-1 text-xs"
                          onClick={() => router.push('/categories')}
                        >
                          <FolderPlus className="h-3.5 w-3.5 mr-1" />
                          Manage Categories
                        </Button>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div>
                  <Label>Field Types</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {fieldTypes.map((type) => (
                      <Draggable 
                        key={type.id} 
                        id={`field-type-${type.id}`}
                        data={{ type: 'field-type', fieldType: type }}
                      >
                        <DraggableFieldType type={type} />
                      </Draggable>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-4">
                <p className="text-sm text-muted-foreground">
                  Drag field types onto the document to position them.
                </p>
              </div>
            </div>
            
            {/* Main canvas */}
            <div className="flex-1 p-6 overflow-auto">
              <Droppable id="document-canvas">
                <div 
                  ref={canvasRef}
                  className="bg-white shadow-lg rounded-lg p-8 min-h-[842px] w-[595px] mx-auto relative border-2 border-dashed border-transparent hover:border-primary/20 transition-colors"
                  onClick={() => setCurrentField(null)}
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
                    <DraggableField
                      key={field.id}
                      field={field}
                      isActive={currentField?.id === field.id}
                      onClick={() => handleFieldSelect(field)}
                    />
                  ))}

                  {fields.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-6 max-w-md">
                        <FolderPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium mb-2">No Fields Added Yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Drag and drop field types from the left sidebar onto this document to add form fields.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Droppable>
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
                  <p className="text-sm">Click on a field to edit its properties or drag a field type onto the document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Drag overlay */}
      <DragOverlay>
        {activeFieldId && (
          <FieldOverlay 
            field={fields.find(field => field.id === activeFieldId)} 
          />
        )}
        {activeFieldType && (
          <FieldOverlay type={activeFieldType} />
        )}
      </DragOverlay>
    </DndContext>
  );
} 