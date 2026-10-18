'use strict'

const Env = use('Env')

/**
 * MenuUnitController
 * ---------------------------------------------------------------
 * Menyajikan halaman navbar/menu navigasi tiap unit layanan.
 * Sebelumnya rute-rute ini ditulis inline di start/routes.js;
 * dipusatkan di sini agar lebih rapi dan mudah dipelihara.
 */
class MenuUnitController {
    /**
     * Render satu halaman menu unit.
     * @param {string} viewName - nama view tanpa prefix, mis. 'menu_laboratorium'
     */
    _renderMenu(viewName, { view, session }) {
        try {
            return view.render(`admin.${viewName}`, {
                user: session.get('session_nama'),
                level: session.get('session_level'),
                title: Env.get('APP_NAME'),
            })
        } catch (err) {
            return view.render('error_404', { error: err })
        }
    }

    async pendaftaran(ctx) { return this._renderMenu('menu_pendaftaran', ctx) }
    async keperawatan(ctx) { return this._renderMenu('menu_keperawatan', ctx) }
    async farmasi(ctx) { return this._renderMenu('menu_farmasi', ctx) }
    async radiologi(ctx) { return this._renderMenu('menu_radiologi', ctx) }
    async laboratorium(ctx) { return this._renderMenu('menu_laboratorium', ctx) }
    async kasir(ctx) { return this._renderMenu('menu_kasir', ctx) }
    async dokter(ctx) { return this._renderMenu('menu_dokter', ctx) }
}

module.exports = MenuUnitController
