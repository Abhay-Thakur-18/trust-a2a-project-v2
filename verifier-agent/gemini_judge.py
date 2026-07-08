import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None


def evaluate_report(report: str):
    if not client:
        raise RuntimeError("GEMINI_API_KEY is not configured for verifier.")

    prompt = f"""
You are an expert AI evaluator.

Evaluate the following report.

Give marks out of 100 based on:

1. Structure
2. Completeness
3. Accuracy
4. Professional Writing
5. References

Return ONLY valid JSON with a detailed feedback paragraph (3-5 sentences covering strengths, gaps, and release recommendation).

Example:

{{
    "verified": true,
    "score": 92,
    "feedback": "The report follows a professional structure with clear executive summary, market overview, and conclusion. Section completeness is strong and references are present. Minor gaps in trend depth were noted, but overall quality is high enough for trusted release. Recommended for escrow payment release."
}}

REPORT:

{report}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip()

    # Gemini kabhi kabhi ```json ... ``` return karta hai
    text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)