"""
╔══════════════════════════════════════════════════════════════════╗
║     EXCLUSIÓN MUTUA - ALGORITMO CENTRALIZADO                     ║
║     Analogía: El Club Nocturno 🎵                                ║
╚══════════════════════════════════════════════════════════════════╝
  Requiere: pip install rich
"""

import time
import threading
from collections import deque
from typing import Optional

try:
    from rich.console import Console
    from rich.live import Live
    from rich.layout import Layout
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    from rich import box
    from rich.align import Align

except ImportError:
    print("Instala la dependencia: pip install rich")
    raise SystemExit(1)

console = Console()

PROCS: dict[str, tuple[str, str]] = {
    "P1": ("🧑", "cyan"),
    "P2": ("👩", "magenta"),
    "P3": ("🧔", "yellow"),
    "P4": ("👨", "green"),
}


# ═══════════════════════════════════════════════════════════════════
#  ESTADO COMPARTIDO — leído por el renderer, escrito por los hilos
# ═══════════════════════════════════════════════════════════════════
class SimState:
    def __init__(self):
        self._lock = threading.Lock()
        self.vip_occupant: Optional[str] = None
        self.queue: list[str] = []
        self.proc_states: dict[str, str] = {}
        self.messages: deque = deque(maxlen=12)
        self.vip_progress: dict[str, float] = {}
        self.scenario_title: str = ""
        self.scenario_num: int = 0
        self.stats: dict[str, int] = {"requests": 0, "queued": 0, "grants": 0}

    def set_scenario(self, num: int, title: str):
        with self._lock:
            self.scenario_num = num
            self.scenario_title = title

    def set_proc_state(self, pid: str, state: str):
        with self._lock:
            self.proc_states[pid] = state

    def set_vip_occupied(self, pid: str, queue_snap):
        with self._lock:
            self.vip_occupant = pid
            self.queue = list(queue_snap)

    def set_vip_free(self, queue_snap):
        with self._lock:
            self.vip_occupant = None
            self.queue = list(queue_snap)

    def set_progress(self, pid: str, pct: float):
        with self._lock:
            self.vip_progress[pid] = pct

    def log(self, from_n: str, to_n: str, mtype: str, detail: str = ""):
        with self._lock:
            self.messages.append((from_n, to_n, mtype, detail))
            if mtype == "REQUEST":
                self.stats["requests"] += 1
            elif mtype == "GRANT":
                self.stats["grants"] += 1
            elif mtype == "QUEUED":
                self.stats["queued"] += 1

    def reset(self, pids: list[str]):
        with self._lock:
            self.vip_occupant = None
            self.queue = []
            self.vip_progress = {}
            self.proc_states = {pid: "inactivo" for pid in pids}
            self.messages.clear()
            self.stats = {"requests": 0, "queued": 0, "grants": 0}

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "vip_occupant": self.vip_occupant,
                "queue": list(self.queue),
                "proc_states": dict(self.proc_states),
                "messages": list(self.messages),
                "vip_progress": dict(self.vip_progress),
                "scenario_title": self.scenario_title,
                "scenario_num": self.scenario_num,
                "stats": dict(self.stats),
            }


# ═══════════════════════════════════════════════════════════════════
#  COORDINADOR (El Portero)
# ═══════════════════════════════════════════════════════════════════
class Coordinador:
    def __init__(self, state: SimState):
        self.state = state
        self.vip_ocupado = False
        self.quien_en_vip: Optional[str] = None
        self.cola: deque[str] = deque()
        self._lock = threading.Lock()
        self._sems: dict[str, threading.Semaphore] = {}

    def registrar(self, pid: str):
        self._sems[pid] = threading.Semaphore(0)

    def solicitar_entrada(self, pid: str):
        self.state.log(pid, "COORD", "REQUEST", "quiero entrar al VIP")
        with self._lock:
            if not self.vip_ocupado:
                self.vip_ocupado = True
                self.quien_en_vip = pid
                self.state.set_vip_occupied(pid, self.cola)
                self.state.log("COORD", pid, "GRANT", "inmediato — sala libre ✓")
                self._sems[pid].release()
            else:
                self.cola.append(pid)
                self.state.set_vip_occupied(self.quien_en_vip, self.cola)
                self.state.log("COORD", pid, "QUEUED", f"en cola #{len(self.cola)}")

    def esperar_grant(self, pid: str):
        self._sems[pid].acquire()

    def liberar_entrada(self, pid: str):
        self.state.log(pid, "COORD", "RELEASE", "saliendo del VIP")
        with self._lock:
            self.vip_ocupado = False
            self.quien_en_vip = None
            if self.cola:
                siguiente = self.cola.popleft()
                self.vip_ocupado = True
                self.quien_en_vip = siguiente
                self.state.set_vip_occupied(siguiente, self.cola)
                self.state.log("COORD", siguiente, "GRANT", "desde cola — tu turno ✓")
                self._sems[siguiente].release()
            else:
                self.state.set_vip_free(self.cola)


# ═══════════════════════════════════════════════════════════════════
#  PROCESO (Un cliente del club)
# ═══════════════════════════════════════════════════════════════════
class Proceso(threading.Thread):
    def __init__(self, pid: str, coord: Coordinador, state: SimState,
                 trabajo: float = 1.5, delay: float = 0.0):
        super().__init__(name=pid, daemon=True)
        self.pid = pid
        self.coord = coord
        self.state = state
        self.trabajo = trabajo
        self.delay = delay

    def run(self):
        self.state.set_proc_state(self.pid, "llegando al club...")
        time.sleep(self.delay)

        self.state.set_proc_state(self.pid, "enviando REQUEST →")
        self.coord.solicitar_entrada(self.pid)

        self.state.set_proc_state(self.pid, "esperando GRANT...")
        self.coord.esperar_grant(self.pid)

        self.state.set_proc_state(self.pid, "EN VIP — sección crítica")
        pasos = 24
        for i in range(pasos + 1):
            self.state.set_progress(self.pid, i / pasos)
            time.sleep(self.trabajo / pasos)

        self.state.set_proc_state(self.pid, "enviando RELEASE →")
        self.coord.liberar_entrada(self.pid)
        self.state.set_proc_state(self.pid, "completado ✓")


# ═══════════════════════════════════════════════════════════════════
#  HELPERS DE RENDERIZADO
# ═══════════════════════════════════════════════════════════════════
def _bar(pct: float, width: int, color: str) -> str:
    filled = int(width * pct)
    empty = width - filled
    return f"[{color}]{'█' * filled}[/{color}][dim]{'░' * empty}[/dim]"


# ═══════════════════════════════════════════════════════════════════
#  PANELES DEL DASHBOARD
# ═══════════════════════════════════════════════════════════════════
def render_header(s: dict) -> Panel:
    t = Text(justify="center")
    t.append("🎵  EXCLUSIÓN MUTUA CENTRALIZADA — CLUB VIP  🎵\n", style="bold blue")
    t.append("Algoritmo Centralizado · Sistemas Distribuidos\n", style="dim")
    if s["scenario_num"]:
        t.append(f" ESCENARIO {s['scenario_num']} ", style="bold white on blue")
        t.append(f"  {s['scenario_title']}", style="italic dim")
    return Panel(Align.center(t), border_style="blue", box=box.DOUBLE, padding=(0, 2))


def render_vip(s: dict) -> Panel:
    pid = s["vip_occupant"]
    if pid:
        emoji, color = PROCS.get(pid, ("👤", "white"))
        pct = s["vip_progress"].get(pid, 0.0)
        t = Text.from_markup(
            f"\n  {emoji} [{color}]OCUPADO  ·  {pid}[/{color}]\n\n"
            f"  {_bar(pct, 22, color)}  [{color}]{int(pct * 100):3d}%[/{color}]\n\n"
            f"  [dim]Ejecutando sección crítica...[/dim]\n"
        )
        return Panel(t, title="[bold red]🔴 SALA VIP — OCUPADA[/bold red]",
                     border_style=color, box=box.ROUNDED)
    t = Text.from_markup(
        "\n  [bold green]✓  DISPONIBLE[/bold green]\n\n"
        "  [dim]Sala vacía — esperando solicitud[/dim]\n"
    )
    return Panel(t, title="[bold green]🟢 SALA VIP — LIBRE[/bold green]",
                 border_style="green", box=box.ROUNDED)


def render_queue(s: dict) -> Panel:
    q = s["queue"]
    if q:
        parts: list[str] = []
        for i, pid in enumerate(q):
            emoji, color = PROCS.get(pid, ("👤", "white"))
            tag = "[bold yellow]NEXT[/bold yellow]" if i == 0 else f"[dim]{i + 1}.[/dim]"
            parts.append(f"{tag} {emoji}[{color}]{pid}[/{color}]")
        content = Text.from_markup("  " + "  →  ".join(parts) + "\n")
    else:
        content = Text.from_markup("  [dim italic]Cola vacía — sin espera[/dim italic]\n")
    return Panel(content, title=f"[yellow]🧍 COLA DE ESPERA ({len(q)})[/yellow]",
                 border_style="yellow", box=box.ROUNDED)


def render_procs(s: dict) -> Panel:
    tbl = Table(box=box.SIMPLE_HEAVY, show_header=True,
                header_style="bold dim", expand=True, padding=(0, 1))
    tbl.add_column("", width=3, no_wrap=True)
    tbl.add_column("Proceso", width=9, no_wrap=True)
    tbl.add_column("Estado", min_width=22)
    tbl.add_column("Rol", width=13, no_wrap=True)

    for pid, (emoji, color) in PROCS.items():
        state_str = s["proc_states"].get(pid, "inactivo")
        if pid == s["vip_occupant"]:
            pct = s["vip_progress"].get(pid, 0.0)
            icon = "🔴"
            role = f"[{color}]EN VIP {int(pct*100)}%[/{color}]"
        elif pid in s["queue"]:
            pos = s["queue"].index(pid) + 1
            icon = "🟡"
            role = f"[yellow]Cola #{pos}[/yellow]"
        elif "completado" in state_str:
            icon = "✅"
            role = "[dim]—[/dim]"
        else:
            icon = "⚪"
            role = "[dim]activo[/dim]"
        tbl.add_row(icon, f"{emoji} [{color}]{pid}[/{color}]",
                    f"[dim]{state_str}[/dim]", role)

    return Panel(tbl, title="[bold blue]📊 ESTADO DE PROCESOS[/bold blue]",
                 border_style="blue", box=box.ROUNDED)


def render_msgs(s: dict) -> Panel:
    STYLES: dict[str, tuple] = {
        "REQUEST": ("yellow",     "──►", "📨"),
        "GRANT":   ("green",      "◄──", "✅"),
        "RELEASE": ("red",        "──►", "📤"),
        "QUEUED":  ("dark_orange", "···", "⏳"),
    }
    lines: list[str] = []
    for from_n, to_n, mtype, detail in s["messages"][-10:]:
        st, arrow, icon = STYLES.get(mtype, ("white", "───", "📩"))
        fe = PROCS[from_n][0] if from_n in PROCS else "🎩"
        te = PROCS[to_n][0]   if to_n   in PROCS else "🎩"
        fc = PROCS[from_n][1] if from_n in PROCS else "red"
        tc = PROCS[to_n][1]   if to_n   in PROCS else "red"
        lines.append(
            f"  {icon} {fe}[{fc}]{from_n}[/{fc}] [dim]{arrow}[/dim]"
            f" {te}[{tc}]{to_n}[/{tc}]  [{st}]{mtype}[/{st}]"
            + (f"  [dim]{detail}[/dim]" if detail else "")
        )
    if not lines:
        lines = ["  [dim italic]Esperando mensajes...[/dim italic]"]
    return Panel(Text.from_markup("\n".join(lines)),
                 title="[bold cyan]📡 MENSAJES EN TIEMPO REAL[/bold cyan]",
                 border_style="cyan", box=box.ROUNDED)


def render_footer(s: dict) -> Panel:
    st = s["stats"]
    t = Text.from_markup(
        f"  [yellow]REQUEST[/yellow]: {st['requests']}  "
        f"[green]GRANT[/green]: {st['grants']}  "
        f"[dark_orange]QUEUED[/dark_orange]: {st['queued']}"
        f"  │  [dim]3 mensajes por acceso a la SC[/dim]"
        f"  │  [dim]🎩 COORDINADOR = portero · punto único de fallo[/dim]"
    )
    return Panel(t, box=box.SIMPLE, border_style="dim")


def refresh(layout: Layout, state: SimState):
    s = state.snapshot()
    layout["header"].update(render_header(s))
    layout["vip"].update(render_vip(s))
    layout["queue"].update(render_queue(s))
    layout["procs"].update(render_procs(s))
    layout["msgs"].update(render_msgs(s))
    layout["footer"].update(render_footer(s))


# ═══════════════════════════════════════════════════════════════════
#  LAYOUT DEL DASHBOARD
# ═══════════════════════════════════════════════════════════════════
def make_layout() -> Layout:
    layout = Layout(name="root")
    layout.split_column(
        Layout(name="header", size=5),
        Layout(name="body"),
        Layout(name="footer", size=3),
    )
    layout["body"].split_row(
        Layout(name="left", ratio=2),
        Layout(name="right", ratio=3),
    )
    layout["left"].split_column(
        Layout(name="vip", ratio=3),
        Layout(name="queue", ratio=2),
    )
    layout["right"].split_column(
        Layout(name="procs", ratio=2),
        Layout(name="msgs", ratio=3),
    )
    return layout


# ═══════════════════════════════════════════════════════════════════
#  EJECUCIÓN DE ESCENARIOS
# ═══════════════════════════════════════════════════════════════════
def run_scenario(layout: Layout, state: SimState,
                 num: int, title: str, config: list[dict]):
    pids = [c["pid"] for c in config]
    state.reset(pids)
    state.set_scenario(num, title)
    refresh(layout, state)
    time.sleep(0.8)

    coord = Coordinador(state)
    procs = [Proceso(c["pid"], coord, state, c["trabajo"], c["delay"]) for c in config]
    for p in procs:
        coord.registrar(p.pid)
    for p in procs:
        p.start()

    while any(p.is_alive() for p in procs):
        refresh(layout, state)
        time.sleep(0.07)

    for p in procs:
        p.join()
    refresh(layout, state)
    time.sleep(2.0)


# ═══════════════════════════════════════════════════════════════════
#  RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════════
def show_summary():
    console.print()
    console.rule("[bold blue]RESUMEN DEL ALGORITMO CENTRALIZADO[/bold blue]")
    console.print()

    props = Table(title="Propiedades del Algoritmo", box=box.ROUNDED,
                  border_style="blue", show_header=True, header_style="bold",
                  min_width=70)
    props.add_column("Propiedad", style="bold", min_width=22)
    props.add_column("Estado", justify="center", width=22)
    props.add_column("Detalle")
    props.add_row("Exclusión mutua",    "[bold green]✅ Garantizada[/bold green]",  "Solo 1 proceso en SC a la vez")
    props.add_row("Sin inanición",      "[bold green]✅ Garantizada[/bold green]",  "Cola FIFO — orden de llegada")
    props.add_row("Mensajes por acceso","[bold cyan]3 mensajes[/bold cyan]",         "REQUEST + GRANT + RELEASE")
    props.add_row("Punto único de fallo","[bold red]⚠  Sí[/bold red]",             "Falla el coord. → bloqueo total")
    props.add_row("Escalabilidad",      "[bold yellow]Limitada[/bold yellow]",      "Coordinador = cuello de botella")
    console.print(props)

    console.print()
    flow = Table(title="Flujo de Mensajes", box=box.ROUNDED,
                 border_style="cyan", show_header=True, header_style="bold",
                 min_width=70)
    flow.add_column("#",        width=4)
    flow.add_column("Mensaje",  style="bold", width=12)
    flow.add_column("Origen",   width=16)
    flow.add_column("Destino",  width=16)
    flow.add_column("Cuándo")
    flow.add_row("1", "[yellow]REQUEST[/yellow]", "Proceso",       "🎩 Coordinador", "Al querer entrar a la SC")
    flow.add_row("2", "[green]GRANT[/green]",     "🎩 Coordinador", "Proceso",       "SC libre (o al liberarse)")
    flow.add_row("3", "[red]RELEASE[/red]",       "Proceso",       "🎩 Coordinador", "Al terminar trabajo en SC")
    console.print(flow)
    console.print()


# ═══════════════════════════════════════════════════════════════════
#  CONFIGURACIÓN DE ESCENARIOS
# ═══════════════════════════════════════════════════════════════════
SCENARIO_1 = [
    {"pid": "P1", "trabajo": 1.2, "delay": 0.0},
    {"pid": "P2", "trabajo": 1.0, "delay": 1.8},
    {"pid": "P3", "trabajo": 0.8, "delay": 3.5},
]

SCENARIO_2 = [
    {"pid": "P1", "trabajo": 1.5, "delay": 0.0},
    {"pid": "P2", "trabajo": 1.2, "delay": 0.05},
    {"pid": "P3", "trabajo": 1.0, "delay": 0.05},
    {"pid": "P4", "trabajo": 0.8, "delay": 0.05},
]


# ═══════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════
def main():
    state = SimState()
    layout = make_layout()
    refresh(layout, state)

    with Live(layout, console=console, refresh_per_second=15, screen=True):
        run_scenario(layout, state, 1,
                     "Accesos escalonados — sin contención", SCENARIO_1)
        time.sleep(0.5)
        run_scenario(layout, state, 2,
                     "Alta contención — todos llegan a la vez", SCENARIO_2)
        time.sleep(1.0)

    show_summary()


if __name__ == "__main__":
    main()
