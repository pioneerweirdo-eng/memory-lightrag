#!/usr/bin/env bash
set -euo pipefail

# Install a static ffmpeg binary into ./bin/ffmpeg (bridge-local).
# Avoid relying on apt repos in minimal containers.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BIN_DIR="$ROOT_DIR/bin"
mkdir -p "$BIN_DIR"

ARCH="$(uname -m)"
if [[ "$ARCH" != "x86_64" && "$ARCH" != "amd64" ]]; then
  echo "Unsupported arch: $ARCH (this script supports x86_64 only)" >&2
  exit 2
fi

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

URL="https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"

echo "Downloading ffmpeg from: $URL" >&2
curl -k -L --fail --retry 3 --connect-timeout 10 --max-time 300 "$URL" -o "$TMP/ffmpeg.tar.xz"

mkdir -p "$TMP/extract"
tar -xJf "$TMP/ffmpeg.tar.xz" -C "$TMP/extract"

FFMPEG_PATH="$(find "$TMP/extract" -type f -name ffmpeg | head -n 1)"
FFPROBE_PATH="$(find "$TMP/extract" -type f -name ffprobe | head -n 1)"

if [[ -z "$FFMPEG_PATH" ]]; then
  echo "ffmpeg binary not found in archive" >&2
  exit 3
fi

cp "$FFMPEG_PATH" "$BIN_DIR/ffmpeg"
chmod +x "$BIN_DIR/ffmpeg"

if [[ -n "$FFPROBE_PATH" ]]; then
  cp "$FFPROBE_PATH" "$BIN_DIR/ffprobe"
  chmod +x "$BIN_DIR/ffprobe"
fi

echo "Installed: $BIN_DIR/ffmpeg" >&2
"$BIN_DIR/ffmpeg" -version | head -n 2 >&2
