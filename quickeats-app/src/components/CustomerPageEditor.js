import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Eye, Edit } from 'lucide-react';
import WYSIWYGEditor from './WYSIWYGEditor';

const CustomerPageEditor = ({ customPages, setCustomPages }) => {
  const [selectedPage, setSelectedPage] = useState(null);
  const [editingPage, setEditingPage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (customPages && customPages.length > 0 && !selectedPage) {
      setSelectedPage(customPages[0]);
      setEditingPage({ ...customPages[0] });
    }
  }, [customPages, selectedPage]);

  const handleNewPage = () => {
    const newPage = {
      id: Date.now(),
      title: 'New Page',
      slug: 'new-page',
      content: '<h1>Welcome to Your New Page</h1><p>Start editing to customize this page.</p>',
      isActive: true,
      showInNav: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPages = [...customPages, newPage];
    setCustomPages(updatedPages);
    setSelectedPage(newPage);
    setEditingPage({ ...newPage });
  };

  const handleSavePage = () => {
    if (!editingPage) return;

    const updatedPages = customPages.map(page =>
      page.id === editingPage.id
        ? { ...editingPage, updatedAt: new Date().toISOString() }
        : page
    );

    setCustomPages(updatedPages);
    setSelectedPage({ ...editingPage });
    alert('Page saved successfully!');
  };

  const handleDeletePage = (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      const updatedPages = customPages.filter(page => page.id !== pageId);
      setCustomPages(updatedPages);

      if (selectedPage?.id === pageId) {
        setSelectedPage(updatedPages[0] || null);
        setEditingPage(updatedPages[0] ? { ...updatedPages[0] } : null);
      }
    }
  };

  const handleSelectPage = (page) => {
    setSelectedPage(page);
    setEditingPage({ ...page });
    setShowPreview(false);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (newTitle) => {
    const newSlug = generateSlug(newTitle);
    setEditingPage({ ...editingPage, title: newTitle, slug: newSlug });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Page Editor</h2>
        <button
          onClick={handleNewPage}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          New Page
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Page List */}
        <div className="col-span-3 border-r pr-4">
          <h3 className="font-semibold text-gray-700 mb-3">Pages</h3>
          <div className="space-y-2">
            {customPages && customPages.length > 0 ? (
              customPages.map(page => (
                <div
                  key={page.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPage?.id === page.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectPage(page)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{page.title}</div>
                      <div className="text-xs text-gray-500">/{page.slug}</div>
                      <div className="flex gap-2 mt-1">
                        {page.isActive && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Active
                          </span>
                        )}
                        {page.showInNav && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            In Nav
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete Page"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center py-4">
                No pages yet. Create one to get started!
              </div>
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="col-span-9">
          {editingPage ? (
            <>
              {/* Page Settings */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={editingPage.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPage.isActive}
                      onChange={(e) => setEditingPage({ ...editingPage, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Page is active (visible to customers)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPage.showInNav}
                      onChange={(e) => setEditingPage({ ...editingPage, showInNav: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Show in navigation menu</span>
                  </label>
                </div>
              </div>

              {/* Editor Actions */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleSavePage}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Save size={20} />
                  Save Page
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {showPreview ? <Edit size={20} /> : <Eye size={20} />}
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
              </div>

              {/* WYSIWYG Editor or Preview */}
              {showPreview ? (
                <div className="border rounded-lg p-6 bg-white min-h-[500px]">
                  <h1 className="text-3xl font-bold mb-4">{editingPage.title}</h1>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: editingPage.content }}
                  />
                </div>
              ) : (
                <WYSIWYGEditor
                  content={editingPage.content}
                  onChange={(html) => setEditingPage({ ...editingPage, content: html })}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <p className="text-xl mb-2">No page selected</p>
                <p className="text-sm">Select a page from the list or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPageEditor;