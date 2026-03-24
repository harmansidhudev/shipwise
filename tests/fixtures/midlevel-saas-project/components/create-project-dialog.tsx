'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createProjectSchema } from '@/lib/validations';
import { ZodError } from 'zod';

type CreateProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateProjectDialog({ open, onClose, onCreated }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('ACTIVE');
    setErrors({});
    setServerError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    // Client-side validation
    try {
      createProjectSchema.parse({ name, description: description || undefined, status });
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(err.flatten().fieldErrors as Record<string, string[]>);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || undefined, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.details) {
          setErrors(data.details);
        } else {
          setServerError(data.error ?? 'Failed to create project');
        }
        return;
      }

      resetForm();
      onCreated();
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-secondary-100">
          <h2 className="text-base font-semibold text-secondary-900">Create New Project</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-secondary-400 hover:bg-secondary-50 hover:text-secondary-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile App Redesign"
              autoFocus
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-secondary-200'
              }`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-secondary-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-secondary-700 mb-1.5"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'ARCHIVED')}
              className="w-full px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
