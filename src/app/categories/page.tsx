'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Plus,
  Folder,
  Tag,
  Edit,
  Trash2,
  Info,
  FolderTree,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/template';

export default function Categories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#6366F1');
  const [formParentId, setFormParentId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      if (status === 'authenticated') {
        try {
          setLoading(true);
          const response = await fetch('/api/categories');
          
          if (!response.ok) {
            throw new Error('Failed to fetch categories');
          }
          
          const data = await response.json();
          setCategories(data);
          setError(null);
        } catch (err) {
          console.error('Error fetching categories:', err);
          setError('Failed to load categories. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchCategories();
  }, [status]);
  
  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormColor('#6366F1');
    setFormParentId(undefined);
    setFormError(null);
  };
  
  // Handle close dialog
  const handleCloseDialog = () => {
    setShowNewDialog(false);
    setShowEditDialog(false);
    resetForm();
  };
  
  // Handle open edit dialog
  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setFormName(category.name);
    setFormDescription(category.description || '');
    setFormColor(category.color || '#6366F1');
    setFormParentId(category.parentId);
    setShowEditDialog(true);
  };
  
  // Handle delete category dialog
  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };
  
  // Create new category
  const handleCreateCategory = async () => {
    if (!formName.trim()) {
      setFormError('Category name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          color: formColor,
          parentId: formParentId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }
      
      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      
      // Close dialog and reset form
      setShowNewDialog(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating category:', error);
      setFormError(error.message || 'There was a problem creating the category');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update category
  const handleUpdateCategory = async () => {
    if (!categoryToEdit) return;
    
    if (!formName.trim()) {
      setFormError('Category name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const response = await fetch(`/api/categories/${categoryToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          color: formColor,
          parentId: formParentId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }
      
      const updatedCategory = await response.json();
      
      // Update categories list
      setCategories(
        categories.map(cat => 
          cat._id === updatedCategory._id ? updatedCategory : cat
        )
      );
      
      // Close dialog and reset form
      setShowEditDialog(false);
      resetForm();
      setCategoryToEdit(null);
    } catch (error: any) {
      console.error('Error updating category:', error);
      setFormError(error.message || 'There was a problem updating the category');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete category
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/categories/${categoryToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      
      // Remove from categories list
      setCategories(
        categories.filter(cat => cat._id !== categoryToDelete._id)
      );
      
      // Close dialog
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setError(error.message || 'There was a problem deleting the category');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Find parent category name
  const getParentCategoryName = (parentId?: string) => {
    if (!parentId) return null;
    const parent = categories.find(cat => cat._id === parentId);
    return parent ? parent.name : 'Unknown';
  };
  
  // Handle unauthenticated users
  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }
  
  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your templates into categories for easier management
          </p>
        </div>
        
        <Button onClick={() => {
          resetForm();
          setShowNewDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}
      
      {categories.length === 0 && !error ? (
        <div className="text-center py-12">
          <FolderTree className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">No categories yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first category to organize your templates
          </p>
          <Button onClick={() => {
            resetForm();
            setShowNewDialog(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex-shrink-0 mt-1" 
                      style={{ backgroundColor: category.color || '#6366F1' }}
                    />
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      {category.parentId && (
                        <CardDescription>
                          Parent: {getParentCategoryName(category.parentId)}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {category.description ? (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    No description provided
                  </p>
                )}
              </CardContent>
              
              <CardFooter className="border-t bg-muted/30 flex justify-between pt-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* New Category Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent onInteractOutside={handleCloseDialog}>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your templates
            </DialogDescription>
          </DialogHeader>
          
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
              {formError}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter category name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of this category"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex mt-1 items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: formColor }}
                />
                <Input
                  id="color"
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-12 h-8 p-0"
                />
                <span className="text-sm text-muted-foreground ml-2">
                  {formColor}
                </span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="parent">Parent Category (optional)</Label>
              <select
                id="parent"
                value={formParentId || ''}
                onChange={(e) => setFormParentId(e.target.value || undefined)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">None (Root Category)</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent onInteractOutside={handleCloseDialog}>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category details
            </DialogDescription>
          </DialogHeader>
          
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
              {formError}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter category name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Input
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of this category"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-color">Color</Label>
              <div className="flex mt-1 items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: formColor }}
                />
                <Input
                  id="edit-color"
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-12 h-8 p-0"
                />
                <span className="text-sm text-muted-foreground ml-2">
                  {formColor}
                </span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-parent">Parent Category (optional)</Label>
              <select
                id="edit-parent"
                value={formParentId || ''}
                onChange={(e) => setFormParentId(e.target.value || undefined)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">None (Root Category)</option>
                {categories
                  .filter(cat => cat._id !== categoryToEdit?._id) // Exclude current category
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Category Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category 
              <span className="font-medium">
                {categoryToDelete ? ` "${categoryToDelete.name}"` : ''}
              </span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 