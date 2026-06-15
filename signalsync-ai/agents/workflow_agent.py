#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Workflow Agent
Role: Structures high-converting personalized outreach pitches and maps automation tasks for webhook executions.
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


class WorkflowAgent:
    """
    Agent responsible for designing automated engagement templates, generating 
    proactive outreach copy, and defining CRM webhook automation steps.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.use_live_llm = HAS_GEMINI_SDK and bool(self.api_key)

        if self.use_live_llm:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")

        # Prompt template guiding high-impact personalization hooks and styling rules
        self.prompt_template = """
You are a master Sales Development Workflow Orchestrator. Your goal is to generate a highly personalized outreach recipe and an elegant, professional email pitch for the following scored lead.

Scored Lead and Contact Data:
{lead_json}

Active Intent Details:
{intent_json}

Instructions for Outreach Style:
- Professional, value-driven, and highly relevant. Mention their specific corporate trigger and the department affected.
- Keep the call to action low-stress (e.g., "Would you be open to a 5-minute product overview next Tuesday?").
- Avoid generic clickbait subject lines.

Output a strictly formatted JSON object with this exact structure:
{{
  "outreach_channel": "One of [Email, Linkedin InMail, Dedicated Demo Request]",
  "subject_line": "A compelling email subject line (under 60 characters)",
  "personalized_pitch_markdown": "A 3-paragraph outreach body written in clean Markdown format",
  "workflow_triggers": {{
    "crm_sync": "Suggested status label (e.g., Outreach Scheduled)",
    "slack_channel_alert": "Notification banner copy announcing the dispatch pipeline",
    "webhook_action": "POST payload category to fire to dispatch servers"
  }}
}}

Strict constraints:
1. Return ONLY a valid JSON block enclosed in ```json and ```.
2. Absolutely no preambles or post-match commentary.
"""

    def _fallback_generate_workflow(self, lead: Dict[str, Any], intent: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based procedural outreach synthesis engine."""
        company = lead.get("company", "Prospect Company")
        contact_name = lead.get("contact_name", "Valued Leader")
        contact_title = lead.get("contact_title", "Head of Engineering")
        intent_cat = intent.get("intent_category", "Expansion")
        
        # Build standard value proposition based on the intent category
        if "migrat" in intent_cat.lower() or "tech" in intent_cat.lower():
            value_prop = "Our intelligent code modernization engine helps companies transition legacy stacks without structural downtime or scaling regressions."
            trigger_context = "current modernizations and database pivots"
        elif "expansion" in intent_cat.lower() or "hiring" in intent_cat.lower():
            value_prop = "Our high-throughput orchestration tooling automates backend onboarding, allowing engineering leaders to double project volume without scaling friction."
            trigger_context = "rapid engineering expansion and development efforts"
        else:
            value_prop = "Our workflow analytics platform helps you identify, evaluate, and capitalize on product pipeline indicators automatically."
            trigger_context = "recent operational scaling and execution milestones"

        subject = f"Optimizing backend scalability at {company}"
        
        markdown_pitch = (
            f"Hi {contact_name.split()[0]},\n\n"
            f"I noticed the {trigger_context} currently underway at {company}. "
            f"Often, engineering teams scaling backend divisions face unexpected database bottlenecking "
            f"and code synchronization latency.\n\n"
            f"{value_prop} We work with organizations like yours to establish reliable, automated, "
            f"and highly performant pipelines.\n\n"
            f"Are you open to a brief 5-minute operational overview next week to compare methodologies?\n\n"
            f"Best regards,\n"
            f"Autonomous Agent // Sales Autopilot"
        )

        slack_alert = f"🚀 LeadHarvester Priority Outreach Generated for *{company}* ({contact_title} / {contact_name})"

        return {
            "outreach_channel": "Email",
            "subject_line": subject,
            "personalized_pitch_markdown": markdown_pitch,
            "workflow_triggers": {
                "crm_sync": "Outreach Draft Generated",
                "slack_channel_alert": slack_alert,
                "webhook_action": "trigger_email_dispatch"
            }
        }

    def process(self, lead: Dict[str, Any], intent: Dict[str, Any]) -> Dict[str, Any]:
        """
        Orchestrates output workflows and drafts high-impact personalized email outreach profiles.
        """
        if not lead or not intent:
            raise ValueError("Both lead and intent data must be provided.")

        if not self.use_live_llm:
            return self._fallback_generate_workflow(lead, intent)

        try:
            formatted_prompt = self.prompt_template.format(
                lead_json=json.dumps(lead, indent=2),
                intent_json=json.dumps(intent, indent=2)
            )
            response = self.model.generate_content(formatted_prompt)

            # Extract clean JSON
            json_match = re.search(r"```json\s*(.*?)\s*```", response.text, re.DOTALL)
            json_str = json_match.group(1) if json_match else response.text

            return json.loads(json_str.strip())
        except Exception as e:
            fallback = self._fallback_generate_workflow(lead, intent)
            fallback["personalized_pitch_markdown"] += f"\n\n*(Template compile system exception fallback: {str(e)})*"
            return fallback


# Executable Demonstration Block
if __name__ == "__main__":
    sample_lead = {
        "company": "Globex Solutions",
        "contact_name": "Sanjay Kapoor",
        "contact_title": "VP of Engineering & Cloud Infrastructure",
        "contact_email": "sanjay.kapoor@globex.io",
        "lead_score": 85,
        "fit_tier": "P0 - High Urgency ICP",
        "estimated_arr_value": 75000
    }

    sample_intent_profile = {
        "intent_category": "Expansion",
        "intent_strength": "High",
        "buying_stage": "Consideration",
        "buyer_pain_points": [
            "Bottlenecks in active engineering delivery",
            "High database latency under scaled request loads"
        ]
    }

    print("\033[95m=== RUNNING WORKFLOW AGENT ===\033[0m")
    print(f"\033[90mLead Input Data:\033[0m {json.dumps(sample_lead)}\n")

    workflow = WorkflowAgent()
    outreach_recipe = workflow.process(sample_lead, sample_intent_profile)

    print("\033[95mOutput Outreach Recipe & Pitch:\033[0m")
    print(json.dumps(outreach_recipe, indent=2))
