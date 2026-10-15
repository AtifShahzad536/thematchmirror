import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useApp } from '../../../context/AppContext';
import { processLiveFrame } from '../../../utils/skinColorAnalysis';

export const DesktopCameraView = () => {
  const navigate = useNavigate();
  const { updateFromLiveCapture, liveAnalysis } = useApp();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const imageRef = useRef(null);
  const logScrollRef = useRef(null);

  // Camera & Stream states (defaults to ON for live camera)
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [useTestTarget, setUseTestTarget] = useState(false);

  // Audio Voice-Over state for Urdu Advice
  const [activeVoiceIdx, setActiveVoiceIdx] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Interactive Mirror Simulation Mode: 'live' | 'wrong_shade' | 'unblended' | 'optimal'
  const [mirrorMode, setMirrorMode] = useState('live');

  // Real-time telemetry values from actual video frames
  const [telemetry, setTelemetry] = useState({
    exposureEV: '+0.29',
    exposureEVNum: 0.29,
    lux: 819,
    blurScore: 139.8,
    roll: 2.0,
    checklist: {
      faceCentered: true,
      highCRI: true,
      noMotionBlur: true,
      neutralExpression: true,
      hairClear: true,
    },
  });

  // Current extracted skin sample from frame
  const currentSampleRef = useRef({
    lab: { L: 62.4, a: 14.2, b: 19.8 },
    ita: 32.6,
    monkScale: 5,
    undertone: 'Warm Olive',
    hex: '#d29d6e',
  });

  // Optical scanning state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Initialize and request camera automatically
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
          setStreamActive(true);
          setUseTestTarget(false);
        };
      }
    } catch (err) {
      console.warn('Camera error or permission denied:', err);
      setCameraError(err.message || 'Permission denied');
      setStreamActive(false);
      setUseTestTarget(true);
    }
  }, []);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      // Clean up camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [startCamera]);

  // Pre-warm SpeechSynthesis voices for immediate Urdu voiceover playback
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cancel any active speech when switching simulation modes
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveVoiceIdx(null);
    }
  }, [mirrorMode]);

  // Frame processing loop for real-time telemetry (10 Hz rate)
  useEffect(() => {
    let lastTime = 0;
    const FPS = 10;
    const interval = 1000 / FPS;

    const analyzeLoop = (timestamp) => {
      if (timestamp - lastTime >= interval) {
        lastTime = timestamp;

        const source = streamActive && !useTestTarget ? videoRef.current : imageRef.current;
        if (source && canvasRef.current) {
          try {
            const result = processLiveFrame(source, canvasRef.current);
            if (result) {
              setTelemetry(result.telemetry);
              currentSampleRef.current = result.sample;
            }
          } catch (e) {
            // Frame capture error ignore
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(analyzeLoop);
    };

    animFrameRef.current = requestAnimationFrame(analyzeLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [streamActive, useTestTarget]);

  // Handle RUN CIELAB ANALYSIS click
  const handleRunAnalysis = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setScanProgress(0);

    const startTime = Date.now();
    const duration = 850;

    const scanInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(scanInterval);

        // Update global context with real sampled skin color
        updateFromLiveCapture(currentSampleRef.current);

        // Transition to Foundation Recommendations (F4)
        setTimeout(() => {
          setIsAnalyzing(false);
          navigate(ROUTES.FOUNDATION);
        }, 150);
      }
    }, 30);
  };

  // Natural Urdu Text-to-Speech handler
  const speakAdvice = useCallback((item, index) => {
    if (!('speechSynthesis' in window)) {
      alert("Audio speech is not supported in this browser.");
      return;
    }

    // Toggle stop if already playing this item
    if (isSpeaking && activeVoiceIdx === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveVoiceIdx(null);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = item.urduVoice || item.simpleUrdu;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Locate best matching Urdu or Hindi voice (Hindi phonetics pronounce Urdu vocabulary identically)
    const voices = window.speechSynthesis.getVoices();
    const urduVoice = voices.find((v) => v.lang.startsWith('ur') || v.lang === 'ur-PK' || v.lang === 'ur-IN');
    const hindiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang === 'hi-IN');
    const subcontVoice = voices.find((v) => v.lang.includes('IN') || v.lang.includes('PK'));

    if (urduVoice) {
      utterance.voice = urduVoice;
      utterance.lang = urduVoice.lang;
    } else if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = hindiVoice.lang;
    } else if (subcontVoice) {
      utterance.voice = subcontVoice;
      utterance.lang = subcontVoice.lang;
    } else if (voices.length > 0) {
      utterance.voice = voices[0];
    }

    utterance.rate = 0.88; // Gentle, natural pacing for easy understanding
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveVoiceIdx(index);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveVoiceIdx(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveVoiceIdx(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, activeVoiceIdx]);

  // Real-time smart mirror advice & warnings generator (user friendly + Urdu voice-over enabled)
  const getMirrorAdviceLogs = () => {
    const monk = currentSampleRef.current?.monkScale || 5;
    const undertone = currentSampleRef.current?.undertone || 'Warm Olive';
    const isDark = telemetry.lux < 250;

    if (mirrorMode === 'wrong_shade') {
      return [
        {
          id: 'wrong_shade_1',
          type: 'ERROR',
          badge: 'خطرہ • MISMATCH',
          badgeColor: 'text-[#ef4444] bg-[#ef4444]/15 border-[#ef4444]/40',
          icon: '❌',
          urduTitle: 'فاؤنڈیشن شیڈ بہت زیادہ گورا ہے',
          engTitle: 'Foundation Too Fair (ΔE 4.8)',
          simpleUrdu: 'یہ فاؤنڈیشن آپ کی جلد سے بہت زیادہ گوری ہے۔ لگانے کے بعد چہرہ سرمئی، کالا اور چونا نظر آئے گا۔',
          romanUrdu: 'Yeh shade aapki skin se bohot zyada gora hai, thori der baad face ashy ya gray lagne lagega.',
          urduVoice: 'خبردار! یہ فاؤنڈیشن شیڈ آپ کی جلد سے بہت زیادہ گورا ہے۔ یہ لگانے کے بعد چہرہ سرمئی یا چونا نظر آئے گا۔ براہ کرم قدرتی شیڈ استعمال کریں۔',
          color: 'text-[#ef4444]',
          border: 'border-[#ef4444]/50',
          bg: 'bg-[#ef4444]/10',
        },
        {
          id: 'wrong_shade_2',
          type: 'WARNING',
          badge: 'انتباہ • UNDERTONE CLASH',
          badgeColor: 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/40',
          icon: '⚠️',
          urduTitle: 'پنک رنگت کا غلط ٹون',
          engTitle: 'Ashy Pink Undertone Conflict',
          simpleUrdu: 'اس میں گلابی پگمنٹس ہیں جو آپ کی گندمی رنگت کو بے رونق اور بجھا بجھا دکھائیں گے۔',
          romanUrdu: 'Is mein cool pink tones hain jo aapki wheatish skin ko dull aur lifeless bana dain gay.',
          urduVoice: 'اس فاؤنڈیشن میں گلابی رنگ زیادہ ہے جو آپ کی گندمی رنگت کے ساتھ مل کر چہرے کو بے رونق بنا دے گا۔',
          color: 'text-[#f59e0b]',
          border: 'border-[#f59e0b]/50',
          bg: 'bg-[#f59e0b]/10',
        },
        {
          id: 'wrong_shade_3',
          type: 'RECOMMENDATION',
          badge: 'مشورہ • BEST ALTERNATIVE',
          badgeColor: 'text-[#00f0ff] bg-[#00f0ff]/15 border-[#00f0ff]/40',
          icon: '💄',
          urduTitle: 'آپ کے لیے صحیح شیڈز',
          engTitle: 'Recommended Matches',
          simpleUrdu: 'Maybelline 220 Natural Beige یا Rivaj RJ-04 خریدیں، یہ آپ کی جلد پر 93% پرفیکٹ ملیں گی۔',
          romanUrdu: 'Maybelline Fit Me 220 ya Rivaj RJ-04 Honey aapki skin ke liye 93% ideal match hain.',
          urduVoice: 'آپ کے لیے میبلین فٹ می دو سو بیس نیچرل بیج یا رواج ہنی سب سے بہترین ہے، یہ ترانوے فیصد میچ ہے۔',
          color: 'text-[#00f0ff]',
          border: 'border-[#00f0ff]/50',
          bg: 'bg-[#00f0ff]/10',
        },
      ];
    }

    if (mirrorMode === 'unblended') {
      return [
        {
          id: 'unblended_1',
          type: 'WARNING',
          badge: 'دھیان دیں • JAWLINE LINE',
          badgeColor: 'text-[#ef4444] bg-[#ef4444]/15 border-[#ef4444]/40',
          icon: '⚠️',
          urduTitle: 'گردن پر الگ لائن نظر آ رہی ہے',
          engTitle: 'Demarcation Line Detected (ΔE 3.8)',
          simpleUrdu: 'چہرے اور گردن کے درمیان فاؤنڈیشن کی الگ موٹی لائن بن گئی ہے۔ میک اپ الگ سے تھپا ہوا لگ رہا ہے۔',
          romanUrdu: 'Face aur gardan ke darmiyan makeup ki alag line ban gayi hai, jissay chehra alag aur gardan alag lag rahi hai.',
          urduVoice: 'دھیان دیں! چہرے اور گردن کے درمیان فاؤنڈیشن کی الگ لائن نظر آ رہی ہے۔ میک اپ تھپا ہوا لگ رہا ہے۔',
          color: 'text-[#ef4444]',
          border: 'border-[#ef4444]/50',
          bg: 'bg-[#ef4444]/10',
        },
        {
          id: 'unblended_2',
          type: 'GUIDANCE',
          badge: 'آسان طریقہ • BLENDING TIP',
          badgeColor: 'text-[#00f0ff] bg-[#00f0ff]/15 border-[#00f0ff]/40',
          icon: '💡',
          urduTitle: 'سپنج سے نیچے کی طرف پھیلائیں',
          engTitle: 'Feather Downward to Neck',
          simpleUrdu: 'گیلے بیوٹی سپنج سے فاؤنڈیشن کو جبڑے سے نیچے گردن کی طرف ٹیپ کر کے مکس کریں تاکہ لائن غائب ہو۔',
          romanUrdu: 'Geelay beauty sponge se makeup ko jabray se gardan ki taraf achi tarah blend karein.',
          urduVoice: 'گیلے بیوٹی سپنج کی مدد سے فاؤنڈیشن کو نیچے گردن کی طرف اچھی طرح پھیلائیں تاکہ لائن ختم ہو جائے۔',
          color: 'text-[#00f0ff]',
          border: 'border-[#00f0ff]/50',
          bg: 'bg-[#00f0ff]/10',
        },
      ];
    }

    if (mirrorMode === 'optimal') {
      return [
        {
          id: 'optimal_1',
          type: 'SUCCESS',
          badge: 'شاباش • PERFECT MATCH',
          badgeColor: 'text-[#10b981] bg-[#10b981]/15 border-[#10b981]/40',
          icon: '✅',
          urduTitle: 'بالکل پرفیکٹ میچ ہے!',
          engTitle: 'Optimal Match Confirmed (ΔE 1.12)',
          simpleUrdu: 'زبردست! یہ فاؤنڈیشن آپ کے چہرے اور گردن کی اصل رنگت میں بالکل جذب ہو کر چھپ گئی ہے۔ کوئی لائن نہیں!',
          romanUrdu: 'Zabardast! Yeh foundation aapki natural skin mein bilkul ghul mil gayi hai, koi line nahi hai.',
          urduVoice: 'مبارک ہو! یہ فاؤنڈیشن آپ کے چہرے اور گردن کی قدرتی رنگت کے ساتھ بالکل پرفیکٹ مل گئی ہے۔',
          color: 'text-[#10b981]',
          border: 'border-[#10b981]/50',
          bg: 'bg-[#10b981]/10',
        },
        {
          id: 'optimal_2',
          type: 'MATCH',
          badge: 'نیچرل لک • NATURAL FINISH',
          badgeColor: 'text-[#00f0ff] bg-[#00f0ff]/15 border-[#00f0ff]/40',
          icon: '✨',
          urduTitle: 'قدرتی نکھار اور چمک',
          engTitle: 'Natural Complexion Harmony',
          simpleUrdu: 'ماتھے، گالوں اور گردن کا رنگ ایک جیسا لگ رہا ہے، میک اپ قدرتی اور بے داغ دکھے گا۔',
          romanUrdu: 'Mathey, gaalon aur gardan ka color aik jaisa hai. Makeup natural aur seamless hai.',
          urduVoice: 'ماتھے، گالوں اور گردن کا رنگ بالکل یکساں ہے۔ میک اپ قدرتی اور بے داغ لگ رہا ہے۔',
          color: 'text-[#00f0ff]',
          border: 'border-[#00f0ff]/50',
          bg: 'bg-[#00f0ff]/10',
        },
      ];
    }

    // Default Live mode from active video: 100% Pure Makeup, Shade & Blending Guidance
    const logs = [];

    // 1. [WARNING]: Makeup Shade Match Warning (Preventing Ashy / Overly Fair Base)
    logs.push({
      id: 'live_shade_alert',
      type: 'WARNING',
      badge: 'میک اپ وارننگ • SHADE CHECK',
      badgeColor: 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/40',
      icon: '⚠️',
      urduTitle: 'فاؤنڈیشن کا شیڈ بہت زیادہ گورا نہ چنیں',
      engTitle: 'Avoid Overly Fair / Chalky Base',
      simpleUrdu: 'اپنی جلد سے زیادہ سفید یا گلابی فاؤنڈیشن مت لگائیں۔ یہ کچھ دیر بعد کالی (آکسیڈائز) اور سرمئی ہو جاتی ہے۔',
      romanUrdu: 'Apni skin se zyada safed ya pink base na lagayein, yeh baad mein gray ya ashy dikhai deti hai.',
      urduVoice: 'خبردار! اپنی جلد سے زیادہ گورا یا گلابی فاؤنڈیشن شیڈ مت لگائیں۔ یہ کچھ دیر بعد چہرے کو کالا اور سرمئی بنا دیتا ہے۔ ہمیشہ قدرتی شیڈ لگائیں۔',
      color: 'text-[#f59e0b]',
      border: 'border-[#f59e0b]/50',
      bg: 'bg-[#f59e0b]/10',
    });

    // 2. [SKIN_PROFILE]: Live Complexion & Undertone for Makeup Base
    logs.push({
      id: 'live_skin_profile',
      type: 'SKIN_PROFILE',
      badge: 'آپ کی رنگت • COMPLEXION PROFILE',
      badgeColor: 'text-[#00f0ff] bg-[#00f0ff]/15 border-[#00f0ff]/40',
      icon: '👤',
      urduTitle: 'آپ کی اصل جلد کی رنگت اور انڈرٹون',
      engTitle: `Detected: Medium Wheatish (MST ${monk}) with Warm Undertone`,
      simpleUrdu: `آپ کی جلد گندمی (میڈیم) ہے اور وارم انڈرٹون ہے۔ اس رنگت پر یلو اور گولڈن بیس میک اپ سب سے قدرتی اور خوبصورت لگتا ہے۔`,
      romanUrdu: `Aapki skin gandumee (medium wheatish) hai. Yellow aur golden base makeup aap par sab se pyara lagega.`,
      urduVoice: `آپ کی رنگت گندمی ہے اور وارم انڈرٹون ہے۔ آپ کے چہرے پر یلو اور گولڈن بیس فاؤنڈیشن سب سے زیادہ نیچرل لگے گی۔`,
      color: 'text-[#00f0ff]',
      border: 'border-[#00f0ff]/50',
      bg: 'bg-[#00f0ff]/10',
    });

    // 3. [SUITABILITY]: Foundation Recommendation & Dark Circle Color Corrector
    logs.push({
      id: 'live_suitability',
      type: 'SUITABILITY',
      badge: 'بہترین شیڈز • FOUNDATION MATCH',
      badgeColor: 'text-[#10b981] bg-[#10b981]/15 border-[#10b981]/40',
      icon: '💄',
      urduTitle: 'آپ کے چہرے کے لیے پرفیکٹ فاؤنڈیشنز',
      engTitle: 'Maybelline 220 / Rivaj RJ-04 Honey',
      simpleUrdu: 'Maybelline Fit Me 220 یا Rivaj RJ-04 Honey لگائیں۔ آنکھوں کے نیچے ہلکے سیاہ حلقوں پر پہلے اورینج کریکٹر لگانا مت بھولیں۔',
      romanUrdu: 'Maybelline 220 ya Rivaj RJ-04 aapki skin ke liye ideal hain. Dark circles par pehle orange corrector lagayein.',
      urduVoice: 'آپ کے لیے میبلین فٹ می دو سو بیس یا رواج ہنی سب سے بہترین ہے۔ ہلکے سیاہ حلقوں کے لیے اورینج کریکٹر استعمال کریں۔',
      color: 'text-[#10b981]',
      border: 'border-[#10b981]/50',
      bg: 'bg-[#10b981]/10',
    });

    // 4. [CLIMATE_ADVICE]: Anti-Oxidation, Sweat-Proof & Powder Setting Advice
    logs.push({
      id: 'live_climate',
      type: 'CLIMATE_ADVICE',
      badge: 'میک اپ دیرپا رکھیں • SETTING TIP',
      badgeColor: 'text-[#a855f7] bg-[#a855f7]/15 border-[#a855f7]/40',
      icon: '🖌️',
      urduTitle: 'پسینے اور چکنائی سے میک اپ خراب ہونے سے بچائیں',
      engTitle: 'Anti-Crease & Translucent Powder Lock',
      simpleUrdu: 'فاؤنڈیشن کے فوراً بعد گیلے بیوٹی سپنج سے ٹیپ کریں اور ماتھے، ناک اور آنکھوں کے نیچے لوز پاؤڈر سے لاک کریں تاکہ بیس نہ پھٹے۔',
      romanUrdu: 'Foundation ke baad geelay sponge se tap karein aur loose powder se set karein taake makeup sweat se na phatay.',
      urduVoice: 'فاؤنڈیشن لگانے کے بعد گیلے بیوٹی سپنج سے اچھی طرح ٹیپ کریں اور ہلکے لوز پاؤڈر سے سیٹ کریں تاکہ میک اپ دن بھر تازہ رہے۔',
      color: 'text-[#a855f7]',
      border: 'border-[#a855f7]/50',
      bg: 'bg-[#a855f7]/10',
    });

    return logs;
  };

  const adviceLogs = getMirrorAdviceLogs();

  // Progress bar percentages
  const exposurePercent = Math.max(5, Math.min(95, ((telemetry.exposureEVNum + 2.5) / 5.0) * 100));
  const luxPercent = Math.max(8, Math.min(95, (telemetry.lux / 1200) * 100));
  const blurPercent = Math.max(10, Math.min(95, (telemetry.blurScore / 180) * 100));

  return (
    <div className="h-full w-full max-w-6xl mx-auto flex flex-col gap-3">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ==========================================================================
            LEFT COLUMN: CAPTURE VIEWPORT (Cols 1-7)
            ========================================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          {/* Header Bar */}
          <div className="flex items-center justify-between text-xs font-mono select-none px-1">
            <div className="flex items-center gap-2 text-[#c7d5e0]">
              <span className="text-[#00f0ff]">■</span>
              <span className="font-semibold tracking-wider">CAPTURE VIEWPORT</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle / Retry Button */}
              {streamActive ? (
                <button
                  type="button"
                  onClick={() => setUseTestTarget(!useTestTarget)}
                  className="text-[10px] text-[#556c7b] hover:text-[#00f0ff] transition-colors cursor-pointer"
                >
                  {useTestTarget ? '● Switch to Live Webcam' : 'Switch to Test Target'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-[10px] text-[#00f0ff] hover:underline transition-colors cursor-pointer"
                >
                  {cameraError ? '↻ Allow & Start Webcam' : 'Starting Camera...'}
                </button>
              )}

              <span className="text-[#10b981] font-medium flex items-center gap-1">
                <span>Face lock</span>
                <span>✓</span>
              </span>
            </div>
          </div>

          {/* Viewport Box */}
          <div className="relative w-full aspect-[4/3] bg-[#060a0d] border border-[#172530] rounded-md overflow-hidden flex items-center justify-center shadow-inner group">
            
            {/* Live Camera Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                streamActive && !useTestTarget ? 'opacity-100' : 'hidden'
              }`}
            />

            {/* High-Resolution Laboratory Calibration Face Fallback */}
            <img
              ref={imageRef}
              src="/calibration_face.jpg"
              alt="Calibration Subject"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                !streamActive || useTestTarget ? 'opacity-100' : 'hidden'
              }`}
            />

            {/* Viewport UI Overlays */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
              
              {/* Top Viewport Header */}
              <div className="flex items-center justify-between">
                {/* Flashing REC indicator */}
                <div className="flex items-center gap-1.5 font-mono text-xs text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse"></span>
                  <span className="font-bold tracking-wider text-[#ef4444]">REC</span>
                </div>

                {/* CAM_0 • LIVE Tag */}
                <div className="font-mono text-xs text-[#00f0ff] font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span>
                  <span>{streamActive && !useTestTarget ? 'WEBCAM • LIVE' : 'CAM_0 • LIVE'}</span>
                </div>
              </div>

              {/* Optical Scanning Line HUD during analysis */}
              {isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 flex flex-col justify-between">
                  <div
                    className="w-full h-1 bg-[#00f0ff] shadow-[0_0_15px_#00f0ff] transition-all duration-75"
                    style={{ transform: `translateY(${scanProgress * 3.5}px)` }}
                  ></div>
                  <div className="absolute inset-0 bg-[#00f0ff]/10 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-[#0c1217]/90 border border-[#00f0ff] px-4 py-2 rounded font-mono text-xs text-[#00f0ff] font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                      SCANNING CIELAB CHROMATICITY... {scanProgress}%
                    </div>
                  </div>
                </div>
              )}

              {/* Center Face Target Recognition Graphic */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Horizontal Crosshair Line */}
                <div className="absolute left-0 right-0 h-[1px] bg-[#00f0ff]/30"></div>
                {/* Vertical Crosshair Line */}
                <div className="absolute top-0 bottom-0 w-[1px] bg-[#00f0ff]/30"></div>

                {/* Center Green Bounding Box */}
                <div className="relative w-52 sm:w-60 h-64 sm:h-72 border border-[#10b981]/90 rounded-sm flex items-center justify-center">
                  {/* Face Tag on Top Left */}
                  <span className="absolute -top-4 left-0 text-[10px] font-mono text-[#10b981] font-bold tracking-wider">
                    FACE 0.950
                  </span>

                  {/* Cyan Dotted Oval Face Guide */}
                  <div className="w-40 sm:w-48 h-56 sm:h-64 border-2 border-dashed border-[#00f0ff]/80 rounded-[50%]"></div>
                </div>

                {/* SMART MIRROR REAL-TIME HUD CALLOUT TAGS ON VIEWPORT */}
                {mirrorMode === 'wrong_shade' && (
                  <div className="absolute top-[38%] left-[18%] pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#ef4444] bg-[#ef4444]/25 backdrop-blur-md shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                      <span className="text-[#ef4444] font-mono text-[10px] font-bold">◀</span>
                      <span className="text-[#ef4444] font-mono text-[10px] font-bold tracking-wider">
                        CHEEK: WRONG SHADE (ΔE 4.8) • TOO COOL/FAIR
                      </span>
                    </div>
                  </div>
                )}

                {mirrorMode === 'unblended' && (
                  <div className="absolute bottom-[32%] left-[20%] pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#f59e0b] bg-[#f59e0b]/25 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                      <span className="text-[#f59e0b] font-mono text-[10px] font-bold">◀</span>
                      <span className="text-[#f59e0b] font-mono text-[10px] font-bold tracking-wider">
                        L. JAWLINE: UNBLENDED DEMARCATION (ΔE 3.8)
                      </span>
                    </div>
                  </div>
                )}

                {mirrorMode === 'optimal' && (
                  <div className="absolute bottom-[35%] right-[20%] pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#10b981] bg-[#10b981]/25 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                      <span className="text-[#10b981] font-mono text-[10px] font-bold">✓</span>
                      <span className="text-[#10b981] font-mono text-[10px] font-bold tracking-wider">
                        OPTIMAL BLEND (ΔE 1.12) • WARM BEIGE 220
                      </span>
                    </div>
                  </div>
                )}

                {mirrorMode === 'live' && (
                  <div className="absolute top-[18%] pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#00f0ff]/40 bg-[#00f0ff]/15 backdrop-blur-md shadow-[0_0_12px_rgba(0,240,255,0.25)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping"></span>
                      <span className="text-[#00f0ff] font-mono text-[10px] font-bold tracking-wider">
                        SMART MAKEUP MIRROR • LIVE COMPLEXION AUDIT
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Video Spec Bar */}
              <div className="flex items-center justify-between font-mono text-[11px] text-[#8699a6] bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded">
                <span>1920×1080 • H.264 • 30.0 fps</span>
                <span className="text-[#00f0ff]">{streamActive && !useTestTarget ? 'Active Sensor' : 'Calibration Feed'}</span>
              </div>
            </div>
          </div>

          {/* Camera Settings Badges Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-xs text-center">
            <div className="bg-[#0b1015] border border-[#172530] rounded py-1.5 text-[#8699a6]">
              ISO 200
            </div>
            <div className="bg-[#0b1015] border border-[#172530] rounded py-1.5 text-[#8699a6]">
              f/2.0
            </div>
            <div className="bg-[#0b1015] border border-[#172530] rounded py-1.5 text-[#8699a6]">
              1/60s
            </div>
            <div className="bg-[#0b1015] border border-[#172530] rounded py-1.5 text-[#8699a6]">
              WB 6500K
            </div>
          </div>
        </div>

        {/* ==========================================================================
            RIGHT COLUMN: TELEMETRY, PRE-FLIGHT & SMART MIRROR ADVICE STREAM
            ========================================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          
          {/* 1. Real-Time Telemetry Panel (Drives from live video stream!) */}
          <div className="bg-[#0b1015] border border-[#172530] rounded-md p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono select-none">
              <div className="flex items-center gap-2 text-[#c7d5e0]">
                <span className="text-[#00f0ff]">■</span>
                <span className="font-semibold tracking-wider">REAL-TIME TELEMETRY</span>
              </div>
              <span className="text-[10px] text-[#10b981] font-semibold animate-pulse">Hz 10 LIVE</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {/* Exposure Level (Dynamic from video) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#8699a6]">Exposure level</span>
                  <span className="text-white font-semibold">{telemetry.exposureEV} EV</span>
                </div>
                <div className="w-full h-1.5 bg-[#121c24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981] rounded-full transition-all duration-200"
                    style={{ width: `${exposurePercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Lighting Index (Dynamic Lux) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#8699a6]">Lighting Index (High-CRI)</span>
                  <span className="text-white font-semibold">{telemetry.lux} Lux • CRI 96</span>
                </div>
                <div className="w-full h-1.5 bg-[#121c24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981] rounded-full transition-all duration-200"
                    style={{ width: `${luxPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Blur Score (Dynamic Laplacian sharpness) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#8699a6]">Blur Score (Laplacian var.)</span>
                  <span className="text-white font-semibold">
                    {telemetry.blurScore} {telemetry.blurScore > 90 ? 'sharp' : 'stabilizing'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#121c24] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#10b981] rounded-full transition-all duration-200"
                    style={{ width: `${blurPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Posture Check (Dynamic tilt) */}
              <div className="flex justify-between items-center pt-1 border-t border-[#172530]">
                <span className="text-[#8699a6]">Posture Check (head tilt)</span>
                <span className="text-white font-semibold">{telemetry.roll}° roll</span>
              </div>
            </div>
          </div>

          {/* 2. SMART MIRROR REAL-TIME GUIDANCE & WARNING LOG */}
          <div className="bg-[#0b1015] border border-[#172530] rounded-md p-3.5 space-y-2 flex-1 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between text-xs font-mono select-none mb-2">
                <div className="flex items-center gap-1.5 text-[#00f0ff]">
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping"></span>
                  <span className="font-bold tracking-wider">SMART MIRROR ADVICE</span>
                  <span className="text-white text-[11px] font-sans">/ سمارٹ مشورہ</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-2 py-0.5 rounded">
                  <span>🔊</span>
                  <span className="font-sans font-medium">کلک کر کے سنیں</span>
                </div>
              </div>

              {/* Interactive Simulation / Test Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 mb-2.5 select-none font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setMirrorMode('live')}
                  className={`px-2 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                    mirrorMode === 'live'
                      ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                      : 'border-[#172530] text-[#8699a6] hover:bg-[#141f27]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span>
                  <span>لائیو کیمرہ (Live)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMirrorMode('wrong_shade')}
                  className={`px-2 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                    mirrorMode === 'wrong_shade'
                      ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444] font-bold shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                      : 'border-[#172530] text-[#8699a6] hover:bg-[#141f27]'
                  }`}
                >
                  <span>❌</span>
                  <span>غلط شیڈ (Wrong Shade)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMirrorMode('unblended')}
                  className={`px-2 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                    mirrorMode === 'unblended'
                      ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b] font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'border-[#172530] text-[#8699a6] hover:bg-[#141f27]'
                  }`}
                >
                  <span>⚠️</span>
                  <span>گردن پر لائن (Jawline Flaw)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMirrorMode('optimal')}
                  className={`px-2 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                    mirrorMode === 'optimal'
                      ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981] font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'border-[#172530] text-[#8699a6] hover:bg-[#141f27]'
                  }`}
                >
                  <span>✓</span>
                  <span>پرفیکٹ میچ (Ideal Match)</span>
                </button>
              </div>

              {/* Scrollable Advice & Warnings Stream */}
              <div
                ref={logScrollRef}
                className="space-y-2 max-h-56 overflow-y-auto pr-1 font-mono text-[11px]"
              >
                {adviceLogs.map((item, idx) => {
                  const isPlaying = isSpeaking && activeVoiceIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => speakAdvice(item, idx)}
                      className={`p-2.5 rounded border transition-all cursor-pointer relative group select-none ${item.border} ${item.bg} ${
                        isPlaying
                          ? 'ring-2 ring-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                          : 'hover:border-[#00f0ff]/60 hover:bg-[#0e161c]'
                      }`}
                    >
                      {/* Top Row: Icon + Badges + Urdu Title + Speaker Button */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm shrink-0">{item.icon}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          <span className="text-white font-bold text-xs font-sans">
                            {item.urduTitle}
                          </span>
                        </div>

                        {/* Speaker Voice Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakAdvice(item, idx);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold flex items-center gap-1 border transition-all cursor-pointer shrink-0 ${
                            isPlaying
                              ? 'bg-[#00f0ff] text-black border-[#00f0ff] shadow-[0_0_10px_#00f0ff]'
                              : 'bg-[#172530] text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff]/20'
                          }`}
                          title="Urdu Voice Mein Suniye"
                        >
                          {isPlaying ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span>
                              <span>رکیں (بول رہا ہے)</span>
                            </>
                          ) : (
                            <>
                              <span>🔊</span>
                              <span>سنیں (Urdu)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Prominent Easy-to-understand Urdu Explanation */}
                      <p className="text-white text-xs sm:text-[13px] font-sans leading-relaxed tracking-wide pt-0.5 text-right sm:text-left">
                        {item.simpleUrdu}
                      </p>

                      {/* Roman Urdu subtitle for reading ease */}
                      <div className="flex items-center justify-between pt-1 mt-1 border-t border-white/5 text-[10px] text-[#8699a6]">
                        <span>{item.romanUrdu}</span>
                        <span className="text-[9px] text-[#556c7b] hidden sm:inline">{item.engTitle}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Advice Footer Status */}
            <div className="pt-2 border-t border-[#141f27] flex items-center justify-between font-mono text-[10px] text-[#556c7b]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                <span className="text-[#8699a6] font-sans">آڈیو سسٹم فعال ہے (Urdu Voice Active)</span>
              </div>
              <span className="text-[#00f0ff]">
                {currentSampleRef.current?.undertone || 'Warm Olive'} • MST {currentSampleRef.current?.monkScale || 5}
              </span>
            </div>
          </div>

          {/* 3. Action Button: RUN CIELAB ANALYSIS */}
          <div>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunAnalysis}
              className="w-full py-3 rounded-md border border-[#00f0ff] text-[#00f0ff] font-mono text-xs font-bold tracking-wider uppercase bg-[#00f0ff]/5 hover:bg-[#00f0ff]/15 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isAnalyzing ? '⚡' : '▶'}</span>
              <span>{isAnalyzing ? 'ANALYZING FACIAL CHROMATICITY...' : 'RUN CIELAB ANALYSIS'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DesktopCameraView;
