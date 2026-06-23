# =========================
# SIMPLE REPUTATION SYSTEM
# =========================

reputation_db = {}


def init_agent(agent_id: str):
    if agent_id not in reputation_db:
        reputation_db[agent_id] = {
            "completed_tasks": 0,
            "failed_tasks": 0,
            "reputation_score": 100
        }


def update_reputation(agent_id: str, success: bool):

    init_agent(agent_id)

    if success:
        reputation_db[agent_id]["completed_tasks"] += 1
        reputation_db[agent_id]["reputation_score"] += 5
    else:
        reputation_db[agent_id]["failed_tasks"] += 1
        reputation_db[agent_id]["reputation_score"] -= 10

    return reputation_db[agent_id]


def get_reputation(agent_id: str):

    init_agent(agent_id)
    return reputation_db[agent_id]