export const NEWSLETTER_CATEGORY_ORDER = [
    'feature',
    'economy',
    'brief',
    'research',
    'uncategorized',
] as const

export const NEWSLETTER_CATEGORY_LABELS: Record<string, string> = {
    feature: 'Feature',
    brief: 'Brief',
    economy: 'The AI Economy',
    research: 'Research',
    uncategorized: 'Uncategorized',
}

export const NEWSLETTER_MARKET_TABLE_COLUMNS = ['Sector', 'Leader', 'Laggard'] as const

export const NEWSLETTER_MARKET_TABLE_PLACEHOLDER_ROWS = [
    { sector: '⚡ Sector Placeholder', leader: '🟢 Leader ticker +X.X%', laggard: 'Laggard ticker +X.X%' },
    { sector: '⚙️ Sector Placeholder', leader: '🟢 Leader ticker +X.X%', laggard: 'Laggard ticker +X.X%' },
    { sector: '📡 Sector Placeholder', leader: '🔴 Leader ticker -X.X%', laggard: 'Laggard ticker +X.X%' },
    { sector: '🛡️ Sector Placeholder', leader: '⚪ Leader ticker +X.X%', laggard: 'Laggard ticker +X.X%' },
] as const
