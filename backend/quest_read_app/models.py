import uuid

from django.db import models


class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    age_band = models.CharField(max_length=16)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    overall_score = models.FloatField(null=True, blank=True)
    risk_level = models.CharField(max_length=16, null=True, blank=True)
    summary = models.TextField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Session {self.id} ({self.age_band})"


class Round(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        Session, on_delete=models.CASCADE, related_name="rounds"
    )
    round_number = models.PositiveIntegerField(default=1)
    total_rounds = models.PositiveIntegerField(default=1)
    content = models.JSONField(default=dict)
    next_round = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["round_number", "created_at"]

    def __str__(self) -> str:
        return f"Round {self.id} (Session {self.session_id})"


class Event(models.Model):
    TASK_IMAGE_COLOR = "image_color"
    TASK_SCRAMBLE = "scramble"
    TASK_AUDIO_MISMATCH = "audio_mismatch"
    TASK_CHOICES = [
        (TASK_IMAGE_COLOR, "Image Color"),
        (TASK_SCRAMBLE, "Scramble"),
        (TASK_AUDIO_MISMATCH, "Audio Mismatch"),
    ]

    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        Session, on_delete=models.CASCADE, related_name="events"
    )
    round = models.ForeignKey(Round, on_delete=models.CASCADE, related_name="events")
    task_component = models.CharField(max_length=32, choices=TASK_CHOICES)
    selected = models.CharField(max_length=255)
    correct = models.CharField(max_length=255)
    is_correct = models.BooleanField()
    latency_ms = models.PositiveIntegerField()
    attempt_number = models.PositiveIntegerField(default=1)
    extra = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"Event {self.id} ({self.task_component})"
