import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import {
  Sparkles,
  Bot,
  User,
  Send,
  Sprout,
  ShieldAlert,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  Leaf,
  Bug,
  Droplets,
  Calendar,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  category?: string;
  timestamp: string;
}

// Curated Knowledge Base for Instant Expert Agronomy Fallback
const EXPERT_KNOWLEDGE: Record<string, string> = {
  cotton: `**Bt Cotton Pest Management & Nutrition Guide:**
1. **Pink Bollworm Control**:
   - Install pheromone traps @ 5 traps/acre for pest monitoring.
   - ETL (Economic Threshold Level): 8 moths/trap/night for 3 consecutive days.
   - Recommended Spray: Emamectin Benzoate 5% SG @ 80g/acre or Spinetoram 11.7% SC @ 170ml/acre.
2. **Nutrient Management**:
   - Spray 2% DAP (Di-Ammonium Phosphate) + 1% Potassium Nitrate (13:0:45) at flowering and boll formation stage to prevent square drying and flower shedding.
3. **Moisture Advice**:
   - Avoid water stagnation during boll formation. If using drip, maintain 2-3 hours/alternate day depending on soil moisture.`,

  tomato: `**Tomato Leaf Spot & Disease Diagnostic:**
1. **Symptoms Check (Early Blight vs Bacterial Spot)**:
   - Concentric rings on older leaves indicate **Early Blight** (*Alternaria solani*).
   - Water-soaked dark brown circular spots indicate **Bacterial Spot**.
2. **Treatment Protocol**:
   - **For Early Blight**: Spray Mancozeb 75% WP @ 2g/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L water.
   - **For Bacterial Spot**: Copper Oxychloride (50% WP) @ 2.5g/L + Streptocycline @ 0.1g/L.
3. **Preventive Cultural Practice**:
   - Prune lower foliage touching the soil.
   - Mulch around base with silver-black mulch sheet to prevent soil splash.`,

  onion: `**Onion Bulb Development & Thrips Management:**
1. **Thrips Control (*Thrips tabaci*)**:
   - Whitish silvery patches and curling leaf tips indicate thrips attack.
   - Spray Fipronil 5% SC @ 2ml/L or Spinetoram 11.7% SC @ 1ml/L. Always add non-ionic wetting agent (sticker) @ 0.5ml/L.
2. **Fertigation Schedule (Bulb Development Stage - 45 to 75 DAT)**:
   - Apply 00:52:34 (Monopotassium phosphate) @ 5kg/acre through drip irrigation.
   - Spray Micronutrient Grade IV or II containing Zinc and Boron to enhance bulb hardness and shelf life.
3. **Withholding Irrigation**:
   - Stop watering 10-14 days before harvest to avoid neck rot during post-harvest storage.`,

  fall_armyworm: `**Fall Armyworm (FAW) Management in Maize:**
1. **Identification**:
   - Typical inverted 'Y' mark on head and 4 square-arranged black spots on the 8th abdominal segment.
   - Whorl feeding produces windowing on leaves followed by heavy ragged holes with sawdust-like frass.
2. **Integrated Pest Management (IPM)**:
   - Release *Trichogramma chilonis* egg parasitoids @ 50,000/acre.
   - Whorl application of Sand + Lime mixture (9:1 ratio) in early stages.
   - Chemical spray: Chlorantraniliprole 18.5% SC @ 0.4ml/L or Spinetoram 11.7% SC @ 0.5ml/L targeting directly into the whorl nozzle.`,

  fertilizer: `**Balanced NPK & Soil Health Blueprint:**
1. **General NPK Principles**:
   - Cereals: 4:2:1 ratio (e.g. 120:60:40 kg/ha).
   - Pulses (Legumes): 1:2:1 ratio (e.g. 20:40:20 kg/ha) — legumes fix atmospheric nitrogen via *Rhizobium*.
   - Oilseeds: 3:2:1 ratio + Sulphur @ 20-30 kg/ha for oil content.
2. **Bio-Fertilizer Integration**:
   - Apply PSB (Phosphate Solubilizing Bacteria) and Azotobacter/Rhizobium @ 2kg/acre with 100kg well-decomposed FYM.
3. **Zinc & Micronutrient Note**:
   - Never mix Zinc Sulphate with DAP or Single Super Phosphate directly in the tank (causes insoluble Zinc Phosphate precipitation). Maintain a 3-day gap.`,

  general: `**KrishiSetu Agronomy Guidance:**
- Maintain optimal soil organic carbon above 0.75% by incorporating farm yard manure (FYM), press mud, or green manure (Dhaincha/Sunn hemp).
- Check weather forecast before spraying chemicals to avoid wash-off from sudden unseasonal rains.
- Use certified inputs with valid batch and QR certificates from verified vendors in the KrishiSetu Marketplace.`,
};

export const AICropDoctor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Namaste! I am your **KrishiSetu AI Crop Doctor & Agronomy Advisory**, powered by Google Gemini AI. 

How can I help you today? You can ask about:
- **Crop Disease Diagnosis & Fungicide Dosages** (Tomato, Onion, Cotton, Maize, Wheat, Soybean)
- **Insect & Pest Control** (Thrips, Fall Armyworm, Pink Bollworm, Whitefly, Aphids)
- **Fertilizer & Micronutrient Schedules** (NPK ratio, drip fertigation, organic Jeevamrut)
- **Machinery Recommendations** for land preparation, sowing, and harvesting`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('ALL');

  const getAIResponse = async (query: string): Promise<string> => {
    // 1. Try Gemini API if key is present in environment
    const apiKey =
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.GEMINI_API_KEY ||
      '';

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const prompt = `You are KrishiSetu AI Crop Doctor, an expert agricultural scientist advising Indian farmers in Maharashtra and across India. 
Farmer Query: "${query}"
Context / Selected Crop: "${selectedCrop}"
Provide practical, scientific, eco-friendly, and actionable agricultural advice including symptoms, biological remedies, and approved chemical dosages per litre of water. Be encouraging, clear, and structured.`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) return generatedText;
        }
      } catch (err) {
        console.warn('Live Gemini API call failed, using intelligent Agronomy Engine fallback', err);
      }
    }

    // 2. Intelligent Agronomy Knowledge Engine Fallback
    const q = query.toLowerCase();
    if (q.includes('cotton') || q.includes('bollworm')) {
      return EXPERT_KNOWLEDGE.cotton;
    }
    if (q.includes('tomato') || q.includes('blight') || q.includes('leaf spot')) {
      return EXPERT_KNOWLEDGE.tomato;
    }
    if (q.includes('onion') || q.includes('thrip') || q.includes('bulb')) {
      return EXPERT_KNOWLEDGE.onion;
    }
    if (q.includes('maize') || q.includes('corn') || q.includes('armyworm') || q.includes('faw')) {
      return EXPERT_KNOWLEDGE.fall_armyworm;
    }
    if (q.includes('fertilizer') || q.includes('npk') || q.includes('dap') || q.includes('urea') || q.includes('dose')) {
      return EXPERT_KNOWLEDGE.fertilizer;
    }

    return `**KrishiSetu Agronomic Advisory for: "${query}"**

1. **Recommended Cultural Practices**:
   - Inspect 20 representative plants across diagonal transects of your field for early detection of pest egg masses or leaf discoloration.
   - Maintain weed-free bunds to remove alternate host plants.

2. **Fertigation & Plant Immunity**:
   - Strengthen plant cell walls by providing soluble Silicon and Potassium (00:00:50 @ 5g/L water).
   - Spray Seaweed Extract or Humic Acid (12%) @ 2ml/L to enhance root architecture and drought tolerance.

3. **Protection & Certified Inputs**:
   - Ensure clean spray equipment and spray either in early morning (7 AM - 10 AM) or late afternoon (4 PM - 6 PM) for maximum stomatal uptake.
   - Check the **KrishiSetu Marketplace** for verified certified inputs with batch tracking.`;
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Small simulated latency for realistic assistant interaction
      const replyText = await getAIResponse(text);
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: EXPERT_KNOWLEDGE.general,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const QUICK_PROMPTS = [
    { label: 'Bt Cotton Pink Bollworm Remedy', crop: 'Cotton', text: 'How do I control pink bollworm and flower dropping in Bt cotton?' },
    { label: 'Tomato Early Blight Symptoms', crop: 'Tomato', text: 'My tomato leaves have brown concentric rings and spots. What fungicide should I spray?' },
    { label: 'Onion Thrips & Bulb Sizing', crop: 'Onion', text: 'Best insecticide for onion thrips and fertilizer schedule for maximum bulb weight?' },
    { label: 'Maize Fall Armyworm Control', crop: 'Maize', text: 'Symptoms and chemical doses for Fall Armyworm in sweet corn/maize?' },
    { label: 'Balanced NPK Fertilizer Schedule', crop: 'General', text: 'What is the ideal NPK ratio and biofertilizer recipe for seasonal vegetables?' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Powered by Gemini AI Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            KrishiSetu AI Crop Doctor & Agronomy Advisory
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Get instant expert diagnostics for crop diseases, pest infestations, irrigation schedules, and certified chemical dosages tailored to Indian soil and climate conditions.
          </p>
        </div>

        <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none hidden md:block">
          <Sprout className="w-64 h-64 text-emerald-400" />
        </div>
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Frequent Farmer Diagnostic Inquiries:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.text)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition whitespace-nowrap shadow-2xs cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs flex flex-col h-[600px] overflow-hidden">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  m.sender === 'user' ? 'bg-emerald-600' : 'bg-slate-900'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2">
                  {m.text}
                </div>
                <span
                  className={`block text-[10px] mt-2 font-mono ${
                    m.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Crop Doctor analyzing plant pathology & fertilizer database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask about crop symptoms, leaf spot remedies, pest dosage, or irrigation advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || isTyping}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Ask Doctor
            </Button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
            <span>Free Agricultural Extension Service for registered Krishisetu farmers.</span>
            <span>English, Hindi & Marathi queries supported</span>
          </div>
        </div>
      </div>
    </div>
  );
};
