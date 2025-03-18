// Template types for DockSign

// Category for templates
export interface Category {
  _id?: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string; // For nested categories (optional)
  createdAt?: Date;
  updatedAt?: Date;
}

// Position of a field in a template
export interface FieldPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

// Advanced field configuration options
export interface FieldConfig {
  // Dropdown/Radio options
  options?: { label: string; value: string }[];
  
  // Validation
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
  
  // Formatting
  format?: string;
  
  // Conditional display
  showWhen?: {
    fieldId: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
    value: any;
  };
  
  // Default values
  defaultValue?: any;
  
  // Calculated field
  formula?: string;
  
  // Table configuration
  columns?: { id: string; header: string; width?: number }[];
  
  // Rich text options
  allowFormatting?: boolean;
  
  // Image placeholder options
  aspectRatio?: number;
  maxSize?: number;
}

// Field in a template
export interface TemplateField {
  id: string;
  type: string; // 'text', 'signature', 'date', 'checkbox', 'dropdown', 'radio', 'image', 'table', 'richText', 'calculated'
  label: string;
  placeholder?: string;
  required: boolean;
  position: FieldPosition;
  config?: FieldConfig; // Advanced configuration options
}

// Permission level for template access
export interface TemplatePermission {
  userId?: string;
  teamId?: string;
  level: 'view' | 'use' | 'edit' | 'manage' | 'admin';
  grantedBy?: string;
  grantedAt?: Date;
}

// Version information for templates
export interface TemplateVersion {
  versionId: string;
  createdAt: Date;
  createdBy: string;
  comment?: string;
  fields: TemplateField[];
  name: string;
  description?: string;
  visibility: 'private' | 'shared';
  categoryId?: string;
}

// Template model
export interface Template {
  _id?: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  visibility: 'private' | 'shared';
  categoryId?: string; // Reference to category
  isActive?: boolean; // Whether the template is active/available
  metadata?: Record<string, any>; // Additional metadata for the template
  permissions?: TemplatePermission[]; // Enhanced permissions
  currentVersion?: string; // Reference to current version ID
  versions?: TemplateVersion[]; // Version history
}

// Reference to a template in a document
export interface DocumentTemplateReference {
  templateId: string;
  versionId?: string; // Specific version used
  fieldValues: {
    [fieldId: string]: any;
  };
} 