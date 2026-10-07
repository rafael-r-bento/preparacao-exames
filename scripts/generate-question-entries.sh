#!/bin/bash

EXAM=$1
TOTAL=$2

if [ -z "$EXAM" ] || [ -z "$TOTAL" ]; then
  echo "Uso: ./scripts/generate-questions.sh BCB_2024 120"
  exit 1
fi

OUTPUT="${EXAM}.txt"

> "$OUTPUT"

for ((i=1; i<=TOTAL; i++)); do
  ID=$(printf "%03d" "$i")

  cat >> "$OUTPUT" <<EOF
{
  "exam": "${EXAM//_/ }",
  "id": "$i",
  "contentFile": "questions/${EXAM}/${ID}",
  "alternatives": [
    "C",
    "E"
  ],
  "answer": ""
}
EOF

  if [ "$i" -lt "$TOTAL" ]; then
    echo "" >> "$OUTPUT"
  fi
done

echo "Arquivo '$OUTPUT' gerado com sucesso!"
