#!/usr/bin/env python3
"""
Regression tests for Mercury rendering pipeline.

Covers bugs found during the IDX self-audit (March 2026):
  - Bug 1: D3 script load order (treemap)
  - Bug 2: documentsTab in single-stage renders
  - Bug 3: comparison_matrix format mismatch (array vs object)
  - Bug 5: nav links all resolve to sections

Run with:
    cd mercury
    python3 -m unittest tests/test_renderer_regression.py -v
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent.parent / "skills" / "mercury-render" / "scripts"
FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"


def node_available():
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def run_node(script_code):
    """Run a Node.js snippet, return stdout."""
    result = subprocess.run(
        ["node", "-e", script_code],
        capture_output=True, text=True,
        cwd=str(SCRIPTS)
    )
    if result.returncode != 0:
        raise RuntimeError(f"Node error: {result.stderr}")
    return result.stdout


def generate_html(artefact_dict):
    """Generate HTML from an artefact dict via mercury-adapter + mercury-html."""
    artefact_json = json.dumps(artefact_dict)
    script = f"""
const adapter = require('./mercury-adapter');
const MH = require('./mercury-html');
const artefact = {artefact_json};
const reportData = adapter.buildReportData({{ brief: artefact }});
const html = MH.buildPresentation(reportData);
process.stdout.write(html);
"""
    return run_node(script)


def generate_html_with_sitemap(sitemap_data):
    """Generate HTML with sitemapData populated."""
    sitemap_json = json.dumps(sitemap_data)
    script = f"""
const adapter = require('./mercury-adapter');
const MH = require('./mercury-html');
const sitemap_artefact = {{
    stage: 'sitemap',
    entity: 'Test Co',
    domain: 'test.com',
    generated_at: '2026-01-01T00:00:00Z',
    scope: {{ focus: 'test', confirmed_at: '2026-01-01T00:00:00Z' }},
    capabilities_used: [],
    claims: [],
    sitemap_data: {sitemap_json}
}};
const reportData = adapter.buildReportData({{ sitemap: sitemap_artefact }});
const html = MH.buildPresentation(reportData);
process.stdout.write(html);
"""
    return run_node(script)


MINIMAL_ARTEFACT = {
    "stage": "brief",
    "entity": "Test Company",
    "domain": "test.com",
    "generated_at": "2026-01-01T00:00:00Z",
    "scope": {"focus": "test", "confirmed_at": "2026-01-01T00:00:00Z"},
    "capabilities_used": [],
    "executive_summary": "Test summary.",
    "claims": [],
}

SITEMAP_DATA = {
    "name": "root",
    "children": [
        {
            "name": "About Us",
            "children": [
                {"name": "Team", "value": 1},
                {"name": "History", "value": 1},
            ]
        },
        {
            "name": "What We Do",
            "children": [
                {"name": "Services", "value": 2},
            ]
        }
    ]
}


@unittest.skipUnless(node_available(), "Node.js not available")
class TestSitemapSection(unittest.TestCase):
    """Sitemap section renders as HTML directory tree (D3 treemap was removed in commit 7075f63)."""

    def setUp(self):
        self.html = generate_html_with_sitemap(SITEMAP_DATA)

    def test_sitemap_section_present(self):
        self.assertIn('<section id="sitemap"', self.html)

    def test_no_d3_dependency(self):
        """D3 was removed — the sitemap must not depend on d3.min.js."""
        self.assertNotIn('d3.min.js', self.html,
            "D3 was replaced by an HTML directory tree in commit 7075f63 — d3.min.js must not be present")

    def test_sitemap_tree_structure_rendered(self):
        """Sitemap section should contain the HTML directory tree markup."""
        sitemap_start = self.html.find('<section id="sitemap"')
        sitemap_end = self.html.find('</section>', sitemap_start)
        self.assertGreater(sitemap_start, 0, "sitemap section not found")
        section_html = self.html[sitemap_start:sitemap_end]
        # The directory tree uses a nested list or div structure; check root node is present
        self.assertTrue(
            'About Us' in section_html or 'What We Do' in section_html,
            "Sitemap tree should render node labels from sitemap_data"
        )


@unittest.skipUnless(node_available(), "Node.js not available")
class TestDocumentsTab(unittest.TestCase):
    """Bug 2: documentsTab must be populated so Documents section renders."""

    def test_adapter_buildreportdata_no_documents_tab(self):
        """buildReportData alone does not set documentsTab (correct — it has no file paths)."""
        script = f"""
const adapter = require('./mercury-adapter');
const artefact = {json.dumps(MINIMAL_ARTEFACT)};
const reportData = adapter.buildReportData({{ brief: artefact }});
// documentsTab should be absent from the adapter output
console.log(reportData.documentsTab === undefined || reportData.documentsTab === null ? 'absent' : 'present');
"""
        output = run_node(script).strip()
        self.assertEqual(output, "absent",
            "adapter.buildReportData should not set documentsTab (no file paths available)")

    def test_html_without_documents_tab_omits_section(self):
        """Without documentsTab, the HTML should not contain a documents section."""
        html = generate_html(MINIMAL_ARTEFACT)
        self.assertNotIn('<section id="documents"', html,
            "Documents section should be absent when documentsTab is not set")

    def test_html_with_documents_tab_renders_section(self):
        """With documentsTab set, HTML should contain the documents section and nav link."""
        docs_tab = {
            "stages_completed": ["brief"],
            "groups": [
                {
                    "label": "Briefing",
                    "files": [
                        {
                            "format": "HTML",
                            "filename": "test-brief.html",
                            "path": "/tmp/test-brief.html",
                            "rendered_at": "2026-01-01T00:00:00Z"
                        }
                    ]
                }
            ]
        }
        docs_tab_json = json.dumps(docs_tab)
        script = f"""
const adapter = require('./mercury-adapter');
const MH = require('./mercury-html');
const artefact = {json.dumps(MINIMAL_ARTEFACT)};
const reportData = adapter.buildReportData({{ brief: artefact }});
reportData.documentsTab = {docs_tab_json};
const html = MH.buildPresentation(reportData);
process.stdout.write(html);
"""
        html = run_node(script)
        self.assertIn('<section id="documents"', html,
            "Documents section should render when documentsTab is set")
        self.assertIn('data-section="documents"', html,
            "Nav link for documents should be present when documentsTab is set")


@unittest.skipUnless(node_available(), "Node.js not available")
class TestComparisonMatrix(unittest.TestCase):
    """Bug 3: comparison_matrix should accept both array and object formats."""

    COMPETE_BASE = {
        "stage": "compete",
        "entity": "Test Co",
        "domain": "test.com",
        "generated_at": "2026-01-01T00:00:00Z",
        "scope": {"focus": "test", "confirmed_at": "2026-01-01T00:00:00Z"},
        "capabilities_used": [],
        "claims": [],
        "company_a": "Test Co",
        "company_b": "Peer Co",
    }

    def _build_compete_html(self, matrix):
        artefact = dict(self.COMPETE_BASE, comparison_matrix=matrix)
        artefact_json = json.dumps(artefact)
        script = f"""
const adapter = require('./mercury-adapter');
const MH = require('./mercury-html');
const artefact = {artefact_json};
const brief = {json.dumps(MINIMAL_ARTEFACT)};
const reportData = adapter.buildReportData({{ brief, compete: artefact }});
console.log(JSON.stringify({{ matrix: reportData.comparisonMatrix, a: reportData.companyA, b: reportData.companyB }}));
"""
        return json.loads(run_node(script))

    def test_array_format_accepted(self):
        """Array format [{dimension, a, b, edge}] should work without crash."""
        matrix = [
            {"dimension": "Messaging", "a": "Strong", "b": "Weak", "edge": "Test Co"},
            {"dimension": "Design", "a": "Modern", "b": "Dated", "edge": "Test Co"},
        ]
        result = self._build_compete_html(matrix)
        self.assertIsInstance(result["matrix"], list)
        self.assertEqual(len(result["matrix"]), 2)
        self.assertEqual(result["matrix"][0]["dimension"], "Messaging")
        self.assertEqual(result["matrix"][0]["a"], "Strong")

    def test_object_format_accepted(self):
        """Object format {dimensions, companies} should not crash and produce array output."""
        matrix = {
            "dimensions": ["Messaging", "Design"],
            "companies": {
                "Test Co": {
                    "Messaging": {"summary": "Strong", "edge": "Test Co"},
                    "Design": {"summary": "Modern"},
                },
                "Peer Co": {
                    "Messaging": {"summary": "Weak"},
                    "Design": {"summary": "Dated"},
                }
            }
        }
        result = self._build_compete_html(matrix)
        self.assertIsInstance(result["matrix"], list,
            "Object format should produce an array, not crash")
        self.assertEqual(len(result["matrix"]), 2)
        self.assertEqual(result["matrix"][0]["dimension"], "Messaging")
        self.assertIn("Strong", result["matrix"][0]["a"])

    def test_unrecognised_format_no_crash(self):
        """An unrecognised format (e.g. plain string) should not crash."""
        result = self._build_compete_html("not-a-matrix")
        # Should produce empty/default comparisonMatrix, not throw
        self.assertIsInstance(result["matrix"], list)

    def test_missing_matrix_no_crash(self):
        """Missing comparison_matrix entirely should not crash."""
        artefact = dict(self.COMPETE_BASE)  # no comparison_matrix key
        artefact_json = json.dumps(artefact)
        script = f"""
const adapter = require('./mercury-adapter');
const artefact = {artefact_json};
const brief = {json.dumps(MINIMAL_ARTEFACT)};
const reportData = adapter.buildReportData({{ brief, compete: artefact }});
console.log(JSON.stringify(reportData.comparisonMatrix));
"""
        result = json.loads(run_node(script))
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 0)


@unittest.skipUnless(node_available(), "Node.js not available")
class TestNavLinks(unittest.TestCase):
    """Bug 4 / general: every nav link must resolve to a section."""

    def test_all_nav_links_resolve(self):
        html = generate_html(MINIMAL_ARTEFACT)
        nav_ids = re.findall(r'data-section="([^"]+)"', html)
        self.assertGreater(len(nav_ids), 0, "No nav links found")
        for sec_id in nav_ids:
            self.assertIn(f'<section id="{sec_id}"', html,
                f'Nav link data-section="{sec_id}" has no matching <section id="{sec_id}">')

    def test_all_nav_links_resolve_with_sitemap(self):
        html = generate_html_with_sitemap(SITEMAP_DATA)
        nav_ids = re.findall(r'data-section="([^"]+)"', html)
        for sec_id in nav_ids:
            self.assertIn(f'<section id="{sec_id}"', html,
                f'Nav link data-section="{sec_id}" has no matching section')


@unittest.skipUnless(node_available(), "Node.js not available")
class TestComparisonTableRenders(unittest.TestCase):
    """Comparison section renders correctly when comparisonMatrix is populated."""

    def test_peer_comparison_section_present(self):
        matrix = [{"dimension": "Messaging", "a": "Good", "b": "Poor", "edge": "Us"}]
        artefact = dict(TestComparisonMatrix.COMPETE_BASE, comparison_matrix=matrix)
        artefact_json = json.dumps(artefact)
        script = f"""
const adapter = require('./mercury-adapter');
const MH = require('./mercury-html');
const artefact = {artefact_json};
const brief = {json.dumps(MINIMAL_ARTEFACT)};
const reportData = adapter.buildReportData({{ brief, compete: artefact }});
process.stdout.write(MH.buildPresentation(reportData));
"""
        html = run_node(script)
        self.assertIn('<section id="peer-comparison"', html)

    def test_peer_comparison_table_has_three_columns(self):
        matrix = [{"dimension": "Messaging", "a": "Good", "b": "Poor", "edge": "Us"}]
        artefact = dict(TestComparisonMatrix.COMPETE_BASE, comparison_matrix=matrix)
        artefact_json = json.dumps(artefact)
        script = f"""
const adapter = require('./mercury-adapter');
const MH = require('./mercury-html');
const artefact = {artefact_json};
const brief = {json.dumps(MINIMAL_ARTEFACT)};
const reportData = adapter.buildReportData({{ brief, compete: artefact }});
process.stdout.write(MH.buildPresentation(reportData));
"""
        html = run_node(script)
        # Find the thead row inside the peer-comparison section
        match = re.search(r'<section id="peer-comparison".*?<thead>(.*?)</thead>', html, re.DOTALL)
        self.assertIsNotNone(match, "peer-comparison thead not found")
        thead_html = match.group(1)
        # Header row should have 4 <th> elements: Dimension, Co A, Co B, Edge
        headers = re.findall(r'<th[^>]*>', thead_html)
        self.assertEqual(len(headers), 4,
            f"Expected 4 column headers (Dimension/A/B/Edge), found {len(headers)}: {thead_html}")


if __name__ == "__main__":
    unittest.main()
