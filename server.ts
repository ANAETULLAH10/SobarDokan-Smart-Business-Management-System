import express from 'express';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey,
    });
  }
  return aiClient;
}

/**
 * Parses raw Gemini ApiErrors / network errors into clean, informative messages.
 * Detects 503 high demand, 429 rate limit, and unwraps JSON message bodies.
 */
function formatGeminiError(err: any): { message: string; isHighDemand: boolean; isRateLimit: boolean } {
  const raw = String(err?.message || (typeof err === 'string' ? err : JSON.stringify(err || '')));
  const isHighDemand =
    raw.includes('503') ||
    raw.includes('UNAVAILABLE') ||
    raw.includes('high demand') ||
    raw.includes('overloaded') ||
    raw.includes('temporarily unavailable');

  const isRateLimit =
    raw.includes('429') ||
    raw.includes('RESOURCE_EXHAUSTED') ||
    raw.includes('quota');

  if (isHighDemand) {
    return {
      message: 'মডেলটিতে বর্তমানে সাময়িক উচ্চ চাপ রয়েছে (503 High Demand)। কিছুক্ষণের মধ্যে পুনরায় চেষ্টা করা হচ্ছে...',
      isHighDemand: true,
      isRateLimit: false,
    };
  }

  if (isRateLimit) {
    return {
      message: 'অনুরোধের সীমা অতিক্রম করেছে (429 Rate Limit)। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।',
      isHighDemand: false,
      isRateLimit: true,
    };
  }

  // Attempt to extract clean message from embedded JSON like ApiError: {"error":{"message":...}}
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error && parsed.error.message) {
        return {
          message: parsed.error.message,
          isHighDemand: false,
          isRateLimit: false,
        };
      }
    }
  } catch {
    // ignore parse error
  }

  const clean = raw.replace(/^ApiError:\s*/, '').replace(/\{[\s\S]*\}/, '').trim();
  return {
    message: clean || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    isHighDemand: false,
    isRateLimit: false,
  };
}

/**
 * Provides an intelligent local store management response when the upstream AI model is temporarily experiencing high demand (503).
 */
function getSmartStoreFallback(prompt: string, context?: any): string {
  const p = prompt.toLowerCase();
  
  if (p.includes('বাকি') || p.includes('due') || p.includes('খাতা') || p.includes('টাকা তোলা') || p.includes('উসুল')) {
    return (
      "দোকানের বাকি খাতা (Due Ledger) সফলভাবে আদায় ও পরিচালনার পরামর্শ:\n\n" +
      "১. বাকির সর্বোচ্চ সীমা (Limit) নির্ধারণ: প্রত্যেক নিয়মিত কাস্টমারের জন্য বাকির একটি সুনির্দিষ্ট লিমিট ঠিক রাখুন (যেমন ৳২,০০০ বা ৳৫,০০০)।\n" +
      "২. নির্দিষ্ট দিন অন্তর তাগাদা: অমরদোকানের 'বাকি খাতা' মেনু থেকে বকেয়ার তালিকা দেখে প্রতি শুক্রবার বা নির্দিষ্ট দিনে ভদ্রভাবে এসএমএস/ফোন দিয়ে মনে করিয়ে দিন।\n" +
      "৩. কিস্তিতে আদায়: বড় অঙ্কের বাকি আটকে থাকলে একবারে না চেয়ে প্রতি সপ্তাহে কিস্তিতে (যেমন ৳৫০০ করে) আদায়ের প্রস্তাব দিন।\n" +
      "৪. রসিদ ও স্বচ্ছতা: প্রতি লেনদেনে ডিজিটাল ইনভয়েস ও রসিদ প্রদান করুন যাতে কোনো ভুল বোঝাবুঝি না হয়।"
    );
  }

  if (p.includes('বিক্রি') || p.includes('সেল') || p.includes('sales') || p.includes('লাভ') || p.includes('উন্নতি') || p.includes('গ্রাহক')) {
    return (
      "দোকানের বিক্রি ও মুনাফা বৃদ্ধির কার্যকর কৌশল:\n\n" +
      "১. শীর্ষ বিক্রিত পণ্য মজুত রাখা: অমরদোকানের 'রিপোর্ট' মেনুতে দেখুন কোন পণ্যগুলো সবচেয়ে বেশি চলে, সেগুলো সবসময় স্টকে রাখুন।\n" +
      "২. কম্বো ও বান্ডেল অফার: ধীরগতির পণ্যের সাথে জনপ্রিয় পণ্য একসাথে বিশেষ ছাড়ে বিক্রির ব্যবস্থা করুন।\n" +
      "৩. ডিজিটাল পেমেন্ট সুবিধা: bKash, Nagad ও কার্ড গ্রহণ করলে ক্রেতাদের কেনাকাটার সিদ্ধান্ত দ্রুত হয়।\n" +
      "৪. বন্ধুত্বপূর্ণ ব্যবহার ও লয়্যালটি: নিয়মিত গ্রাহকদের ছোটখাটো ছাড় বা বিশেষ খাতির দিয়ে দোকানে ধরে রাখুন।"
    );
  }

  if (p.includes('স্টক') || p.includes('stock') || p.includes('পণ্য') || p.includes('ইনভেন্টরি')) {
    return (
      "ইনভেন্টরি ও স্টক নিয়ন্ত্রণের সহজ নিয়ম:\n\n" +
      "১. লো-স্টক অ্যালার্ট খেয়াল রাখুন: অমরদোকান ড্যাশবোর্ডে যেসব পণ্যে লাল সতর্কতা রয়েছে সেগুলো দ্রুত অর্ডারের তালিকাভুক্ত করুন।\n" +
      "২. FIFO পদ্ধতি: যেসব পণ্য আগে এসেছে বা যাদের মেয়াদ কম, সেগুলো ডিসপ্লেতে সামনে রাখুন যাতে ক্ষতি না হয়।\n" +
      "৩. নিয়মিত স্টক নিরীক্ষা: মাসে একবার ফিজিক্যাল স্টকের সাথে অমরদোকানের সফটওয়্যার স্টক মিলিয়ে অসঙ্গতি রোধ করুন।"
    );
  }

  return (
    "বর্তমানে এআই মডেলে সাময়িক উচ্চ চাপ রয়েছে (Temporary High Demand)। " +
    "আপনার অমরদোকান সিস্টেমের সকল ডাটা, পিওএস বিক্রি, পণ্য তালিকা ও বাকির হিসাব সম্পূর্ণ সুরক্ষিত আছে। " +
    "অনুগ্রহ করে কয়েক মুহূর্ত পর পুনরায় প্রশ্ন করুন অথবা উপরে উল্লেখিত মেনু ব্যবহার করুন।"
  );
}

/**
 * Calls Gemini with automatic retries, backoff, and model fallback if high demand (503) or rate limit is encountered.
 */
async function generateContentWithResilience(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction: string,
  businessContext?: any
): Promise<{ text: string; modelUsed: string; fallbackUsed?: boolean }> {
  // Primary model and verified active fallback model
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.6-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const callPromise = ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('503: Request timed out due to temporary model high demand.')), 8000)
        );

        const response = await Promise.race([callPromise, timeoutPromise]);

        const text = response.text || '';
        if (text) {
          return {
            text,
            modelUsed: model,
            fallbackUsed: model !== 'gemini-3.8-flash',
          };
        }
      } catch (err: any) {
        lastError = err;
        const errInfo = formatGeminiError(err);
        console.warn(`[Gemini Resilient] Attempt ${attempt} on ${model} encountered: ${errInfo.message}`);

        if (errInfo.isHighDemand || errInfo.isRateLimit) {
          if (attempt < 2) {
            // Wait 800ms with jitter before retry on same model
            await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
            continue;
          }
          // Break to next candidate model
          break;
        } else {
          // Other non-transient error, break immediately
          break;
        }
      }
    }
  }

  // If both models experienced high demand, return the smart store assistance instead of crashing
  const finalErrInfo = formatGeminiError(lastError);
  if (finalErrInfo.isHighDemand) {
    return {
      text: getSmartStoreFallback(prompt, businessContext),
      modelUsed: 'offline-smart-assistant',
      fallbackUsed: true,
    };
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health and status endpoints
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/gemini/status', (_req, res) => {
    res.json({
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      liveModel: 'gemini-3.8-live',
      flashModel: 'gemini-3.8-flash',
    });
  });

  // Fallback text endpoint with resilient retries and graceful 503 high-demand handling
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { prompt, businessContext } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      const ai = getAi();
      const systemInstruction = `You are the smart AI assistant for AmarDokan (আমারদোকান), a comprehensive business management and POS platform in Bangladesh.
You assist retail owners and managers with sales tips, inventory management, bookkeeping, due ledger (বাকি খাতা) collection strategies, and expense tracking.
Respond fluently in Bengali or English depending on user query. Keep responses clear, polite, and actionable.${
  businessContext ? `\nCurrent store context: ${JSON.stringify(businessContext)}` : ''
}`;

      const result = await generateContentWithResilience(ai, prompt, systemInstruction, businessContext);
      console.log('[API] /api/gemini/chat success, modelUsed:', result.modelUsed);
      return res.json(result);
    } catch (err: any) {
      console.error('Gemini chat API error:', err);
      const parsedError = formatGeminiError(err);
      
      // If downstream error is due to high demand (503 UNAVAILABLE), supply smart store fallback
      if (parsedError.isHighDemand) {
        return res.json({
          text: getSmartStoreFallback(req.body?.prompt || '', req.body?.businessContext),
          isFallback: true,
          notice: parsedError.message,
        });
      }

      return res.status(500).json({
        error: parsedError.message || 'Failed to generate response from Gemini API',
      });
    }
  });

  const server = http.createServer(app);

  // WebSocket Server for Gemini Live API (gemini-3.8-live)
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (url.pathname === '/api/live' || url.pathname === '/live') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch (e) {
      socket.destroy();
    }
  });

  wss.on('connection', (clientWs: WebSocket) => {
    console.log('[Live API] Client connected to WebSocket');
    let liveSession: any = null;
    let isConnecting = false;

    async function initSession(voiceName = 'Zephyr', customInstruction?: string) {
      if (isConnecting) return;
      isConnecting = true;

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          clientWs.send(
            JSON.stringify({
              type: 'error',
              error: 'GEMINI_API_KEY is not configured in environment variables.',
            })
          );
          isConnecting = false;
          return;
        }

        const ai = getAi();
        const baseInstruction =
          "You are the real-time AI voice assistant for 'AmarDokan' (আমারদোকান) POS and retail store system. " +
          "You assist the store owner with daily sales, stock management, dues (বাকি খাতা), business advice, and customer relations. " +
          "You speak warmly and naturally in both Bengali (বাংলা) and English. Keep spoken voice responses concise, conversational, and direct.";

        liveSession = await ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
            systemInstruction: customInstruction || baseInstruction,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              if (clientWs.readyState !== WebSocket.OPEN) return;

              // Forward model audio chunks (PCM 24kHz)
              const parts = message.serverContent?.modelTurn?.parts || [];
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'audio',
                      audio: part.inlineData.data,
                    })
                  );
                }
                if (part.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'text',
                      text: part.text,
                    })
                  );
                }
              }

              // Handle interruption
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: 'interrupted' }));
              }

              // Handle turn complete
              if (message.serverContent?.turnComplete) {
                clientWs.send(JSON.stringify({ type: 'turnComplete' }));
              }
            },
            onerror: (err: any) => {
              console.error('[Live API] Session error:', err);
              if (clientWs.readyState === WebSocket.OPEN) {
                const errInfo = formatGeminiError(err);
                clientWs.send(
                  JSON.stringify({
                    type: 'error',
                    error: errInfo.message,
                    isHighDemand: errInfo.isHighDemand,
                  })
                );
              }
            },
            onclose: () => {
              console.log('[Live API] Session closed');
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'closed' }));
              }
            },
          },
        });

        isConnecting = false;
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(
            JSON.stringify({
              type: 'ready',
              model: 'gemini-3.8-live',
              voice: voiceName,
            })
          );
        }
      } catch (err: any) {
        isConnecting = false;
        console.error('[Live API] Failed to connect to Gemini Live:', err);
        if (clientWs.readyState === WebSocket.OPEN) {
          const errInfo = formatGeminiError(err);
          clientWs.send(
            JSON.stringify({
              type: 'error',
              error: errInfo.message,
              isHighDemand: errInfo.isHighDemand,
            })
          );
        }
      }
    }

    clientWs.on('message', async (data: Buffer | string) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'start') {
          if (liveSession) {
            try {
              liveSession.close();
            } catch (e) {
              // ignore
            }
            liveSession = null;
          }
          await initSession(msg.voice || 'Zephyr', msg.systemInstruction);
        } else if (msg.type === 'audio' && msg.audio) {
          if (!liveSession && !isConnecting) {
            await initSession();
          }
          if (liveSession) {
            liveSession.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        } else if (msg.type === 'text' && msg.text) {
          if (!liveSession && !isConnecting) {
            await initSession();
          }
          if (liveSession) {
            liveSession.sendRealtimeInput({
              text: msg.text,
            });
          }
        } else if (msg.type === 'stop') {
          if (liveSession) {
            try {
              liveSession.close();
            } catch (e) {
              // ignore
            }
            liveSession = null;
          }
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'stopped' }));
          }
        }
      } catch (err: any) {
        console.error('[Live API] Error processing client message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[Live API] Client disconnected');
      if (liveSession) {
        try {
          liveSession.close();
        } catch (e) {
          // ignore
        }
        liveSession = null;
      }
    });
  });

  // Vite middleware in dev / static in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
