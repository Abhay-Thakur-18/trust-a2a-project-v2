# =========================
# REPUTATION SYSTEM
# =========================

reputation_db = {}


def init_agent(agent_id: str):
    if agent_id not in reputation_db:
        reputation_db[agent_id] = {
            "agent_id": agent_id,
            "completed_tasks": 0,
            "failed_tasks": 0,
            "total_tasks": 0,
            "success_rate": 100.0,
            "reputation_score": 100
        }


def update_reputation(agent_id: str, success: bool):

    init_agent(agent_id)

    agent = reputation_db[agent_id]

    agent["total_tasks"] += 1

    if success:
        agent["completed_tasks"] += 1
        agent["reputation_score"] = min(100, agent["reputation_score"] + 2)
    else:
        agent["failed_tasks"] += 1
        agent["reputation_score"] = max(0, agent["reputation_score"] - 10)

    agent["success_rate"] = round(
        (agent["completed_tasks"] / agent["total_tasks"]) * 100,
        2
    )

    return agent


def get_reputation(agent_id: str):

    init_agent(agent_id)

    return reputation_db[agent_id]


def get_all_reputations():
    return reputation_db