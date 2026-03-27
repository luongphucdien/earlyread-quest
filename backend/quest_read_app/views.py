import json
from typing import Any
import random

from django.db.models import Avg, Count, Q
from django.http import HttpRequest, HttpResponseNotAllowed, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import Event, Round, Session

AGE_BANDS = ("4-5", "6-7", "8-9", "10-11")
TASK_COMPONENTS = tuple(choice for choice, _label in Event.TASK_CHOICES)


def _read_json_body(request: HttpRequest) -> dict[str, Any]:
    if not request.body:
        return {}
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return {}
    return payload if isinstance(payload, dict) else {}


def _bad_request(detail: str, **extra: Any) -> JsonResponse:
    payload = {"detail": detail}
    payload.update(extra)
    return JsonResponse(payload, status=400)


def _normalize_age_band(age_band: Any) -> str:
    normalized = str(age_band or "").strip()
    return normalized


def _validate_age_band(age_band: Any) -> str | None:
    normalized = _normalize_age_band(age_band)
    return normalized if normalized in AGE_BANDS else None


def _parse_non_negative_int(value: Any, field_name: str) -> int:
    try:
        parsed_value = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be an integer") from None

    if parsed_value < 0:
        raise ValueError(f"{field_name} must be non-negative")

    return parsed_value


def _parse_positive_int(value: Any, field_name: str) -> int:
    parsed_value = _parse_non_negative_int(value, field_name)
    if parsed_value < 1:
        raise ValueError(f"{field_name} must be greater than or equal to 1")
    return parsed_value


def _validate_event_payload(
    payload: dict[str, Any], round_obj: Round
) -> tuple[dict[str, Any] | None, JsonResponse | None]:
    task_component = str(payload.get("task_component", "")).strip()
    if task_component not in TASK_COMPONENTS:
        return None, _bad_request("task_component is invalid")

    if not isinstance(payload.get("is_correct"), bool):
        return None, _bad_request("is_correct must be a boolean")

    selected = str(payload.get("selected", "")).strip()
    submitted_correct = str(payload.get("correct", "")).strip()
    if not selected:
        return None, _bad_request("selected must be a non-empty string")
    if not submitted_correct:
        return None, _bad_request("correct must be a non-empty string")

    try:
        latency_ms = _parse_non_negative_int(payload.get("latency_ms"), "latency_ms")
        attempt_number = _parse_positive_int(
            payload.get("attempt_number"), "attempt_number"
        )
    except ValueError as exc:
        return None, _bad_request(str(exc))

    content = round_obj.content if isinstance(round_obj.content, dict) else {}
    challenges = content.get("challenges", {})
    challenge = challenges.get(task_component)
    if not isinstance(challenge, dict):
        return None, _bad_request("task_component is not available in this round")

    options = challenge.get("options", [])
    if selected not in options:
        return None, _bad_request("selected must match one of the available options")

    expected_correct = str(challenge.get("correct_answer", "")).strip()
    derived_is_correct = selected == expected_correct
    if submitted_correct != expected_correct:
        return None, _bad_request("correct does not match the round configuration")
    if payload.get("is_correct") is not derived_is_correct:
        return None, _bad_request(
            "is_correct does not match the submitted answer and round configuration"
        )

    if Event.objects.filter(round=round_obj, task_component=task_component).exists():
        return None, _bad_request("This mini-challenge has already been submitted")

    extra = payload.get("extra")
    if extra is not None and not isinstance(extra, dict):
        return None, _bad_request("extra must be an object when provided")

    return (
        {
            "task_component": task_component,
            "selected": selected,
            "correct": expected_correct,
            "is_correct": derived_is_correct,
            "latency_ms": latency_ms,
            "attempt_number": attempt_number,
            "extra": extra or {},
        },
        None,
    )


def _incomplete_rounds_for_session(session: Session) -> list[dict[str, Any]]:
    expected_components = set(TASK_COMPONENTS)
    grouped_events = (
        Event.objects.filter(session=session)
        .values("round_id")
        .annotate(components_seen=Count("task_component", distinct=True))
    )
    counts_by_round = {
        str(row["round_id"]): row["components_seen"] for row in grouped_events
    }

    incomplete_rounds: list[dict[str, Any]] = []
    for round_obj in session.rounds.all():
        seen_components = set(
            Event.objects.filter(round=round_obj).values_list(
                "task_component", flat=True
            )
        )
        missing_components = sorted(expected_components - seen_components)
        if missing_components:
            incomplete_rounds.append(
                {
                    "round_id": str(round_obj.id),
                    "round_number": round_obj.round_number,
                    "completed_components": counts_by_round.get(str(round_obj.id), 0),
                    "required_components": len(expected_components),
                    "missing_components": missing_components,
                }
            )

    return incomplete_rounds


def _difficulty_level(age_band: str, round_number: int) -> int:
    base_level = AGE_BANDS.index(age_band)
    # Older ages start harder. Each new round can increase difficulty one step.
    return min(3, base_level + max(0, round_number - 1))


def _total_rounds_for_age(age_band: str) -> int:
    return 1 if age_band in {"4-5", "6-7"} else 2


def _image_color_challenge(round_number: int, level: int) -> dict[str, Any]:
    correct_ans_1 = "Yellow"
    correct_ans_2 = 'Red'
    color_options = ["Blue", 'Green', 'Purple', 'Orange', "Gold", 'Amber', "Mustard"]

    random_options = random.sample(color_options, 3)

    if round_number == 1:
        prompts = [
            "Tap the color of the banana.",
            "What color is the banana?",
            "Choose the best color label for the banana.",
            "Pick the most accurate color for the banana peel.",
        ]
        random_options.append(correct_ans_1)
        random.shuffle(random_options)
        return {
            "prompt": random.choice(prompts),
            "image_url": "https://images.unsplash.com/photo-1603833665858-e61d17a86224",
            "options": random_options,
            "correct_answer": correct_ans_1,
        }

    prompts = [
        "Tap the color of the apple.",
        "What color is the apple shown?",
        "Choose the best color label for the apple.",
        "Pick the most accurate color for this apple.",
    ]
    random_options.append(correct_ans_2)
    random.shuffle(random_options)
    return {
        "prompt": prompts[level],
        "image_url": "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce",
        "options": random_options,
        "correct_answer": correct_ans_2,
    }


def _scramble_challenge(round_number: int, level: int) -> dict[str, Any]:
    if round_number == 1:
        challenge_by_level = [
            {
                "scrambled_word": "CTA",
                "options": ["CAT", "ACT", "TAC", "CTA"],
                "correct_answer": "CAT",
            },
            {
                "scrambled_word": "RIBD",
                "options": ["BIRD", "BRID", "DRIB", "BIDR"],
                "correct_answer": "BIRD",
            },
            {
                "scrambled_word": "NPELIC",
                "options": ["PENCIL", "PINECL", "CLIPEN", "PENCLI"],
                "correct_answer": "PENCIL",
            },
            {
                "scrambled_word": "LEPHATNE",
                "options": ["ELEPHANT", "ELPHANTE", "ELEPHTAN", "ELPHATEN"],
                "correct_answer": "ELEPHANT",
            },
        ]
    else:
        challenge_by_level = [
            {
                "scrambled_word": "DOG",
                "options": ["DOG", "GOD", "ODG", "DGO"],
                "correct_answer": "DOG",
            },
            {
                "scrambled_word": "PANEL",
                "options": ["PLANE", "PANEL", "PENAL", "PLENA"],
                "correct_answer": "PLANE",
            },
            {
                "scrambled_word": "LOCHSO",
                "options": ["SCHOOL", "CHOOLS", "SOCHOL", "CHSLOO"],
                "correct_answer": "SCHOOL",
            },
            {
                "scrambled_word": "GNLAITER",
                "options": ["TRIANGLE", "TRAINGLE", "TRIANGEL", "TRINAGEL"],
                "correct_answer": "TRIANGLE",
            },
        ]

    prompt_by_level = [
        "Fix the scrambled word.",
        "Fix the scrambled word.",
        "Rebuild the correctly spelled word.",
        "Rebuild the correctly spelled word.",
    ]
    return {
        "prompt": prompt_by_level[level],
        **challenge_by_level[level],
    }


def _audio_mismatch_challenge(round_number: int, level: int) -> dict[str, Any]:
    audio_urls = {
        "Rain": "https://cdn.pixabay.com/audio/2026/03/10/audio_feb4530766.mp3",
        "Dog": "https://cdn.pixabay.com/audio/2025/10/12/audio_c89bb7f7f9.mp3",
        "Bird": "https://cdn.pixabay.com/audio/2026/02/10/audio_004926ac57.mp3"
    }
    texts = list(audio_urls.keys())
    # audio_url = (
    #     "https://cdn.pixabay.com/audio/2026/03/10/audio_feb4530766.mp3"
    #     if round_number == 1
    #     else "https://cdn.pixabay.com/audio/2026/03/10/audio_feb4530766.mp3"
    # )
    # shown_text_by_level = ["Rain", "Rain", "Dog", "Thunderstorm"]
    # correct_by_level = ["Yes", "Yes", "No", "No"]
    prompts = [
        "Listen to the sound. Does it match the word?",
        "Does the audio match the shown text?",
        "Listen carefully. Does the audio match the shown text?",
        "Compare the audio and text. Do they match exactly?",
    ]
    audio = random.choice(texts)
    text = random.choice(texts)
    return {
        "prompt": random.choice(prompts),
        "audio_url": audio_urls[audio],
        "shown_text": text,
        "options": ["Yes", "No"],
        "correct_answer": "Yes" if audio == text else "No" ,
    }


def _build_round_content(round_number: int, age_band: str) -> dict[str, Any]:
    level = _difficulty_level(age_band, round_number)
    return {
        "challenges": {
            "image_color": _image_color_challenge(round_number, level),
            "scramble": _scramble_challenge(round_number, level),
            "audio_mismatch": _audio_mismatch_challenge(round_number, level),
        }
    }


@csrf_exempt
def start_session(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    payload = _read_json_body(request)
    age_band = _validate_age_band(payload.get("age_band"))
    if age_band is None:
        return _bad_request(
            "age_band must be one of: 4-5, 6-7, 8-9, 10-11"
        )

    total_rounds = _total_rounds_for_age(age_band)

    session = Session.objects.create(age_band=age_band)
    round_one = Round.objects.create(
        session=session,
        round_number=1,
        total_rounds=total_rounds,
        content=_build_round_content(1, age_band),
    )

    if total_rounds > 1:
        round_two = Round.objects.create(
            session=session,
            round_number=2,
            total_rounds=total_rounds,
            content=_build_round_content(2, age_band),
        )
        round_one.next_round = round_two
        round_one.save(update_fields=["next_round"])

    return JsonResponse(
        {"session_id": str(session.id), "first_round_id": str(round_one.id)}, status=201
    )


def get_round(request: HttpRequest, round_id: str):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    try:
        round_obj = Round.objects.get(id=round_id)
    except Round.DoesNotExist:
        return JsonResponse({"detail": "Round not found"}, status=404)

    content = round_obj.content if isinstance(round_obj.content, dict) else {}
    challenges = content.get("challenges", {})

    return JsonResponse(
        {
            "round_id": str(round_obj.id),
            "round_number": round_obj.round_number,
            "total_rounds": round_obj.total_rounds,
            "next_round_id": str(round_obj.next_round_id) if round_obj.next_round_id else None,
            "challenges": challenges,
        }
    )


@csrf_exempt
def log_event(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    payload = _read_json_body(request)
    required_fields = [
        "session_id",
        "round_id",
        "task_component",
        "selected",
        "correct",
        "is_correct",
        "latency_ms",
        "attempt_number",
    ]
    missing_fields = [field for field in required_fields if field not in payload]
    if missing_fields:
        return _bad_request(f"Missing fields: {', '.join(missing_fields)}")

    try:
        session = Session.objects.get(id=payload["session_id"])
        round_obj = Round.objects.get(id=payload["round_id"], session=session)
    except (Session.DoesNotExist, Round.DoesNotExist):
        return JsonResponse({"detail": "Session or round not found"}, status=404)

    validated_payload, error_response = _validate_event_payload(payload, round_obj)
    if error_response is not None:
        return error_response

    Event.objects.create(
        session=session,
        round=round_obj,
        task_component=validated_payload["task_component"],
        selected=validated_payload["selected"],
        correct=validated_payload["correct"],
        is_correct=validated_payload["is_correct"],
        latency_ms=validated_payload["latency_ms"],
        attempt_number=validated_payload["attempt_number"],
        extra=validated_payload["extra"],
    )

    return JsonResponse({"ok": True}, status=201)


@csrf_exempt
def finish_session(request: HttpRequest, session_id: str):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        session = Session.objects.get(id=session_id)
    except Session.DoesNotExist:
        return JsonResponse({"detail": "Session not found"}, status=404)

    incomplete_rounds = _incomplete_rounds_for_session(session)
    if incomplete_rounds:
        return _bad_request(
            "Cannot finish session before all three mini-challenges are completed",
            incomplete_rounds=incomplete_rounds,
        )

    grouped = (
        Event.objects.filter(session=session)
        .values("task_component")
        .annotate(
            total=Count("id"),
            correct_total=Count("id", filter=Q(is_correct=True)),
            avg_latency=Avg("latency_ms"),
        )
    )

    subscores: dict[str, dict[str, float]] = {}
    category_accuracies: list[float] = []
    for row in grouped:
        total = row["total"] or 0
        correct_total = row["correct_total"] or 0
        accuracy = (correct_total / total * 100.0) if total else 0.0
        category_accuracies.append(accuracy)
        subscores[row["task_component"]] = {
            "accuracy": round(accuracy, 2),
            "avgResponseTimeMs": round(float(row["avg_latency"] or 0.0), 2),
        }

    overall_score = (
        round(sum(category_accuracies) / len(category_accuracies), 2)
        if category_accuracies
        else 0.0
    )

    if overall_score >= 80:
        risk_level = "low"
    elif overall_score >= 50:
        risk_level = "medium"
    else:
        risk_level = "high"

    summary = (
        "Strong early-reading indicators observed."
        if risk_level == "low"
        else "Mixed performance; monitor progress and continue guided reading."
        if risk_level == "medium"
        else "Potential reading-risk indicators detected; consider specialist follow-up."
    )

    session.finished_at = timezone.now()
    session.overall_score = overall_score
    session.risk_level = risk_level
    session.summary = summary
    session.save(
        update_fields=["finished_at", "overall_score", "risk_level", "summary"]
    )

    return JsonResponse(
        {
            "subscores": subscores,
            "overall_score": overall_score,
            "risk_level": risk_level,
            "summary": summary,
            "next_round_id": None,
        }
    )
