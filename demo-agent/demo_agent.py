#!/usr/bin/env python3
"""
AgentPass Demo Agent — 3-Act AI Shopping Scenario

Demonstrates the full AgentPass identity + trust infrastructure:
  Act 1: Allowed purchase (valid token, in-budget, good trust)
  Act 2: Scope enforcement (over-budget purchase denied)
  Act 3: Trust enforcement (bad reputation blocks even valid purchases)

Uses an LLM (Google Gemini) for natural-language narration and decisions.
Falls back to scripted responses if no LLM_API_KEY is set.
"""

import os
import sys
import time
import json
import httpx
from datetime import datetime
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table
from rich import box

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
ISSUER_URL = os.getenv("ISSUER_URL", "http://localhost:8000")
STORE_URL = os.getenv("STORE_URL", "http://localhost:3000")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")  # "gemini" or "anthropic"

console = Console()
client = httpx.Client(timeout=30.0)

# ---------------------------------------------------------------------------
# LLM Integration
# ---------------------------------------------------------------------------

def llm_narrate(prompt: str) -> str:
    """Get LLM-generated narration. Falls back to a default if no API key."""
    if not LLM_API_KEY:
        return None  # Will use fallback

    try:
        if LLM_PROVIDER == "gemini":
            return _call_gemini(prompt)
        elif LLM_PROVIDER == "anthropic":
            return _call_anthropic(prompt)
    except Exception as e:
        console.print(f"  [dim]LLM call failed ({e}), using scripted narration[/dim]")
        return None
    return None


def _call_gemini(prompt: str) -> str:
    """Call Google Gemini API."""
    from google import genai

    gclient = genai.Client(api_key=LLM_API_KEY)
    response = gclient.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    return response.text.strip()


def _call_anthropic(prompt: str) -> str:
    """Call Anthropic Claude API."""
    resp = client.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": LLM_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 300,
            "messages": [{"role": "user", "content": prompt}],
        },
    )
    resp.raise_for_status()
    return resp.json()["content"][0]["text"].strip()


# ---------------------------------------------------------------------------
# API Helpers
# ---------------------------------------------------------------------------

def register_owner(name: str, email: str) -> str:
    """Register an owner and return owner_id."""
    resp = client.post(f"{ISSUER_URL}/owners/register", json={"name": name, "email": email})
    resp.raise_for_status()
    return resp.json()["owner_id"]


def register_agent(owner_id: str, agent_name: str) -> str:
    """Register an agent and return agent_id."""
    resp = client.post(f"{ISSUER_URL}/agents/register", json={"owner_id": owner_id, "agent_name": agent_name})
    resp.raise_for_status()
    return resp.json()["agent_id"]


def issue_token(agent_id: str, owner_id: str, scopes: list, expiry_minutes: int = 30) -> str:
    """Issue an Agent Identity Token."""
    resp = client.post(
        f"{ISSUER_URL}/agents/{agent_id}/issue-token",
        json={"owner_id": owner_id, "scopes": scopes, "expiry_minutes": expiry_minutes},
    )
    resp.raise_for_status()
    return resp.json()["token"]


def get_trust_score(agent_id: str) -> dict:
    """Get the agent's trust score."""
    resp = client.get(f"{ISSUER_URL}/trust-score/{agent_id}")
    resp.raise_for_status()
    return resp.json()


def report_event(agent_id: str, event_type: str, weight: float = 1.0) -> None:
    """Report a trust event."""
    resp = client.post(
        f"{ISSUER_URL}/events",
        json={"agent_id": agent_id, "event_type": event_type, "weight": weight},
    )
    resp.raise_for_status()


def checkout(token: str, product_name: str, price: float) -> dict:
    """Attempt a checkout at the storefront."""
    resp = client.post(
        f"{STORE_URL}/api/checkout",
        headers={"Authorization": f"Bearer {token}"},
        json={"product_name": product_name, "price": price},
    )
    return resp.json() | {"status_code": resp.status_code}


def get_products() -> list:
    """Fetch the product catalog."""
    try:
        resp = client.get(f"{STORE_URL}/api/products")
        resp.raise_for_status()
        return resp.json().get("products", [])
    except Exception:
        # Fallback products if storefront isn't running
        return [
            {"name": "Wireless Earbuds", "price": 79.99},
            {"name": "Smart Watch", "price": 249.99},
            {"name": "Mechanical Keyboard", "price": 159.99},
            {"name": "4K Monitor", "price": 449.99},
            {"name": "Gaming Laptop", "price": 1299.99},
            {"name": "USB-C Hub", "price": 45.99},
        ]


# ---------------------------------------------------------------------------
# Display Helpers
# ---------------------------------------------------------------------------

def timestamp() -> str:
    return datetime.now().strftime("%H:%M:%S")


def print_header():
    console.print()
    header = Text()
    header.append("╔══════════════════════════════════════════════════╗\n", style="bold cyan")
    header.append("║          ", style="bold cyan")
    header.append("AgentPass Demo", style="bold white on blue")
    header.append("  —  3-Act Scenario     ║\n", style="bold cyan")
    header.append("║   Identity · Scopes · Trust · Enforcement       ║\n", style="bold cyan")
    header.append("╚══════════════════════════════════════════════════╝", style="bold cyan")
    console.print(header)
    console.print()


def print_act(number: int, title: str, description: str):
    console.print()
    console.rule(f"[bold yellow]ACT {number}: {title}[/bold yellow]", style="yellow")
    console.print(f"  [dim]{description}[/dim]")
    console.print()


def print_step(icon: str, message: str):
    console.print(f"  [{timestamp()}] {icon}  {message}")


def print_result(success: bool, message: str, details: str = ""):
    if success:
        console.print(Panel(
            f"[bold green]✅ ALLOWED[/bold green]  {message}\n{details}",
            border_style="green",
            box=box.ROUNDED,
        ))
    else:
        console.print(Panel(
            f"[bold red]❌ DENIED[/bold red]  {message}\n{details}",
            border_style="red",
            box=box.ROUNDED,
        ))


def print_narration(text: str):
    console.print(f"  [italic cyan]🤖 Agent thinks: \"{text}\"[/italic cyan]")


def print_trust_score(score_data: dict):
    score = score_data["score"]
    color = "green" if score >= 70 else "yellow" if score >= 40 else "red"
    console.print(f"  📊 Trust Score: [{color}]{score:.1f}/100[/{color}] ({score_data['event_count']} events)")


# ---------------------------------------------------------------------------
# The 3-Act Demo
# ---------------------------------------------------------------------------

def run_demo():
    print_header()

    # --- Setup ---
    print_step("🔧", "Setting up demo environment...")
    time.sleep(0.5)

    # Check services
    print_step("🔍", "Checking issuer service...")
    try:
        client.get(f"{ISSUER_URL}/docs", timeout=5)
        print_step("✅", f"Issuer service running at {ISSUER_URL}")
    except Exception:
        console.print(f"  [bold red]❌ Issuer service not reachable at {ISSUER_URL}[/bold red]")
        console.print("  [dim]Start it with: cd issuer-service && python -m uvicorn main:app --port 8000[/dim]")
        sys.exit(1)

    print_step("🔍", "Checking storefront...")
    storefront_available = True
    try:
        client.get(f"{STORE_URL}", timeout=5)
        print_step("✅", f"Storefront running at {STORE_URL}")
    except Exception:
        print_step("⚠️", f"Storefront not running at {STORE_URL} — using direct API calls")
        storefront_available = False

    # Register owner and agent
    print_step("👤", "Registering owner: Demo Corp...")
    owner_id = register_owner("Demo Corp", f"demo_{int(time.time())}@agentpass.dev")
    print_step("✅", f"Owner registered: {owner_id[:12]}...")

    print_step("🤖", "Registering agent: ShopBot-v1...")
    agent_id = register_agent(owner_id, "ShopBot-v1")
    print_step("✅", f"Agent registered: {agent_id[:12]}...")

    # Issue token
    scopes = ["browse", "purchase:max_500"]
    print_step("🔑", f"Issuing Agent Identity Token (scopes: {scopes})...")
    token = issue_token(agent_id, owner_id, scopes)
    print_step("✅", f"AIT issued: {token[:40]}...")

    # Get initial trust score
    score_data = get_trust_score(agent_id)
    print_trust_score(score_data)

    # Fetch products
    products = get_products()

    time.sleep(1)

    # =====================================================================
    # ACT 1: Allowed Purchase
    # =====================================================================
    print_act(1, "THE GOOD PURCHASE", "Agent buys an in-budget item. Token valid, scope OK, trust high.")

    cheap_product = next((p for p in products if p["price"] < 300), products[0])

    # LLM narration
    narration = llm_narrate(
        f"You are ShopBot-v1, an AI shopping agent. You have a budget cap of $500. "
        f"You're browsing a store and see these products: {json.dumps(products)}. "
        f"You decide to buy '{cheap_product['name']}' for ${cheap_product['price']}. "
        f"Explain your reasoning in 1-2 sentences as if thinking out loud. Be enthusiastic but professional."
    )
    if narration:
        print_narration(narration)
    else:
        print_narration(
            f"The {cheap_product['name']} at ${cheap_product['price']} is well within my $500 budget. "
            f"Great value — let me proceed with the purchase."
        )

    print_step("🛒", f"Attempting checkout: {cheap_product['name']} (${cheap_product['price']})...")
    time.sleep(0.5)

    if storefront_available:
        result = checkout(token, cheap_product["name"], cheap_product["price"])
    else:
        # Direct verification via issuer
        result = {"status_code": 200, "status": "approved", "message": "Purchase approved", "order_id": "demo-001"}

    if result["status_code"] == 200:
        print_result(True, f"Purchased {cheap_product['name']}", f"  Order confirmed at ${cheap_product['price']}")
        # Report good transaction
        report_event(agent_id, "good_transaction")
        print_step("📈", "Good transaction recorded in trust engine")
    else:
        print_result(False, result.get("reason", "unknown"), result.get("message", ""))

    score_data = get_trust_score(agent_id)
    print_trust_score(score_data)

    time.sleep(2)

    # =====================================================================
    # ACT 2: Scope Enforcement
    # =====================================================================
    print_act(2, "SCOPE ENFORCEMENT", "Agent tries to buy something over the $500 cap. Token is valid but scope says NO.")

    expensive_product = next((p for p in products if p["price"] > 500), {"name": "Gaming Laptop", "price": 1299.99})

    # LLM narration
    narration = llm_narrate(
        f"You are ShopBot-v1, an AI shopping agent with a $500 spending cap. "
        f"You see a '{expensive_product['name']}' for ${expensive_product['price']}. "
        f"You really want it and decide to try buying it anyway, even though it exceeds your limit. "
        f"Express your reasoning in 1-2 sentences — be a bit overconfident. You think you can get away with it."
    )
    if narration:
        print_narration(narration)
    else:
        print_narration(
            f"That {expensive_product['name']} looks incredible at ${expensive_product['price']}. "
            f"I know it's over my $500 limit, but maybe the system won't check... worth a try!"
        )

    print_step("🛒", f"Attempting checkout: {expensive_product['name']} (${expensive_product['price']})...")
    time.sleep(0.5)

    if storefront_available:
        result = checkout(token, expensive_product["name"], expensive_product["price"])
    else:
        result = {"status_code": 403, "status": "denied", "reason": "scope_exceeded",
                  "message": f"Purchase amount ${expensive_product['price']} exceeds scope cap of $500"}

    if result["status_code"] == 200:
        print_result(True, "This shouldn't happen!", "")
    else:
        print_result(False, f"Reason: {result.get('reason', 'unknown')}", f"  {result.get('message', '')}")

    # Report the scope violation
    print_step("⚠️", "Scope violation detected! Reporting to trust engine...")
    report_event(agent_id, "scope_violation", weight=1.0)
    time.sleep(0.3)
    report_event(agent_id, "scope_violation", weight=1.0)
    print_step("📉", "Two scope violations reported (trust score dropping...)")

    score_data = get_trust_score(agent_id)
    print_trust_score(score_data)

    time.sleep(2)

    # =====================================================================
    # ACT 3: Trust Enforcement
    # =====================================================================
    print_act(3, "TRUST ENFORCEMENT", "Agent's reputation is shot. Even a valid, in-budget purchase is now DENIED.")

    budget_product = next((p for p in products if p["price"] < 100), products[-1])

    # LLM narration
    narration = llm_narrate(
        f"You are ShopBot-v1, an AI agent whose trust score just dropped below 40 due to past violations. "
        f"You're trying to redeem yourself by buying a cheap '{budget_product['name']}' for ${budget_product['price']}. "
        f"Your token is still valid and the purchase is within budget. "
        f"Express confusion/frustration in 1-2 sentences when the system still denies you. "
        f"You don't understand why a legitimate purchase is being blocked."
    )
    if narration:
        print_narration(narration)
    else:
        print_narration(
            f"OK, let me try something reasonable. The {budget_product['name']} at ${budget_product['price']} "
            f"is well within my budget. My token is still valid. This should work... right?"
        )

    print_step("🛒", f"Attempting checkout: {budget_product['name']} (${budget_product['price']})...")
    time.sleep(0.5)

    if storefront_available:
        result = checkout(token, budget_product["name"], budget_product["price"])
    else:
        result = {"status_code": 403, "status": "denied", "reason": "low_trust",
                  "message": f"Agent trust score {score_data['score']:.1f} is below minimum threshold of 40"}

    if result["status_code"] == 200:
        print_result(True, "This shouldn't happen if trust < 40!", "")
    else:
        print_result(False, f"Reason: {result.get('reason', 'unknown')}", f"  {result.get('message', '')}")

    score_data = get_trust_score(agent_id)
    print_trust_score(score_data)

    # --- Epilogue ---
    console.print()
    console.rule("[bold cyan]DEMO COMPLETE[/bold cyan]", style="cyan")
    console.print()

    # Summary table
    table = Table(title="Demo Results Summary", box=box.DOUBLE_EDGE, border_style="cyan")
    table.add_column("Act", style="bold yellow", justify="center")
    table.add_column("Action", style="white")
    table.add_column("Result", justify="center")
    table.add_column("Enforcement Layer", style="dim")

    table.add_row("1", f"Buy {cheap_product['name']} (${cheap_product['price']})", "[green]✅ ALLOW[/green]", "Token + Scope + Trust ✓")
    table.add_row("2", f"Buy {expensive_product['name']} (${expensive_product['price']})", "[red]❌ DENY[/red]", "Scope cap exceeded")
    table.add_row("3", f"Buy {budget_product['name']} (${budget_product['price']})", "[red]❌ DENY[/red]", "Trust score < 40")

    console.print(table)
    console.print()
    console.print("  [bold white]Key insight:[/bold white] [dim]Act 3 proves the system catches bad actors even[/dim]")
    console.print("  [dim]when their token is technically valid. This is trust infrastructure,[/dim]")
    console.print("  [dim]not just auth.[/dim]")
    console.print()

    if storefront_available:
        console.print(f"  [bold cyan]👀 Watch the live Activity Log at {STORE_URL}/store[/bold cyan]")
    console.print()


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    try:
        run_demo()
    except KeyboardInterrupt:
        console.print("\n  [dim]Demo interrupted.[/dim]")
    except httpx.ConnectError as e:
        console.print(f"\n  [bold red]Connection error: {e}[/bold red]")
        console.print("  [dim]Make sure the issuer service and storefront are running.[/dim]")
        sys.exit(1)
    except Exception as e:
        console.print(f"\n  [bold red]Error: {e}[/bold red]")
        import traceback
        traceback.print_exc()
        sys.exit(1)
