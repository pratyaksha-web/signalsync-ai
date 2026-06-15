#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
LeadHarvester AI Pipeline demo
Sequentially runs all 5 AI Agents to process crude business intelligence into highly targeted sales pipelines.
"""

import json
from signal_harvester import SignalHarvesterAgent
from intent_analyzer import IntentAnalyzerAgent
from lead_scorer import LeadScorerAgent
from workflow_agent import WorkflowAgent
from ai_assistant import AIAssistantAgent


def run_pipeline():
    print("\033[92m" + "="*70 + "\033[0m")
    print("\033[92m🚀 STARTING AUTONOMOUS LEADHARVESTER COOPERATIVE PIPELINE 🚀\033[0m")
    print("\033[92m" + "="*70 + "\033[0m")

    # Raw intelligence feed representing incoming internet crawler scans
    raw_feed = """
    Omni Consumer Products has just announced they are migrating their legacy telemetry engines 
    to modern Node.js and AWS cloud clusters to support rapid scaling of their autonomous security robotic fleets.
    To execute this migration, their engineering team is opening 15 new senior DevOps and Backend DevOps roles.
    """

    # 1. Pipeline Stage 1: Signal Harvesting
    print("\n\033[95m[STAGE 1] Agent 1: Signal Harvester — Ingesting intelligence nodes...\033[0m")
    harvester = SignalHarvesterAgent()
    signal = harvester.process(raw_feed)
    print(f"✔️ Captured Trigger: \033[93m{signal.get('title')}\033[0m for company \033[93m{signal.get('company')}\033[0m")
    print(json.dumps(signal, indent=2))

    # 2. Pipeline Stage 2: Intent Analyzing
    print("\n\033[95m[STAGE 2] Agent 2: Intent Analyzer — Mapping corporate triggers to buyer pain points...\033[0m")
    analyzer = IntentAnalyzerAgent()
    intent_profile = analyzer.process(signal)
    print(f"✔️ Derived Intent Category: \033[93m{intent_profile.get('intent_category')}\033[0m // Urgency: \033[93m{intent_profile.get('intent_strength')}\033[0m")
    print(json.dumps(intent_profile, indent=2))

    # 3. Pipeline Stage 3: Lead Scoring
    print("\n\033[95m[STAGE 3] Agent 3: Lead Scorer — Aligning intent telemetry with ICP metadata...\033[0m")
    # Firmographic details fetched from enrichment sources (e.g., Apollo, Clearbit, ZoomInfo proxy)
    firmographics = {
        "company": signal.get("company", "Omni Consumer Products"),
        "employee_count": 650,
        "hq_location": "Detroit, MI",
        "tech_stack": ["Node.js", "C++", "AWS Cloud", "Docker"],
        "industry": "Autonomous Systems"
    }
    scorer = LeadScorerAgent()
    qualification_profile = scorer.process(firmographics, intent_profile)
    print(f"✔️ Pipeline Qualification: Fit Score = \033[93m{qualification_profile.get('lead_score')}%\033[0m // Tier = \033[93m{qualification_profile.get('fit_tier')}\033[0m")
    print(f"💰 Projected Contract Value (ARR): \033[92m${qualification_profile.get('estimated_arr_value', 0):,}\033[0m")
    print(json.dumps(qualification_profile, indent=2))

    # 4. Pipeline Stage 4: Workflow Campaign Creation
    print("\n\033[95m[STAGE 4] Agent 4: Workflow Agent — Crafting personalized outreach & webhook scripts...\033[0m")
    contact_data = {
        "company": firmographics.get("company"),
        "contact_name": "Dr. Aris Vance",
        "contact_title": "VP of Engineering & DevOps Architecture",
        "contact_email": "aris.vance@omnicorp.com",
        "lead_score": qualification_profile.get("lead_score"),
        "fit_tier": qualification_profile.get("fit_tier"),
        "estimated_arr_value": qualification_profile.get("estimated_arr_value")
    }
    workflow = WorkflowAgent()
    outreach_recipe = workflow.process(contact_data, intent_profile)
    print(f"✔️ Primary Campaign Outreach Vector: \033[93m{outreach_recipe.get('outreach_channel')}\033[0m")
    print(f"✨ Custom Campaign Email Subject: \033[93m{outreach_recipe.get('subject_line')}\033[0m")
    print("\n📝 Compiled Email Body:")
    print("-" * 50)
    print(outreach_recipe.get("personalized_pitch_markdown"))
    print("-" * 50)
    print(f"📡 Dispatch Webhook Triggers: {json.dumps(outreach_recipe.get('workflow_triggers'), indent=2)}")

    # 5. Pipeline State 5: Conversational Operational Assistant
    print("\n\033[95m[STAGE 5] Agent 5: AI Assistant — Presenting pipeline updates to sales rep companion...\033[0m")
    state_summary = {
        "total_signals": 451,
        "active_harvest_nodes": 4,
        "leads": [
            {
                "company": contact_data.get("company"),
                "lead_score": contact_data.get("lead_score"),
                "fit_tier": contact_data.get("fit_tier"),
                "estimated_arr_value": contact_data.get("estimated_arr_value")
            },
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
            }
        ]
    }
    query = "Summarize top targets by ARR size and outline visual comparisons."
    assistant = AIAssistantAgent()
    assistant_report = assistant.process(query, state_summary)
    print(f"\033[97mReport Query: '{query}'\033[0m")
    print("\n\033[96mGenerated Analyst Copilot Report:\033[0m")
    print(assistant_report)

    print("\n\033[92m" + "="*70 + "\033[0m")
    print("\033[92m🎉 AUTONOMOUS PIPELINE PIPELINE EXECUTION COMPLETED SUCCESSFULLY 🎉\033[0m")
    print("\033[92m" + "="*70 + "\033[0m")


if __name__ == "__main__":
    run_pipeline()
