import { useState, useRef, useEffect, useCallback } from 'react';
import { LiveAudioPlayer, LiveMicRecorder } from '../services/liveAudioService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

export type LiveConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface UseGeminiLiveOptions {
  defaultVoice?: string;
  systemInstruction?: string;
  onTurnComplete?: () => void;
}

export function useGeminiLive(options: UseGeminiLiveOptions = {}) {
  const { defaultVoice = 'Zephyr', systemInstruction } = options;

  const [connectionState, setConnectionState] = useState<LiveConnectionState>('disconnected');
  const [voice, setVoice] = useState<string>(defaultVoice);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [userLevel, setUserLevel] = useState(0);
  const [modelLevel, setModelLevel] = useState(0);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  // References to keep callbacks and instances fresh
  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const recorderRef = useRef<LiveMicRecorder | null>(null);
  const isMutedRef = useRef(false);
  isMutedRef.current = isMuted;

  const currentTurnTextRef = useRef('');
  const animFrameRef = useRef<number | null>(null);

  // Audio level monitoring loop
  const startLevelMeter = useCallback(() => {
    const checkLevels = () => {
      if (recorderRef.current) {
        const uLevel = recorderRef.current.getAudioLevel();
        setUserLevel(uLevel);
        setIsUserSpeaking(uLevel > 0.08);
      } else {
        setUserLevel(0);
        setIsUserSpeaking(false);
      }

      if (playerRef.current) {
        const mLevel = playerRef.current.getAudioLevel();
        setModelLevel(mLevel);
        setIsModelSpeaking(mLevel > 0.04);
      } else {
        setModelLevel(0);
        setIsModelSpeaking(false);
      }

      animFrameRef.current = requestAnimationFrame(checkLevels);
    };
    animFrameRef.current = requestAnimationFrame(checkLevels);
  }, []);

  const stopLevelMeter = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setUserLevel(0);
    setModelLevel(0);
    setIsModelSpeaking(false);
    setIsUserSpeaking(false);
  }, []);

  const stopConversation = useCallback(() => {
    // 1. Stop mic recorder
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }

    // 2. Stop audio playback
    if (playerRef.current) {
      playerRef.current.stopAll();
      playerRef.current.close();
      playerRef.current = null;
    }

    // 3. Close WebSocket
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'stop' }));
          wsRef.current.close();
        }
      } catch (e) {
        // ignore
      }
      wsRef.current = null;
    }

    stopLevelMeter();
    setConnectionState('disconnected');

    // Flush any pending streamed text
    if (currentTurnTextRef.current.trim()) {
      const finalMsg = currentTurnTextRef.current.trim();
      setMessages((prev) => [
        ...prev,
        {
          id: 'model-' + Date.now(),
          sender: 'model',
          text: finalMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      ]);
      currentTurnTextRef.current = '';
    }
    setStreamingText('');
  }, [stopLevelMeter]);

  const startConversation = useCallback(
    async (chosenVoice?: string) => {
      stopConversation();
      setErrorMessage(null);
      setConnectionState('connecting');

      const activeVoice = chosenVoice || voice;
      if (chosenVoice) setVoice(chosenVoice);

      try {
        // 1. Initialize player
        const player = new LiveAudioPlayer();
        player.init();
        playerRef.current = player;

        // 2. Setup WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: 'start',
              voice: activeVoice,
              systemInstruction: systemInstruction || undefined,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'ready') {
              setConnectionState('connected');
              // Start mic once server confirms ready
              startMic();
              startLevelMeter();
            } else if (data.type === 'audio') {
              if (data.audio && playerRef.current) {
                playerRef.current.playChunk(data.audio);
              }
            } else if (data.type === 'text') {
              currentTurnTextRef.current += data.text;
              setStreamingText(currentTurnTextRef.current);
            } else if (data.type === 'interrupted') {
              if (playerRef.current) {
                playerRef.current.stopAll();
              }
              if (currentTurnTextRef.current.trim()) {
                const interruptedText = currentTurnTextRef.current.trim() + ' ⏹️';
                setMessages((prev) => [
                  ...prev,
                  {
                    id: 'model-' + Date.now(),
                    sender: 'model',
                    text: interruptedText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  },
                ]);
                currentTurnTextRef.current = '';
                setStreamingText('');
              }
            } else if (data.type === 'turnComplete') {
              if (currentTurnTextRef.current.trim()) {
                const completeText = currentTurnTextRef.current.trim();
                setMessages((prev) => [
                  ...prev,
                  {
                    id: 'model-' + Date.now(),
                    sender: 'model',
                    text: completeText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  },
                ]);
                currentTurnTextRef.current = '';
                setStreamingText('');
              }
            } else if (data.type === 'error') {
              const friendlyError = typeof data.error === 'string'
                ? data.error.replace(/^ApiError:\s*/, '')
                : 'Live API error';
              setErrorMessage(friendlyError);
              setConnectionState('error');
              stopConversation();
            } else if (data.type === 'closed') {
              stopConversation();
            }
          } catch (e) {
            console.error('Error handling WebSocket message:', e);
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket connection error:', err);
          setErrorMessage('Failed to connect to the Live API server.');
          setConnectionState('error');
        };

        ws.onclose = () => {
          if (connectionState !== 'disconnected') {
            setConnectionState('disconnected');
          }
        };
      } catch (err: any) {
        console.error('Failed to initiate live conversation:', err);
        setErrorMessage(err?.message || 'Could not start live session');
        setConnectionState('error');
        stopConversation();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [voice, systemInstruction, startLevelMeter, stopConversation]
  );

  const startMic = async () => {
    try {
      const recorder = new LiveMicRecorder();
      await recorder.start((base64Audio) => {
        if (!isMutedRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'audio',
              audio: base64Audio,
            })
          );
        }
      });
      recorderRef.current = recorder;
    } catch (err: any) {
      console.error('Microphone permission / access error:', err);
      setErrorMessage(
        err?.name === 'NotAllowedError'
          ? 'মাইক্রোফোনের অনুমতি দেওয়া হয়নি (Microphone permission denied). অনুগ্রহ করে ব্রাউজার সেটিংসে অনুমতি দিন।'
          : 'মাইক্রোফোন চালু করা যায়নি: ' + (err?.message || 'Unknown error')
      );
    }
  };

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    // Record user message
    setMessages((prev) => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: text.trim(),
        })
      );
    } else {
      // Fallback via POST /api/gemini/chat if socket is not connected
      fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text.trim() }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.text) {
            setMessages((prev) => [
              ...prev,
              {
                id: 'model-' + Date.now(),
                sender: 'model',
                text: data.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              },
            ]);
            if (data.notice || data.isFallback) {
              setErrorMessage(data.notice || 'মডেলটিতে অতিরিক্ত চাপের কারণে ব্যাকআপ সহায়তা প্রদর্শন করা হয়েছে।');
              setTimeout(() => setErrorMessage(null), 7000);
            }
          } else if (data.error) {
            setErrorMessage(data.error);
          }
        })
        .catch((err) => {
          setErrorMessage('অনুরোধ পাঠানো সম্ভব হয়নি: ' + (err?.message || 'নেটওয়ার্ক ত্রুটি'));
        });
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingText('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  return {
    connectionState,
    voice,
    setVoice,
    messages,
    streamingText,
    errorMessage,
    isMuted,
    userLevel,
    modelLevel,
    isModelSpeaking,
    isUserSpeaking,
    startConversation,
    stopConversation,
    toggleMute,
    sendTextMessage,
    clearMessages,
  };
}
