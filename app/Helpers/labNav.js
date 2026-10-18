'use strict'

/**
 * Helper navbar modul Laboratorium (Edge include)
 * Menyediakan fungsi labNav(active) untuk menandai menu aktif.
 */
const MENUS = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high', url: '/admin/laboratorium/dashboard' },
    { key: 'permintaan', label: 'Permintaan & Pendaftaran', icon: 'fa-clipboard-list', url: '/admin/laboratorium/permintaan' },
    { key: 'pemeriksaan', label: 'Proses Pemeriksaan', icon: 'fa-microscope', url: '/admin/laboratorium/pemeriksaan' },
    { key: 'stok', label: 'Stok & Reagen', icon: 'fa-boxes-stacked', url: '/admin/laboratorium/stok' },
    { key: 'laporan', label: 'Laporan & Analitik', icon: 'fa-chart-line', url: '/admin/laboratorium/laporan' },
    { key: 'pengaturan', label: 'Pengaturan', icon: 'fa-gear', url: '/admin/laboratorium' }
]

function labNav(active) {
    return MENUS.map(m => {
        const isActive = m.key === active
        return `<a class="nav-link${isActive ? ' active-menu' : ''}" href="${m.url}">
            <i class="fas ${m.icon} me-1"></i>${m.label}</a>`
    }).join('\n')
}

module.exports = { MENUS, labNav }
