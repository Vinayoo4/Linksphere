import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Trash2, ExternalLink, Edit, Save, X, Plus, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLinks } from '../../hooks/useLinks';
import { useRealtime } from '../../hooks/useRealtime';
import { linksApi } from '../../services/api';
import { Link } from '../../types';
import toast from 'react-hot-toast';

interface LinksManagerProps {
  searchQuery?: string;
}

const LinksManager: React.FC<LinksManagerProps> = ({ searchQuery = '' }) => {
  const { links, addLink, removeLink, updateLink } = useLinks();
  const { emitContentUpdate } = useRealtime();
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    url: '',
    icon: ''
  });

  const handleCreateLink = async () => {
    if (!editForm.title || !editForm.url) {
      toast.error('Title and URL are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await linksApi.create(editForm);
      addLink(response.data);
      emitContentUpdate('links', 'add', response.data);
      
      setShowAddForm(false);
      setEditForm({ title: '', description: '', url: '', icon: '' });
      toast.success('Link created successfully');
    } catch (error) {
      console.error('Error creating link:', error);
      toast.error('Failed to create link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;

    setIsLoading(true);
    try {
      const response = await linksApi.update(editingLink.id, editForm);
      updateLink(response.data);
      emitContentUpdate('links', 'update', response.data);
      
      setEditingLink(null);
      setEditForm({ title: '', description: '', url: '', icon: '' });
      toast.success('Link updated successfully');
    } catch (error) {
      console.error('Error updating link:', error);
      toast.error('Failed to update link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    setIsLoading(true);
    try {
      await linksApi.delete(id);
      removeLink(id);
      emitContentUpdate('links', 'delete', { id });
      toast.success('Link deleted successfully');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (link: Link) => {
    setEditingLink(link);
    setEditForm({
      title: link.title,
      description: link.description,
      url: link.url,
      icon: link.icon || ''
    });
  };

  const cancelEditing = () => {
    setEditingLink(null);
    setEditForm({ title: '', description: '', url: '', icon: '' });
  };

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Links Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your links</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          Add New Link
        </button>
      </div>

      {/* Add New Link Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Link</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter link title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Enter link description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/icon.png"
                  value={editForm.icon}
                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                Create Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Links List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredLinks.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              {editingLink?.id === link.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Title"
                    />
                    <input
                      type="url"
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="URL"
                    />
                  </div>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Description"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      disabled={isLoading}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={handleUpdateLink}
                      disabled={isLoading}
                      className="px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      <LinkIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{link.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{link.description}</p>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1 hover:underline"
                      >
                        {link.url} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(link)}
                      disabled={isLoading}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      disabled={isLoading}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredLinks.length === 0 && (
        <div className="text-center py-12">
          <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No links found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Try adjusting your search query' : 'Create your first link to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LinksManager;