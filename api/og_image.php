<?php
declare(strict_types=1);

/**
 * Dispatcher for the per-report Open Graph image (routed for
 * /api/og/{token}.png and /api/og/r{id}.png).
 *
 * Two layouts exist; the active one is selected here so the site can toggle
 * between them without touching the routing or the meta tags:
 *   - 'card'    (default) — dark comparison-card style  -> og_image_card.php
 *   - 'classic'           — original chart-left/metrics-right layout,
 *                           preserved for reuse          -> og_image_classic.php
 *
 * Override with the HCRI_OG_STYLE environment variable (e.g. HCRI_OG_STYLE=classic).
 */
$style = strtolower((string)(getenv('HCRI_OG_STYLE') ?: 'card'));
$style = 'classic';
require __DIR__ . ($style === 'classic' ? '/og_image_classic.php' : '/og_image_card.php');