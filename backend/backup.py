"""Owner-operated backup. Pause application writes while this command runs."""
import argparse
import json
import shutil
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from app import config


def backup(destination: Path):
    destination = destination.resolve()
    if destination == config.DATA or destination.is_relative_to(config.DATA):
        raise ValueError('Choose a new backup directory outside the runtime data directory.')
    source = config.DATA / 'studyforge.sqlite3'
    if not source.is_file():
        raise ValueError('No StudyForge database exists at the configured data directory.')
    destination.mkdir(parents=True, exist_ok=False)
    with sqlite3.connect(source) as current, sqlite3.connect(destination / source.name) as saved:
        current.backup(saved)
        if saved.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
            raise RuntimeError('Backup integrity check failed; do not use this backup.')
    for folder in ('uploads', 'indexes', 'generated'):
        if (config.DATA / folder).exists():
            shutil.copytree(config.DATA / folder, destination / folder)
    if (config.DATA / 'encryption.key').exists():
        shutil.copy2(config.DATA / 'encryption.key', destination / 'encryption.key')
    (destination / 'manifest.json').write_text(json.dumps({
        'created_at': datetime.now(timezone.utc).isoformat(),
        'original_data_dir': str(config.DATA),
        'embedding_model': config.MODEL,
        'restore': 'Restore to the same absolute data path. Preserve the production ENCRYPTION_KEY separately.'
    }, indent=2), encoding='utf-8')
    return destination


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path, help='New directory outside STUDYFORGE_DATA_DIR')
    args = parser.parse_args()
    print(f'Backup created: {backup(args.destination)}')
