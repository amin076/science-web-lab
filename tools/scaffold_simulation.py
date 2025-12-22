#!/usr/bin/env python3
"""
scaffold_simulation.py

A CLI scaffolder for Science Web Lab simulations.

What it does:
1) Creates the standard simulation folder structure under:
   src/simulations/subjects/<subject>/<category>/<simulation-folder>/

2) Generates:
   - index.jsx (default export)
   - <ComponentName>.jsx (starter component)
   - README.md
   - standard subfolders: components/, hooks/, physics/, overlays/, assets/

3) Updates:
   - src/simulations/registry/index.js   (adds lazy-loaded entry)
   - src/data/experiments.js             (adds experiment metadata)

Design goals:
- No routing changes
- Stable IDs
- Minimal assumptions
- Safe: prevents duplicates unless --force

Note:
- This script uses text insertion (regex-based). It expects the target JS files
  to follow typical formatting (object literal for registry, array for experimentsData).
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Tuple


REPO_ROOT_MARKERS = ["package.json", "vite.config.js", ".git"]


@dataclass(frozen=True)
class SimSpec:
    sim_id: str                    # registry key + experimentsData id
    subject_folder: str            # src/simulations/subjects/<subject_folder>/
    category_folder: str           # .../<category_folder>/
    simulation_folder: str         # .../<simulation_folder>/
    subject_label: str             # experimentsData.subject
    name: str                      # experimentsData.name
    desc: str                      # experimentsData.desc
    icon: str                      # experimentsData.Icon (must already exist in experiments.js imports)
    gradient: str                  # experimentsData.gradient
    demo: bool                     # experimentsData.demo
    component_name: str            # e.g. CoulombLaw2DSimulator (file + exported component)


def find_repo_root(start: Path) -> Path:
    """Find repo root by walking up until we see typical markers."""
    cur = start.resolve()
    for _ in range(20):
        if any((cur / m).exists() for m in REPO_ROOT_MARKERS):
            return cur
        if cur.parent == cur:
            break
        cur = cur.parent
    raise FileNotFoundError("Could not find repo root (package.json/vite.config.js/.git not found). Run from inside the repo.")


def kebab(s: str) -> str:
    s = s.strip()
    s = s.replace("_", "-")
    s = re.sub(r"[^\w\-]+", "-", s, flags=re.UNICODE)
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", s)  # camelCase -> kebab
    s = re.sub(r"-{2,}", "-", s)
    return s.strip("-").lower()


def pascal_from_id(sim_id: str) -> str:
    """
    Turn a simulation id or folder name into a PascalCase component name.
    Example: "coulomb-law-2d" -> "CoulombLaw2D"
             "earth-science.geology.plate-tectonics" -> "EarthScienceGeologyPlateTectonics"
    We'll usually append "Simulator" for clarity.
    """
    parts = re.split(r"[.\-/\s]+", sim_id.strip())
    words = []
    for p in parts:
        if not p:
            continue
        # keep numeric chunks as-is, but capitalize letters
        chunk = re.split(r"[^a-zA-Z0-9]+", p)
        for c in chunk:
            if not c:
                continue
            if c.isdigit():
                words.append(c)
            else:
                words.append(c[:1].upper() + c[1:])
    base = "".join(words) if words else "NewSimulation"
    return base


def parse_id(sim_id: str) -> Tuple[str, str, str]:
    """
    Parse ID into subject/category/simulation folder tokens.
    For 3+ segments: subject=0, category=1, simulation=join(2..)
    """
    parts = sim_id.split(".")
    if len(parts) < 3:
        raise ValueError(
            f"Simulation id must have at least 3 parts like 'physics.electricity.coulomb-law-2d'. Got: {sim_id}"
        )
    subject = parts[0]
    category = parts[1]
    sim_folder = ".".join(parts[2:])
    return subject, category, sim_folder


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def ensure_not_exists(path: Path, force: bool) -> None:
    if path.exists() and not force:
        raise FileExistsError(f"Path already exists: {path} (use --force to overwrite)")


def make_sim_files(repo: Path, spec: SimSpec, force: bool) -> Path:
    sim_root = repo / "src" / "simulations" / "subjects" / spec.subject_folder / spec.category_folder / spec.simulation_folder
    ensure_not_exists(sim_root, force)

    # Create folders
    for sub in ["components", "hooks", "physics", "overlays", "assets"]:
        (sim_root / sub).mkdir(parents=True, exist_ok=True)

    # index.jsx
    index_jsx = f"""import {spec.component_name} from "./{spec.component_name}";
export default {spec.component_name};
"""
    write_text(sim_root / "index.jsx", index_jsx)

    # main component
    comp_jsx = f"""import React from "react";

/**
 * {spec.name}
 * ID: {spec.sim_id}
 *
 * Rules:
 * - No routing
 * - No auth/firestore
 * - Assume fullscreen runtime shell (RunSimulation + SimulationLayout)
 */
export default function {spec.component_name}() {{
  return (
    <div className="h-full w-full overflow-auto p-6 bg-gradient-to-br from-[#0b1220] to-[#111827]">
      <div className="max-w-6xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-2">{spec.name}</h1>
        <p className="text-white/70 mb-6">
          Starter scaffold generated by tools/scaffold_simulation.py
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/80">
            Replace this UI with your simulation canvas / controls.
          </p>
        </div>
      </div>
    </div>
  );
}}
"""
    write_text(sim_root / f"{spec.component_name}.jsx", comp_jsx)

    # README.md
    readme = f"""# {spec.name}

**ID:** `{spec.sim_id}`

## Folder
`src/simulations/subjects/{spec.subject_folder}/{spec.category_folder}/{spec.simulation_folder}/`

## Notes
- No routing/auth/firestore inside simulations
- Fullscreen runtime: `/experiments/:id/run`
- Registered via `src/simulations/registry/index.js`
- Metadata in `src/data/experiments.js`
"""
    write_text(sim_root / "README.md", readme)

    return sim_root


def registry_has_key(registry_text: str, key: str) -> bool:
    # crude but effective: check quoted key in object literal
    return bool(re.search(rf'["\']{re.escape(key)}["\']\s*:', registry_text))


def experiments_has_id(experiments_text: str, exp_id: str) -> bool:
    return bool(re.search(rf'\bid\s*:\s*["\']{re.escape(exp_id)}["\']', experiments_text))


def insert_into_object_literal(src: str, object_name: str, entry: str) -> str:
    """
    Insert an entry before the closing '};' of: export const <object_name> = { ... };
    """
    # Find: export const simulationRegistry = { ... };
    pattern = rf"(export\s+const\s+{re.escape(object_name)}\s*=\s*\{{)([\s\S]*?)(\n\}};\s*)$"
    m = re.search(pattern, src, flags=re.MULTILINE)
    if not m:
        raise ValueError(f"Could not find object literal for '{object_name}'.")
    head, body, tail = m.group(1), m.group(2), m.group(3)

    # Ensure body ends with a comma if it has entries and doesn't already end with comma
    body_stripped = body.rstrip()
    if body_stripped and not body_stripped.rstrip().endswith(","):
        body = body.rstrip() + ",\n"

    new_body = body + entry + "\n"
    return src[: m.start()] + head + new_body + tail


def insert_into_array_literal(src: str, array_name: str, entry: str) -> str:
    """
    Insert an entry before the closing '];' of: export const <array_name> = [ ... ];
    """
    pattern = rf"(export\s+const\s+{re.escape(array_name)}\s*=\s*\[)([\s\S]*?)(\n\];\s*)$"
    m = re.search(pattern, src, flags=re.MULTILINE)
    if not m:
        raise ValueError(f"Could not find array literal for '{array_name}'.")
    head, body, tail = m.group(1), m.group(2), m.group(3)

    body_stripped = body.rstrip()
    if body_stripped and not body_stripped.rstrip().endswith(","):
        # It's okay if last entry ends with "}," or "}" etc; we won't enforce comma here strictly.
        body = body.rstrip() + "\n"

    new_body = body + entry + "\n"
    return src[: m.start()] + head + new_body + tail


def update_registry(repo: Path, spec: SimSpec, force: bool) -> None:
    path = repo / "src" / "simulations" / "registry" / "index.js"
    if not path.exists():
        raise FileNotFoundError(f"Registry file not found: {path}")

    txt = read_text(path)

    if registry_has_key(txt, spec.sim_id) and not force:
        raise ValueError(f"Registry already contains key '{spec.sim_id}'. Use --force to proceed.")

    # Determine import path for registry
    import_path = f"@/simulations/subjects/{spec.subject_folder}/{spec.category_folder}/{spec.simulation_folder}"

    entry = f"""  "{spec.sim_id}": lazy(() =>
    import("{import_path}")
  ),"""

    # If key exists and force, replace it
    if registry_has_key(txt, spec.sim_id) and force:
        # Replace the existing block for that key (best-effort)
        txt = re.sub(
            rf'\s*["\']{re.escape(spec.sim_id)}["\']\s*:\s*lazy\(\(\)\s*=>\s*\n\s*import\([\s\S]*?\)\s*\n\s*\),\s*',
            "\n" + entry + "\n",
            txt,
            flags=re.MULTILINE,
        )
        write_text(path, txt)
        return

    # Insert new entry
    txt2 = insert_into_object_literal(txt, "simulationRegistry", entry)
    write_text(path, txt2)


def update_experiments(repo: Path, spec: SimSpec, force: bool) -> None:
    path = repo / "src" / "data" / "experiments.js"
    if not path.exists():
        raise FileNotFoundError(f"Experiments file not found: {path}")

    txt = read_text(path)

    if experiments_has_id(txt, spec.sim_id) and not force:
        raise ValueError(f"experimentsData already contains id '{spec.sim_id}'. Use --force to proceed.")

    entry = f"""  {{
    id: "{spec.sim_id}",
    subject: "{spec.subject_label}",
    name: "{spec.name}",
    desc: "{spec.desc}",
    Icon: {spec.icon},
    gradient: "{spec.gradient}",
    demo: {str(spec.demo).lower()},
  }},"""

    # If exists and force, replace the object block (best-effort)
    if experiments_has_id(txt, spec.sim_id) and force:
        # Replace object containing id: "<sim_id>"
        txt = re.sub(
            rf"\{{[\s\S]*?\bid\s*:\s*['\"]{re.escape(spec.sim_id)}['\"][\s\S]*?\}},\s*",
            entry + "\n",
            txt,
            flags=re.MULTILINE,
        )
        write_text(path, txt)
        return

    txt2 = insert_into_array_literal(txt, "experimentsData", entry)
    write_text(path, txt2)


def build_spec(args: argparse.Namespace) -> SimSpec:
    subj, cat, sim_folder = parse_id(args.id)

    subject_folder = kebab(subj)
    category_folder = kebab(cat)
    simulation_folder = kebab(sim_folder)

    # Component name
    base = pascal_from_id(sim_folder)
    component_name = args.component_name or f"{base}Simulator"

    return SimSpec(
        sim_id=args.id,
        subject_folder=subject_folder,
        category_folder=category_folder,
        simulation_folder=simulation_folder,
        subject_label=args.subject_label,
        name=args.name,
        desc=args.desc,
        icon=args.icon,
        gradient=args.gradient,
        demo=args.demo,
        component_name=component_name,
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Science Web Lab - scaffold a new simulation and update registry/experiments."
    )
    parser.add_argument("--id", required=True, help="Simulation ID (e.g. physics.electricity.coulomb-law-2d)")
    parser.add_argument("--name", default="New Simulation", help="Display name for ExperimentDetail and cards")
    parser.add_argument("--desc", default="An interactive simulation.", help="Short description")
    parser.add_argument("--subject-label", default="Physics", help="Display subject label (e.g. Physics, Earth Science)")
    parser.add_argument("--icon", default="ScienceIcon", help="Icon identifier already imported in experiments.js (e.g. ScienceIcon)")
    parser.add_argument("--gradient", default="linear-gradient(135deg,#6366f1,#8b5cf6)", help="CSS gradient string")
    parser.add_argument("--demo", action="store_true", help="Mark as demo experiment (shown in Experiments page)")
    parser.add_argument("--component-name", default=None, help="Override component name (default: <Pascal>Simulator)")
    parser.add_argument("--force", action="store_true", help="Overwrite existing folder/entries if present")

    args = parser.parse_args()

    try:
        repo = find_repo_root(Path.cwd())
        spec = build_spec(args)

        sim_root = make_sim_files(repo, spec, force=args.force)
        update_registry(repo, spec, force=args.force)
        update_experiments(repo, spec, force=args.force)

        print("✅ Simulation scaffold created successfully.")
        print(f"   - Folder: {sim_root}")
        print(f"   - Registry: src/simulations/registry/index.js (added '{spec.sim_id}')")
        print(f"   - Experiments: src/data/experiments.js (added '{spec.sim_id}')")
        print("\nNext:")
        print(f"   - Run: npm run dev")
        print(f"   - Open: /experiments/{spec.sim_id} and /experiments/{spec.sim_id}/run")
        return 0

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
