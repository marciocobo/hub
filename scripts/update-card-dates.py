#!/usr/bin/env python3
"""Atualiza a data "Atualizado em" dos cards do index.html.

A data de cada card é a do último commit que alterou a página que ele abre.
Se a página tiver alteração ainda sem commit, vale a data de hoje.

Uso (na raiz do repositório):
  python3 scripts/update-card-dates.py          # grava as datas
  python3 scripts/update-card-dates.py --check  # só confere (sai com 1 se estiver desatualizado)
"""
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
BRT = timezone(timedelta(hours=-3))  # horário de Brasília

CARD = re.compile(r'(<a href="([^"]+)" class="card\b[^>]*>)(.*?)(\r?\n[ \t]*</a>)', re.S)
STAMP = re.compile(r'\r?\n[ \t]*<div class="card-updated">.*?</div>')


def git(*args):
    return subprocess.run(
        ["git", *args], cwd=ROOT, check=True, capture_output=True, text=True
    ).stdout.strip()


def last_change(page):
    if not (ROOT / page).is_file():
        sys.exit(f"Página do card não encontrada: {page}")
    if git("status", "--porcelain", "--", page):
        return datetime.now(BRT)
    return datetime.fromtimestamp(int(git("log", "-1", "--format=%ct", "--", page)), BRT)


def stamp(match):
    opening, page, body, closing = match.groups()
    date = last_change(page)
    newline = "\r\n" if closing.startswith("\r\n") else "\n"
    line = (
        f'{newline}          <div class="card-updated">Atualizado em '
        f'<time datetime="{date:%Y-%m-%d}">{date:%d/%m/%Y}</time></div>'
    )
    return opening + STAMP.sub("", body) + line + closing


def main():
    # Em clone raso o histórico é incompleto e as datas sairiam erradas.
    if git("rev-parse", "--is-shallow-repository") == "true":
        sys.exit("Clone raso: rode `git fetch --unshallow` antes.")
    current = INDEX.read_bytes().decode("utf-8")
    updated, total = CARD.subn(stamp, current)
    if not total:
        sys.exit("Nenhum card encontrado no index.html.")
    if "--check" in sys.argv[1:]:
        if updated != current:
            sys.exit("Datas dos cards desatualizadas: rode scripts/update-card-dates.py")
        print(f"OK: {total} cards com a data em dia.")
        return
    INDEX.write_bytes(updated.encode("utf-8"))
    print(f"{total} cards processados.")


if __name__ == "__main__":
    main()
