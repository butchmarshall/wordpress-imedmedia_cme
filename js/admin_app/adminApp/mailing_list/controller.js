
function MailingListController($scope, $rootScope, $modal, site, mailing_list, $state, $stateParams, ngTableParams) {
	$scope.site = site;
	$scope.mailing_list = mailing_list;

	$scope.tableParams = new ngTableParams({
		page: 1,            // show first page
		count: 10          // count per page
	}, {
		total: 0,           // length of data
		getData: function($defer, params) {
			$scope.tableParams.$params.search = $scope.search;
			var queryParams = params.url();

			queryParams = iMed.$.extend(queryParams, {
				limit: queryParams.count
			});

			delete queryParams.count;

			iMed.Api.execute("get_cme_site_mailing_list_users", {
				cme_site_id: iMedMediaCME.cme_site_id,
				mailing_list_id: mailing_list.id
			}, queryParams, true).then(
				function(result) {
					params.total(result.total);
					$defer.resolve(result.data);
				}
			);
		}
	});
	
	$scope.email_mailing_list = function(mailing_list_id) {
		iMed.Api.execute("create_cme_site_mailing_list_export", {
			cme_site_id: iMedMediaCME.cme_site_id,
			mailing_list_id: mailing_list_id,
			format: "json"
		}, {
		}).then(
			function() {
				alert("Sent!");
			},
			function() {
			}
		);
	}
	
	$scope.delete_mailing_list_user = function(mailing_list_id, user_id) {
		if (confirm("Are you sure?")) {
		iMed.Api.execute("delete_cme_site_mailing_list_user", {
			cme_site_id: iMedMediaCME.cme_site_id,
			mailing_list_id: mailing_list_id,
			user_id: user_id,
			format: "json"
		}, {
		}).then(
			function() {
				$state.go($state.current, {}, {reload: true});
			},
			function() {
				alert("Failed");
			}
		);
		}
	};
	
	$scope.find_recipients = function() {
		$modal.open({
			size: 'lg',
			resolve: {
			},
			controller: function($scope, $modalInstance, ngTableParams, Api) {
				$scope.edit_recipient = function(user) {
					$modal.open({
						size: 'lg',
						resolve: {
							registrant:['$stateParams', 'Api', function($stateParams, Api) {
								return Api.execute("get_cme_site_mailing_list_registrant", {
									cme_site_id: iMedMediaCME.cme_site_id,
									cme_mailing_list_registrant_id: user.id
								}, {}, true);
							}]
						},
						controller: function($scope, $modalInstance, registrant) {
							$scope.model = registrant;
							$scope.onSubmit = function(data) {
								delete data.fields.courses;
								Api.execute("update_cme_site_mailing_list_registrant", {
									cme_site_id: iMedMediaCME.cme_site_id,
									cme_mailing_list_registrant_id: user.id
								}, {
									registrant: data
								}).then(
									function() {
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
						templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/mailing_list/registrant_modal.html'
					});
				};

				$scope.add_recipient = function(user) {
					Api.execute("create_cme_site_mailing_list_user", {
						cme_site_id: iMedMediaCME.cme_site_id,
						mailing_list_id: mailing_list.id,
						format: "json"
					}, {
						mailing_list_user: {
							user_id: user.id
						}
					}).then(
						function() {
							$state.go($state.current, {}, {reload: true});
						},
						function() {
							alert("Already in the list!");
						}
					);
				};
				// Adds the search result to the list
				$scope.add_search_results = function() {
					Api.execute("create_cme_site_mailing_list_user", {
						cme_site_id: iMedMediaCME.cme_site_id,
						mailing_list_id: mailing_list.id,
						format: "json"
					}, {
						search: $scope.search
					}).then(
						function() {
							$state.go($state.current, {}, {reload: true});
						},
						function() {
							alert("Failed to save!");
						}
					);
				};
				$scope.total = {};
				$scope.search = {};
				$scope.tableParams = new ngTableParams({
					page: 1,            // show first page
					count: 10          // count per page
				}, {
					total: 0,           // length of data
					getData: function($defer, params) {
						$scope.tableParams.$params.search = $scope.search;
						var queryParams = params.url();
			
						queryParams = iMed.$.extend(queryParams, {
							limit: queryParams.count
						});

						delete queryParams.count;
			
						iMed.Api.execute("get_cme_site_mailing_list_registrants", {
							cme_site_id: iMedMediaCME.cme_site_id
						}, queryParams, true).then(
							function(result) {
								$scope.total = result.total;
								params.total(result.total);
								$defer.resolve(result.data);
							}
						);
					}
				});

				$scope.recipient_selected = function(user_id) {
					
				};

				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/adminApp/mailing_list/recipients_list.html'
		});
	};
};
MailingListController.$inject = ["$scope", "$rootScope", "$modal", "site", "mailing_list", "$state", "$stateParams", "ngTableParams"];


function MailingListSubscribersController($scope, $rootScope, $modal, site, mailing_list, $state, $stateParams) {
	$scope.site = site;
	$scope.mailing_list = mailing_list;

};
MailingListSubscribersController.$inject = ["$scope", "$rootScope", "$modal", "site", "mailing_list", "$state", "$stateParams"];
