import os
import re

frontend_src = os.path.join(os.path.dirname(__file__), "..", "..", "frontend1", "src")
patterns = [
    re.compile(r'axios\.(get|post|put|delete|patch)\s*\(\s*[\'"`](/[^\'"`]+)[\'"`]'),
    re.compile(r'axios\.(get|post|put|delete|patch)<[^>]+>\s*\(\s*[\'"`](/[^\'"`]+)[\'"`]'),
]

found = []
for root, _, files in os.walk(frontend_src):
    for f in files:
        if f.endswith(('.ts', '.tsx')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as file:
                for idx, line in enumerate(file, 1):
                    for pat in patterns:
                        m = pat.search(line)
                        if m:
                            found.append((os.path.relpath(p, frontend_src), idx, line.strip()))

for p, idx, l in found:
    print(f"{p}:{idx} -> {l}")

print(f"Total remaining relative axios calls: {len(found)}")
