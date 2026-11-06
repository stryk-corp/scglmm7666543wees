from __future__ import annotations

import threading
import time
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any

import requests
from kivy.app import App
from kivy.clock import Clock
from kivy.metrics import dp
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.gridlayout import GridLayout
from kivy.uix.label import Label
from kivy.uix.screenmanager import Screen, ScreenManager
from kivy.uix.scrollview import ScrollView
from kivy.uix.spinner import Spinner
from kivy.uix.textinput import TextInput
from kivy.core.window import Window
from kivy.graphics import Color, Ellipse, RoundedRectangle


PROJECT_ID = "scholarvee"
SITE_URL = "https://scholarverse.app"
FIREBASE_API_KEY = "AIzaSyAJzFQCl-G9bbmLbOiLd68oj743kBJUU64"
MAX_DOCS_PER_COLLECTION = 5000
REFRESH_SECONDS = 60

DATASETS = (
    "users",
    "transactions",
    "reports",
    "schoolEarnings",
    "generationDocuments",
    "generationJobs",
    "globalNotifications",
    "testimonials",
)

SECTIONS = {
    "Overview": "overview",
    "Users": "users",
    "Transactions": "transactions",
    "Reports": "reports",
    "AI Generation": "generation",
    "Universities": "universities",
    "Analytics": "analytics",
    "Activity": "activity",
}

DEFINITIONS = (
    ("users", "users", False, [
        "fullName", "displayName", "email", "universityName", "departmentName",
        "balance", "referralBalance", "referralCount", "createdAt",
    ]),
    ("transactions", "transactions", True, [
        "amount", "type", "status", "createdAt", "reference",
        "paystackReference", "method", "channel", "university",
    ]),
    ("reports", "reports", True, [
        "reportTitle", "title", "documentType", "universityName",
        "departmentName", "createdAt", "expiresAt",
    ]),
    ("schoolEarnings", "schoolEarnings", False, [
        "universityName", "reportCount", "totalEarnings", "updatedAt",
    ]),
    ("generationDocuments", "generationDocuments", True, [
        "ownerId", "title", "documentType", "status", "createdAt", "updatedAt",
    ]),
    ("generationJobs", "generationJobs", True, [
        "slotId", "documentId", "moveId", "status", "attempts", "updatedAt",
    ]),
    ("globalNotifications", "globalNotifications", False, [
        "title", "body", "createdAt",
    ]),
    ("testimonials", "testimonials", False, [
        "authorName", "testimonialText", "university", "createdAt",
    ]),
)

PALETTE = {
    "background": (0.045, 0.04, 0.12, 1),
    "panel": (0.09, 0.08, 0.19, 0.96),
    "panel_alt": (0.12, 0.10, 0.23, 1),
    "border": (0.34, 0.31, 0.54, 0.7),
    "text": (0.95, 0.96, 1, 1),
    "muted": (0.69, 0.72, 0.88, 1),
    "purple": (0.55, 0.36, 0.96, 1),
    "emerald": (0.20, 0.83, 0.60, 1),
    "cyan": (0.13, 0.81, 0.91, 1),
    "pink": (0.96, 0.45, 0.71, 1),
    "amber": (0.98, 0.75, 0.26, 1),
}


def decode_firestore_value(value: dict[str, Any]) -> Any:
    if "stringValue" in value:
        return value["stringValue"]
    if "integerValue" in value:
        return int(value["integerValue"])
    if "doubleValue" in value:
        return float(value["doubleValue"])
    if "booleanValue" in value:
        return value["booleanValue"]
    if "timestampValue" in value:
        return value["timestampValue"]
    if "nullValue" in value:
        return None
    if "mapValue" in value:
        return {
            key: decode_firestore_value(field)
            for key, field in value["mapValue"].get("fields", {}).items()
        }
    if "arrayValue" in value:
        return [
            decode_firestore_value(item)
            for item in value["arrayValue"].get("values", [])
        ]
    return None


def as_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value.replace(tzinfo=None) if value.tzinfo else value
    if isinstance(value, date):
        return datetime.combine(value, datetime.min.time())
    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed.replace(tzinfo=None) if parsed.tzinfo else parsed
        except ValueError:
            return None
    return None


def format_datetime(value: Any) -> str:
    parsed = as_datetime(value)
    return parsed.strftime("%Y-%m-%d %H:%M") if parsed else "—"


def money(value: Any) -> str:
    try:
        return f"₦{float(value or 0):,.2f}"
    except (TypeError, ValueError):
        return "₦0.00"


def number(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def transaction_kind(data: dict[str, Any]) -> str:
    value = str(data.get("type") or "").strip().lower()
    if value:
        value = value.replace("_", " ").replace("-", " ").strip()
        if "withdraw" in value:
            return "Withdrawal"
        if "top" in value or "deposit" in value:
            return "Top-up"
        return value.title()
    if data.get("university") or data.get("method") or data.get("reference"):
        return "Top-up"
    return "Transaction"


def successful_transaction(item: dict[str, Any]) -> bool:
    status = str(item["data"].get("status") or "success").lower()
    return status in {"success", "successful", "complete", "completed"}


def bucket_label(value: datetime, period: str) -> str:
    if period == "Daily":
        return value.strftime("%Y-%m-%d")
    if period == "Weekly":
        monday = (value - timedelta(days=value.weekday())).date()
        return f"Week of {monday:%Y-%m-%d}"
    if period == "Monthly":
        return value.strftime("%Y-%m")
    return value.strftime("%Y")


def aggregate_activity(
    transactions: list[dict[str, Any]],
    reports: list[dict[str, Any]],
    period: str,
) -> list[dict[str, Any]]:
    totals: dict[str, dict[str, float | int]] = defaultdict(
        lambda: {"topups": 0.0, "withdrawals": 0.0, "transactions": 0, "reports": 0}
    )
    for item in transactions:
        data = item["data"]
        timestamp = as_datetime(data.get("createdAt"))
        if not timestamp:
            continue
        bucket = totals[bucket_label(timestamp, period)]
        bucket["transactions"] += 1
        if not successful_transaction(item):
            continue
        amount = number(data.get("amount"))
        kind = transaction_kind(data).lower()
        if "withdraw" in kind:
            bucket["withdrawals"] += amount
        elif "top" in kind or data.get("university") or data.get("reference"):
            bucket["topups"] += amount
    for item in reports:
        timestamp = as_datetime(item["data"].get("createdAt"))
        if timestamp:
            totals[bucket_label(timestamp, period)]["reports"] += 1
    return [{"period": label, **values} for label, values in sorted(totals.items())]


class FirebaseRestReader:
    def __init__(self, admin_path: str, password: str) -> None:
        self.admin_path = admin_path
        self.password = password
        self.session = requests.Session()
        self.id_token = ""
        self.refresh_token = ""
        self.token_time = 0.0

    def connect(self) -> None:
        try:
            response = self.session.post(
                f"{SITE_URL}/api/desktop-dashboard/session",
                json={"adminPath": self.admin_path, "password": self.password},
                timeout=30,
            )
        finally:
            self.password = ""
        if response.status_code >= 400:
            try:
                message = response.json().get("error")
            except ValueError:
                message = None
            raise RuntimeError(message or f"Sign-in failed (HTTP {response.status_code}).")
        custom_token = response.json().get("customToken")
        if not custom_token:
            raise RuntimeError("The sign-in service did not return a dashboard session.")
        token_response = self.session.post(
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken",
            params={"key": FIREBASE_API_KEY},
            json={"token": custom_token, "returnSecureToken": True},
            timeout=30,
        )
        token_response.raise_for_status()
        tokens = token_response.json()
        self.id_token = tokens["idToken"]
        self.refresh_token = tokens["refreshToken"]
        self.token_time = time.time()

    def _refresh_id_token(self) -> None:
        if time.time() - self.token_time < 50 * 60:
            return
        if not self.refresh_token:
            raise RuntimeError("The dashboard session expired. Sign in again.")
        response = self.session.post(
            "https://securetoken.googleapis.com/v1/token",
            params={"key": FIREBASE_API_KEY},
            data={"grant_type": "refresh_token", "refresh_token": self.refresh_token},
            timeout=30,
        )
        response.raise_for_status()
        tokens = response.json()
        self.id_token = tokens["id_token"]
        self.refresh_token = tokens.get("refresh_token", self.refresh_token)
        self.token_time = time.time()

    def fetch_collection(
        self, collection_id: str, descendants: bool, fields: list[str]
    ) -> list[dict[str, Any]]:
        self._refresh_id_token()
        endpoint = (
            f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}"
            "/databases/(default)/documents:runQuery"
        )
        response = self.session.post(
            endpoint,
            headers={"Authorization": f"Bearer {self.id_token}"},
            json={
                "structuredQuery": {
                    "from": [{"collectionId": collection_id, "allDescendants": descendants}],
                    "select": {"fields": [{"fieldPath": field} for field in fields]},
                    "limit": MAX_DOCS_PER_COLLECTION,
                }
            },
            timeout=60,
        )
        response.raise_for_status()
        documents = []
        for result in response.json():
            document = result.get("document")
            if not document:
                continue
            path = document["name"].split("/documents/", 1)[-1]
            parts = path.split("/")
            owner_id = parts[1] if parts[0] == "users" and len(parts) > 2 else None
            documents.append({
                "id": parts[-1],
                "path": path,
                "ownerId": owner_id,
                "data": {
                    key: decode_firestore_value(value)
                    for key, value in document.get("fields", {}).items()
                },
            })
        return documents

    def fetch_all(
        self, previous: dict[str, list[dict[str, Any]]] | None = None
    ) -> tuple[dict[str, list[dict[str, Any]]], list[str]]:
        previous = previous or {}
        datasets = {name: list(previous.get(name, [])) for name in DATASETS}
        errors = []
        for name, collection, descendants, fields in DEFINITIONS:
            try:
                datasets[name] = self.fetch_collection(collection, descendants, fields)
            except requests.HTTPError as error:
                status = error.response.status_code if error.response is not None else None
                if status in {401, 403}:
                    raise RuntimeError(
                        "Dashboard read was denied. Check the deployed Firestore rules, "
                        "then sign in again."
                    ) from error
                errors.append(f"{name}: {error}")
            except requests.RequestException as error:
                errors.append(f"{name}: {error}")
        if errors and not any(datasets.values()):
            raise RuntimeError("Could not load dashboard data: " + "; ".join(errors))
        return datasets, errors

    def close(self) -> None:
        self.session.close()
        self.id_token = ""
        self.refresh_token = ""


class Panel(BoxLayout):
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        with self.canvas.before:
            Color(*PALETTE["border"])
            self.outline = RoundedRectangle(
                pos=self.pos, size=self.size, radius=[dp(16)]
            )
            Color(*PALETTE["panel"])
            self.background = RoundedRectangle(
                pos=(self.x + dp(1), self.y + dp(1)),
                size=(max(0, self.width - dp(2)), max(0, self.height - dp(2))),
                radius=[dp(15)],
            )
        self.bind(pos=self._update_canvas, size=self._update_canvas)

    def _update_canvas(self, *_args: Any) -> None:
        self.background.pos = (self.x + dp(1), self.y + dp(1))
        self.background.size = (
            max(0, self.width - dp(2)),
            max(0, self.height - dp(2)),
        )
        self.outline.pos = self.pos
        self.outline.size = self.size


def make_label(
    text: str,
    size: float = 14,
    color: tuple[float, float, float, float] = PALETTE["text"],
    bold: bool = False,
    height: float | None = None,
) -> Label:
    label = Label(
        text=str(text),
        font_size=dp(size),
        color=color,
        bold=bold,
        halign="left",
        valign="middle",
        size_hint_y=None,
        height=dp(height) if height is not None else dp(size + 16),
        text_size=(None, None),
    )
    return label


def make_button(text: str, callback: Any, color: tuple[float, float, float, float] | None = None) -> Button:
    button = Button(
        text=text,
        size_hint_y=None,
        height=dp(46),
        color=PALETTE["text"],
        font_size=dp(14),
        background_normal="",
        background_down="",
        background_color=color or PALETTE["purple"],
    )
    button.bind(on_release=callback)
    return button


class LoginScreen(Screen):
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self.admin_path = TextInput(
            hint_text="Admin path",
            multiline=False,
            size_hint_y=None,
            height=dp(52),
            foreground_color=PALETTE["text"],
            hint_text_color=PALETTE["muted"],
            background_normal="",
            background_active="",
            background_color=PALETTE["panel_alt"],
            padding=[dp(14), dp(14)],
        )
        self.password = TextInput(
            hint_text="Admin password",
            password=True,
            multiline=False,
            size_hint_y=None,
            height=dp(52),
            foreground_color=PALETTE["text"],
            hint_text_color=PALETTE["muted"],
            background_normal="",
            background_active="",
            background_color=PALETTE["panel_alt"],
            padding=[dp(14), dp(14)],
        )
        layout = BoxLayout(
            orientation="vertical",
            padding=[dp(24), dp(28), dp(24), dp(24)],
            spacing=dp(14),
        )
        layout.add_widget(make_label("SCHOLARVERSE", 13, PALETTE["cyan"], True, 28))
        layout.add_widget(make_label("Read-only Dashboard", 25, PALETTE["text"], True, 42))
        layout.add_widget(make_label(
            "Sign in with the existing admin path and password. Your password is not saved.",
            14, PALETTE["muted"], height=58,
        ))
        layout.add_widget(self.admin_path)
        layout.add_widget(self.password)
        self.error = make_label("", 13, PALETTE["pink"], height=60)
        self.error.bind(
            width=lambda widget, width: setattr(widget, "text_size", (width, None))
        )
        layout.add_widget(self.error)
        self.sign_in = make_button("Sign in and view", self._submit)
        layout.add_widget(self.sign_in)
        layout.add_widget(make_label(
            "Dashboard access is controlled by Firebase Security Rules. This app does not write data.",
            12, PALETTE["muted"], height=64,
        ))
        wrapper = BoxLayout(orientation="vertical", padding=dp(20))
        wrapper.add_widget(BoxLayout())
        panel = Panel(
            orientation="vertical",
            padding=[dp(20), dp(24)],
            spacing=dp(8),
            size_hint_y=None,
            height=dp(450),
        )
        for child in layout.children[::-1]:
            layout.remove_widget(child)
            panel.add_widget(child)
        wrapper.add_widget(panel)
        wrapper.add_widget(BoxLayout())
        self.add_widget(wrapper)

    def _submit(self, *_args: Any) -> None:
        path = self.admin_path.text.strip().strip("/")
        password = self.password.text
        if not path or not password:
            self.error.text = "Enter the admin path and password."
            return
        self.error.text = ""
        self.sign_in.disabled = True
        self.sign_in.text = "Signing in…"
        App.get_running_app().sign_in(path, password)

    def show_error(self, message: str) -> None:
        self.error.text = message
        self.sign_in.disabled = False
        self.sign_in.text = "Sign in and view"
        self.password.text = ""


class DashboardScreen(Screen):
    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self.section = "Overview"
        self.period_name = "Monthly"
        self.root_layout = BoxLayout(
            orientation="vertical", padding=[dp(16), dp(12)], spacing=dp(10)
        )
        with self.root_layout.canvas.before:
            Color(*PALETTE["background"])
            self._background = RoundedRectangle(
                pos=self.root_layout.pos, size=self.root_layout.size
            )
            Color(0.35, 0.14, 0.74, 0.12)
            self._glow = Ellipse(pos=self.root_layout.pos, size=(dp(260), dp(260)))
        self.root_layout.bind(pos=self._update_background, size=self._update_background)
        self._build_header()
        self.search = TextInput(
            hint_text="Filter the current view",
            multiline=False,
            size_hint_y=None,
            height=dp(44),
            foreground_color=PALETTE["text"],
            hint_text_color=PALETTE["muted"],
            background_normal="",
            background_active="",
            background_color=PALETTE["panel_alt"],
            padding=[dp(12), dp(10)],
        )
        self.search.bind(text=lambda *_args: self.render())
        self.root_layout.add_widget(self.search)
        self.scroll = ScrollView(do_scroll_x=False)
        self.content = BoxLayout(
            orientation="vertical",
            spacing=dp(12),
            padding=[0, dp(2), 0, dp(12)],
            size_hint_y=None,
        )
        self.content.bind(minimum_height=self.content.setter("height"))
        self.scroll.add_widget(self.content)
        self.root_layout.add_widget(self.scroll)
        self.add_widget(self.root_layout)
        self.datasets = {name: [] for name in DATASETS}
        self.errors: list[str] = []

    def _update_background(self, *_args: Any) -> None:
        self._background.pos = self.root_layout.pos
        self._background.size = self.root_layout.size
        self._glow.pos = (
            self.root_layout.x + self.root_layout.width - dp(210),
            self.root_layout.y + self.root_layout.height - dp(130),
        )

    def _build_header(self) -> None:
        header = BoxLayout(size_hint_y=None, height=dp(56), spacing=dp(8))
        brand = BoxLayout(orientation="vertical")
        brand.add_widget(make_label("SCHOLARVERSE", 11, PALETTE["cyan"], True, 20))
        self.heading = make_label("Read-only dashboard", 17, PALETTE["text"], True, 28)
        brand.add_widget(self.heading)
        header.add_widget(brand)
        self.status = make_label("Connecting…", 11, PALETTE["muted"], height=dp(40))
        self.status.size_hint_x = 0.55
        header.add_widget(self.status)
        self.root_layout.add_widget(header)
        controls = BoxLayout(size_hint_y=None, height=dp(44), spacing=dp(8))
        self.section_picker = Spinner(
            text=self.section,
            values=tuple(SECTIONS),
            size_hint_x=1,
            color=PALETTE["text"],
            background_normal="",
            background_color=PALETTE["panel_alt"],
        )
        self.section_picker.bind(text=self._select_section)
        controls.add_widget(self.section_picker)
        controls.add_widget(make_button("Refresh", lambda *_args: App.get_running_app().refresh()))
        controls.add_widget(make_button(
            "Sign out", lambda *_args: App.get_running_app().sign_out(),
            color=(0.45, 0.17, 0.31, 1),
        ))
        self.root_layout.add_widget(controls)

    def _select_section(self, _spinner: Spinner, value: str) -> None:
        self.section = value
        self.render()

    def set_data(self, datasets: dict[str, list[dict[str, Any]]], status: str) -> None:
        self.datasets = datasets
        self.errors = errors
        self.status.text = status
        self.render()

    def render(self, *_args: Any) -> None:
        self.content.clear_widgets()
        self.heading.text = self.section
        if self.errors:
            self.content.add_widget(self._panel(
                "Some dashboard reads failed",
                "\n".join(self.errors),
                PALETTE["amber"],
            ))
        if self.section == "Overview":
            self._render_overview()
        elif self.section == "Users":
            self._render_users()
        elif self.section == "Transactions":
            self._render_transactions()
        elif self.section == "Reports":
            self._render_reports()
        elif self.section == "AI Generation":
            self._render_generation()
        elif self.section == "Universities":
            self._render_universities()
        elif self.section == "Analytics":
            self._render_analytics()
        else:
            self._render_activity()

    def _panel(self, title: str, detail: str = "", accent: tuple[float, float, float, float] | None = None) -> Panel:
        panel = Panel(
            orientation="vertical",
            padding=[dp(14), dp(12)],
            spacing=dp(5),
            size_hint_y=None,
        )
        panel.add_widget(make_label(title, 14, accent or PALETTE["text"], True, 24))
        if detail:
            detail_label = make_label(detail, 12, PALETTE["muted"], height=44)
            detail_label.valign = "top"
            detail_label.bind(
                width=lambda widget, width: setattr(widget, "text_size", (width, None))
            )
            detail_label.bind(
                texture_size=lambda widget, size: setattr(widget, "height", max(dp(44), size[1]))
            )
            panel.add_widget(detail_label)
        panel.bind(minimum_height=panel.setter("height"))
        return panel

    def _filtered(self, rows: list[tuple[str, str]]) -> list[tuple[str, str]]:
        query = self.search.text.strip().lower()
        if not query:
            return rows
        return [row for row in rows if query in (row[0] + " " + row[1]).lower()]

    def _add_rows(self, rows: list[tuple[str, str]], empty: str) -> None:
        filtered = self._filtered(rows)
        if not filtered:
            self.content.add_widget(self._panel(
                "No matching records" if rows else empty,
                "Try a different filter." if rows else "",
            ))
            return
        for title, detail in filtered[:250]:
            self.content.add_widget(self._panel(title, detail))

    def _render_overview(self) -> None:
        users = self.datasets["users"]
        tx = self.datasets["transactions"]
        reports = self.datasets["reports"]
        jobs = self.datasets["generationJobs"]
        schools = self.datasets["schoolEarnings"]
        successful = [item for item in tx if successful_transaction(item)]
        topups = sum(
            number(item["data"].get("amount"))
            for item in successful
            if transaction_kind(item["data"]).lower() == "top-up"
        )
        withdrawals = sum(
            number(item["data"].get("amount"))
            for item in successful
            if "withdraw" in transaction_kind(item["data"]).lower()
        )
        metrics = (
            ("Users", f"{len(users):,}", PALETTE["purple"]),
            ("Top-up volume", money(topups), PALETTE["emerald"]),
            ("Withdrawals", money(withdrawals), PALETTE["pink"]),
            ("Saved reports", f"{len(reports):,}", PALETTE["cyan"]),
            ("Generation jobs", f"{len(jobs):,}", PALETTE["amber"]),
            ("Universities", f"{len(schools):,}", PALETTE["purple"]),
        )
        grid = GridLayout(cols=2, spacing=dp(10), size_hint_y=None, row_default_height=dp(94), row_force_default=True)
        grid.bind(minimum_height=grid.setter("height"))
        for title, value, accent in metrics:
            card = Panel(
                orientation="vertical",
                padding=[dp(12), dp(10)],
                spacing=dp(2),
                size_hint_y=None,
                height=dp(94),
            )
            card.add_widget(make_label(title, 11, PALETTE["muted"], True, 22))
            card.add_widget(make_label(value, 16, accent, True, 30))
            grid.add_widget(card)
        self.content.add_widget(grid)
        self.content.add_widget(self._panel(
            "Read-only monitoring",
            f"Refreshes every {REFRESH_SECONDS} seconds. Queries are capped at "
            f"{MAX_DOCS_PER_COLLECTION:,} documents per collection.",
            PALETTE["cyan"],
        ))
        rows = []
        for item in tx:
            data = item["data"]
            rows.append((
                f"{transaction_kind(data)} · {money(data.get('amount'))}",
                f"{format_datetime(data.get('createdAt'))} · {data.get('status') or '—'} · "
                f"{item.get('ownerId') or '—'}",
            ))
        rows.sort(key=lambda row: row[1], reverse=True)
        self.content.add_widget(make_label("Recent transactions", 15, PALETTE["text"], True, 28))
        self._add_rows(rows[:30], "No transactions yet")

    def _render_users(self) -> None:
        rows = []
        for item in self.datasets["users"]:
            data = item["data"]
            rows.append((
                str(data.get("fullName") or data.get("displayName") or item["id"]),
                f"{data.get('email') or '—'} · {data.get('universityName') or '—'} · "
                f"{data.get('departmentName') or '—'}\nWallet {money(data.get('balance'))} · "
                f"Referrals {data.get('referralCount', 0)} · {format_datetime(data.get('createdAt'))}",
            ))
        self._add_rows(rows, "No users yet")

    def _render_transactions(self) -> None:
        rows = []
        for item in self.datasets["transactions"]:
            data = item["data"]
            rows.append((
                f"{transaction_kind(data)} · {money(data.get('amount'))}",
                f"{format_datetime(data.get('createdAt'))} · {data.get('status') or '—'} · "
                f"{data.get('method') or data.get('channel') or '—'}\n"
                f"User {item.get('ownerId') or '—'} · "
                f"Ref {data.get('reference') or data.get('paystackReference') or item['id']}",
            ))
        rows.sort(key=lambda row: row[1], reverse=True)
        self._add_rows(rows, "No transactions yet")

    def _render_reports(self) -> None:
        rows = []
        for item in self.datasets["reports"]:
            data = item["data"]
            rows.append((
                str(data.get("reportTitle") or data.get("title") or item["id"]),
                f"{data.get('documentType') or '—'} · {data.get('universityName') or '—'} · "
                f"{data.get('departmentName') or '—'}\nCreated {format_datetime(data.get('createdAt'))} · "
                f"Expires {format_datetime(data.get('expiresAt'))} · User {item.get('ownerId') or '—'}",
            ))
        rows.sort(key=lambda row: row[1], reverse=True)
        self._add_rows(rows, "No reports yet")

    def _render_generation(self) -> None:
        rows = []
        for item in self.datasets["generationDocuments"]:
            data = item["data"]
            rows.append((
                str(data.get("title") or item["id"]),
                f"Document · {data.get('documentType') or '—'} · {data.get('status') or '—'}\n"
                f"Updated {format_datetime(data.get('updatedAt') or data.get('createdAt'))} · "
                f"User {data.get('ownerId') or item.get('ownerId') or '—'}",
            ))
        for item in self.datasets["generationJobs"]:
            data = item["data"]
            rows.append((
                str(data.get("slotId") or data.get("documentId") or "Generation job"),
                f"Job · {data.get('moveId') or '—'} · {data.get('status') or '—'} · "
                f"Attempts {data.get('attempts', '—')}\nUpdated {format_datetime(data.get('updatedAt'))} · "
                f"User {item.get('ownerId') or '—'}",
            ))
        rows.sort(key=lambda row: row[1], reverse=True)
        self._add_rows(rows, "No generation activity yet")

    def _render_universities(self) -> None:
        rows = []
        for item in self.datasets["schoolEarnings"]:
            data = item["data"]
            rows.append((
                str(data.get("universityName") or item["id"]),
                f"{data.get('reportCount', 0)} reports · Earnings {money(data.get('totalEarnings'))}\n"
                f"Updated {format_datetime(data.get('updatedAt'))}",
            ))
        rows.sort(key=lambda row: number(row[1].split(" reports", 1)[0]), reverse=True)
        self._add_rows(rows, "No university earnings yet")

    def _render_analytics(self) -> None:
        controls = BoxLayout(size_hint_y=None, height=dp(44), spacing=dp(8))
        controls.add_widget(make_label("Group by", 13, PALETTE["muted"], height=dp(40)))
        period = Spinner(
            text=self.period_name,
            values=("Daily", "Weekly", "Monthly", "Yearly"),
            color=PALETTE["text"],
            background_normal="",
            background_color=PALETTE["panel_alt"],
        )
        period.bind(text=self._change_period)
        controls.add_widget(period)
        self.content.add_widget(controls)
        rows = aggregate_activity(
            self.datasets["transactions"], self.datasets["reports"], self.period_name
        )
        formatted = [
            (
                row["period"],
                f"{row['reports']} reports · {row['transactions']} transactions\n"
                f"Top-ups {money(row['topups'])} · Withdrawals {money(row['withdrawals'])}",
            )
            for row in rows
        ]
        self._add_rows(formatted, "No dated activity yet")

    def _change_period(self, _spinner: Spinner, value: str) -> None:
        self.period_name = value
        self.render()

    def _render_activity(self) -> None:
        rows = []
        for name in ("globalNotifications", "testimonials"):
            for item in self.datasets[name]:
                data = item["data"]
                notification = name == "globalNotifications"
                rows.append((
                    str(data.get("title") or data.get("authorName") or item["id"]),
                    f"{'Notification' if notification else 'Testimonial'} · "
                    f"{format_datetime(data.get('createdAt'))}\n"
                    f"{data.get('body') or data.get('testimonialText') or data.get('university') or '—'}",
                ))
        rows.sort(key=lambda row: row[1], reverse=True)
        self._add_rows(rows, "No notifications or testimonials yet")


class ScholarverseDashboardApp(App):
    def build(self) -> ScreenManager:
        Window.clearcolor = PALETTE["background"]
        self.reader: FirebaseRestReader | None = None
        self.busy = False
        self.refresh_event = None
        self.manager = ScreenManager()
        self.login_screen = LoginScreen(name="login")
        self.dashboard_screen = DashboardScreen(name="dashboard")
        self.manager.add_widget(self.login_screen)
        self.manager.add_widget(self.dashboard_screen)
        return self.manager

    def sign_in(self, admin_path: str, password: str) -> None:
        if self.busy:
            return
        self.busy = True
        reader = FirebaseRestReader(admin_path, password)
        threading.Thread(
            target=self._connect_and_load, args=(reader,), daemon=True
        ).start()

    def _connect_and_load(self, reader: FirebaseRestReader) -> None:
        try:
            reader.connect()
            datasets, errors = reader.fetch_all()
            Clock.schedule_once(
                lambda _dt: self._signed_in(reader, datasets, errors), 0
            )
        except Exception as error:
            reader.close()
            message = str(error)
            Clock.schedule_once(
                lambda _dt, error_message=message: self._sign_in_failed(error_message), 0
            )

    def _signed_in(
        self,
        reader: FirebaseRestReader,
        datasets: dict[str, list[dict[str, Any]]],
        errors: list[str],
    ) -> None:
        self.reader = reader
        self.busy = False
        self.manager.current = "dashboard"
        self._show_datasets(datasets, errors)
        if self.refresh_event is not None:
            self.refresh_event.cancel()
        self.refresh_event = Clock.schedule_interval(
            lambda _dt: self.refresh(), REFRESH_SECONDS
        )

    def _show_datasets(
        self, datasets: dict[str, list[dict[str, Any]]], errors: list[str]
    ) -> None:
        if errors:
            status = f"Live · {len(errors)} read warning(s)"
        else:
            status = f"Live · refreshed {datetime.now():%H:%M}"
        self.dashboard_screen.set_data(datasets, status)

    def _sign_in_failed(self, message: str) -> None:
        self.busy = False
        self.login_screen.show_error(message)

    def refresh(self) -> None:
        if self.busy or self.reader is None:
            return
        self.busy = True
        reader = self.reader
        previous = {
            name: list(rows) for name, rows in self.dashboard_screen.datasets.items()
        }
        threading.Thread(
            target=self._refresh_worker, args=(reader, previous), daemon=True
        ).start()

    def _refresh_worker(
        self, reader: FirebaseRestReader, previous: dict[str, list[dict[str, Any]]]
    ) -> None:
        try:
            datasets, errors = reader.fetch_all(previous)
            Clock.schedule_once(lambda _dt: self._refreshed(datasets, errors), 0)
        except Exception as error:
            message = str(error)
            Clock.schedule_once(
                lambda _dt, error_message=message: self._refresh_failed(error_message), 0
            )

    def _refreshed(
        self, datasets: dict[str, list[dict[str, Any]]], errors: list[str]
    ) -> None:
        self.busy = False
        self._show_datasets(datasets, errors)

    def _refresh_failed(self, message: str) -> None:
        self.busy = False
        self.dashboard_screen.status.text = f"Refresh failed: {message}"
        if "sign in again" in message.lower() or "read was denied" in message.lower():
            self.sign_out()
            self.login_screen.show_error(message)

    def sign_out(self) -> None:
        if self.refresh_event is not None:
            self.refresh_event.cancel()
            self.refresh_event = None
        if self.reader is not None:
            self.reader.close()
            self.reader = None
        self.dashboard_screen.datasets = {name: [] for name in DATASETS}
        self.dashboard_screen.errors = []
        self.login_screen.password.text = ""
        self.login_screen.show_error("")
        self.manager.current = "login"


if __name__ == "__main__":
    ScholarverseDashboardApp().run()
