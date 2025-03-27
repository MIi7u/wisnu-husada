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
Route.get('/admin/dokter', 'Admin/DashboardController.dokter').as('admin.dokter')
Route.get('/admin/pending', 'Admin/DashboardController.pending').as('admin.pending')
Route.get('/favicon.ico', ({ response }) => response.status(204).send(''));
Route.get('/admin/dpjb', 'Admin/DashboardController.dpjb').as('admin.dpjb')
Route.get('/admin/dpjb/detail/:dpjp', 'Admin/DashboardController.dpjbdetail').as('admin.dpjbdetail');

Route.post('/admin/dpjb', 'Admin/DashboardController.dpjb') // AJAX filter

//operator

Route.on('*').render('notfound') 
