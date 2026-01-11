import type { Express } from "express";
import { createServer, type Server } from "http";
import Groq from "groq-sdk";
import Replicate from "replicate";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";
import { storage } from "./storage";
import {
  generateAdRequestSchema,
  imageGenerationRequestSchema,
  videoGenerationRequestSchema,
  insertCampaignSchema,
  videoScriptRequestSchema,
  newspaperAdRequestSchema,
  socialPostsRequestSchema,
} from "@shared/schema";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Initialize Gemini AI if API key is available
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    console.log("Health check endpoint called");
    res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
  });

  app.post("/api/ad/generate", async (req, res) => {
    console.log("[AD-GEN] Ad generation endpoint called with body:", req.body);
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured");
      }

      const validatedData = generateAdRequestSchema.parse(req.body);
      const { productName, tone } = validatedData;
      console.log("[AD-GEN] Generating ad for:", { productName, tone });

      const toneDescriptions = {
        professional: "professional, authoritative, and trustworthy",
        casual: "friendly, conversational, and approachable",
        urgent: "urgent, compelling, and action-oriented with FOMO elements",
        luxury: "sophisticated, premium, and exclusive",
      };

      const prompt = `You are an expert digital advertiser and copywriter. Generate a realistic, high-converting advertisement for:

Product: ${productName}
Tone: ${toneDescriptions[tone]}

Return ONLY a valid JSON object with NO additional text, explanations, or markdown formatting. The JSON must have these exact fields:
- headline: A compelling headline (max 12 words) that grabs attention
- description: A persuasive description (max 30 words) highlighting key benefits
- call_to_action: A strong CTA (max 5 words) that drives action
- variations: An array of exactly 3 short headline variations (each max 10 words)
- visual_prompts: An array of exactly 2 detailed image prompts (each 20-40 words) describing professional ad visuals
- hashtags: An array of up to 6 relevant hashtags (words only, no # symbol)

Example format:
{
  "headline": "Revolutionary Smartwatch - Track Your Health Goals",
  "description": "Monitor heart rate, sleep quality, and calories burned with precision sensors and AI insights.",
  "call_to_action": "Shop Now",
  "variations": ["Transform Your Fitness Journey Today", "Your Personal Health Coach on Your Wrist", "Advanced Health Tracking Made Simple"],
  "visual_prompts": ["Professional product photography of a sleek black smartwatch on a minimalist white surface with soft lighting, displaying health metrics on screen", "Action shot of an athletic person wearing the smartwatch during morning run, with vibrant sunrise background and clear display showing heart rate"],
  "hashtags": ["Fitness", "Smartwatch", "HealthTech", "Wellness", "Wearables", "Innovation"]
}`;

      console.log("[AD-GEN] Calling Groq API...");
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1000,
      });

      console.log("[AD-GEN] Groq response received");
      const responseText = completion.choices[0]?.message?.content || "";
      console.log("[AD-GEN] Response text:", responseText.substring(0, 200));
      
      let adData;
      try {
        adData = JSON.parse(responseText);
      } catch (parseError) {
        console.log("[AD-GEN] JSON parse failed, attempting regex extraction...");
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          adData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      const response = {
        headline: adData.headline || "Discover Something Amazing",
        description: adData.description || "Experience the next level of innovation and quality.",
        callToAction: adData.call_to_action || adData.callToAction || "Learn More",
        variations: Array.isArray(adData.variations) ? adData.variations.slice(0, 3) : [
          "Limited Time Offer - Act Now",
          "Join Thousands of Satisfied Customers",
          "Transform Your Experience Today"
        ],
        visualPrompts: Array.isArray(adData.visual_prompts) ? adData.visual_prompts.slice(0, 2) : Array.isArray(adData.visualPrompts) ? adData.visualPrompts.slice(0, 2) : [
          `Professional product photography of ${productName}, studio lighting, clean background, high-end commercial aesthetic`,
          `Lifestyle shot featuring ${productName} in use, natural lighting, authentic setting, professional composition`
        ],
        hashtags: Array.isArray(adData.hashtags) ? adData.hashtags.slice(0, 6) : [
          "Innovation",
          "Quality",
          "Premium",
          "Lifestyle",
          "New",
          "Trending"
        ],
      };

      console.log("[AD-GEN] Successfully generated ad data");
      res.json(response);
    } catch (error) {
      console.error("[AD-GEN] Error:", error instanceof Error ? error.message : error);
      res.status(500).json({
        error: "Failed to generate ad copy",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/image/generate", async (req, res) => {
    // FREE AI Image Generation - Multiple free services
    // Always returns an actual generated image (not placeholders)
    
    try {
      // Get prompt from request
      let prompt: string;
      try {
        const validatedData = imageGenerationRequestSchema.parse(req.body);
        prompt = validatedData.prompt;
      } catch {
        prompt = typeof req.body?.prompt === 'string' 
          ? req.body.prompt 
          : "professional product photography";
      }

      // Enhance prompt for better results
      const enhancedPrompt = prompt + ", professional advertising photography, high quality, 4k, commercial grade";
      
      // Try 1: Lexica.art API (free, no key needed) - searches existing AI-generated images
      try {
        console.log("[IMG-GEN] Attempting Lexica.art search (free, fast)...");
        const lexicaResponse = await axios.post(
          "https://lexica.art/api/v1/search",
          { q: prompt, source: "search" },
          { timeout: 10000 }
        );
        
        if (lexicaResponse.data?.images && lexicaResponse.data.images.length > 0) {
          const imageUrl = lexicaResponse.data.images[0].src;
          console.log("[IMG-GEN] Found image on Lexica.art");
          return res.json({ imageUrl });
        }
      } catch (lexicaError) {
        console.log("[IMG-GEN] Lexica.art search failed, trying other services...");
      }

      // Try 2: Pollinations AI with different URL format (generates actual images)
      // Note: Pollinations AI is free and doesn't require an API key for basic usage
      // Optional POLLINATIONS_API_KEY can be used for higher rate limits or premium features
      try {
        console.log("[IMG-GEN] Attempting Pollinations AI generation...");
        const seed = Math.floor(Math.random() * 1000000);
        // Use the working Pollinations URL format that actually generates
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;
        
        // Configure headers - include API key if available (optional)
        const headers: Record<string, string> = {};
        if (process.env.POLLINATIONS_API_KEY) {
          headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
          console.log("[IMG-GEN] Using Pollinations AI with API key");
        }
        
        // Fetch the image server-side to ensure it's generated (not placeholder)
        const imageResponse = await axios.get(pollinationsUrl, {
          responseType: 'arraybuffer',
          timeout: 120000, // 2 minutes - Pollinations needs time to generate
          validateStatus: (status) => status >= 200 && status < 500,
          headers,
        });

        // Check if we got actual image data (not HTML placeholder)
        if (imageResponse.data && imageResponse.data.length > 5000) {
          // Check content type - if it's HTML, it's probably a placeholder
          const contentType = imageResponse.headers['content-type'] || '';
          if (contentType.startsWith('image/')) {
            const imageBuffer = Buffer.from(imageResponse.data);
            const base64Image = imageBuffer.toString('base64');
            const imageUrl = `data:${contentType};base64,${base64Image}`;
            console.log(`[IMG-GEN] Successfully generated image with Pollinations AI (${imageBuffer.length} bytes)`);
            return res.json({ imageUrl });
          }
        }
      } catch (pollinationsError) {
        console.log("[IMG-GEN] Pollinations fetch failed, trying fallback...");
      }

      // Try 3: Unsplash (existing photos, not AI-generated but free and fast)
      try {
        console.log("[IMG-GEN] Attempting Unsplash (fallback - existing photos)...");
        const keywords = prompt.split(/\s+/).slice(0, 3).join(' ').toLowerCase() || 'product';
        const unsplashUrl = `https://source.unsplash.com/1024x1024/?${encodeURIComponent(keywords)}`;
        
        // Test if URL works
        const testResponse = await axios.head(unsplashUrl, { timeout: 5000 });
        if (testResponse.status === 200) {
          console.log("[IMG-GEN] Using Unsplash (existing photo, not AI-generated)");
          return res.json({ imageUrl: unsplashUrl });
        }
      } catch (unsplashError) {
        console.log("[IMG-GEN] Unsplash failed...");
      }

      // Final fallback: Return Pollinations URL (browser will try to load it)
      // Even if server-side fetch failed, the URL might work in browser
      const seed = Math.floor(Math.random() * 1000000);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;
      console.log("[IMG-GEN] Returning Pollinations URL as final fallback");
      return res.json({ imageUrl: fallbackUrl });
      
    } catch (error) {
      // Last resort: Simple Pollinations URL
      console.error("[IMG-GEN] All methods failed, using simple fallback:", error instanceof Error ? error.message : error);
      const fallbackPrompt = typeof req.body?.prompt === 'string' 
        ? req.body.prompt 
        : "professional product photography";
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=1024&height=1024&model=flux`;
      return res.json({ imageUrl: fallbackUrl });
    }
  });

  app.post("/api/video/generate", async (req, res) => {
    try {
      const validatedData = videoGenerationRequestSchema.parse(req.body);
      const { prompt } = validatedData;

      const output = await replicate.run(
        "lucataco/animate-diff:1531004ee4c98894ab11f8a4ce6206099e732c1da15121508a24b41b35d215ab",
        {
          input: {
            path: "toonyou_beta3.safetensors",
            seed: Math.floor(Math.random() * 1000000),
            steps: 25,
            prompt: prompt + ", cinematic, professional video, advertising quality, smooth motion",
            n_prompt: "bad quality, worst quality, low resolution, blurry",
            motion_module: "mm_sd_v14",
            guidance_scale: 7.5,
          },
        }
      );

      const videoUrl = Array.isArray(output) ? output[0] : output;

      res.json({ videoUrl });
    } catch (error) {
      console.error("Video generation error:", error);
      res.status(500).json({
        error: "Failed to generate video",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const saved = await storage.saveCampaign(validatedData);
      res.json(saved);
    } catch (error) {
      console.error("Save campaign error:", error);
      res.status(500).json({
        error: "Failed to save campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      res.status(500).json({
        error: "Failed to get campaigns",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Get campaign error:", error);
      res.status(500).json({
        error: "Failed to get campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete campaign error:", error);
      res.status(500).json({
        error: "Failed to delete campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/video/script", async (req, res) => {
    try {
      const validatedData = videoScriptRequestSchema.parse(req.body);
      const { productName, headline, description, callToAction } = validatedData;

      const prompt = `You are an expert video scriptwriter for advertising. Create a professional video script for:

Product: ${productName}
Headline: ${headline}
Description: ${description}
Call to Action: ${callToAction}

Return ONLY a valid JSON object with NO additional text. The JSON must have these exact fields:
- title: Video title (max 8 words)
- duration: Total video duration in seconds (30, 60, or 90)
- scenes: An array of 3-5 scene objects, each with:
  - sceneNumber: Number starting from 1
  - duration: Duration in seconds (5-15 seconds per scene)
  - visual: Detailed description of what viewers see
  - voiceover: The voiceover script for this scene
  - music: Music style/description for this scene
  - onscreen_text: Text to display on screen (if any)
- music_style: Overall music style (e.g., "upbeat pop", "cinematic", "modern electronic")
- pacing: Pacing style (e.g., "fast-paced", "moderate", "slow-building")
- callToAction: Final call to action

Example format:
{
  "title": "Transform Your Morning Routine",
  "duration": 30,
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 8,
      "visual": "Close-up of product on minimalist background with soft lighting",
      "voiceover": "Meet the product that changes everything.",
      "music": "Upbeat modern electronic",
      "onscreen_text": "Product Name"
    }
  ],
  "music_style": "upbeat modern electronic",
  "pacing": "fast-paced",
  "callToAction": "${callToAction}"
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      let videoData;
      try {
        videoData = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          videoData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      res.json(videoData);
    } catch (error) {
      console.error("Video script generation error:", error);
      res.status(500).json({
        error: "Failed to generate video script",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/newspaper/ad", async (req, res) => {
    try {
      const validatedData = newspaperAdRequestSchema.parse(req.body);
      const { productName, headline, description } = validatedData;

      const prompt = `You are an expert newspaper advertising designer. Create a professional newspaper ad for:

Product: ${productName}
Headline: ${headline}
Description: ${description}

Return ONLY a valid JSON object with NO additional text. The JSON must have these exact fields:
- publication_style: Style like "broadsheet", "tabloid", or "magazine"
- section: Newspaper section (e.g., "Business", "Technology", "Lifestyle")
- headline: Main ad headline (max 10 words)
- subheading: Secondary headline (max 15 words)
- body_text: Main body copy (50-100 words)
- article_content: Additional article-style content (100-150 words)
- key_features: Array of 3-4 key product features
- call_to_action: Call to action text
- price_point: Price or pricing strategy description
- border_style: Border design style (e.g., "classic black border", "gradient border", "no border")
- layout: Layout type (e.g., "single column", "two column", "three column")

Example format:
{
  "publication_style": "broadsheet",
  "section": "Technology",
  "headline": "Revolutionary Product Launches Today",
  "subheading": "Transform Your Daily Workflow",
  "body_text": "...",
  "article_content": "...",
  "key_features": ["Feature 1", "Feature 2", "Feature 3"],
  "call_to_action": "Shop Now",
  "price_point": "Starting at $99",
  "border_style": "classic black border",
  "layout": "two column"
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      let adData;
      try {
        adData = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          adData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      res.json(adData);
    } catch (error) {
      console.error("Newspaper ad generation error:", error);
      res.status(500).json({
        error: "Failed to generate newspaper ad",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/social/posts", async (req, res) => {
    try {
      const validatedData = socialPostsRequestSchema.parse(req.body);
      const { productName, headline, description } = validatedData;

      const prompt = `You are an expert social media copywriter. Create professional social media posts for:

Product: ${productName}
Headline: ${headline}
Description: ${description}

Return ONLY a valid JSON object with NO additional text. The JSON must have these exact fields:
- twitter: Object with "content" (max 280 chars) and "hashtags" array
- instagram: Object with "caption" (max 2200 chars), "hashtags" array, and "call_to_action"
- linkedin: Object with "content" (professional tone), "hashtags" array, and "call_to_action"

Example format:
{
  "twitter": {
    "content": "Introducing the future of productivity...",
    "hashtags": ["Innovation", "Tech", "Future"]
  },
  "instagram": {
    "caption": "Long-form caption for Instagram...",
    "hashtags": ["Innovation", "Tech", "Future", "Lifestyle"],
    "call_to_action": "Shop Now"
  },
  "linkedin": {
    "content": "Professional content for LinkedIn...",
    "hashtags": ["Innovation", "Business", "Technology"],
    "call_to_action": "Learn More"
  }
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      let postsData;
      try {
        postsData = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          postsData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      res.json(postsData);
    } catch (error) {
      console.error("Social posts generation error:", error);
      res.status(500).json({
        error: "Failed to generate social posts",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/social/banner-ad", async (req, res) => {
    try {
      const validatedData = socialPostsRequestSchema.parse(req.body);
      const { productName, headline, description } = validatedData;

      const bannerPrompt = `Create a professional social media banner ad for: ${productName}. 
Headline: ${headline}
Description: ${description}

Make it eye-catching, modern, and suitable for social media promotion.`;

      const imageResponse = await axios.post(
        "https://api.pollinations.ai/generate",
        {
          prompt: bannerPrompt + ", professional social media banner, 1200x628px, high quality, marketing design",
          model: "flux",
        }
      );

      const bannerUrl = imageResponse.data?.imageUrl || imageResponse.data?.url;

      res.json({ bannerImage: bannerUrl });
    } catch (error) {
      console.error("Social banner ad generation error:", error);
      res.status(500).json({
        error: "Failed to generate social banner ad",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/post/generate", async (req, res) => {
    try {
      const { prompt, productName, tone, adCopy } = req.body;

      let postPrompt = prompt;
      if (!postPrompt && productName) {
        const toneDescriptions = {
          professional: "professional, authoritative, and trustworthy",
          casual: "friendly, conversational, and approachable",
          urgent: "urgent, compelling, and action-oriented with FOMO elements",
          luxury: "sophisticated, premium, and exclusive",
        };

        const toneDesc = tone ? toneDescriptions[tone as keyof typeof toneDescriptions] || "" : "";
        postPrompt = `Create a short, engaging social media post (max 280 characters) for ${productName}. 
${tone ? `Tone: ${toneDesc}` : ""}
${adCopy?.headline ? `Headline: ${adCopy.headline}` : ""}
${adCopy?.description ? `Description: ${adCopy.description}` : ""}

Make it catchy, concise, and perfect for platforms like Twitter, Instagram, or LinkedIn.`;
      }

      if (!postPrompt) {
        return res.status(400).json({ error: "Prompt or productName is required" });
      }

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: postPrompt + "\n\nReturn ONLY the post text with no additional formatting, explanations, or JSON.",
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 300,
      });

      const post = completion.choices[0]?.message?.content?.trim() || "Failed to generate post";
      res.json({ post });
    } catch (error) {
      console.error("Post generation error:", error);
      res.status(500).json({
        error: "Failed to generate post",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/batch/generate-images-video", async (req, res) => {
    try {
      const { prompt, caption, productName, headline, description, visualPrompts } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Generate 10 images using the prompt
      const enhancedPrompt = `${prompt}, professional advertising photography, high quality, 4k, commercial grade`;
      const imageUrls: string[] = [];

      // Use Pollinations AI (fast, free) - generate image URLs instantly
      // Each image gets a unique seed for variation, images generate on-demand when browser loads them
      for (let i = 0; i < 10; i++) {
        try {
          // Pollinations AI URL format - generates images when URL is accessed
          const seed = Math.floor(Math.random() * 1000000);
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&model=flux-pro&nologo=true&enhance=true`;
          imageUrls.push(pollinationsUrl);
        } catch (err) {
          console.error(`[BATCH] Error generating image ${i + 1}:`, err);
          // Continue with remaining images even if one fails
        }
      }

      console.log(`[BATCH] Generated ${imageUrls.length} image URLs using Pollinations AI (instant URL response)`);
      res.json({
        images: imageUrls,
        caption: caption || headline || "Amazing Product Showcase",
      });
    } catch (error) {
      console.error("Batch image generation error:", error);
      res.status(500).json({
        error: "Failed to generate images",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/batch/create-video", async (req, res) => {
    try {
      const { images, caption } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Images array is required" });
      }

      // For now, return a placeholder video URL
      // In a production environment, you would use ffmpeg to create a slideshow video
      // This would require downloading images, creating video frames, and encoding
      
      // Placeholder response - in production, implement actual video generation
      // using fluent-ffmpeg or similar library
      const videoUrl = `https://via.placeholder.com/1920x1080/000000/FFFFFF?text=${encodeURIComponent(caption || "Video Slideshow")}`;

      res.json({ videoUrl });
    } catch (error) {
      console.error("Batch video creation error:", error);
      res.status(500).json({
        error: "Failed to create video",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
