var dashboardModule = angular.module("adminApp.Dashboard", []);

dashboardModule.config(
	function($stateProvider, $urlRouterProvider) {
		var resolve = {
			
		};

		// Dashboard
		$stateProvider.state({
			name: "dashboard",
			url: "/dashboard",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/view.html',
			controller: 'DashboardController',
			resolve: resolve
		});

		// Settings
		$stateProvider.state({
			name: "dashboard.settings",
			url: "/settings",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/settings.html',
			resolve: resolve
		});

		// Courses
		$stateProvider.state({
			name: "dashboard.courses",
			url: "/courses",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/courses.html',
			resolve: resolve
		});

		// Emails
		$stateProvider.state({
			name: "dashboard.emails",
			url: "/emails",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/emails.html',
			resolve: resolve
		});

		// Mailing Lists
		$stateProvider.state({
			name: "dashboard.mailing_lists",
			url: "/mailing_lists",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/mailing_lists.html',
			resolve: resolve
		});
	}
);

dashboardModule.controller('DashboardController', ['$scope', '$rootScope', '$location', 'ngTableParams', DashboardController]);
dashboardModule.controller('CoursesController', ['$scope', '$rootScope', '$location', '$modal', '$state', '$stateParams', 'ngTableParams', CoursesController]);
dashboardModule.controller('MailingListsController', ['$scope', '$rootScope', '$location', '$modal', '$state', '$stateParams', 'ngTableParams', MailingListsController]);
dashboardModule.controller('EmailsController', ['$scope', '$rootScope', '$location', '$modal', '$state', '$stateParams', 'ngTableParams', EmailsController]);