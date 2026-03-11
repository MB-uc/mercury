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

# HTML files: validate and smoke test
if [ "$FORMAT" = "html" ]; then
  echo "--- Step 1: Validating HTML ---"
  if command -v python3 &> /dev/null; then
    python3 - "$FILEPATH" << 'PYEOF'
import sys, re

filepath = sys.argv[1]
with open(filepath, 'r') as f:
    content = f.read()
print(f'Size: {len(content)} chars, {content.count("<section")} sections')

errors = []
warnings = []

if '<!DOCTYPE html>' not in content:
    errors.append('Missing DOCTYPE')
if '@font-face' not in content:
    warnings.append('No embedded fonts detected')

# D3 load order: d3.min.js must appear before <section id="sitemap">
if '<section id="sitemap"' in content:
    d3_pos = content.find('d3.min.js')
    sitemap_pos = content.find('<section id="sitemap"')
    if d3_pos == -1:
        errors.append('D3 script tag missing but sitemap section present')
    elif d3_pos > sitemap_pos:
        errors.append('D3 script loaded AFTER sitemap section — treemap will be blank')

# All nav links must have matching sections
for sec_id in re.findall(r'data-section="([^"]+)"', content):
    if f'<section id="{sec_id}"' not in content:
        errors.append(f'Nav link data-section="{sec_id}" has no matching section')

# No completely empty sections (content beyond h2)
for sec_id in re.findall(r'<section id="([^"]+)"', content):
    match = re.search(f'<section id="{sec_id}"[^>]*>(.*?)</section>', content, re.DOTALL)
    if match:
        inner = re.sub(r'<h2[^>]*>.*?</h2>', '', match.group(1), flags=re.DOTALL).strip()
        if not inner:
            warnings.append(f'Section #{sec_id} is empty (no content beyond h2)')

for e in errors:
    print(f'ERROR: {e}')
for w in warnings:
    print(f'Warning: {w}')
if errors:
    sys.exit(1)
print('Smoke tests passed')
PYEOF
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
