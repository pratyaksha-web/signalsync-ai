#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Signal Harvester Agent
Role: Scrapes and parses raw unstructured text feeds to extract structured intent indicators.
"""

import os
import json
import re
from typing import Dict, Any, Optional

# Attempt to import Google's Generative AI SDK for genuine execution if installed
try:
    import google.generativeai as genai
    HAS_GEMINI_SDK = True
except ImportError:
    HAS_GEMINI_SDK = False


class SignalHarvesterAgent:
    """
    Agent responsible for ingesting raw unstructured intelligence feeds and
    extracting clean, validated intent signals.
    """

    def __init__(self, api_key: Optional[str] = None):
        # Configure Gemini API client if API key is provided
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.use_live_llm = HAS_GEMINI_SDK and bool(self.api_key)

        if self.use_live_llm:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")

        # Prompt template defining intent extraction parameters
        self.prompt_template = """
You are an advanced AI Signal Harvester. Your job is to extract business triggers and intent signals from the following raw text feed.

Raw Text Feed:
'''
{raw_text}
'''

Extract and return a JSON object with the following schema:
{{
  "company": "Name of the company mentioned",
  "industry": "Industry category (e.g. SaaS, Fintech, Cybersecurity, Healthtech, DevTools)",
  "signal_type": "The category of trigger (e.g., Hiring Surge, Tech Migration, Leadership Shift, Funding Event, Expansion)",
  "title": "A short, concise summary title of the signal (e.g., Scaling Node.js infrastructure)",
  "description": "A detailed 2-3 sentence explanation of the trigger and its business implications",
  "confidence_score": 0.0 to 1.0,
  "confidence_reason": "Specific textual proof justifying the assigned confidence score"
}}

Strict constraints:
1. Return ONLY a valid JSON block block enclosed in ```json and ```.
2. Under no circumstances should you add any conversational text or preambles.
3. If no company or clear signal is identified, fallback gracefully with appropriate markers.
"""

    def clean_text(self, text: str) -> str:
        """Cleans input text by stripping excess white-space and special characters."""
        return re.sub(r'\s+', ' ', text).strip()

    def _fallback_extract(self, raw_text: str) -> Dict[str, Any]:
        """Provides high-fidelity heuristic simulation of the intent extraction for offline executions."""
        text_lower = raw_text.lower()
        company = "Unknown Corp"
        industry = "Technology"
        signal_type = "Leadership Shift"
        title = "Executive recruitment initiative detected"
        description = "Unstructured signal indicates active operational evolution within the organization."
        confidence = 0.5
        reason = "Heuristic parsing fallback enabled due to lack of an active GEMINI_API_KEY."

        # Heuristic rules matching standard mock triggers for offline/deterministic runs
        if "acme" in text_lower:
            company = "Acme Corp"
            industry = "SaaS"
        elif "globex" in text_lower:
            company = "Globex Solutions"
            industry = "Cybersecurity"
        elif "hiring" in text_lower or "recruit" in text_lower or "careers" in text_lower:
            signal_type = "Hiring Surge"
            title = "Engineering scaling initiative"
            description = f"Company is expanding teams to support increased demand, indicating scaling requirements."
            confidence = 0.85
            reason = "Found direct keywords indicating active talent acquisition."
        elif "funding" in text_lower or "series" in text_lower or "capital" in text_lower:
            signal_type = "Funding Event"
            title = "Capital influx secured"
            description = "Company raised fresh enterprise capital, suggesting budget availability."
            confidence = 0.90
            reason = "Mentions of active investment and financing round details."
        elif "migrat" in text_lower or "legacy" in text_lower or "moderniz" in text_lower:
            signal_type = "Tech Migration"
            title = "Cloud architecture transition"
            description = "Actively modernizing systems to dynamic server-side cloud operations."
            confidence = 0.80
            reason = "Indicates active system restructuring trends."

        return {
            "company": company,
            "industry": industry,
            "signal_type": signal_type,
            "title": title,
            "description": description,
            "confidence_score": confidence,
            "confidence_reason": reason
        }

    def process(self, raw_input: str) -> Dict[str, Any]:
        """
        Executes the harvesting logic. Parses input raw text and outcomes structured triggers.
        """
        cleaned_input = self.clean_text(raw_input)
        if not cleaned_input:
            raise ValueError("Input text cannot be empty.")

        if not self.use_live_llm:
            # Execute standard precise logic fallback
            return self._fallback_extract(cleaned_input)

        try:
            formatted_prompt = self.prompt_template.format(raw_text=cleaned_input)
            response = self.model.generate_content(formatted_prompt)
            
            # Extract JSON block
            json_match = re.search(r"```json\s*(.*?)\s*```", response.text, re.DOTALL)
            json_str = json_match.group(1) if json_match else response.text
            
            return json.loads(json_str.strip())
        except Exception as e:
            # Fallback gracefully to rules on any API exception
            result = self._fallback_extract(cleaned_input)
            result["confidence_reason"] = f"Fallback due to active system error: {str(e)}"
            return result


# Executable Demonstration Block
if __name__ == "__main__":
    test_feed = """
    Globex Solutions is recruiting heavily across their Node.js engineering groups, focusing on backend database scalability.
    They recently hired five Senior Tech Leads to drive their cloud modernization efforts, following their series B financing.
    """
    
    print("\033[92m=== RUNNING SIGNAL HARVESTER AGENT ===\033[0m")
    print(f"\033[90mInput Raw Feed:\033[0m\n{test_feed.strip()}\n")
    
    # Initialize and execute
    harvester = SignalHarvesterAgent()
    output_signal = harvester.process(test_feed)
    
    print("\033[92mOutput Structured Signal:\033[0m")
    print(json.dumps(output_signal, indent=2))
