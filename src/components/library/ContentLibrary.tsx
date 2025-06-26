import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookOpen, Copy, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface SavedContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  platform: string;
  created_at: string;
}

export function ContentLibrary() {
  const { profile } = useAuth();
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    if (profile) {
      fetchSavedContent();
    }
  }, [profile]);

  const fetchSavedContent = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('saved_content')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedContent(data || []);
    } catch (error: any) {
      console.error('Error fetching saved content:', error);
      toast.error('Failed to load saved content');
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSavedContent(prev => prev.filter(item => item.id !== id));
      toast.success('Content deleted successfully');
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Content copied to clipboard!');
  };

  const filteredContent = selectedPlatform === 'all' 
    ? savedContent 
    : savedContent.filter(item => item.platform === selectedPlatform);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-myanmar-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myanmar-500"
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          You have {savedContent.length} saved content pieces
        </p>
      </div>

      {filteredContent.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved content yet</h3>
            <p className="text-gray-600">
              Generate and save content to build your library
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredContent.map((item) => (
            <Card key={item.id} hover>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="capitalize">{item.content_type}</span>
                      <span className="capitalize">{item.platform}</span>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(item.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.content)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteContent(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap font-myanmar leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}