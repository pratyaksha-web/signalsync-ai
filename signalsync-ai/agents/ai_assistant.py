#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AI Assistant Agent
Role: Conversational Sales Operations Copilot aggregating pipeline state to synthesize analytical reports.
"""

import os
import json
import re
from typing import Dict, Any, List, Optional

# Attempt to import Google's Generative AI SDK for execution if configured
try:
    import google.generativeai as genai
    HAS_GEMINI_SDK = True
except ImportError:
    HAS_GEMINI_SDK = False


class AIAssistantAgent:
    """
    Agent providing analytical, conversational command actions over sales pipeline metadata,
    generating reports, sorting leads, and suggesting structural improvements.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.use_live_llm = HAS_GEMINI_SDK and bool(self.api_key)

        if self.use_live_llm:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")

        # Prompt template establishing conversational context, data grounding, and visual constraints
        self.prompt_template = """
You are 'Harvester Assistant' - an elite Sales Operations and Pipeline Strategy Co-pilot. Your role is to interpret the user's operational query and generate a precise, actionable, data-grounded report.

Current Pipeline Consolidated State:
{state_json}

User Operational Query:
"{query}"

Please review the consolidated state carefully and synthesize a highly structured Response adhering to these formatting principles:
1. Ground every conclusion on real numbers and properties in the state. No halluncinations.
2. Structure your response in clean Markdown with scannable headers, bold text elements, and a small ASCII-like data layout representing comparative values where appropriate.
3. Keep the tone professional, direct, objective, and action-focused. Provide concrete recommendations.

Output the final report directly in clean Markdown format without enclosing JSON envelopes.
"""

    def _fallback_interact(self, query: str, state: Dict[str, Any]) -> str:
        """Procedural natural language fallback interpreter resolving standard pipeline queries."""
        query_lc = query.lower()
        leads: List[Dict[str, Any]] = state.get("leads", [])
        signals_count = state.get("total_signals", 0)
        total_value = sum(lead.get("estimated_arr_value", 0) for lead in leads)

        # 1. Structure summary data lines
        lead_summary = ""
        for lead in leads:
            lead_summary += f"- **{lead.get('company')}** (Score: {lead.get('lead_score')}%, Tier: {lead.get('fit_tier')}, Value: ${lead.get('estimated_arr_value', 0):,} ARR)\n"

        if "high" in query_lc or "p0" in query_lc or "score" in query_lc:
            # Filter high priority
            filtered = [l for l in leads if l.get("lead_score", 0) >= 80]
            header = "### 🎯 TOP PRIORITY PIPELINE BREAKDOWN (Score >= 80%)\n"
            data_block = ""
            for l in filtered:
                bar = "█" * int(l.get("lead_score", 0) // 10)
                data_block += f"{l.get('company'):<20} | {l.get('lead_score')}% | {bar:<10} | ${l.get('estimated_arr_value', 0):,} ARR\n"
            
            sub_analysis = (
                f"We currently have **{len(filtered)} leads** meeting high priority thresholds (P0/P1 Tier).\n"
                f"Combined target opportunity ARR for these segments represents **${sum(l.get('estimated_arr_value', 0) for l in filtered):,}**.\n"
            )
        else:
            header = "### 📊 AUTO-PILOT PIPELINE CONSOLIDATED HEALTH REPORT\n"
            sub_analysis = (
                f"The sales autopilot dashboard is actively tracking **{signals_count} signals** from enterprise crawler nodes.\n"
                f"Total aggregated prospective ARR inside pipeline is currently **${total_value:,} ARR**.\n"
            )
            data_block = "Company Name         | Score | Status\n" + "-"*40 + "\n"
            for l in leads:
                data_block += f"{l.get('company'):<20} | {l.get('lead_score')}%  | {l.get('fit_tier').split(' - ')[0]}\n"

        report_markdown = f"""{header}
{sub_analysis}
#### 📋 Current Target Leads Registry
{lead_summary}
#### 🛠️ Live Visual metrics Mapping
```text
{data_block}```

#### 💡 System Next-Action Recommendations:
1. **Target outreach dispatching:** High scoring leads have high potential. Trigger AI Assisted outreach using the CRM Workflow module.
2. **Review incoming intent signals:** Expand raw crawlers to locate additional indicators.
"""
        return report_markdown

    def process(self, query: str, state_summary: Dict[str, Any]) -> str:
        """
        Processes conversational pipeline queries and compiles structured Markdown recommendations.
        """
        if not query or not state_summary:
            raise ValueError("Query and state_summary are required inputs.")

        if not self.use_live_llm:
            return self._fallback_interact(query, state_summary)

        try:
            formatted_prompt = self.prompt_template.format(
                state_json=json.dumps(state_summary, indent=2),
                query=query
            )
            response = self.model.generate_content(formatted_prompt)
            return response.text.strip()
        except Exception as e:
            return f"### AI Copilot Interaction Failed\n\nFallback reporting is active due to processing error: `{str(e)}`\n\n" + self._fallback_interact(query, state_summary)


# Executable Demonstration Block
if __name__ == "__main__":
    sample_pipeline_state = {
        "total_signals": 142,
        "active_harvest_nodes": 3,
        "leads": [
            {
                "company": "Globex Solutions",
                "lead_score": 85,
                "fit_tier": "P0 - High Urgency ICP",
                "estimated_arr_value": 75000
            },
            {
                "company": "Initech Softwares",
                "lead_score": 62,
                "fit_tier": "P2 - Moderate Fit",
                "estimated_arr_value": 18000
            },
            {
                "company": "Omni Consumer Prod",
                "lead_score": 94,
                "fit_tier": "P0 - High Urgency ICP",
                "estimated_arr_value": 150000
            }
        ]
    }

    test_queries = [
        "Give me a consolidated health report of the active pipeline.",
        "List high scorers (P0 tier) and draw a visual comparison of their scores."
    ]

    print("\033[96m=== RUNNING AI ASSISTANT AGENT ===\033[0m")
    assistant = AIAssistantAgent()

    for idx, q in enumerate(test_queries, 1):
        print(f"\n\033[97mQuery {idx}: '{q}'\033[0m")
        report = assistant.process(q, sample_pipeline_state)
        print("\033[96mAssistant Response:\033[0m")
        print(report)
        print("-" * 60)
