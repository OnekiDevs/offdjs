#!/bin/bash

# Archivo del changelog
CHANGELOG_FILE="CHANGELOG.md"

# Versión a buscar (pasada como argumento)
VERSION="$1"

if [[ -z "$VERSION" ]]; then
  echo "Debes proporcionar una versión como argumento. Ejemplo: ./get_changelog.sh 2.7.0"
  exit 1
fi

# Extrae el changelog de la versión especificada
awk -v ver="# $VERSION" '
  $0 ~ ver {flag=1; next}
  /^#/ && flag {flag=0}
  flag {print}' "$CHANGELOG_FILE"
