import json

from django.test import TestCase

from .models import Event, Session


class BaseQuestApiTestCase(TestCase):
    def start_session(self, age_band: str = "6-7") -> dict[str, str]:
        response = self.client.post(
            "/sessions/start",
            data=json.dumps({"age_band": age_band}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        return response.json()

    def get_round(self, round_id: str) -> dict:
        response = self.client.get(f"/rounds/{round_id}")
        self.assertEqual(response.status_code, 200)
        return response.json()

    def build_event_payload(
        self,
        session_id: str,
        round_payload: dict,
        task_component: str,
        *,
        selected: str | None = None,
        latency_ms: int = 900,
        attempt_number: int = 1,
        extra: dict | None = None,
    ) -> dict:
        challenge = round_payload["challenges"][task_component]
        correct_answer = challenge["correct_answer"]
        chosen_answer = selected or correct_answer

        payload = {
            "session_id": session_id,
            "round_id": round_payload["round_id"],
            "task_component": task_component,
            "selected": chosen_answer,
            "correct": correct_answer,
            "is_correct": chosen_answer == correct_answer,
            "latency_ms": latency_ms,
            "attempt_number": attempt_number,
        }
        if extra is not None:
            payload["extra"] = extra
        return payload

    def post_event(self, payload: dict, expected_status: int = 201):
        response = self.client.post(
            "/events",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, expected_status)
        return response


class FunctionalTestingProcedureTests(BaseQuestApiTestCase):
    def test_end_to_end_flow_generates_final_report(self):
        started = self.start_session(age_band="8-9")
        session_id = started["session_id"]

        first_round = self.get_round(started["first_round_id"])
        self.assertEqual(first_round["round_number"], 1)
        self.assertEqual(first_round["total_rounds"], 2)
        self.assertIsNotNone(first_round["next_round_id"])

        for component in ("image_color", "scramble", "audio_mismatch"):
            self.post_event(
                self.build_event_payload(
                    session_id,
                    first_round,
                    component,
                    extra={"audio_replay_count": 1}
                    if component == "audio_mismatch"
                    else None,
                )
            )

        second_round = self.get_round(first_round["next_round_id"])
        self.assertEqual(second_round["round_number"], 2)
        self.assertIsNone(second_round["next_round_id"])

        for component in ("image_color", "scramble", "audio_mismatch"):
            self.post_event(
                self.build_event_payload(
                    session_id,
                    second_round,
                    component,
                    extra={"audio_replay_count": 2}
                    if component == "audio_mismatch"
                    else None,
                )
            )

        finish_response = self.client.post(f"/sessions/{session_id}/finish")
        self.assertEqual(finish_response.status_code, 200)

        report = finish_response.json()
        self.assertEqual(report["risk_level"], "low")
        self.assertEqual(report["overall_score"], 100.0)
        self.assertEqual(
            set(report["subscores"].keys()),
            {"image_color", "scramble", "audio_mismatch"},
        )
        self.assertIn("Strong early-reading indicators observed.", report["summary"])

        session = Session.objects.get(id=session_id)
        self.assertIsNotNone(session.finished_at)
        self.assertEqual(session.risk_level, "low")
        self.assertEqual(session.overall_score, 100.0)
        self.assertEqual(Event.objects.filter(session=session).count(), 6)

    def test_report_generation_reflects_submitted_event_accuracy(self):
        started = self.start_session(age_band="6-7")
        session_id = started["session_id"]
        round_payload = self.get_round(started["first_round_id"])

        components = ("image_color", "scramble", "audio_mismatch")
        for index, component in enumerate(components):
            challenge = round_payload["challenges"][component]
            selected = (
                challenge["correct_answer"]
                if index < 2
                else next(
                    option
                    for option in challenge["options"]
                    if option != challenge["correct_answer"]
                )
            )
            self.post_event(
                self.build_event_payload(
                    session_id,
                    round_payload,
                    component,
                    selected=selected,
                    latency_ms=500 + (index * 100),
                )
            )

        finish_response = self.client.post(f"/sessions/{session_id}/finish")
        self.assertEqual(finish_response.status_code, 200)

        report = finish_response.json()
        self.assertEqual(report["overall_score"], 66.67)
        self.assertEqual(report["risk_level"], "medium")
        self.assertEqual(report["subscores"]["audio_mismatch"]["accuracy"], 0.0)
        self.assertEqual(report["subscores"]["scramble"]["accuracy"], 100.0)


class InputValidationTestingProcedureTests(BaseQuestApiTestCase):
    def setUp(self):
        super().setUp()
        started = self.start_session(age_band="6-7")
        self.session_id = started["session_id"]
        self.round_payload = self.get_round(started["first_round_id"])

    def test_invalid_age_band_is_rejected(self):
        response = self.client.post(
            "/sessions/start",
            data=json.dumps({"age_band": "12-13"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["detail"],
            "age_band must be one of: 4-5, 6-7, 8-9, 10-11",
        )

    def test_missing_session_identifier_is_rejected(self):
        payload = self.build_event_payload(
            self.session_id, self.round_payload, "image_color"
        )
        payload.pop("session_id")

        response = self.post_event(payload, expected_status=400)
        self.assertEqual(response.json()["detail"], "Missing fields: session_id")

    def test_negative_latency_value_is_rejected(self):
        payload = self.build_event_payload(
            self.session_id,
            self.round_payload,
            "image_color",
            latency_ms=-25,
        )

        response = self.post_event(payload, expected_status=400)
        self.assertEqual(
            response.json()["detail"], "latency_ms must be non-negative"
        )

    def test_invalid_task_component_label_is_rejected(self):
        payload = self.build_event_payload(
            self.session_id, self.round_payload, "image_color"
        )
        payload["task_component"] = "phonics"

        response = self.post_event(payload, expected_status=400)
        self.assertEqual(response.json()["detail"], "task_component is invalid")

    def test_malformed_correctness_fields_are_rejected(self):
        payload = self.build_event_payload(
            self.session_id, self.round_payload, "scramble"
        )
        payload["is_correct"] = not payload["is_correct"]

        response = self.post_event(payload, expected_status=400)
        self.assertEqual(
            response.json()["detail"],
            "is_correct does not match the submitted answer and round configuration",
        )

    def test_cannot_finish_before_all_three_mini_challenges_are_completed(self):
        self.post_event(
            self.build_event_payload(self.session_id, self.round_payload, "image_color")
        )
        self.post_event(
            self.build_event_payload(self.session_id, self.round_payload, "scramble")
        )

        response = self.client.post(f"/sessions/{self.session_id}/finish")
        self.assertEqual(response.status_code, 400)

        payload = response.json()
        self.assertEqual(
            payload["detail"],
            "Cannot finish session before all three mini-challenges are completed",
        )
        self.assertEqual(len(payload["incomplete_rounds"]), 1)
        self.assertEqual(
            payload["incomplete_rounds"][0]["missing_components"],
            ["audio_mismatch"],
        )
