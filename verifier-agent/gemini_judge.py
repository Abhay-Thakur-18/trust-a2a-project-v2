import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def evaluate_report(report: str):

    prompt = f"""
You are an expert AI evaluator.

Evaluate the following report.

Give marks out of 100 based on:

1. Structure
2. Completeness
3. Accuracy
4. Professional Writing
5. References

Return ONLY valid JSON.

Example:

{{
    "verified": true,
    "score": 92,
    "feedback": "Very professional report with complete sections."
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