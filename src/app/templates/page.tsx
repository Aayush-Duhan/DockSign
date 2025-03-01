'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { motion } from "framer-motion"
import { Plus, FileText, ArrowLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  usageCount: number;
}

const MOCK_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Non-Disclosure Agreement',
    description: 'Standard NDA template for business confidentiality',
    category: 'Legal',
    usageCount: 245
  },
  {
    id: '2',
    title: 'Employment Contract',
    description: 'Standard employment agreement template',
    category: 'HR',
    usageCount: 189
  },
  {
    id: '3',
    title: 'Service Agreement',
    description: 'Professional services contract template',
    category: 'Business',
    usageCount: 167
  },
];

export default function Templates() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);

  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                onClick={() => router.back()}
                className="rounded-full hover:bg-background/80"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
                <p className="text-muted-foreground mt-1">
                  Choose from our collection of pre-made templates
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/templates/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/templates/${template.id}`)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {template.usageCount} uses
                      </span>
                    </div>
                    <CardTitle className="mt-4">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <span className="text-sm font-medium text-muted-foreground">
                      {template.category}
                    </span>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 