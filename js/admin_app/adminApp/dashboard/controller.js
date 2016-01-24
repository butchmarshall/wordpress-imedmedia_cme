function DashboardController($scope, $rootScope, $location, ngTableParams) {

};

function CoursesController($scope, $rootScope, $location, $modal, $state, $stateParams, ngTableParams, Api) {
	$scope.course_selected = function(id) {
		$state.go('course.settings', { courseId: id });
	};

	$scope.course_delete = function(id) {
		if (confirm("Are you sure?")) {
		iMed.$.Api.execute("delete_cme_site_course", {
			cme_site_id: iMedMediaCME.cme_site_id,
			cme_course_id: id
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			},
			function() {
				alert("Failed to delete the course");
			}
		);
		}
	};
	
	$scope.add_course = function() {
		$modal.open({
			//size: 'md',
			controller: function($scope, $modalInstance) {
				$scope.model = {
					name: ""
				};
				
				$scope.onSubmit = function(data) {
					return iMed.$.Api.execute("create_cme_site_course", {
						cme_site_id: iMedMediaCME.cme_site_id
					}, {
						course: {
							translate: {
								name: {
									en: data.name
								}
							}
						}
					}).then(
						function(response) {
							$modalInstance.close();
							$state.go('course.settings', { courseId: response.id });
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/course_form.html'
		});
	};	

	$scope.search = {};
	$scope.sortFieldKeys = ["order","translated_order"];
	$scope.lastSortField = "order";
	$scope.sortFields = function(key, field) {
		if (typeof($scope.tableParams.$params[key]) == "object") {
			$scope.tableParams.$params[key] = JSON.stringify($scope.tableParams.$params[key]);
		}
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
		count: 10,          // count per page
		order: [{starts_at: "desc"}]
	}, {
		total: 0,           // length of data
		getData: function($defer, params) {
			$scope.tableParams.$params.search = $scope.search;
			var queryParams = params.url();

			queryParams = iMed.$.extend(queryParams, {
				limit: queryParams.count
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

			iMed.Api.execute("get_cme_site_courses", {
				cme_site_id: iMedMediaCME.cme_site_id
			}, queryParams, true).then(
				function(result) {
					params.total(result.total);
					$defer.resolve(result.data);
				}
			);
		}
	});
};
CoursesController.$inject = ["$scope", "$rootScope", "$location", "$modal", "$state", "$stateParams", "ngTableParams", "Api"];

function MailingListsController($scope, $rootScope, $location, $modal, $state, $stateParams, ngTableParams, Api) {
	$scope.mailing_list_delete = function(id) {
		if (confirm("Are you sure?")) {
		iMed.$.Api.execute("delete_cme_site_mailing_list", {
			cme_site_id: iMedMediaCME.cme_site_id,
			mailing_list_id: id
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			},
			function() {
				alert("Failed to delete the mailing list");
			}
		);
		}
	};

	$scope.add_mailing_list = function() {
		$modal.open({
			//size: 'md',
			controller: function($scope, $modalInstance) {
				$scope.model = {
					name: ""
				};
				
				$scope.onSubmit = function(data) {
					return iMed.$.Api.execute("create_cme_site_mailing_list", {
						cme_site_id: iMedMediaCME.cme_site_id
					}, {
						mailing_list: {
							name: data.name
						}
					}).then(
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
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/mailing_list_form.html'
		});
	};	

	$scope.search = {};
	$scope.sortFieldKeys = ["order","translated_order"];
	$scope.lastSortField = "order";
	$scope.sortFields = function(key, field) {
		if (typeof($scope.tableParams.$params[key]) == "object") {
			$scope.tableParams.$params[key] = JSON.stringify($scope.tableParams.$params[key]);
		}
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
		count: 10,          // count per page
		order: [{starts_at: "desc"}]
	}, {
		total: 0,           // length of data
		getData: function($defer, params) {
			$scope.tableParams.$params.search = $scope.search;
			var queryParams = params.url();

			queryParams = iMed.$.extend(queryParams, {
				limit: queryParams.count
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

			iMed.Api.execute("get_cme_site_mailing_lists", {
				cme_site_id: iMedMediaCME.cme_site_id
			}, queryParams, true).then(
				function(result) {
					params.total(result.total);
					$defer.resolve(result.data);
				}
			);
		}
	});
};
MailingListsController.$inject = ["$scope", "$rootScope", "$location", "$modal", "$state", "$stateParams", "ngTableParams", "Api"];


function EmailsController($scope, $rootScope, $location, $modal, $state, $stateParams, ngTableParams, Api) {
	$scope.email_delete = function(id) {
		if (confirm("Are you sure?")) {
		iMed.$.Api.execute("delete_cme_site_email", {
			cme_site_id: iMedMediaCME.cme_site_id,
			email_id: id
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			},
			function() {
				alert("Failed to delete the mailing list");
			}
		);
		}
	};


	$scope.find_mailing_list = function(email_id) {
		$modal.open({
			size: 'lg',
			resolve: {
				email: [function() {
					return iMed.Api.execute("get_cme_site_email", {
							cme_site_id: iMedMediaCME.cme_site_id,
							email_id: email_id,
							format: "json"
						}, {}, true
					);
				}]
			},
			controller: function($scope, $modalInstance, email, ngTableParams) {
				$scope.email_id = email_id;
				$scope.selected = {};
				$scope.toggle_mailing_list = function(id) {
				};

				$scope.search = {};
				$scope.sortFieldKeys = ["order","translated_order"];
				$scope.lastSortField = "order";
				$scope.sortFields = function(key, field) {
					if (typeof($scope.tableParams.$params[key]) == "object") {
						$scope.tableParams.$params[key] = JSON.stringify($scope.tableParams.$params[key]);
					}
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
					count: 10,          // count per page
					order: [{starts_at: "desc"}]
				}, {
					total: 0,           // length of data
					getData: function($defer, params) {
						$scope.tableParams.$params.search = $scope.search;
						var queryParams = params.url();
			
						queryParams = iMed.$.extend(queryParams, {
							limit: queryParams.count
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
			
						iMed.Api.execute("get_cme_site_mailing_lists", {
							cme_site_id: iMedMediaCME.cme_site_id
						}, queryParams, true).then(
							function(result) {
								params.total(result.total);
								$defer.resolve(result.data);
							}
						);
					}
				});

				$scope.onSubmit = function(email_id) {
					var mailing_list_ids = [];
					for(var id in $scope.selected) {
						// ID is true
						if ($scope.selected[id] === true) {
							mailing_list_ids.push(id);
						}
					}
					iMed.Api.execute("send_cme_site_email", {
						cme_site_id: iMedMediaCME.cme_site_id,
						email_id: email_id
					}, {
						mailing_lists: mailing_list_ids
					}).then(
						function() {
							alert("Sent to mailing lists successfully");
							$modalInstance.close();
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/find_mailing_list.html'
		});
	};
	
	$scope.edit_email = function(email_id) {
		$modal.open({
			size: 'lg',
			resolve: {
				email: [function() {
					return iMed.Api.execute("get_cme_site_email", {
							cme_site_id: iMedMediaCME.cme_site_id,
							email_id: email_id,
							format: "json"
						}, {}, true
					);
				}]
			},
			controller: function($scope, email, $modalInstance) {
				$scope.model = email;

				$scope.tinymceOptions = {
					browser_spellcheck : true,
					mode: "exact",
					convert_urls: false,
					plugins: [
						"advlist autolink lists link image charmap print preview anchor",
						"searchreplace visualblocks code fullscreen",
						"insertdatetime media table contextmenu jbimages"
					],
					formats: {
						bold : {inline : 'b' },  
						italic : {inline : 'i' },
						underline : {inline : 'u'}
					},
					toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
					document_base_url: iMed.Config.domain+'/assets/tinymce/',
					height: "300px"
				};

				$scope.onSubmit = function(data) {
					return iMed.$.Api.execute("update_cme_site_email", {
						cme_site_id: iMedMediaCME.cme_site_id,
						email_id: email_id
					}, {
						email: {
							name: data.name,
							subject: data.subject,
							body: data.body
						}
					}).then(
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
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/email_form.html'
		});
	};
	
	$scope.add_email = function() {
		$modal.open({
			size: 'lg',
			controller: function($scope, $modalInstance) {
				$scope.model = {
					name: "",
					subject: "",
					body: ""
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
					formats: {
						bold : {inline : 'b' },  
						italic : {inline : 'i' },
						underline : {inline : 'u'}
					},
					toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
					document_base_url: iMed.Config.domain+'/assets/tinymce/',
					height: "300px"
				};

				$scope.onSubmit = function(data) {
					console.log(data);
					return iMed.$.Api.execute("create_cme_site_email", {
						cme_site_id: iMedMediaCME.cme_site_id
					}, {
						email: {
							name: data.name,
							subject: data.subject,
							body: data.body
						}
					}).then(
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
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/dashboard/email_form.html'
		});
	};	

	$scope.search = {};
	$scope.sortFieldKeys = ["order","translated_order"];
	$scope.lastSortField = "order";
	$scope.sortFields = function(key, field) {
		if (typeof($scope.tableParams.$params[key]) == "object") {
			$scope.tableParams.$params[key] = JSON.stringify($scope.tableParams.$params[key]);
		}
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
		count: 10,          // count per page
		order: [{starts_at: "desc"}]
	}, {
		total: 0,           // length of data
		getData: function($defer, params) {
			$scope.tableParams.$params.search = $scope.search;
			var queryParams = params.url();

			queryParams = iMed.$.extend(queryParams, {
				limit: queryParams.count
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

			iMed.Api.execute("get_cme_site_emails", {
				cme_site_id: iMedMediaCME.cme_site_id
			}, queryParams, true).then(
				function(result) {
					params.total(result.total);
					$defer.resolve(result.data);
				}
			);
		}
	});
};
EmailsController.$inject = ["$scope", "$rootScope", "$location", "$modal", "$state", "$stateParams", "ngTableParams", "Api"];