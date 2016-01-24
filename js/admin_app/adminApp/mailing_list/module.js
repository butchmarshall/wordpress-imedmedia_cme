var mailingListModule = angular.module("adminApp.MailingList", []);

mailingListModule.config(
	function($stateProvider, $urlRouterProvider) {
		// Mailing List
		$stateProvider.state({
			name: "dashboard.mailing_list",
			url: "/mailing_list/{mailingListId:int}",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/mailing_list/view.html',
			controller: 'MailingListController',
			resolve: {
				site: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site", { cme_site_id: iMedMediaCME.cme_site_id });
				}],
				mailing_list: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_mailing_list", {
						cme_site_id: iMedMediaCME.cme_site_id,
						mailing_list_id: $stateParams.mailingListId,
						format: "json"
					}, {}, true);
				}]
			}
		})
		// Subscribers
		.state({
			name: "dashboard.mailing_list.subscribers",
			url: "/subscribers",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/mailing_list/subscribers.html',
			controller: 'MailingListSubscribersController',
			resolve: {

			}
		});
	}
);

mailingListModule.controller('MailingListController', 				MailingListController);
mailingListModule.controller('MailingListSubscribersController',	MailingListSubscribersController);
