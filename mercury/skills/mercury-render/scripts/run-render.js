#!/usr/bin/env node
/**
 * Mercury Render CLI
 *
 * Renders Mercury artefacts to HTML, DOCX, and PPTX.
 * Used by the automated runner instead of generating inline scripts.
 *
 * Usage:
 *   node run-render.js --dir <path> --company <slug> --stages brief,compete,sitemap,meeting [--formats html,docx,pptx]
 *
 * Examples:
 *   node run-render.js --dir ./ihg --company ihg --stages brief,compete
 *   node run-render.js --dir ./ihg --company ihg --stages all --formats html
 */

const path = require('path');
const MO = require('./mercury-output.js');

function parseArgs() {
    const args = process.argv.slice(2);
    const result = { dir: null, company: null, stages: [], formats: ['html', 'docx', 'pptx', 'xlsx'] };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--dir') result.dir = args[++i];
        else if (args[i] === '--company') result.company = args[++i];
        else if (args[i] === '--stages') {
            const val = args[++i];
            if (val === 'all') {
                result.stages = ['brief', 'compete', 'sitemap', 'meeting'];
            } else if (val === 'ms-all' || val === 'ms_all') {
                result.stages = ['ms_brief', 'ms_crawl', 'ms_findings'];
            } else {
                // normalise ms-brief → ms_brief etc.
                result.stages = val.split(',').map(s => s.replace(/-/g, '_'));
            }
        }
        else if (args[i] === '--formats') result.formats = args[++i].split(',');
    }

    return result;
}

async function main() {
    const { dir, company, stages, formats } = parseArgs();

    if (!dir || !company || !stages.length) {
        console.error('Usage: node run-render.js --dir <path> --company <slug> --stages <stage1,stage2|all> [--formats html,docx,pptx]');
        process.exit(1);
    }

    for (const stage of stages) {
        console.log(`Rendering ${company} ${stage}...`);
        try {
            const result = await MO.renderStage({
                dir,
                company,
                stage,
                formats,
                opts: {},
            });
            console.log(`  rendered: ${Object.keys(result.files || {}).join(', ')}`);
        } catch (e) {
            console.error(`  Error rendering ${stage}: ${e.message}`);
        }
    }

    console.log('Rendering complete.');
}

main().catch(console.error);
