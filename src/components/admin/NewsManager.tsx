import React, { useState } from 'react';
import { Newspaper, Trash2, ExternalLink, Edit, Save, X, Plus, Upload, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLinks } from '../../hooks/useLinks';
import { useRealtime } from '../../hooks/useRealtime';
import { newsApi } from '../../services/api';
import { News } from '../../types';
import toast from 'react-hot-toast';

interface NewsManagerProps {
  searchQuery?: string;
}

const NewsManager: React.FC<NewsManagerProps> = ({ searchQuery = '' }) => {
  const { news, addNews, removeNews, updateNews } = useLinks();
  const { emitContentUpdate } = useRealtime();
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editForm, setEditForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    url: '',
    image: ''
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateNews = async () => {
    if (!editForm.title || !editForm.excerpt) {
      toast.error('Title and excerpt are required');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('excerpt', editForm.excerpt);
      formData.append('content', editForm.content);
      formData.append('url', editForm.url);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      } else if (editForm.image) {
        formData.append('image', editForm.image);
      }

      const response = await newsApi.create(formData);
      addNews(response.data);
      emitContentUpdate('news', 'add', response.data);
      
      resetForm();
      toast.success('News article created successfully');
    } catch (error) {
      console.error('Error creating news:', error);
      toast.error('Failed to create news article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('excerpt', editForm.excerpt);
      formData.append('content', editForm.content);
      formData.append('url', editForm.url);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      } else if (editForm.image) {
        formData.append('image', editForm.image);
      }

      const response = await newsApi.update(editingNews.id, formData);
      updateNews(response.data);
      emitContentUpdate('news', 'update', response.data);
      
      cancelEditing();
      toast.success('News article updated successfully');
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error('Failed to update news article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;

    setIsLoading(true);
    try {
      await newsApi.delete(id);
      removeNews(id);
      emitContentUpdate('news', 'delete', { id });
      toast.success('News article deleted successfully');
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news article');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (newsItem: News) => {
    setEditingNews(newsItem);
    setEditForm({
      title: newsItem.title,
      excerpt: newsItem.excerpt,
      content: newsItem.content || '',
      url: newsItem.url,
      image: newsItem.image || ''
    });
    setImagePreview(newsItem.image || '');
  };

  const cancelEditing = () => {
    setEditingNews(null);
    resetForm();
  };

  const resetForm = () => {
    setEditForm({ title: '', excerpt: '', content: '', url: '', image: '' });
    setSelectedImage(null);
    setImagePreview('');
    setShowAddForm(false);
  };

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">News Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage news articles</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          Add News Article
        </button>
      </div>

      {/* Add New News Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add News Article</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter article title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    External URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/article"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Excerpt *
                </label>
                <textarea
                  placeholder="Brief description of the article"
                  value={editForm.excerpt}
                  onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  placeholder="Full article content"
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Featured Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Image size={16} />
                    Choose Image
                  </label>
                  <span className="text-sm text-gray-500">or</span>
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={editForm.image}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-32 h-20 object-cover rounded-lg" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForm}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNews}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                Create Article
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredNews.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              {editingNews?.id === item.id ? (
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
                    value={editForm.excerpt}
                    onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Excerpt"
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
                      onClick={handleUpdateNews}
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
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.excerpt}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {item.url && (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline"
                          >
                            View Article <ExternalLink size={12} />
                          </a>
                        )}
                        {item.date && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {item.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(item)}
                      disabled={isLoading}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(item.id)}
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

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No news articles found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Try adjusting your search query' : 'Create your first news article to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsManager;