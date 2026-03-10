#!/bin/bash
# Mercury build pipeline — validate, convert to PDF, extract page images
# Usage: bash build-pipeline.sh docx|pptx <filepath>

set -e

FORMAT="$1"
FILEPATH="$2"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "$FORMAT" ] || [ -z "$FILEPATH" ]; then
  echo "Usage: bash build-pipeline.sh <docx|pptx|html> <filepath>"
  exit 1
fi

if [ ! -f "$FILEPATH" ]; then
  echo "Error: File not found: $FILEPATH"
  exit 1
fi

BASENAME=$(basename "$FILEPATH" ."$FORMAT")
DIRPATH=$(dirname "$FILEPATH")
WORKDIR="${DIRPATH}"

echo "=== Mercury build pipeline ==="
echo "Format: $FORMAT"
echo "File:   $FILEPATH"
echo ""

# HTML files: validate only (no PDF conversion needed)
if [ "$FORMAT" = "html" ]; then
  echo "--- Step 1: Validating HTML ---"
  if command -v python3 &> /dev/null; then
    python3 -c "
with open('$FILEPATH', 'r') as f:
    content = f.read()
print(f'Valid HTML: {len(content)} chars, {content.count(\"<section\")} sections')
if '<!DOCTYPE html>' not in content:
    print('Warning: Missing DOCTYPE')
if '@font-face' not in content:
    print('Warning: No embedded fonts detected')
" 2>/dev/null || echo "Warning: HTML validation unavailable"
  fi
  echo ""
  echo "=== Build pipeline complete ==="
  echo "HTML presentation: $FILEPATH"
  echo "Open in browser to verify"
  exit 0
fi

# Step 1: Validate (docx only)
if [ "$FORMAT" = "docx" ]; then
  echo "--- Step 1: Validating ---"
  # python-docx validation: check the file can be opened
  python3 -c "
try:
    from docx import Document
    doc = Document('$FILEPATH')
    print(f'Valid: {len(doc.paragraphs)} paragraphs, {len(doc.tables)} tables')
except ImportError:
    print('Warning: python-docx not installed, skipping validation')
except Exception as e:
    print(f'Validation error: {e}')
" 2>/dev/null || echo "Warning: Python validation unavailable, skipping"
  echo ""
fi

# Step 2: Convert to PDF
echo "--- Step 2: Converting to PDF ---"
if command -v soffice &> /dev/null; then
  soffice --headless --convert-to pdf "$FILEPATH" --outdir "$WORKDIR"
elif command -v libreoffice &> /dev/null; then
  libreoffice --headless --convert-to pdf "$FILEPATH" --outdir "$WORKDIR"
else
  echo "Warning: LibreOffice not available, skipping PDF conversion"
  exit 0
fi

PDF_PATH="${WORKDIR}/${BASENAME}.pdf"
if [ ! -f "$PDF_PATH" ]; then
  echo "Warning: PDF was not created"
  exit 0
fi
echo ""

# Step 3: Extract page images
echo "--- Step 3: Extracting page images ---"
if command -v pdftoppm &> /dev/null; then
  pdftoppm -jpeg -r 150 "$PDF_PATH" "${WORKDIR}/${BASENAME}-page"
  PAGE_COUNT=$(ls "${WORKDIR}/${BASENAME}-page"*.jpg 2>/dev/null | wc -l)
  echo "Generated $PAGE_COUNT page images"
  echo "Pages: ${WORKDIR}/${BASENAME}-page-*.jpg"
else
  echo "Warning: pdftoppm not available, skipping page image extraction"
fi

echo ""
echo "=== Build pipeline complete ==="
echo "Document: $FILEPATH"
[ -f "$PDF_PATH" ] && echo "PDF:      $PDF_PATH"
[ -n "$PAGE_COUNT" ] && echo "Pages:    $PAGE_COUNT"
