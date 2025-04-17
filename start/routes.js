'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */

const Route = use('Route')

Route.get('/', 'Admin/DashboardController.index').as('admin.index')
Route.get('/admin/persedian_menu', 'Admin/PersedianController.index').as('admin.persedian_menu')
/*Route.get('/admin/dokter', 'Admin/DashboardController.dokter').as('admin.dokter')
Route.get('/admin/pending', 'Admin/DashboardController.pending').as('admin.pending')
Route.get('/favicon.ico', ({ response }) => response.status(204).send(''));
Route.get('/admin/dpjb', 'Admin/DashboardController.dpjb').as('admin.dpjb')
Route.get('/admin/dpjbdetail/:nip_dokter', 'Admin/DashboardController.dpjbdetail').as('admin.dpjbdetail');
Route.get('/admin/dpjb/detail/:dpjp', 'Admin/DashboardController.dpjbdetail').as('admin.dpjbdetail');
Route.post('/admin/dpjb', 'Admin/DashboardController.dpjb') // AJAX filter
Route.get('/admin/dpjb/detail/:dpjp', 'Admin/DashboardController.dpjbdetail').as('admin.dpjbdetail');
Route.post('/admin/lenkapdpjbdetail', 'Admin/DashboardController.lenkapdpjbdetail').as('admin.lenkapdpjbdetail');
Route.get('/admin/dpjbdetail/', 'Admin/DashboardController.dpjbdetail').as('admin.dpjbdetail');
*/
Route.post('/admin/rincian/', 'Admin/DashboardController.dpjbdetailrincian').as('admin.dpjbdetailrincian');
Route.get('/admin/rincian/', 'Admin/DashboardController.dpjbdetailrincian').as('admin.dpjbdetailrincian');
Route.post('/admin/nonbpjs/', 'Admin/DashboardController.dpjbdetailrincian').as('admin.dpjbdetailrincian');
Route.get('/admin/nonbpjs/', 'Admin/DashboardController.dpjbdetailrincian').as('admin.dpjbdetailrincian');
Route.get('/admin/dokter/data', 'Admin/DashboardController.dokterData').as('admin.dokterdata');
Route.get('/admin/dokter/', 'Admin/DashboardController.dokter').as('admin.admin.dokter');

//persedian
Route.get('/admin/obat', 'Admin/PersedianController.persedian_menu').as('admin.obat');
Route.get('/admin/obat/data', 'PersedianController.index')
Route.post('/admin/obat/simpan', 'PersedianController.store')
Route.get('/admin/obat/:id', 'PersedianController.show')
Route.delete('/admin/obat/:id', 'PersedianController.destroy')

Route.on('*').render('notfound') 
