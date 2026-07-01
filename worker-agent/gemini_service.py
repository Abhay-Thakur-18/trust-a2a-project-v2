import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("API Key Loaded:", "YES" if api_key else "NO")

client = genai.Client(api_key=api_key)


def generate_report(task: str):
    prompt = f"""
You are a professional research analyst.

Generate a detailed report on:

{task}

The report must contain:

# Title

## Executive Summary

## Market Overview

## Current Trends

## Opportunities

## Challenges

## Future Scope

## Conclusion

## References

Return only Markdown.
"""

    try:
        print("Sending request to Gemini...")

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        print("Gemini response received.")

        return response.text

    except Exception as e:
        print("Gemini Error:", str(e))
        raise