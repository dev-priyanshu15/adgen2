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
  eventPosterRequestSchema,
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

  // Image proxy - fetches external image and streams it (avoids CORS issues in browser)
  app.get("/api/image/proxy", async (req, res) => {
    const url = req.query.url as string;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing url query parameter" });
    }
    const allowedHosts = [
      "image.pollinations.ai",
      "image.lexica.art",
      "lexica.art",
      "lexica-serve-encoded-images.sharif.workers.dev",
      "picsum.photos",
      "images.unsplash.com",
      "source.unsplash.com",
    ];
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid url" });
    }
    if (!allowedHosts.includes(parsed.hostname)) {
      return res.status(403).json({ error: "Domain not allowed" });
    }
    try {
      const resp = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 90000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/*,*/*",
        },
      });
      const ct = resp.headers["content-type"] || "image/png";
      res.setHeader("Content-Type", ct);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(resp.data));
    } catch (err) {
      console.error("[IMG-PROXY] Fetch failed, using Picsum fallback:", err instanceof Error ? err.message : err);
      try {
        const seed = Math.floor(Math.random() * 1000000);
        const fallbackResp = await axios.get(`https://picsum.photos/seed/${seed}/1024/1024`, {
          responseType: "arraybuffer",
          timeout: 15000,
          headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0", Accept: "image/*" },
        });
        res.setHeader("Content-Type", fallbackResp.headers["content-type"] || "image/jpeg");
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(Buffer.from(fallbackResp.data));
      } catch {
        res.status(502).json({ error: "Failed to fetch image" });
      }
    }
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

  app.post('/api/image/generate', async (req, res) => {
    try {
      let prompt: string;
      let productName = req.body?.productName || '';
      try {
        const validatedData = imageGenerationRequestSchema.parse(req.body);
        prompt = validatedData.prompt;
        if (validatedData.productName) productName = validatedData.productName;
      } catch {
        prompt = typeof req.body?.prompt === 'string'
          ? req.body.prompt
          : 'professional product photography';
      }

      console.log('[IMG-GEN] Generating with OpenRouter Free FLUX...');

      // Build a prompt that forces the subject to be the product explicitly
      const finalPrompt = productName
        ? `A hyper-realistic professional product photography shot of a ${productName}. ${prompt}, professional advertising photography, high quality, 4k, commercial`
        : `${prompt}, professional advertising photography, high quality, 4k, commercial`;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'black-forest-labs/flux.2-klein-4b',
          messages: [{ role: 'user', content: finalPrompt }],
          modalities: ['image']
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://adgenius.app',
            'X-Title': 'AdGenius',
          },
          timeout: 60000,
        }
      );

      // Extract image URL from the chat completion response
      const imageUrl = response.data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
        response.data?.choices?.[0]?.message?.images?.[0]?.url;

      if (!imageUrl) {
        console.error('[IMG-GEN] No image in response:', JSON.stringify(response.data));
        throw new Error('No image URL in response');
      }

      console.log('[IMG-GEN] Success with OpenRouter Free Model');
      return res.json({ imageUrl });

    } catch (error: any) {
      console.error('[IMG-GEN] OpenRouter failed:', error.response?.data || error.message);
      const seed = Math.floor(Math.random() * 1000);
      return res.json({
        imageUrl: `https://picsum.photos/seed/${seed}/1024/1024`
      });
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

  app.post("/api/event/poster", async (req, res) => {
    console.log("[EVENT-POSTER] Request received:", req.body);
    try {
      const validatedData = eventPosterRequestSchema.parse(req.body);
      const { eventName, eventDate, eventTime, venue, description, theme, primaryColor } = validatedData;

      const prompt = `You are a high-end graphic designer and copywriter. Generate structured content for a professional event poster.
      
      Event: ${eventName}
      Date: ${eventDate}
      Time: ${eventTime}
      Venue: ${venue}
      Description: ${description}
      Theme: ${theme}
      Primary Color: ${primaryColor}

      Return ONLY a valid JSON object with these exact fields:
      - headline: Catchy and bold event title (max 8 words)
      - tagline: Enticing sub-headline (max 12 words)
      - dateTimeBlock: Formatted date and time string
      - venueBlock: Formatted venue address
      - descriptionBlock: Concise, punchy event description (max 25 words)
      - highlightPoints: Array of exactly 3 key highlights or features of the event
      - ctaText: Short action-oriented button text (e.g., "Join the Summit", "Get Tickets")
      - colorScheme: Object with { primary, secondary, accent } hex codes matching the ${theme} theme and ${primaryColor} color.
      - layoutSuggestion: Briefly describe the recommended layout (max 10 words).
      - backgroundStyle: One sentence describing the ideal AI background image prompt.

      Return ONLY raw JSON. No markdown. No chatter.`;

      console.log("[EVENT-POSTER] Calling Groq with JSON mode...");
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      let responseText = completion.choices[0]?.message?.content || "";
      console.log("[EVENT-POSTER] Raw response length:", responseText.length);
      
      let posterData;
      try {
        // First try direct parse
        posterData = JSON.parse(responseText);
      } catch (e) {
        console.log("[EVENT-POSTER] Direct parse failed, trying cleanup...");
        // Clean up common JSON issues (trailing commas, comments, etc.)
        const cleaned = responseText
          .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas before ] or }
          .match(/\{[\s\S]*\}/); // Extract only the JSON part
        
        if (cleaned) {
          try {
            posterData = JSON.parse(cleaned[0]);
          } catch (innerError) {
            console.error("[EVENT-POSTER] Cleanup parse failed:", innerError);
            throw new Error("Invalid JSON structure from AI");
          }
        } else {
          throw new Error("No JSON found in AI response");
        }
      }

      if (!posterData) throw new Error("Failed to generate poster data");

      // Generate dynamic background image using OpenRouter Flux
      const bgPrompt = posterData.backgroundStyle || `${eventName} ${theme} event background, professional photography`;
      console.log("[EVENT-POSTER] Generating background image with OpenRouter Flux...");
      
      try {
        const imageResponse = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'black-forest-labs/flux.2-klein-4b',
            messages: [{ role: 'user', content: bgPrompt + ", vertical orientation, professional event background, high quality, 4k" }],
            modalities: ['image']
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://adgenius.app',
              'X-Title': 'AdGenius',
            },
            timeout: 60000,
          }
        );

        const imageUrl = imageResponse.data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
          imageResponse.data?.choices?.[0]?.message?.images?.[0]?.url;

        if (imageUrl) {
          console.log("[EVENT-POSTER] Image Success:", imageUrl);
          posterData.imageUrl = imageUrl;
        }
      } catch (imgError: any) {
        console.error("[EVENT-POSTER] Image Gen failed, using fallback:", imgError.message);
        // Fallback or just leave as undefined to use frontend static fallbacks
      }

      console.log("[EVENT-POSTER] Success");
      res.json(posterData);

    } catch (error: any) {
      console.error("[EVENT-POSTER] Error:", error.message);
      res.status(500).json({ error: "Failed to generate event poster", message: error.message });
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
      const { prompt, caption, headline, productName } = req.body;

      if (!prompt && !headline && !productName) {
        return res.status(400).json({ error: 'Prompt or productName is required' });
      }

      // If we have a productName, use it as the solid foundation for all variations
      let baseSubject = productName
        ? `A hyper-realistic professional product photography shot of a ${productName}`
        : (prompt || headline || 'professional product photography').split(',')[0].trim();

      const basePrompt = productName && prompt
        ? `${baseSubject}. ${prompt.split(',')[0].trim()}`
        : baseSubject;

      const variations = [
        basePrompt,
        `${basePrompt} close up shot`,
        `${basePrompt} lifestyle photography`,
        `${basePrompt} white background studio`,
        `${basePrompt} outdoor natural light`,
        `${basePrompt} professional advertisement`,
        `${basePrompt} product showcase`,
        `${basePrompt} commercial photography`,
        `${basePrompt} minimalist style`,
        `${basePrompt} premium quality`,
      ]

      console.log('[BATCH] Generating 10 images with OpenRouter Free Model...');

      const imagePromises = variations.map(async (variationPrompt, i) => {
        try {
          const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'black-forest-labs/flux.2-klein-4b',
              messages: [{ role: 'user', content: variationPrompt + ', professional advertising photography, high quality' }],
              modalities: ['image']
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://adgenius.app',
                'X-Title': 'AdGenius',
              },
              timeout: 60000,
            }
          );

          return response.data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
            response.data?.choices?.[0]?.message?.images?.[0]?.url ||
            `https://picsum.photos/seed/${Date.now() + i}/1024/1024`;

        } catch (e: any) {
          console.error('[BATCH] Single image failed:', e.message);
          return `https://picsum.photos/seed/${Date.now() + i}/1024/1024`;
        }
      });

      const results = await Promise.allSettled(imagePromises);
      const images = results
        .map(r => r.status === 'fulfilled' ? r.value : null)
        .filter(Boolean);

      while (images.length < 10) {
        images.push(`https://picsum.photos/seed/${Date.now() + images.length}/1024/1024`);
      }

      console.log(`[BATCH] Done: ${images.length} images`);
      return res.json({
        images,
        caption: caption || headline || 'Product Campaign'
      });

    } catch (error: any) {
      console.error('[BATCH] Error:', error.message);
      const images = Array.from({ length: 10 }, (_, i) =>
        `https://picsum.photos/seed/${Date.now() + i}/1024/1024`
      );
      return res.json({ images, caption: 'Product Campaign' });
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
