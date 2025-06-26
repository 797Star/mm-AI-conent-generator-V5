import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ContentRequest {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestData: ContentRequest = await req.json()

    // Generate Myanmar content variations
    const contentVariations = await generateMyanmarContent(requestData)

    return new Response(
      JSON.stringify({ content: contentVariations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate content' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generateMyanmarContent(data: ContentRequest): Promise<GeneratedContent[]> {
  // Construct cultural context and tone guidelines
  const culturalContext = `
မြန်မာ့လူမှုကွန်ယက်ရှိ လုပ်ငန်းအတွက် content ရေးသားရာတွင် အောက်ပါအချက်များကို လိုက်နာပါ:

လုပ်ငန်းအမည်: ${data.businessName}
ကုန်ပစ္စည်း/ဝန်ဆောင်မှု: ${data.productService}
ပစ်မှတ်အုပ်စု: ${data.targetAudience}
Platform: ${data.platform}
Content အမျိုးအစား: ${data.contentType}
လေသံ: ${data.tone}
Brand ကျားမ: ${data.brandGender}

Myanmar Cultural Guidelines:
- မြန်မာ့ယဉ်ကျေးမှုနှင့် ကိုက်ညီသော ယဉ်ကျေးသော ဘာသာစကားသုံးပါ
- ${data.brandGender === 'male' ? 'ကျွန်တော်' : data.brandGender === 'female' ? 'ကျွန်မ' : 'ကျွန်တော်/ကျွန်မ'} ကဲ့သို့ သင့်လျော်သော နာမ်စားသုံးပါ
- လူမှုကွန်ယက်တွင် ရေပန်းစားသော hashtag များ ထည့်သွင်းပါ
- Myanmar Unicode ဖြင့် မှန်ကန်စွာ ရေးသားပါ
- ခံစားချက်ဖြင့် ချမ်းသာသော content ဖန်တီးပါ

Tone သတ်မှတ်ချက်:
${getToneGuidelines(data.tone)}

${data.additionalInfo ? `နောက်ထပ်လိုအပ်ချက်: ${data.additionalInfo}` : ''}
`

  // Generate content variations
  const variations: GeneratedContent[] = []
  
  for (let i = 0; i < 3; i++) {
    const content = await generateSingleContent(culturalContext, data, i + 1)
    variations.push(content)
  }

  return variations
}

function getToneGuidelines(tone: string): string {
  const toneMap: { [key: string]: string } = {
    professional: 'ပရော်ဖက်ရှင်နယ် နှင့် ယုံကြည်စိတ်ချရသော လေသံဖြင့် ရေးသားပါ',
    friendly: 'ဖော်ရွေ့ပျော်ရွှင်သော လေသံဖြင့် ရေးသားပါ',
    casual: 'ပေါ့ပေါ့ပါးပါး သဘာဝကျသော လေသံဖြင့် ရေးသားပါ',
    enthusiastic: 'စိတ်လှုပ်ရှားစရာ ကောင်းသော လေသံဖြင့် ရေးသားပါ'
  }
  return toneMap[tone] || toneMap.professional
}

async function generateSingleContent(context: string, data: ContentRequest, variation: number): Promise<GeneratedContent> {
  // Simulated AI content generation - In production, integrate with OpenAI/Gemini API
  const templates = {
    facebook: [
      `🌟 ${data.businessName} မှ ${data.productService} အတွက် အထူးကမ်းလှမ်းချက်! 

${data.targetAudience} အတွက် အထူးရည်ရွယ်ထားသော ကျွန်${data.brandGender === 'female' ? 'မ' : 'တော်'}တို့၏ ဝန်ဆောင်မှုများကို မြန်မာ့ယဉ်ကျေးမှုနှင့် ကိုက်ညီအောင် ပြင်ဆင်ထားပါသည်။

📞 ဆက်သွယ်စုံစမ်းရန် - [ဖုန်းနံပါတ်]
📍 လိပ်စာ - [လိပ်စာ]

#${data.businessName.replace(/\s+/g, '')} #Myanmar #${data.platform} #QualityService #မြန်မာ`,

      `✨ ${data.businessName} ဂုဏ်ယူစွာတင်ပြပါသည်! 

ကျွန်${data.brandGender === 'female' ? 'မ' : 'တော်'}တို့၏ ${data.productService} သည် ${data.targetAudience} များအတွက် အထူးဖန်တီးထားပါသည်။ 

မြန်မာ့အရသာနှင့် နိုင်ငံတကာ အရည်အသွေးကို ပေါင်းစပ်ထားသော ကျွန်${data.brandGender === 'female' ? 'မ' : 'တော်'}တို့၏ ထုတ်ကုန်များကို စမ်းသပ်ကြည့်ပါ။

🎯 လာရောက်ဝယ်ယူရန် ဖိတ်ကြားပါသည်!

#MyanmarBusiness #Quality #${data.platform}Content #ကိုယ်ပိုင်လုပ်ငန်း`,

      `🔥 ${data.businessName} Hot Deal! 

${data.targetAudience} တွေအတွက် အထူးလျှော့စျေး! ကျွန်${data.brandGender === 'female' ? 'မ' : 'တော်'}တို့ရဲ့ ${data.productService} ကို အခုပဲ အာဒါမှာလိုက်ပါ။

💰 အထူးစျေးနှုန်း
⏰ ကန့်သတ်ချိန်အတွင်းသာ
🎁 အခမဲ့ဒေလီဗရီ

ခု order လုပ်လိုက်ပါ!

#${data.businessName} #SpecialOffer #Myanmar #OrderNow`
    ],
    instagram: [
      `${data.businessName} 💫

${data.productService} for ${data.targetAudience} 

#${data.businessName.replace(/\s+/g, '')} #Myanmar #Insta #Quality #Local`,

      `✨ Premium ${data.productService} ✨

Perfect for ${data.targetAudience}
📍 Myanmar
🔥 Order now!

#MyanmarBusiness #Premium #Instagram #${data.platform}`
    ]
  }

  const platformTemplates = templates[data.platform as keyof typeof templates] || templates.facebook
  const selectedTemplate = platformTemplates[variation % platformTemplates.length]

  // Generate quality metrics (simulated)
  const qualityScore = Math.floor(Math.random() * 20) + 80 // 80-100%
  const engagementPrediction = Math.floor(Math.random() * 30) + 60 // 60-90%

  // Extract keywords
  const keywords = extractKeywords(data)

  return {
    id: `content_${variation}_${Date.now()}`,
    content: selectedTemplate,
    quality_score: qualityScore,
    engagement_prediction: engagementPrediction,
    keywords: keywords
  }
}

function extractKeywords(data: ContentRequest): string[] {
  const keywords: string[] = []
  
  // Add business-related keywords
  keywords.push(data.businessName.replace(/\s+/g, ''))
  keywords.push('Myanmar')
  keywords.push(data.platform)
  
  // Add content type keywords
  if (data.contentType === 'promotion') {
    keywords.push('SpecialOffer', 'Promotion', 'Deal')
  } else if (data.contentType === 'announcement') {
    keywords.push('News', 'Update', 'Announcement')
  }
  
  // Add tone-based keywords
  if (data.tone === 'professional') {
    keywords.push('Professional', 'Quality')
  } else if (data.tone === 'friendly') {
    keywords.push('Friendly', 'Welcome')
  }
  
  return keywords.slice(0, 5) // Limit to 5 keywords
}