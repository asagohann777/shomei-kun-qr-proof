# SPDX-License-Identifier: MIT
"""Check bilingual documentation, preserved originals, and local Markdown links."""

from hashlib import sha256
import json
import os
from pathlib import Path
import re
import subprocess
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'docs/languages.json'
LINK = re.compile(r'\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)')


def restore_original_links(text):
    """Japanese pages may link to Japanese siblings without changing their prose."""
    return LINK.sub(lambda m: m[0].replace('.ja.md', '.md').replace('openapi.ja.yaml', 'openapi.yaml'), text)


def anchor(text):
    text = re.sub(r'<[^>]*>', '', text)
    text = re.sub(r'[^\w\-\s]', '', text.lower())
    return text.replace(' ', '-')


def anchors(text):
    result, seen = set(), {}
    fenced = False
    for line in text.splitlines():
        if line.lstrip().startswith(('```', '~~~')):
            fenced = not fenced
        if fenced:
            continue
        match = re.match(r'^#{1,6}\s+(.+?)\s*#*$', line)
        if match:
            key = anchor(match[1])
            count = seen.get(key, 0)
            result.add(key if not count else f'{key}-{count}')
            seen[key] = count + 1
    result.update(re.findall(r'<(?:a|h\d)\s+(?:id|name)=["\']([^"\']+)', text))
    return result


def main():
    manifest = json.loads(MANIFEST.read_text())
    errors = []
    for pair in manifest['pairs']:
        english, japanese = ROOT / pair['english'], ROOT / pair['japanese']
        if not english.is_file() or not japanese.is_file():
            errors.append(f'Missing language file: {pair}')
            continue
        en, ja = english.read_text(), japanese.read_text()
        ja_link = Path(os.path.relpath(japanese, english.parent)).as_posix()
        en_link = Path(os.path.relpath(english, japanese.parent)).as_posix()
        if f'[日本語]({ja_link})' not in en.split('\n\n', 1)[0]:
            errors.append(f'Missing Japanese navigation: {english}')
        if f'[English]({en_link})' not in ja.split('\n\n', 1)[0]:
            errors.append(f'Missing English navigation: {japanese}')
        expected = pair.get('original_sha256')
        if expected:
            body = restore_original_links(ja.split('\n\n', 1)[1])
            for correction in pair.get('link_corrections', []):
                body = body.replace(correction['to'], correction['from'])
            if sha256(body.encode()).hexdigest() != expected:
                errors.append(f'Japanese source body changed: {japanese}')
    if sha256((ROOT / 'specs/openapi.ja.yaml').read_bytes()).hexdigest() != manifest['japanese_openapi_sha256']:
        errors.append('Japanese OpenAPI snapshot changed')
    files = sorted(set(subprocess.check_output(
        ['git', 'ls-files', '-co', '--exclude-standard', '*.md'], cwd=ROOT, text=True
    ).splitlines()))
    checked_links = 0
    for filename in files:
        if filename.startswith('.agents/') or filename in manifest.get('excluded_generated_files', []):
            continue
        path = ROOT / filename
        text = path.read_text()
        # Inline code contains example paths, not rendered hyperlinks.
        rendered = re.sub(r'```.*?```|`[^`\n]*`', '', text, flags=re.S)
        targets = [m[1] for m in LINK.finditer(rendered)]
        targets += re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', rendered)
        for target in targets:
            parsed = urlsplit(target.strip('<>'))
            if parsed.scheme or parsed.netloc:
                continue
            linked = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            checked_links += 1
            if not linked.exists():
                errors.append(f'{filename}: missing local target {target}')
            elif parsed.fragment and linked.suffix == '.md' and unquote(parsed.fragment) not in anchors(linked.read_text()):
                errors.append(f'{filename}: missing heading {target}')
    for error in errors:
        print(error)
    print(f'Checked {len(manifest["pairs"])} language pairs and {checked_links} local links; {len(errors)} errors.')
    return bool(errors)


if __name__ == '__main__':
    raise SystemExit(main())
