var courseModule = angular.module("adminApp.Course", []);

courseModule.config(
	function($stateProvider, $urlRouterProvider) {

		// Course
		$stateProvider.state({
			name: "course",
			url: "/course/{courseId:int}",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/view.html',
			controller: 'CourseController',
			resolve: {
				site: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site", { cme_site_id: iMedMediaCME.cme_site_id });
				}],
				course: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: $stateParams.courseId,
						format: "json"
					}, {}, true);
				}],
				categories: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: $stateParams.courseId,
						format: "json"
					}, {}, true).then(
						function(cme_course) {
							return Api.execute("get_cme_site_course_categories", cme_course.links.categories.href, {}, true);
						}
					);
				}]
			}
		})
		// Course Category
		.state({
			name: "course.category",
			url: "/category/{categoryId:int}",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/category_view.html',
			controller: 'CourseCategoryController',
			resolve: {
				category: ['$stateParams', 'Api', 'categories', function($stateParams, Api, categories) {
					for(var i = 0; i < categories.data.length; i++) {
						if (categories.data[i].id == $stateParams.categoryId) {
							return categories.data[i];
						}
					}
					return {};
				}]
			}
		})
		// Email Speakers
		.state({
			name: "course.email_speakers",
			url: "/email_speakers",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/email_speakers_view.html',
			controller: 'CourseEmailSpeakersController',
			resolve: {
				speakers: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course_speakers", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: $stateParams.courseId
					}, {}, true).then(
						function(result) {
							var emailArray = [],
							items = [];
							$.each(result.data, function(i, item) {
								if ($.inArray(item.email, emailArray) === -1) {
									emailArray.push(item.email);
									items.push(item);
								}
							});
							result.data = items;
							return result;
						}
					);
				}]
			}
		})
		// Email Registrants
		.state({
			name: "course.email_registrants",
			url: "/email_registrants",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/email_registrants_view.html',
			controller: 'CourseEmailRegistrantsController',
			resolve: {
				registrants: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course_registrants", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: $stateParams.courseId
					}, {
						search: {
							complete: 1
						}
					}, true).then(
						function(result) {
							var emailArray = [],
							items = [];
							$.each(result.data, function(i, item) {
								if ($.inArray(item.email, emailArray) === -1) {
									emailArray.push(item.email);
									items.push(item);
								}
							});
							result.data = items;
							return result;
						}
					);
				}]
			}
		})
		// Course Schedule
		.state({
			name: "course.schedule",
			url: "/schedule",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/schedule_view.html',
			controller: 'CourseScheduleController',
			resolve: {
				days: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_days", course.links.days.href, {}, true).then(
						function(result) {
							for(var i = 0; i < result.data.length; i++) {
								result.data[i].starts_at = iMed.moment(result.data[i].starts_at).toDate();
							}
							return result;
						}
					);
				}],
				speakers: ['$stateParams', 'Api', 'course', function($stateParams, Api) {
					return Api.execute("get_cme_site_speakers", { cme_site_id: iMedMediaCME.cme_site_id }, {}, true);
				}]
			}
		})
		// Documents
		.state({
			name: "course.documents",
			url: "/documents",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/documents_view.html',
			controller: 'CourseDocumentsController',
			resolve: {
				documents: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_documents", course.links.documents.href, {}, true);
				}]
			}
		})
		// Presentations
		.state({
			name: "course.presentations",
			url: "/presentations",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/presentations_view.html',
			controller: 'CoursePresentationsController',
			resolve: {
				days: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_days", course.links.days.href, {}, true).then(
						function(result) {
							for(var i = 0; i < result.data.length; i++) {
								result.data[i].starts_at = iMed.moment(result.data[i].starts_at).toDate();
							}
							return result;
						}
					);
				}]
			}
		})
		// Fees
		.state({
			name: "course.fees",
			url: "/fees",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/fees_view.html',
			controller: 'CourseFeesController',
			resolve: {
				days: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_days", course.links.days.href, {}, true).then(
						function(result) {
							for(var i = 0; i < result.data.length; i++) {
								result.data[i].starts_at = iMed.moment(result.data[i].starts_at).toDate();
							}
							return result;
						}
					);
				}],
				fees: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_fees", course.links.fees.href, {}, true);
				}]
			}
		})
		// Discount Codes
		.state({
			name: "course.discount_codes",
			url: "/discount_codes",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/discount_codes_view.html',
			controller: 'CourseDiscountCodesController',
			resolve: {
				discount_codes: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_discount_codes", course.links.discount_codes.href, {}, true);
				}]
			}
		})
		// Registrants
		.state({
			name: "course.registrants",
			url: "/registrants",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/registrants_view.html',
			controller: 'CourseRegistrantsController'
		})
		// Complete Registrants
		.state({
			name: "course.registrants.complete",
			url: "/complete",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/registrants_complete_view.html',
			controller: 'CourseRegistrantsCompleteController',
			resolve: {
				days: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_days", course.links.days.href, {}, true).then(
						function(result) {
							for(var i = 0; i < result.data.length; i++) {
								result.data[i].starts_at = iMed.moment(result.data[i].starts_at).toDate();
							}
							return result;
						}
					);
				}],
				fees: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_fees", course.links.fees.href, {}, true);
				}]
			}
		})
		// Incomplete Registrants
		.state({
			name: "course.registrants.incomplete",
			url: "/incomplete",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/registrants_incomplete_view.html',
			controller: 'CourseRegistrantsIncompleteController',
			resolve: {
				placements: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_placements", course.links.placements.href, {}, true);
				}]
			}
		})
		// Additional Activities
		.state({
			name: "course.additional_activities",
			url: "/additional_activities",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/additional_activities_view.html',
			controller: 'CourseAdditionalActivitiesController',
			resolve: {
				days: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_days", course.links.days.href, {}, true).then(
						function(result) {
							for(var i = 0; i < result.data.length; i++) {
								result.data[i].starts_at = iMed.moment(result.data[i].starts_at).toDate();
							}
							return result;
						}
					);
				}],
				activity_groups: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_activity_groups", course.links.activity_groups.href, {}, true);
				}]
			}
		})
		// Sponsors
		.state({
			name: "course.sponsors",
			url: "/sponsors",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/sponsors_view.html',
			controller: 'CourseSponsorsController',
			resolve: {
				sponsors: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_sponsors", course.links.sponsors.href, {}, true);
				}]
			}
		})
		// Settings
		.state({
			name: "course.settings",
			url: "/settings",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/settings_view.html',
			controller: 'CourseSettingsController',
			resolve: {
			}
		})
		// Taxes
		.state({
			name: "course.taxes",
			url: "/taxes",
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/taxes_view.html',
			controller: 'CourseTaxesController',
			resolve: {
				taxes: ['$stateParams', 'Api', 'course', function($stateParams, Api, course) {
					return Api.execute("get_cme_site_course_taxes", course.links.taxes.href, {}, true);
				}]
			}
		});
	}
);

courseModule.controller('CourseController', 			 		CourseController);
courseModule.controller('CourseCategoryController', 	 		CourseCategoryController);
courseModule.controller('CourseScheduleController', 	 		CourseScheduleController);
courseModule.controller('CourseEmailSpeakersController', 		CourseEmailSpeakersController);
courseModule.controller('CourseEmailRegistrantsController', 	CourseEmailRegistrantsController);
courseModule.controller('CourseDocumentsController', 			CourseDocumentsController);
courseModule.controller('CoursePresentationsController', 		CoursePresentationsController);
courseModule.controller('CourseFeesController', 				CourseFeesController);
courseModule.controller('CourseDiscountCodesController', 		CourseDiscountCodesController);
courseModule.controller('CourseRegistrantsController', 			CourseRegistrantsController);
courseModule.controller('CourseRegistrantsCompleteController', 	CourseRegistrantsCompleteController);
courseModule.controller('CourseRegistrantsIncompleteController',CourseRegistrantsIncompleteController);
courseModule.controller('CourseAdditionalActivitiesController', CourseAdditionalActivitiesController);
courseModule.controller('CourseSponsorsController', 			CourseSponsorsController);
courseModule.controller('CourseSettingsController', 			CourseSettingsController);
courseModule.controller('CourseTaxesController', 				CourseTaxesController);


angular.module('adminApp.Course.categoryForm', []).directive('categoryForm', function () {
    return {
		restrict: 'E',
		transclude: true,
		scope: {
			model: "=model"
		},
		controller: function($scope) {
			
		},
		link: function (scope, element, attrs) {
		}, //DOM manipulation
        templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/category_form.html'
    };
});