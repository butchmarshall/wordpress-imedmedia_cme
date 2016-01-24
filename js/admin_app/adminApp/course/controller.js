
function CourseController($scope, $rootScope, $modal, site, course, categories, $state, $stateParams, site_config) {
	$scope.site = site;
	$scope.course = course;
	$scope.categories = categories;

	$scope.course_redirect = function() {
		window.location = site_config.course_url.replace("{cme_course_id}", course.id);
	};
	$scope.registration_redirect = function() {
		window.location = site_config.register_url.replace("{cme_course_id}", course.id);
	};
	
	$scope.$on('course.category.create', function(event, response) {
		$scope.categories.data.push(response);
		$state.go('course.category', { courseId: $stateParams.courseId, categoryId: response.id });
	});
	$scope.$on('course.category.delete', function(event, category_id) {
		for(var i = 0; i < $scope.categories.data.length; i++) {
			if ($scope.categories.data[i].id == category_id) {
				$scope.categories.data.splice(i, 1);
				$scope.$apply();
				break;
			}
		}
	});
	$scope.show_category = function(category_id) {
		$state.go('course.category', { courseId: course.id, categoryId: category_id });
	};
	$scope.edit_category_item = function(category_id, item_id) {
		$modal.open({
			size: 'lg',
			resolve: {
				item: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute(
						"get_cme_site_course_category_item",
						{
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_category_id: category_id,
							cme_course_category_item_id: item_id
						}, {}, true
					);
				}]
			},
			controller: function($scope, $modalInstance, Api, item) {
				$scope.tinymceOptions = {
					browser_spellcheck : true,
					mode: "exact",
					convert_urls: false,
					plugins: [
						"advlist autolink lists link image charmap print preview anchor",
						"searchreplace visualblocks code fullscreen",
						"insertdatetime media table contextmenu jbimages"
					],
					toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
					document_base_url: iMed.Config.domain+'/assets/tinymce/',
					height: "300px"
				};
				$scope.model = {
					id: item.id,
					item: item
				};
				$scope.mce_html = item.description.en;
				$scope.onSubmit = function(data) {
					data.category_item = {
						translate: {
							name: {
								en: data.item.name.en
							},
							description: {
								en: $scope.mce_html
							}
						}
					};
					Api.execute(
						"update_cme_site_course_category_item",
						{
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_category_id: category_id,
							cme_course_category_item_id: item_id
						}, data
					).then(
						function() {
							$modalInstance.close();
							$state.go($state.current, {}, {reload: true});
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/category_item_modal.html'
		});
	};

	$scope.add_category = function() {
		$modal.open({
			//size: 'md',
			controller: function($scope, $modalInstance) {
				$scope.onSubmit = function(data) {
					iMed.$.Api.execute(
						"create_cme_site_course_category",
						{
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId
						},
						data
					).then(
						function(response) {
							$rootScope.$broadcast('course.category.create', response);
							$modalInstance.close();
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/category_modal.html'
		});
	};
};
CourseController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "categories", "$state", "$stateParams", "site_config"];

function CourseCategoryController($scope, $rootScope, $modal, site, course, categories, category, $state, $stateParams) {
	$scope.site = site;
	$scope.course = course;
	$scope.categories = categories;
	$scope.category = category;

	$scope.delete_category_item = function(category_id, item_id) {
		if (confirm("Are you sure?")) {
		iMed.$.Api.execute("delete_cme_site_course_category_item", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: $stateParams.courseId,
			cme_course_category_id: category_id,
			cme_course_category_item_id: item_id
		}, {}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
		}
	};

	$scope.add_category_item = function(category_id, position) {
		iMed.$.Api.execute("create_cme_site_course_category_item", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: $stateParams.courseId,
			cme_course_category_id: category_id
		}, { category_item: { position: position } }).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
	};

	$scope.edit_category = function(category_id) {
		$modal.open({
			//size: 'md',
			controller: function($scope, $modalInstance) {
				$scope.model = { category: { translate: { name: { en: "" } } } };
				for(var i = 0; i < categories.data.length; i++) {
					if (categories.data[i].id == category_id) {
						$scope.model.id = category_id;
						$scope.model.category.translate.name = categories.data[i].name;
						break;
					}
				}

				$scope.onSubmit = function(data) {
					iMed.$.Api.execute(
						"update_cme_site_course_category",
						{
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_category_id: data.id
						},
						data
					).then(
						function(response) {
							$rootScope.$broadcast('course.category.update', response);
							$modalInstance.close();
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/category_modal.html'
		});
	};

	$scope.delete_category = function(category_id) {
		if (confirm("Are you sure?")) {
		iMed.$.Api.execute(
			"delete_cme_site_course_category",
			{
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: $stateParams.courseId,
				cme_course_category_id: category_id
			}
		).then(
			function() {
				$rootScope.$broadcast('course.category.delete', category_id);
			}
		);
		}
	};
};
CourseCategoryController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "categories", "category", "$state", "$stateParams"];

function CourseEmailSpeakersController($scope, $rootScope, $modal, site, course, speakers, $state, $stateParams, Api, FileUploader) {
	$scope.speakers = speakers.data;
	$scope.speakers_pill = window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/speaker_email_pill.html';
	$scope.speakers_auto_complete = window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/speaker_auto_complete.html';

	$scope.model = {
		to: speakers.data.slice(),
		attachments: [],
		subject: "Course Announcement",
		body: "To email a password reset link to the speakers, include {password_reset_link} placeholder.\
\n\
\nTo email a new random password to each of the speakers, include the {new_password} placeholder.\
\n\
\nTo reference the speakers email address, use the {email} placeholder.\
\n\
\nTo reference the speaker by name use {first_name}, {last_name} or {title} placeholders.\
"
	};
	$scope.attachment_remove = function(index) {
		$scope.model.attachments.splice(index, 1);
	};

	$scope.uploader = new FileUploader({
		url: iMed.Api.url("create_asset"),
		removeAfterUpload: true,
		autoUpload: true,
		alias: "asset[upload]",
		withCredentials: true
	});

	$scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
		$scope.model.attachments.push({
			id: response.id,
			name: response.name
		});
	};

	$scope.onPreview = function(data) {
		data = $.extend({}, data, true);
		delete data.to
		data.preview = 1

		Api.execute("create_cme_site_course_speakers_email", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: $stateParams.courseId
		}, data).then(
			function(cme_course_registrant) {
				alert("Preview Email has been sent.");
			}
		);
	};

	$scope.onSubmit = function(data) {
		if (confirm("Are you sure you want to email all the receipients?")) {
			data = $.extend({}, data, true);
			data.to = $.map(data.to, function(item, i) {
				return item.id
			});

			Api.execute("create_cme_site_course_speakers_email", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: $stateParams.courseId
			}, data).then(
				function(cme_course_registrant) {
					alert("Email has been sent.");
				}
			);
		}
	};

	$scope.loadSpeakers = function(query) {
		var s = iMed.$.grep(speakers.data, function(n, i) {
			return [n.title, n.first_name, n.last_name].join(' ').match(new RegExp(query, 'i'));
		}).sort(function(a,b) {
			return ([a.title, a.first_name, a.last_name].join(' ') < [b.title, b.first_name, b.last_name].join(' ')? 1 : -1);
		});

		return s;
		/*
		return Api.execute("get_cme_site_users", { cme_site_id: iMedMediaCME.cme_site_id }, {
			search: {
				name: query
			}
		}, true).then(
			function(users) {
				var s = iMed.$.grep(speakers.data, function(n, i) {
					return [n.title, n.first_name, n.last_name].join(' ').match(new RegExp(query, 'i'));
				}).sort(function(a,b) {
					return ([a.title, a.first_name, a.last_name].join(' ') < [b.title, b.first_name, b.last_name].join(' ')? 1 : -1);
				});
				var u = iMed.$.grep(users.data, function(n, i) {
					return [n.first_name, n.last_name].join(' ').match(new RegExp(query, 'i'));
				}).sort(function(a,b) {
					return ([a.first_name, a.last_name].join(' ') < [b.first_name, b.last_name].join(' ')? 1 : -1);
				});
				
				s = s.slice(0, Math.max(Math.min(u.length, 5), 5));
				u = u.slice(0, Math.max(s.length, 5));

				return s.concat(u);
			}
		);*/
	};
};
CourseEmailSpeakersController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "speakers", "$state", "$stateParams", "Api", "FileUploader"];


function CourseEmailRegistrantsController($scope, $rootScope, $modal, site, course, registrants, $state, $stateParams, Api, FileUploader) {
	$scope.registrants = registrants.data;
	$scope.pill = window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/speaker_email_pill.html';
	$scope.auto_complete_template = window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/registrant_auto_complete.html';

	$scope.model = {
		to: registrants.data.slice(),
		attachments: [],
		subject: "Course Announcement",
		body: "To email a password reset link to the registrants, include {password_reset_link} placeholder.\
\n\
\nTo email a new random password to each of the registrants, include the {new_password} placeholder.\
\n\
\nTo reference the registrants email address, use the {email} placeholder.\
\n\
\nTo reference the registrants by name use {first_name} or {last_name} placeholders.\
\n\
\nTo link the registrants to the downloads page, use the {download_link} placeholder.\
"
	};
	$scope.attachment_remove = function(index) {
		$scope.model.attachments.splice(index, 1);
	};
	
	$scope.uploader = new FileUploader({
		url: iMed.Api.url("create_asset"),
		removeAfterUpload: true,
		autoUpload: true,
		alias: "asset[upload]",
		withCredentials: true
	});

	$scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
		$scope.model.attachments.push({
			id: response.id,
			name: response.name
		});
	};

	$scope.onPreview = function(data) {
		data = $.extend({}, data, true);
		delete data.to
		data.preview = 1

		Api.execute("create_cme_site_course_registrants_email", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: $stateParams.courseId
		}, data).then(
			function(cme_course_registrant) {
				alert("Preview Email has been sent.");
			}
		);
	};

	$scope.onSubmit = function(data) {
		if (confirm("Are you sure you want to email all the receipients?")) {
			console.log(data);
			data = $.extend({}, data, true);
			data.to = $.map(data.to, function(item, i) {
				return (item.resources.registrations[0])? item.resources.registrations[0].unique_id : null;
			});

			Api.execute("create_cme_site_course_registrants_email", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: $stateParams.courseId
			}, data).then(
				function(cme_course_registrant) {
					alert("Email has been sent.");
				}
			);
		}
	};

	$scope.autocompleteSearch = function(query) {
		var s = iMed.$.grep(registrants.data, function(n, i) {
			return [n.first_name, n.last_name].join(' ').match(new RegExp(query, 'i'));
		}).sort(function(a,b) {
			return ([a.first_name, a.last_name].join(' ') < [b.first_name, b.last_name].join(' ')? 1 : -1);
		});

		return s;
	};
};
CourseEmailRegistrantsController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "registrants", "$state", "$stateParams", "Api", "FileUploader"];

function CourseScheduleController($scope, $rootScope, $modal, site, course, categories, days, speakers, $state, $stateParams, Api) {
	$scope.site = site;
	$scope.course = course;
	$scope.categories = categories;
	$scope.days = days;

	$scope.loadSpeakers = function(query) {
		return Api.execute("get_cme_site_users", { cme_site_id: iMedMediaCME.cme_site_id }, {
			search: {
				name: query
			}
		}, true).then(
			function(users) {
				var s = iMed.$.grep(speakers.data, function(n, i) {
					return [n.title, n.first_name, n.last_name].join(' ').match(new RegExp(query, 'i'));
				}).sort(function(a,b) {
					return ([a.title, a.first_name, a.last_name].join(' ') < [b.title, b.first_name, b.last_name].join(' ')? 1 : -1);
				});
				var u = iMed.$.grep(users.data, function(n, i) {
					return [n.first_name, n.last_name].join(' ').match(new RegExp(query, 'i'));
				}).sort(function(a,b) {
					return ([a.first_name, a.last_name].join(' ') < [b.first_name, b.last_name].join(' ')? 1 : -1);
				});
				
				s = s.slice(0, Math.max(Math.min(u.length, 5), 5));
				u = u.slice(0, Math.max(s.length, 5));

				return s.concat(u);
			}
		);
	};
	$scope.speakers_pill = window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/speaker_pill.html';
	$scope.speakers_auto_complete = window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/speaker_auto_complete.html';

	$scope.speaker_added = function(item, day_id, activity_id) {
		Api.execute("create_cme_site_course_day_activity_speaker", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: $stateParams.courseId,
				cme_course_day_id: day_id,
				cme_course_activity_id: activity_id
			},
			{
				speaker: {
					title: item.title,
					first_name: item.first_name,
					last_name: item.last_name,
					email: item.email
				}
			}
		).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
	};
	$scope.speaker_removing = function(item, day_id, activity_id) {
		if (confirm("Are you sure?")) {
		Api.execute("delete_cme_site_course_day_activity_speaker", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: $stateParams.courseId,
				cme_course_day_id: day_id,
				cme_course_activity_id: activity_id,
				speaker_id: item.id
			}
		);
			return true;
		}
		else {
			return false;
		}
	};

	$scope.speaker_new = function(day_id, activity_id) {
		$modal.open({
			//size: 'md',
			controller: function($scope, $modalInstance) {
				$scope.model = { speaker: {} };

				$scope.onSubmit = function(data) {
					Api.execute("create_cme_site_course_day_activity_speaker", {
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_day_id: day_id,
							cme_course_activity_id: activity_id
						}, data, true
					).then(
						function(response) {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/speaker_modal.html'
		});
	};

	$scope.speaker_edit = function(item, day_id, activity_id) {
		$modal.open({
			//size: 'md',
			resolve: {
				speaker: [function() {
					return Api.execute("get_cme_site_course_day_activity_speaker", {
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_day_id: day_id,
							cme_course_activity_id: activity_id,
							speaker_id: item.id
						}, {}, true
					);
				}]
			},
			controller: function($scope, $modalInstance, speaker) {
				$scope.model = { speaker: speaker, id: item.id };

				$scope.onSubmit = function(data) {
					Api.execute("update_cme_site_course_day_activity_speaker", {
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_day_id: day_id,
							cme_course_activity_id: activity_id,
							speaker_id: item.id
						}, data, true
					).then(
						function(response) {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/speaker_modal.html'
		});
	};

	$scope.day_delete = function(day_id) {
		if (confirm("Are you sure?")) {
		Api.execute("delete_cme_site_course_day", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: $stateParams.courseId,
				cme_course_day_id: day_id
			}, {}, true
		).then(
			function(response) {
				$state.go($state.current, {}, {reload: true});
				return response;
			}
		);
		}
	};

	$scope.day_new = function() {
		$modal.open({
			size: 'lg',
			controller: function($scope, $modalInstance) {
				$scope.isDateObject = function(obj) {
					return (obj instanceof Date);
				};

				$scope.tinymceOptions = {
					browser_spellcheck : true,
					mode: "exact",
					convert_urls: false,
					plugins: [
						"advlist autolink lists link image charmap print preview anchor",
						"searchreplace visualblocks code fullscreen",
						"insertdatetime media table contextmenu jbimages"
					],
					toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
					document_base_url: iMed.Config.domain+'/assets/tinymce/',
					height: "300px"
				};

				$scope.model = {
					day: {
						starts_at: new Date()
					}
				};

				$scope.onSubmit = function(data) {
					data.day = {
						starts_at: iMed.moment(data.day.starts_at).format("YYYY-MM-DD"),
						translate: {
							description: {
								en: $scope.mce_description_html
							},
							schedule_description: {
								en: $scope.mce_schedule_description_html
							}
						}
					};

					return Api.execute("create_cme_site_course_day", {
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId
						}, data, true
					).then(
						function(response) {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
							return response;
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/day_modal.html'
		});
	};

	$scope.day_edit = function(day_id) {
		$modal.open({
			size: 'lg',
			resolve: {
				day: [function() {
					return Api.execute("get_cme_site_course_day", {
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_day_id: day_id
						}, {}, true
					).then(
						function(result) {
							result.starts_at = iMed.moment(result.starts_at).toDate();
							return result;
						}
					);
				}]
			},
			controller: function($scope, $modalInstance, day) {

				$scope.isDateObject = function(obj) {
					return (obj instanceof Date);
				};

				$scope.tinymceOptions = {
					browser_spellcheck : true,
					mode: "exact",
					convert_urls: false,
					plugins: [
						"advlist autolink lists link image charmap print preview anchor",
						"searchreplace visualblocks code fullscreen",
						"insertdatetime media table contextmenu jbimages"
					],
					toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
					document_base_url: iMed.Config.domain+'/assets/tinymce/',
					height: "300px"
				};

				$scope.model = { day: day, id: day.id };
				$scope.mce_description_html = day.description.en;
				$scope.mce_schedule_description_html = day.schedule_description.en;

				$scope.onSubmit = function(data) {
					data.day = {
						starts_at: iMed.moment(data.day.starts_at).format("YYYY-MM-DD"),
						translate: {
							description: {
								en: $scope.mce_description_html
							},
							schedule_description: {
								en: $scope.mce_schedule_description_html
							}
						}
					};

					return Api.execute("update_cme_site_course_day", {
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_day_id: day_id
						}, data, true
					).then(
						function(response) {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
							return response;
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/day_modal.html'
		});
	};

	$scope.activity_delete = function(day_id, activity_id) {
		if (confirm("Really delete this activity?")) {
			Api.execute("delete_cme_site_course_day_activity", {
					cme_site_id: iMedMediaCME.cme_site_id,
					cme_course_id: $stateParams.courseId,
					cme_course_day_id: day_id,
					cme_course_activity_id: activity_id
				}, {}, true
			).then(
				function(response) {
					$state.go($state.current, {}, {reload: true});
					return response;
				}
			);
		}
	};


	$scope.activity_edit = function(day_id, activity_id) {
		$modal.open({
			size: 'lg',
			resolve: {
				activity: [function() {
					return Api.execute("get_cme_site_course_day_activity", {
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_day_id: day_id,
							cme_course_activity_id: activity_id
						}, {}, true
					).then(
						function(result) {
							result.starts_at = iMed.moment("1970-01-01 "+result.starts_at+":00").toDate();
							result.ends_at = iMed.moment("1970-01-01 "+result.ends_at+":00").toDate();
							return result;
						}
					);
				}]
			},
			controller: function($scope, $modalInstance, activity) {
				$scope.tinymceOptions = {
					browser_spellcheck : true,
					mode: "exact",
					convert_urls: false,
					plugins: [
						"advlist autolink lists link image charmap print preview anchor",
						"searchreplace visualblocks code fullscreen",
						"insertdatetime media table contextmenu jbimages"
					],
					toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
					document_base_url: iMed.Config.domain+'/assets/tinymce/',
					height: "300px"
				};

				$scope.model = { activity: activity, id: activity.id };
				$scope.mce_description_html = activity.description.en;
				$scope.mce_schedule_description_html = activity.schedule_description.en;

				$scope.onSubmit = function(data) {
					var datum = {
						activity: {
							starts_at: iMed.moment(data.activity.starts_at).format("HH:mm:ss"),
							ends_at: iMed.moment(data.activity.ends_at).format("HH:mm:ss"),
							translate: {
								name: {
									en: data.activity.name.en
								},
								location: {
									en: data.activity.location.en
								},
								description: {
									en: $scope.mce_description_html
								},
								schedule_description: {
									en: $scope.mce_schedule_description_html
								}
							},
							is_additional: data.activity.is_additional,
							amount: data.activity.amount,
							available_seats: data.activity.available_seats
						}
					};

					return Api.execute("update_cme_site_course_day_activity", {
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_day_id: day_id,
							cme_course_activity_id: activity_id
						}, datum, true
					).then(
						function(response) {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
							return response;
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/activity_modal.html'
		});
	};
	
	$scope.activity_new = function(day_id) {
		$modal.open({
			size: 'lg',
			controller: function($scope, $modalInstance) {
				$scope.tinymceOptions = {
					browser_spellcheck : true,
					mode: "exact",
					convert_urls: false,
					plugins: [
						"advlist autolink lists link image charmap print preview anchor",
						"searchreplace visualblocks code fullscreen",
						"insertdatetime media table contextmenu jbimages"
					],
					toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
					document_base_url: iMed.Config.domain+'/assets/tinymce/',
					height: "300px"
				};

				$scope.model = {};
				$scope.mce_description_html = "";
				$scope.mce_schedule_description_html = "";

				$scope.onSubmit = function(data) {
					var datum = {
						activity: {
							starts_at: iMed.moment(data.activity.starts_at).format("HH:mm:ss"),
							ends_at: iMed.moment(data.activity.ends_at).format("HH:mm:ss"),
							translate: {
								name: {
									en: data.activity.name.en
								},
								location: {
									en: data.activity.location.en
								},
								description: {
									en: $scope.mce_description_html
								},
								schedule_description: {
									en: $scope.mce_schedule_description_html
								}
							}
						}
					};

					return Api.execute("create_cme_site_course_day_activity", {
							cme_site_id: iMedMediaCME.cme_site_id,
							cme_course_id: $stateParams.courseId,
							cme_course_day_id: day_id
						}, datum, true
					).then(
						function(response) {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
							return response;
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/activity_modal.html'
		});
	};
};
CourseScheduleController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "categories", "days", "speakers", "$state", "$stateParams", "Api"];

function CourseDocumentsController($scope, $rootScope, $modal, site, course, $state, $stateParams, Api, FileUploader, documents) {
	$scope.documents = documents;

	$scope.uploader = new FileUploader({
		url: iMed.Api.url("get_cme_site_course_documents", course.links.documents.href),
		removeAfterUpload: true,
		autoUpload: true,
		alias: "document[upload]",
		withCredentials: true
	});

	$scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
		$state.go($state.current, {}, {reload: true});
	};
	
	$scope.document_delete = function(document_id) {
		if (confirm("Really delete?")) {
		Api.execute("delete_cme_site_course_document", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_document_id: document_id
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
		}
	};
	$scope.onSubmit = function(document_id, data) {
		Api.execute("update_cme_site_course_document", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_document_id: document_id
		}, {
			document: {
				name: data.name
			}
		}).then(
			function() {
				alert("Document successfully updated");
			}
		);
	};
}
CourseDocumentsController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "$state", "$stateParams", "Api", "FileUploader", "documents"];

function CoursePresentationsController($scope, $rootScope, $modal, site, course, $state, $stateParams, Api, FileUploader, days) {
	$scope.days = days;

	$scope.uploader_url = function(day_id, activity_id) {
		return Api.url("get_cme_site_course_day_activity_presentations", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_day_id: day_id,
			cme_course_activity_id: activity_id
		});
	};
	$scope.uploader = new FileUploader({
		removeAfterUpload: true,
		autoUpload: true,
		alias: "presentation[upload]",
		withCredentials: true
	});

	$scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
		$state.go($state.current, {}, {reload: true});
	};

	$scope.presentation_delete = function(day_id, activity_id, presentation_id) {
		if (confirm("Really delete?")) {
		Api.execute("delete_cme_site_course_day_activity_presentation", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_day_id: day_id,
			cme_course_activity_id: activity_id,
			presentation_id: presentation_id
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
		}
	};
	$scope.onSubmit = function(day_id, activity_id, presentation_id, data) {
		Api.execute("update_cme_site_course_day_activity_presentation", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_day_id: day_id,
			cme_course_activity_id: activity_id,
			presentation_id: presentation_id
		}, {
			presentation: {
				name: data.resources.document.name,
				enabled: data.enabled
			}
		}).then(
			function() {
				alert("Document successfully updated");
			}
		);
	};
}
CoursePresentationsController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "$state", "$stateParams", "Api", "FileUploader", "days"];

function CourseFeesController($scope, $rootScope, $modal, site, course, $state, $stateParams, Api, days, fees) {
	$scope.fees = fees;
	$scope.days = days;

	$scope.fee_delete = function(fee_id) {
		if (confirm("Are you sure?")) {
		Api.execute("delete_cme_site_course_fee", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_fee_level_id: fee_id
		}, {}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
		}
	};

	$scope.fee_create = function() {
		Api.execute("create_cme_site_course_fee", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id
		}, {
			fee: {
				translate: {
					name: {
						en: "(Name not set)"
					}
				}
			}
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
	};
	
	$scope.onSubmit = function(fee_id, data) {
		data = $.extend({}, data, true);
		data.translate = {
			name: {
				en: data.name.en
			}
		};
		data.days = [];

		for(var i = 0; i < days.data.length; i++) {
			if (days.data[i].starts_at)
			data.days.push({
				date: data.resources.days[i].date,
				amount: data.resources.days[i].amount
			});
		}

		Api.execute("update_cme_site_course_fee", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_fee_level_id: fee_id
		}, {
			fee: data
		}).then(
			function() {
				alert("Success!");
				$state.go($state.current, {}, {reload: true});
			}
		);
	};
}
CourseFeesController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "$state", "$stateParams", "Api", "days", "fees"];

function CourseDiscountCodesController($scope, $rootScope, $modal, site, course, $state, $stateParams, Api, discount_codes) {
	$scope.discount_codes = discount_codes;
	

	$scope.discount_code_delete = function(discount_code_id) {
		if (confirm("Are you sure?")) {
		Api.execute("delete_cme_site_course_discount_code", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_discount_code_id: discount_code_id
		}, {}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
		}
	};

	$scope.discount_code_create = function() {
		Api.execute("create_cme_site_course_discount_code", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id
		}, {
			discount_code: {
				name: "(Name not set)"
			}
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
	};
	
	$scope.onSubmit = function(discount_code_id, data) {
		data = $.extend({}, data, true);
		delete data.links;
		delete data.$$hashKey;

		Api.execute("update_cme_site_course_discount_code", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_discount_code_id: discount_code_id
		}, {
			discount_code: data
		}).then(
			function() {
				alert("Success!");
				$state.go($state.current, {}, {reload: true});
			}
		);
	};
}
CourseDiscountCodesController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "$state", "$stateParams", "Api", "discount_codes"];

function CourseRegistrantsController($scope, $rootScope, $modal, site, course, $state, $stateParams, Api) {
	$scope.tab_active = function(route) {
        return $state.includes(route);
    };	
};
CourseRegistrantsController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "$state", "$stateParams", "Api"];

function CourseRegistrantsIncompleteController($scope, $rootScope, $modal, site, course, placements, $state, $stateParams, Api, ngTableParams) {
	$scope.field_names = {};
	for(var k in placements.data) {
		for(var i = 0; i < placements.data[k].length; i++) {
			$scope.field_names[placements.data[k][i].id] = placements.data[k][i].name;
		}
	}

	$scope.set_registration_complete = function(unique_id) {
		if (confirm("Are you sure you want to manually activate this registration?")) {
			Api.execute("update_cme_site_course_registration", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: course.id,
				cme_course_registration_unique_id: unique_id
			}, {
				complete_registration: 1,
				suppress_email: 1
			}).then(
				function() {
					$state.go($state.current, {}, {reload: true});
				}
			);
		}
	};

	$scope.search = {};
	$scope.sortFieldKeys = ["order"];
	$scope.lastSortField = "order";
	$scope.sortFields = function(key, field) {
		$scope.lastSortField = key;
		var order = JSON.parse($scope.tableParams.$params[key] || '[{ "'+field+'": "desc" }]');

		if (JSON.stringify(order) == '[{"'+field+'":"desc"}]') {
			order[0][field] = "asc";
		}
		else {
			order[0][field] = "desc";
		}

		$scope.tableParams.$params[key] = JSON.stringify(order);
	};

	$scope.tableParams = new ngTableParams({
		page: 1,            // show first page
		count: 10          // count per page
	}, {
		total: 0,           // length of data
		getData: function($defer, params) {
			$scope.tableParams.$params.search = $scope.search;
			var queryParams = params.url();

			queryParams = iMed.$.extend(queryParams, {
				limit: queryParams.count,
				search: {
					complete: 0
				}
			});
			if (queryParams[$scope.lastSortField]) {
				queryParams[$scope.lastSortField] = JSON.parse(decodeURIComponent(queryParams[$scope.lastSortField]));
			}
			for(var i = 0; i < $scope.sortFieldKeys.length; i++) {
				if ($scope.sortFieldKeys[i] != $scope.lastSortField) {
					delete queryParams[$scope.sortFieldKeys[i]];
				}
			}

			delete queryParams.count;

			iMed.Api.execute("get_cme_site_course_registrations", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: $stateParams.courseId,
			}, queryParams, true).then(
				function(result) {
					params.total(result.total);
					$defer.resolve(result.data);
				}
			);
		}
	});
};
CourseRegistrantsIncompleteController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "placements", "$state", "$stateParams", "Api", "ngTableParams"];


function CourseRegistrantsCompleteController($scope, $rootScope, $modal, site, course, days, fees, $state, $stateParams, Api, ngTableParams) {

	$scope.search = {};
	$scope.sortFieldKeys = ["order"];
	$scope.lastSortField = "order";
	$scope.sortFields = function(key, field) {
		$scope.lastSortField = key;
		var order = JSON.parse($scope.tableParams.$params[key] || '[{ "'+field+'": "desc" }]');

		if (JSON.stringify(order) == '[{"'+field+'":"desc"}]') {
			order[0][field] = "asc";
		}
		else {
			order[0][field] = "desc";
		}

		$scope.tableParams.$params[key] = JSON.stringify(order);
	};

	$scope.tableParams = new ngTableParams({
		page: 1,            // show first page
		count: 10          // count per page
	}, {
		total: 0,           // length of data
		getData: function($defer, params) {
			$scope.tableParams.$params.search = $scope.search;
			var queryParams = params.url();

			queryParams = iMed.$.extend(queryParams, {
				limit: queryParams.count,
				search: {
					complete: 1
				}
			});
			if (queryParams[$scope.lastSortField]) {
				queryParams[$scope.lastSortField] = JSON.parse(decodeURIComponent(queryParams[$scope.lastSortField]));
			}
			for(var i = 0; i < $scope.sortFieldKeys.length; i++) {
				if ($scope.sortFieldKeys[i] != $scope.lastSortField) {
					delete queryParams[$scope.sortFieldKeys[i]];
				}
			}

			delete queryParams.count;

			iMed.Api.execute("get_cme_site_course_registrants", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: $stateParams.courseId,
			}, queryParams, true).then(
				function(result) {
					params.total(result.total);
					$defer.resolve(result.data);
				}
			);
		}
	});

	$scope.export_registrations = function(registration_id) {
		Api.execute("create_cme_site_course_registration_export", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id
		}).then(
			function() {
				alert("We are exporting now, and will email you the data once it is complete");
			}
		);
	};

	$scope.registration_payments = function(unique_id) {
		$modal.open({
			scope: $scope,
			resolve: {
				registration: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course_registration", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id,
						cme_course_registration_unique_id: unique_id
					}, {}, true);
				}],
				payments: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course_registration_payments", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id,
						cme_course_registration_unique_id: unique_id
					}, {}, true);
				}]
			},
			size: 'lg',
			controller: function($scope, $modalInstance, registration, payments) {
				$scope.payments = payments;
				$scope.registration = registration;

				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/registrant_payments_modal.html'
		});
	};
	
	
	$scope.format_registration = function(registration, translateValueFilter) {
		var datum = {
			fees: {},
			fields: {},
			days: []
		},
		day_ids = [], activity_ids = [], day;

		// Populate fees
		for(var i = 0; i < fees.data.length; i++) {
			// Key by value so we can use it internally
			datum.fees[translateValueFilter(fees.data[i].name)] = fees.data[i];
		}

		if (registration.resources) {
			// Populate days
			for(var i = 0; i < registration.resources.days.length; i++) {
				day_ids.push(registration.resources.days[i].id);
			}
			// Populate activities
			for(var j = 0; j < registration.resources.activities.length; j++) {
				activity_ids.push(registration.resources.activities[j].id);
			}
			// Populate fields
			for(var i = 0; i < registration.resources.fields.length; i++) {
				datum.fields[registration.resources.fields[i].field_id] = translateValueFilter(registration.resources.fields[i].value);
			}
		}

		for(var i = 0; i < days.data.length; i++) {
			days.data[i].selected = (iMed.$.inArray(days.data[i].id, day_ids) !== -1)

			for(var j = 0; j < days.data[i].resources.activities.length; j++) {
				days.data[i].resources.activities[j].selected = (iMed.$.inArray(days.data[i].resources.activities[j].id, activity_ids) !== -1)
			}

			datum.days.push(iMed.$.extend({}, days.data[i], true));
		}

		return datum;
	};
	$scope.format_registration_submission = function(data) {
		var datum = {
			fields: {},
			days: [],
			activities: []
		};

		for(var k in data.fields) {
			datum.fields["field_"+k] = data.fields[k];
		}
		for(var i = 0; i < data.days.length; i++) {
			if (data.days[i].selected) {
				datum.days.push(data.days[i].id);
			}
			for(var j = 0; j < data.days[i].resources.activities.length; j++) {
				if (data.days[i].resources.activities[j].selected) {
					datum.activities.push(data.days[i].resources.activities[j].id);
				}
			}
		}

		return datum;
	}


	$scope.add_refund = function(payment_id) {
		$modal.open({
			scope: $scope,
			resolve: {
				
			},
			size: 'lg',
			controller: function($scope, $modalInstance, translateValueFilter) {
				$scope.model = $scope.format_registration({}, translateValueFilter);
				$scope.model.amount = 0.00;

				$scope.onSubmit = function(data) {

					Api.execute("create_cme_site_course_payment_refund", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id,
						cme_course_payment_id: payment_id
					}, {
						amount: data.amount
					}).then(
						function() {
							alert("Success");
							$modalInstance.close();
						},
						function(err) {
							alert(JSON.stringify(err));
						}
					);
				};

				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/registrant_refund_modal.html'
		});
	};

	$scope.set_registration_incomplete = function(unique_id) {
		if (confirm("Are you sure you want to remove this registration?")) {
			Api.execute("update_cme_site_course_registration", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: course.id,
				cme_course_registration_unique_id: unique_id
			}, {
				registration: {
					complete: 0
				}
			}).then(
				function() {
					$state.go($state.current, {}, {reload: true});
				}
			);
		}
	};
	
	$scope.add_payment = function(unique_id) {
		$modal.open({
			scope: $scope,
			resolve: {
				placements:['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course_placements", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id
					}, {}, true);
				}]
			},
			size: 'lg',
			controller: function($scope, $modalInstance, placements, translateValueFilter) {
				$scope.model = $scope.format_registration({}, translateValueFilter);
				$scope.model.amount = 0.00;
				$scope.placements = placements;

				$scope.onSubmit = function(data) {
					var datum = {
						fields: {}
					}
					for(var k in data.fields) {
						datum.fields["field_"+k] = data.fields[k];
					}

					Api.execute("create_cme_site_course_registration_payment", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id,
						cme_course_registration_unique_id: unique_id
					}, {
						registration: datum,
						amount: data.amount
					}).then(
						function() {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
						},
						function(err) {
							alert(JSON.stringify(err));
						}
					);
				};

				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/registrant_payment_modal.html'
		});
	};

	$scope.add_registration = function() {
		$modal.open({
			scope: $scope,
			resolve: {
				placements:['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course_placements", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id
					}, {}, true);
				}]
			},
			size: 'lg',
			controller: function($scope, $modalInstance, placements, translateValueFilter) {
				$scope.model = $scope.format_registration({}, translateValueFilter);
				$scope.placements = placements;

				$scope.onSubmit = function(data) {
					var datum = $scope.format_registration_submission(data),
					$form = iMed.$("<form></form>"),
					elems = iMed.$.dataToInputs({ registration: datum, 	complete_registration: 1 });

					for(var i =0; i < elems.length; i++) {
						$form.append(elems[i]);
					}

					Api.execute("create_cme_site_course_registration", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id
					}, $form.get(0)).then(
						function() {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
						},
						function(err) {
							alert(JSON.stringify(err));
						}
					);
				};

				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/registrant_modal.html'
		});
	};
	$scope.registration_edit = function(unique_id) {
		$modal.open({
			scope: $scope,
			resolve: {
				registration: ['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course_registration", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id,
						cme_course_registration_unique_id: unique_id
					}, {}, true);
				}],
				placements:['$stateParams', 'Api', function($stateParams, Api) {
					return Api.execute("get_cme_site_course_placements", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id
					}, {}, true);
				}]
			},
			size: 'lg',
			controller: function($scope, $modalInstance, registration, placements, translateValueFilter) {
				$scope.model = $scope.format_registration(registration, translateValueFilter);
				$scope.placements = placements;

				$scope.onSubmit = function(data) {
					var datum = $scope.format_registration_submission(data),
					$form = iMed.$("<form></form>"),
					elems = iMed.$.dataToInputs({ registration: datum });

					for(var i =0; i < elems.length; i++) {
						$form.append(elems[i]);
					}

					Api.execute("update_cme_site_course_registration", {
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: course.id,
						cme_course_registration_unique_id: unique_id
					}, $form.get(0)).then(
						function() {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
						}
					);
				};

				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/course/registrant_modal.html'
		});
	};
	$scope.registration_email_receipt = function(unique_id) {
		Api.execute("create_cme_site_course_registration_receipt_email", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_registration_unique_id: unique_id
		}).then(
			function(cme_course_registrant) {
				alert("Email sent.")
			}
		);
	};
	$scope.registration_view_receipt = function(unique_id) {
		// Work around popup blockers
		var popup = window.open("about:blank", "course_receipt", "scrollbars=1,width=800,height=480");

		setTimeout(function() {
			Api.execute("get_cme_site_course_registration", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: course.id,
				cme_course_registration_unique_id: unique_id
			}, {}, true).then(
				function(registration) {
					popup.location.href = registration.links.receipt.href;
				}
			);
		}, 0)
	};
}
CourseRegistrantsCompleteController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "days", "fees", "$state", "$stateParams", "Api", "ngTableParams"];

function CourseAdditionalActivitiesController($scope, $rootScope, $modal, site, course, $state, $stateParams, Api, days, activity_groups) {
	for(var i = 0; i < days.data.length; i++) {
		for(var j = 0; j < days.data[i].resources.activities.length; j++) {
			days.data[i].resources.activities[j].activity_group_id = null;

			if (days.data[i].resources.activities[j].resources.activity_group) {
				days.data[i].resources.activities[j].activity_group_id = days.data[i].resources.activities[j].resources.activity_group.id
			}
		}
	}
	$scope.days = days;
	activity_groups.data.unshift({
		id: ""
	});
	$scope.activity_groups = activity_groups;
	
	$scope.save_activity = function(day_id, activity_id, activity) {

		Api.execute("update_cme_site_course_day_activity", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_day_id: day_id,
			cme_course_activity_id: activity_id
		}, {
			activity: {
				cme_course_day_activity_group_id: (activity.activity_group_id || "")
			}
		}).then(
			function() {
				alert("Success");
			},
			function(xhr) {
			}
		);
	};

	$scope.add_activity_group = function(activity_group_id) {
		Api.execute("create_cme_site_course_activity_group", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
	};
	
	$scope.delete_activity_group = function(activity_group_id) {
		if (confirm("Are you sure?")) {
			Api.execute("delete_cme_site_course_activity_group", {
				cme_site_id: iMedMediaCME.cme_site_id,
				cme_course_id: course.id,
				cme_course_activity_group_id: activity_group_id
			}).then(
				function() {
					$state.go($state.current, {}, {reload: true});
				}
			);
		}
	};
	
	$scope.save_activity_group = function(activity_group_id, activity_group) {
		Api.execute("update_cme_site_course_activity_group", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			cme_course_activity_group_id: activity_group_id
		}, {
			activity_group: {
				name: activity_group.name,
				maximum_selections: activity_group.maximum_selections
			}
		}).then(
			function() {
				alert("Success!")
			}
		);
	};
}
CourseAdditionalActivitiesController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "$state", "$stateParams", "Api", "days", "activity_groups"];

function CourseSponsorsController($scope, $rootScope, $modal, site, course, $state, $stateParams, Api, sponsors) {
	
}
CourseSponsorsController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "$state", "$stateParams", "Api", "sponsors"];

function CourseSettingsController($scope, $rootScope, $modal, site, course, $state, $stateParams, Api, FileUploader) {
	$scope.tinymceOptions = {
		browser_spellcheck : true,
		mode: "exact",
		convert_urls: false,
		plugins: [
			"advlist autolink lists link image charmap print preview anchor",
			"searchreplace visualblocks code fullscreen",
			"insertdatetime media table contextmenu jbimages"
		],
		toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
		document_base_url: iMed.Config.domain+'/assets/tinymce/',
		height: "300px"
	};
	$scope.course = course;

	$scope.onSubmit = function(data) {
		var datum = {
			translate: {
				name: {
					en: data.name.en
				},
				location: {
					en: data.location.en
				},
				description: {
					en: data.description.en
				},
				banner_description: {
					en: data.banner_description.en
				},
				left_description: {
					en: data.left_description.en
				},
				refund_policy: {
					en: data.refund_policy
				},
				terms_and_conditions: {
					en: data.terms_and_conditions
				}
			},
			available_seats: data.available_seats,
			position: data.position,
			show_in_banner: data.show_in_banner,
			allow_schedule_overlaps: data.allow_schedule_overlaps,
			state: data.state
		};
		if (data.header_image) {
			datum.header_image_id = data.header_image.id;
		}
		if (data.banner_image) {
			datum.banner_image_id = data.banner_image.id;
		}

		Api.execute("update_cme_site_course", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id
		}, { course: datum }).then(
			function() {
				alert("Save successful");
			}
		);
	};

	$scope.uploaderCourseImage = new FileUploader({
		url: iMed.Api.url("create_asset"),
		removeAfterUpload: true,
		autoUpload: true,
		alias: "asset[upload]",
		withCredentials: true
	});

	$scope.uploaderCourseImage.onCompleteItem = function(fileItem, response, status, headers) {
		course.header_image = response;
	};

	$scope.uploaderBannerImage = new FileUploader({
		url: iMed.Api.url("create_asset"),
		removeAfterUpload: true,
		autoUpload: true,
		alias: "asset[upload]",
		withCredentials: true
	});

	$scope.uploaderBannerImage.onCompleteItem = function(fileItem, response, status, headers) {
		course.banner_image = response;
	};
}
CourseSettingsController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "$state", "$stateParams", "Api", "FileUploader"];

function CourseTaxesController($scope, $rootScope, $modal, site, course, $state, $stateParams, Api, taxes) {
	$scope.taxes = taxes;
	
	$scope.tax_delete = function(tax_id) {
		if (confirm("Are you sure?")) {
		iMed.$.Api.execute("delete_cme_site_course_tax", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			tax_id: tax_id
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
		}
	};
	$scope.onSubmit = function(tax_id, data) {
		Api.execute("update_cme_site_course_tax", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id,
			tax_id: tax_id
		}, {
			tax: {
				name: data.name,
				percent: data.percent
			}
		}).then(
			function() {
				alert("Successfully saved.");
			}
		);
	};
	$scope.tax_create = function() {
		Api.execute("create_cme_site_course_tax", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: course.id
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			}
		);
	};
}
CourseTaxesController.$inject = ["$scope", "$rootScope", "$modal", "site", "course", "$state", "$stateParams", "Api", "taxes"];
