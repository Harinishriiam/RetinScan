import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  scan_id: string;
  image_url: string;
}

interface DiseaseAnalysis {
  dr_grade: number;
  dr_confidence: number;
  dr_label: string;
  glaucoma_risk: "low" | "moderate" | "high" | "suspect";
  glaucoma_confidence: number;
  amd_risk: "none" | "early" | "intermediate" | "advanced";
  amd_confidence: number;
  overall_severity: "normal" | "mild" | "moderate" | "severe" | "critical";
  referral_recommendation: "no_action" | "monitor_6_months" | "schedule_3_months" | "urgent_1_month" | "immediate";
  clinical_findings: string[];
  patient_summary: string;
  ai_notes: string;
}

const DR_LABELS = ["No Diabetic Retinopathy", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR"];

function buildAnalysisPrompt(): string {
  return `You are an expert ophthalmology AI assistant specialized in retinal fundus image analysis. Analyze the provided retinal fundus photograph and provide a comprehensive screening assessment.

Evaluate the image for:

1. **DIABETIC RETINOPATHY (DR)** - Grade on scale 0-4:
   - Grade 0: No DR (no lesions visible)
   - Grade 1: Mild DR (microaneurysms only)
   - Grade 2: Moderate DR (more than microaneurysms, less than severe)
   - Grade 3: Severe DR (any of: 20+ intraretinal hemorrhages in each quadrant, venous beading, IRMA)
   - Grade 4: Proliferative DR (neovascularization, vitreous/pre-retinal hemorrhage)

2. **GLAUCOMA INDICATORS** - Assess:
   - Optic disc cup-to-disc ratio (CDR)
   - Optic disc pallor and asymmetry
   - Nerve fiber layer defects
   - Risk level: low / moderate / high / suspect

3. **MACULAR DEGENERATION (AMD)** - Assess:
   - Drusen presence and size
   - Geographic atrophy
   - Choroidal neovascularization signs
   - Stage: none / early / intermediate / advanced

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "dr_grade": <0-4 integer>,
  "dr_confidence": <0.0-1.0 float>,
  "glaucoma_risk": "<low|moderate|high|suspect>",
  "glaucoma_confidence": <0.0-1.0 float>,
  "amd_risk": "<none|early|intermediate|advanced>",
  "amd_confidence": <0.0-1.0 float>,
  "overall_severity": "<normal|mild|moderate|severe|critical>",
  "referral_recommendation": "<no_action|monitor_6_months|schedule_3_months|urgent_1_month|immediate>",
  "clinical_findings": [
    "<specific finding 1>",
    "<specific finding 2>",
    "<specific finding 3>",
    "..."
  ],
  "patient_summary": "<2-3 sentence plain English explanation for the patient about what was found and what it means for their health>",
  "ai_notes": "<brief clinical notes about image quality and any limitations of this analysis>"
}

Important guidelines:
- clinical_findings should list 3-6 specific observations from the image
- patient_summary must be in simple, reassuring but honest language a non-medical person can understand
- Be thorough but conservative in grading - err on the side of caution
- If image quality is poor, still provide best estimate but note it in ai_notes
- overall_severity mapping: normal (dr=0, glauc=low, amd=none), mild (dr=1, glauc=moderate OR amd=early), moderate (dr=2, glauc=high OR amd=intermediate), severe (dr=3 OR amd=advanced), critical (dr=4 OR glauc=suspect with dr≥2)
- referral_recommendation mapping: no_action (normal), monitor_6_months (mild), schedule_3_months (moderate), urgent_1_month (severe), immediate (critical)`;
}

async function analyzeImageWithClaude(imageUrl: string, apiKey: string): Promise<DiseaseAnalysis> {
  // Fetch the image and convert to base64
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

  const validMediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const mediaType = validMediaTypes.includes(contentType) ? contentType : "image/jpeg";

  const requestBody = {
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text: buildAnalysisPrompt(),
          },
        ],
      },
    ],
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
  }

  const claudeResponse = await response.json();
  const rawText = claudeResponse.content?.[0]?.text || "";

  // Extract JSON from response (handle any wrapping text)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    dr_grade: Math.min(4, Math.max(0, parseInt(parsed.dr_grade) || 0)),
    dr_confidence: Math.min(1, Math.max(0, parseFloat(parsed.dr_confidence) || 0.8)),
    dr_label: DR_LABELS[Math.min(4, Math.max(0, parseInt(parsed.dr_grade) || 0))],
    glaucoma_risk: ["low", "moderate", "high", "suspect"].includes(parsed.glaucoma_risk)
      ? parsed.glaucoma_risk
      : "low",
    glaucoma_confidence: Math.min(1, Math.max(0, parseFloat(parsed.glaucoma_confidence) || 0.7)),
    amd_risk: ["none", "early", "intermediate", "advanced"].includes(parsed.amd_risk)
      ? parsed.amd_risk
      : "none",
    amd_confidence: Math.min(1, Math.max(0, parseFloat(parsed.amd_confidence) || 0.7)),
    overall_severity: ["normal", "mild", "moderate", "severe", "critical"].includes(parsed.overall_severity)
      ? parsed.overall_severity
      : "normal",
    referral_recommendation: [
      "no_action",
      "monitor_6_months",
      "schedule_3_months",
      "urgent_1_month",
      "immediate",
    ].includes(parsed.referral_recommendation)
      ? parsed.referral_recommendation
      : "no_action",
    clinical_findings: Array.isArray(parsed.clinical_findings) ? parsed.clinical_findings : [],
    patient_summary: parsed.patient_summary || "Analysis completed. Please consult with your doctor for detailed results.",
    ai_notes: parsed.ai_notes || "Analysis performed by AI screening system.",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: AnalysisRequest = await req.json();
    const { scan_id, image_url } = body;

    if (!scan_id || !image_url) {
      return new Response(JSON.stringify({ error: "scan_id and image_url are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark scan as processing
    await supabase.from("scans").update({ status: "processing" }).eq("id", scan_id);

    // Perform AI analysis
    const analysis = await analyzeImageWithClaude(image_url, anthropicApiKey);

    // Update scan with results
    const { error: updateError } = await supabase
      .from("scans")
      .update({
        status: "completed",
        dr_grade: analysis.dr_grade,
        dr_confidence: analysis.dr_confidence,
        glaucoma_risk: analysis.glaucoma_risk,
        glaucoma_confidence: analysis.glaucoma_confidence,
        amd_risk: analysis.amd_risk,
        amd_confidence: analysis.amd_confidence,
        overall_severity: analysis.overall_severity,
        referral_recommendation: analysis.referral_recommendation,
        clinical_findings: analysis.clinical_findings,
        patient_summary: analysis.patient_summary,
        ai_notes: analysis.ai_notes,
      })
      .eq("id", scan_id);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Analysis error:", errorMessage);

    // Try to mark scan as failed if we have scan_id
    try {
      const bodyText = await req.clone().text();
      const body = JSON.parse(bodyText);
      if (body.scan_id) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await supabase
          .from("scans")
          .update({ status: "failed", error_message: errorMessage })
          .eq("id", body.scan_id);
      }
    } catch {}

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
