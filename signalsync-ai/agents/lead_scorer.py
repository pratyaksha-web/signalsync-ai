#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Lead Scorer Agent
Role: Combines firmographic profiles with active intent dimensions to calculate qualified sales pipeline scoring.
"""

import os
import json
import re
from typing import Dict, Any, Optional

# Attempt to import Google's Generative AI SDK for execution if configured
try:
    import google.generativeai as genai
    HAS_GEMINI_SDK = True
except ImportError:
    HAS_GEMINI_SDK = False


class LeadScorerAgent:
    """
    Agent responsible for combining behavioral intent insights and firmographic data
    to calculate precise lead qualification scores, priority bands, and estimated contract values.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.use_live_llm = HAS_GEMINI_SDK and bool(self.api_key)

        if self.use_live_llm:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")

        # Prompt template defining ICP criteria and value scoring parameters
        self.prompt_template = """
You are an expert Lead Qualification and Pipeline Scorer. Your task is to calculate a qualified lead value profile based on firmographics and the intent profile provided below.

Target Firmographic Insights:
{firmographics_json}

Active Intent Profile:
{intent_profile_json}

Ideal Customer Profile (ICP) Guidelines:
- High priority industries: SaaS, Cybersecurity, Fintech, DevTools.
- High priority employee size: 100 to 1000 (sweet spot).
- Positive triggers: Expansion, Tech Migration.

Output a strictly formatted JSON object with this exact structure:
{{
  "lead_score": 0 to 100,
  "fit_tier": "One of [P0 - High Urgency ICP, P1 - Solid Fit, P2 - Moderate Fit, P3 - Low Priority]",
  "estimated_arr_value": 10000 to 250000 (Integer, estimating budget based on size & trigger),
  "qualification_justification": "A clear, professional summary (2 sentences) explaining the score weight and value calculation"
}}

Strict constraints:
1. Return ONLY a valid JSON block enclosed in ```json and ```.
2. Absolutely no introductory or conversational remarks outside the JSON block.
"""

    def _calculate_score_logic(self, firmographics: Dict[str, Any], intent_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Provides highly precise, mathematical ICP scoring logic as a fallback and ground-truth."""
        base_score = 50

        # 1. Evaluate Industry Fit (Max 15 pts)
        industry = firmographics.get("industry", "Unknown").lower()
        high_value_industries = ["saas", "cybersecurity", "fintech", "devtools", "software"]
        if any(ind in industry for ind in high_value_industries):
            base_score += 15
        else:
            base_score += 5

        # 2. Evaluate Size Fit (Max 15 pts)
        emp_size = firmographics.get("employee_count", 100)
        if 100 <= emp_size <= 1000:
            base_score += 15  # Enterprise sweet-spot
        elif emp_size > 1000:
            base_score += 10  # Large corporate (longer sales cycles)
        else:
            base_score += 5   # Small business

        # 3. Evaluate Intent Strength (Max 20 pts)
        strength = intent_profile.get("intent_strength", "Medium").lower()
        if strength == "high":
            base_score += 20
        elif strength == "medium":
            base_score += 10
        else:
            base_score += 2

        # Cap output score
        lead_score = min(base_score, 100)

        # 4. Map Tiers and ARR Estimate
        if lead_score >= 85:
            fit_tier = "P0 - High Urgency ICP"
            multiplier = 200
        elif lead_score >= 70:
            fit_tier = "P1 - Solid Fit"
            multiplier = 140
        elif lead_score >= 50:
            fit_tier = "P2 - Moderate Fit"
            multiplier = 80
        else:
            fit_tier = "P3 - Low Priority"
            multiplier = 40

        # Estimated contract value based on size and multiplier
        estimated_arr = int(emp_size * multiplier)
        # Clip ARR estimation to reasonable enterprise limits
        estimated_arr = max(12000, min(estimated_arr, 240000))

        justification = (
            f"The computed lead score of {lead_score}% is driven by strong firmographic parameters "
            f"and active {intent_profile.get('intent_category', 'business')} indicators. "
            f"Employee metrics reflect optimal scale for deployment."
        )

        return {
            "lead_score": lead_score,
            "fit_tier": fit_tier,
            "estimated_arr_value": estimated_arr,
            "qualification_justification": justification
        }

    def process(self, firmographics: Dict[str, Any], intent_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes and grades a lead by aligning firmographic profiles with current intent metrics.
        """
        if not firmographics or not intent_profile:
            raise ValueError("Both firmographics and intent_profile are required inputs.")

        if not self.use_live_llm:
            return self._calculate_score_logic(firmographics, intent_profile)

        try:
            formatted_prompt = self.prompt_template.format(
                firmographics_json=json.dumps(firmographics, indent=2),
                intent_profile_json=json.dumps(intent_profile, indent=2)
            )
            response = self.model.generate_content(formatted_prompt)

            # Ensure clean extraction
            json_match = re.search(r"```json\s*(.*?)\s*```", response.text, re.DOTALL)
            json_str = json_match.group(1) if json_match else response.text

            return json.loads(json_str.strip())
        except Exception as e:
            fallback = self._calculate_score_logic(firmographics, intent_profile)
            fallback["qualification_justification"] += f" (Note: Scoring engine fallback active: {str(e)})"
            return fallback


# Executable Demonstration Block
if __name__ == "__main__":
    sample_firmographics = {
        "company": "Globex Solutions",
        "employee_count": 450,
        "hq_location": "San Francisco, CA",
        "tech_stack": ["Node.js", "React", "PostgreSQL", "AWS"],
        "industry": "Cybersecurity"
    }

    sample_intent = {
        "intent_category": "Expansion",
        "intent_strength": "High",
        "buying_stage": "Consideration",
        "target_departments": ["Engineering", "Infrastructure"]
    }

    print("\033[93m=== RUNNING LEAD SCORER AGENT ===\033[0m")
    print(f"\033[90mFirmographics Input:\033[0m {json.dumps(sample_firmographics)}\n")
    print(f"\033[90mIntent Profile Input:\033[0m {json.dumps(sample_intent)}\n")

    scorer = LeadScorerAgent()
    qualified_profile = scorer.process(sample_firmographics, sample_intent)

    print("\033[93mOutput Lead Scoring Profile:\033[0m")
    print(json.dumps(qualified_profile, indent=2))
