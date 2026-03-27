import random

from locust import HttpUser, between, task


AGE_BANDS = ("4-5", "6-7", "8-9", "10-11")
TASK_ORDER = ("image_color", "scramble", "audio_mismatch")


class EarlyReadQuestUser(HttpUser):
    wait_time = between(0.5, 1.5)

    def _start_session(self) -> dict:
        with self.client.post(
            "/sessions/start",
            json={"age_band": random.choice(AGE_BANDS)},
            name="POST /sessions/start",
            catch_response=True,
        ) as response:
            if response.status_code != 201:
                response.failure(f"Unexpected status: {response.status_code}")
                return {}
            return response.json()

    def _get_round(self, round_id: str) -> dict:
        with self.client.get(
            f"/rounds/{round_id}",
            name="GET /rounds/:round_id",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"Unexpected status: {response.status_code}")
                return {}
            return response.json()

    def _submit_event(self, session_id: str, round_payload: dict, component: str):
        challenge = round_payload["challenges"][component]
        selected = challenge["correct_answer"]
        payload = {
            "session_id": session_id,
            "round_id": round_payload["round_id"],
            "task_component": component,
            "selected": selected,
            "correct": challenge["correct_answer"],
            "is_correct": True,
            "latency_ms": random.randint(400, 1800),
            "attempt_number": 1,
        }
        if component == "audio_mismatch":
            payload["extra"] = {"audio_replay_count": random.randint(0, 2)}

        with self.client.post(
            "/events",
            json=payload,
            name="POST /events",
            catch_response=True,
        ) as response:
            if response.status_code != 201:
                response.failure(f"Unexpected status: {response.status_code}")

    def _finish_session(self, session_id: str):
        with self.client.post(
            f"/sessions/{session_id}/finish",
            name="POST /sessions/:session_id/finish",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"Unexpected status: {response.status_code}")

    @task
    def complete_session_flow(self):
        started = self._start_session()
        if not started:
            return

        session_id = started["session_id"]
        next_round_id = started["first_round_id"]

        while next_round_id:
            round_payload = self._get_round(next_round_id)
            if not round_payload:
                return

            for component in TASK_ORDER:
                self._submit_event(session_id, round_payload, component)

            next_round_id = round_payload.get("next_round_id")

        self._finish_session(session_id)
