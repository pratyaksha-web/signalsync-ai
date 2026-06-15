#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Intent Analyzer Agent
Role: Overlooks harvested signals to classify buyer intent vectors and categorize target prospect pain-points.
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


class IntentAnalyzerAgent:
    """
    Agent designed to evaluate business signals to assess buying intent,
    target channels, and categorise overall purchase indicators.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.use_live_llm = HAS_GEMINI_SDK and bool(self.api_key)

        if self.use_live_llm:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")

        # Prompt template specifying the analysis constraints and classification tags
        self.prompt_template = """
You are an elite Enterprise Sales Intent Analyst. Your goal is to evaluate the following harvested signal and generate an Enriched Intent Profile.

Source Signal Details:
{signal_json}

Provide a comprehensive, analytical breakdown by returning a JSON object matching this exact schema:
{{
  "intent_category": "One of [Expansion, Efficiency, Tech Migration, Capital Influx, Leadership Shift]",
  "intent_strength": "One of [High, Medium, Low]",
  "buying_stage": "One of [Awareness, Consideration, Decision]",
  "target_departments": ["List of target business departments impacted - e.g. DevOps, Sales, Security, IT"],
  "buyer_pain_points": [
    "Identified organizational pain-point 1",
    "Identified organizational pain-point 2"
  ],
  "intent_narrative": "A concise 2-sentence strategic rationale detailing why this signal represents an active buying vector."
}}

Strict constraints:
1. Return ONLY a valid JSON block enclosed in ```json and ```.
2. Absolutely no introductory or explanatory remarks outside the JSON block.
"""

    def _fallback_analyze(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """Offline high-fidelity rule-based intent analyzer simulating behavioral modeling."""
        sig_type = signal.get("signal_type", "Expansion").lower()
        
        intent_category = "Efficiency"
        intent_strength = "Medium"
        buying_stage = "Awareness"
        target_departments = ["IT", "Management"]
        pain_points = [
            "Lack of specialized tooling for current initiative",
            "Friction in operational transitions"
        ]
        
        if "hiring" in sig_type or "talent" in sig_type:
            intent_category = "Expansion"
            intent_strength = "High"
            buying_stage = "Consideration"
            target_departments = ["Engineering", "HR"]
            pain_points = [
                "Bottlenecks in active engineering delivery",
                "High administrative overhead during onboarding"
              ]
        elif "funding" in sig_type or "series" in sig_type:
            intent_category = "Capital Influx"
            intent_strength = "High"
            buying_stage = "Decision"
            target_departments = ["Finance", "Operations", "Product"]
            pain_points = [
                "Pressure to accelerate product velocity under board milestones",
                "Scaling infrastructure to sustain regional expansion"
            ]
        elif "migration" in sig_type or "tech" in sig_type:
            intent_category = "Tech Migration"
            intent_strength = "Medium"
            buying_stage = "Consideration"
            target_departments = ["DevOps", "Infrastructure", "Security"]
            pain_points = [
                "Legacy monolithic technology constraints and cost spirals",
                "High downtime risks during major architectural pivots"
            ]

        narrative = f"The active {intent_category} trigger indicates {signal.get('company')} is moving heavy focus toward system improvements, creating a strong window for engagement."

        return {
            "intent_category": intent_category,
            "intent_strength": intent_strength,
            "buying_stage": buying_stage,
            "target_departments": target_departments,
            "buyer_pain_points": pain_points,
            "intent_narrative": narrative
        }

    def process(self, signal: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes intent analysis logic over a pre-harvested signal.
        """
        if not signal:
            raise ValueError("Input signal is required.")

        if not self.use_live_llm:
            return self._fallback_analyze(signal)

        try:
            signal_str = json.dumps(signal, indent=2)
            formatted_prompt = self.prompt_template.format(signal_json=signal_str)
            response = self.model.generate_content(formatted_prompt)

            # Extract json blocks cleanly
            json_match = re.search(r"```json\s*(.*?)\s*```", response.text, re.DOTALL)
            json_str = json_match.group(1) if json_match else response.text

            return json.loads(json_str.strip())
        except Exception as e:
            result = self._fallback_analyze(signal)
            result["intent_narrative"] += f" (Note: Analysis fallback active: {str(e)})"
            return result


# Executable Demonstration Block
if __name__ == "__main__":
    sample_signal = {
        "company": "Globex Solutions",
        "industry": "Cybersecurity",
        "signal_type": "Hiring Surge",
        "title": "Engineering scaling initiative",
        "description": "Globex Solutions is recruiting heavily across their Node.js engineering groups, focusing on backend database scalability.",
        "confidence_score": 0.85
    }

    print("\033[94m=== RUNNING INTENT ANALYZER AGENT ===\033[0m")
    print(f"\033[90mSource Signal Input:\033[0m\n{json.dumps(sample_signal, indent=2)}\n")

    analyzer = IntentAnalyzerAgent()
    intent_profile = analyzer.process(sample_signal)

    print("\033[94mOutput Enriched Intent Profile:\033[0m")
    print(json.dumps(intent_profile, indent=2))
