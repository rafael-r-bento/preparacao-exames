#!/bin/bash

quantidade="$1"

if [[ -z "$quantidade" || ! "$quantidade" =~ ^[0-9]+$ ]]; then
    echo "Uso: $0 <quantidade>"
    echo "Exemplo: $0 120"
    exit 1
fi

for ((i=1; i<=quantidade; i++)); do
    printf -v arquivo "%03d.md" "$i"
    touch "$arquivo"
done

echo "Criados $quantidade arquivos."
