def generate_report(task: str) -> str:
    topic = task.replace("Generate", "").replace("generate", "").strip()

    report = f"""
# {topic}

## Executive Summary
This report provides an overview of {topic} and highlights its current state, major developments, and future potential.

## Market Overview
The market for {topic} is growing rapidly due to advancements in AI, cloud computing, and automation.

## Current Trends
- Increased AI adoption
- Automation across industries
- Growing investment
- Expansion of enterprise AI solutions

## Opportunities
- Business growth
- Cost optimization
- Better decision making
- Innovation

## Challenges
- Data privacy
- Security concerns
- High implementation cost
- Regulatory compliance

## Future Scope
The future of {topic} is promising with continued innovation and increasing global adoption.

## Conclusion
{topic} is expected to play a significant role in the coming years and create new opportunities across multiple industries.

## References
- Gartner
- McKinsey
- Deloitte
- Google AI
"""

    return report.strip()