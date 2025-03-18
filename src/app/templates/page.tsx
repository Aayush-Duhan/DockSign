'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Loader2, 
  FileText, 
  Filter,
  AlertCircle,
  Tag,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Template, Category } from '@/types/template';
import { formatDistanceToNow } from 'date-fns';

export default function Templates() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (status === 'authenticated') {
        try {
          setLoading(true);
          // Fetch templates
          const templatesResponse = await fetch('/api/templates');
          
          if (!templatesResponse.ok) {
            throw new Error('Failed to fetch templates');
          }
          
          const templatesData = await templatesResponse.json();
          setTemplates(templatesData);
          
          // Fetch categories
          const categoriesResponse = await fetch('/api/categories');
          
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData);
          }
          
          setError(null);
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load templates. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchData();
  }, [status]);
  
  // Filter templates based on search query and selected category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || template.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
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
  
  return (
    <div className="container py-6">
      <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage document templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {selectedCategory && (
              <Badge variant="secondary" className="ml-2">1</Badge>
            )}
          </Button>
          <Button 
            onClick={() => router.push('/templates/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>
      
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {showFilters && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Filters</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id || "unknown"}>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color || '#6366F1' }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedCategory && (
              <div className="mt-4 flex items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                  className="flex items-center h-8"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getCategoryColor(selectedCategory) || '#6366F1' }}
                  />
                  {getCategoryName(selectedCategory)}
                  <X className="h-3 w-3 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}
      
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory
              ? "Try changing your search or filters"
              : "Create your first template to get started"}
          </p>
          {!searchQuery && !selectedCategory && (
            <Button
              onClick={() => router.push('/templates/create')}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div 
              key={template._id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/templates/${template._id}`)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium truncate">{template.name}</h3>
                </div>
                
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="flex items-center">
                    {template.createdAt && (
                      <>
                        Created {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                      </>
                    )}
                  </span>
                  
                  {template.categoryId && (
                    <Badge 
                      className="ml-2"
                      style={{ 
                        backgroundColor: getCategoryColor(template.categoryId) || '#6366F1',
                        color: 'white'
                      }}
                    >
                      {getCategoryName(template.categoryId)}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="bg-muted px-4 py-2 flex items-center justify-between text-xs">
                <div>
                  {(template.fields || []).length} {(template.fields || []).length === 1 ? 'field' : 'fields'}
                </div>
                <Badge variant={template.visibility === 'private' ? 'outline' : 'secondary'}>
                  {template.visibility}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 