import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Wand2, Copy, Download, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContentForm {
  businessName: string;
  productService: string;
  targetAudience: string;
  contentType: string;
  platform: string;
  tone: string;
  brandGender: string;
  additionalInfo: string;
}

interface GeneratedContent {
  id: string;
  content: string;
  quality_score: number;
  engagement_prediction: number;
  keywords: string[];
}

export function ContentGenerator() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [formData, setFormData] = useState<ContentForm>({
    businessName: '',
    productService: '',
    targetAudience: '',
    contentType: 'post',
    platform: 'facebook',
    tone: 'professional',
    brandGender: 'neutral',
    additionalInfo: '',
  });

  const handleGenerate = async () => {
    if (!profile || profile.tokens < 1) {
      toast.error('Insufficient tokens. Please get more tokens or upgrade your plan.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);

      // Deduct token
      await updateProfile({ tokens: profile.tokens - 1 });
      toast.success('Content generated successfully!');
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async (content: GeneratedContent) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('saved_content')
        .insert({
          user_id: profile.id,
          title: `${formData.contentType} for ${formData.businessName}`,
          content: content.content,
          content_type: formData.contentType,
          platform: formData.platform,
        });

      if (error) throw error;
      toast.success('Content saved to your library!');
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Content copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Content Generation Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Wand2 className="w-6 h-6 text-myanmar-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Content Generator</h2>
            </div>
            <p className="text-gray-600 mt-1">Fill in the details to generate Myanmar content</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Input
              label="Business Name / လုပ်ငန်းအမည်"
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder="e.g., Golden Myanmar Restaurant"
              required
            />

            <Input
              label="Product/Service / ကုန်ပစ္စည်း/ဝန်ဆောင်မှု"
              value={formData.productService}
              onChange={(e) => setFormData(prev => ({ ...prev, productService: e.target.value }))}
              placeholder="e.g., Traditional Myanmar cuisine"
              required
            />

            <Input
              label="Target Audience / ပစ်မှတ်အုပ်စု"
              value={formData.targetAudience}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="e.g., Food lovers, Young professionals"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myanmar-500"
                >
                  <option value="post">Regular Post</option>
                  <option value="promotion">Promotion</option>
                  <option value="story">Story</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myanmar-500"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tone / လေသံ
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myanmar-500"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Gender / အမှတ်တံဆိပ်ကျားမ
                </label>
                <select
                  value={formData.brandGender}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandGender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myanmar-500"
                >
                  <option value="neutral">Neutral / ကြားခံ</option>
                  <option value="male">Male / ယောက်ျား</option>
                  <option value="female">Female / မိန်းမ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Information / နောက်ထပ်အချက်အလက်များ
              </label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myanmar-500"
                placeholder="Any specific requirements, hashtags, or details..."
              />
            </div>

            <Button
              onClick={handleGenerate}
              loading={loading}
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!formData.businessName || !formData.productService}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Content (1 token)
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content Display */}
        <div className="space-y-6">
          {generatedContent.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
                <p className="text-sm text-gray-600">AI-generated Myanmar content variations</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedContent.map((content) => (
                  <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex space-x-4 text-xs text-gray-500">
                        <span>Quality: {content.quality_score}%</span>
                        <span>Engagement: {content.engagement_prediction}%</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(content.content)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSaveContent(content)}
                          className="p-1 text-myanmar-400 hover:text-myanmar-600"
                          title="Save to library"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-gray-800 whitespace-pre-wrap font-myanmar leading-relaxed">
                        {content.content}
                      </p>
                    </div>
                    
                    {content.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {content.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-block bg-myanmar-100 text-myanmar-800 text-xs px-2 py-1 rounded"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}