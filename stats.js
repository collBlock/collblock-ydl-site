const statsStatus = document.getElementById('stats-status');
const statsSource = document.getElementById('stats-source');
const statsLocale = document.documentElement.lang || 'ru';
const counts = new Intl.NumberFormat(statsLocale);
const quantities = new Intl.NumberFormat(statsLocale, { maximumFractionDigits: 1 });
const units = statsLocale === 'en' ? ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] : ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ'];

function formatStat(value, field) {
    if (!Number.isSafeInteger(value) || value < 0) return '—';
    if (field !== 'bytes_downloaded') return counts.format(value);
    let unit = 0;
    while (value >= 1000 && unit < units.length - 1) {
        value /= 1000;
        unit++;
    }
    return quantities.format(value) + ' ' + units[unit];
}

async function renderStats() {
    try {
        const response = await fetch(statsSource.href, { cache: 'no-cache', credentials: 'omit' });
        if (!response.ok) throw new Error('Statistics unavailable');
        const data = await response.json();
        for (const node of document.querySelectorAll('[data-stat]')) {
            const row = node.dataset.provider ? data.providers?.[node.dataset.provider] : data;
            node.textContent = formatStat(row?.[node.dataset.stat], node.dataset.stat);
        }
        const updated = data.updated_at && new Date(data.updated_at);
        statsStatus.textContent = updated && Number.isFinite(updated.getTime())
            ? statsStatus.dataset.updated + ' ' + updated.toLocaleString(statsLocale)
            : statsStatus.dataset[data.installations_total === 0 ? 'empty' : 'disconnected'];
    } catch {
        statsStatus.textContent = statsStatus.dataset.error;
    }
}

renderStats();
