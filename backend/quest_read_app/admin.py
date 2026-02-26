from django.contrib import admin
from .models import Event, Round, Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("id", "age_band", "started_at", "finished_at", "overall_score", "risk_level")
    search_fields = ("id", "age_band")


@admin.register(Round)
class RoundAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "round_number", "total_rounds", "next_round", "created_at")
    search_fields = ("id", "session__id")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "session",
        "round",
        "task_component",
        "is_correct",
        "latency_ms",
        "attempt_number",
        "created_at",
    )
    list_filter = ("task_component", "is_correct")
    search_fields = ("session__id", "round__id", "selected", "correct")
