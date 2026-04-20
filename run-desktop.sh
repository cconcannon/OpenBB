#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/desktop"

export OPENSSL_DIR="${OPENSSL_DIR:-/opt/homebrew/opt/openssl@3}"
export OPENSSL_INCLUDE_DIR="${OPENSSL_INCLUDE_DIR:-$OPENSSL_DIR/include}"
export OPENSSL_LIB_DIR="${OPENSSL_LIB_DIR:-$OPENSSL_DIR/lib}"

exec npm run tauri dev
