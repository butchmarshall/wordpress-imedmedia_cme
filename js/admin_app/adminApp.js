
// Binds a TinyMCE widget to <textarea> elements.
angular.module('ui.tinymce', [])
  .value('uiTinymceConfig', {})
  .directive('uiTinymce', ['uiTinymceConfig', function (uiTinymceConfig) {
    uiTinymceConfig = uiTinymceConfig || {};
    var generatedIds = 0;
    return {
      priority: 10,
      require: 'ngModel',
      link: function (scope, elm, attrs, ngModel) {
		
		iMed.Promise.all([
			iMed.utils.loadScripts([
				iMed.Config.domain+"/assets/tinymce/tinymce.min.js",
				iMed.Config.domain+"/assets/tinymce/jquery.tinymce.min.js"
			]),
			iMed.App.Main.load_templates("common", "tinymce").then(
				function(style) {
					// Apply stylesheet
					iMed.utils.appendStylesheet(style.css.render({
						app: {
							stylesheet_root: "html body"
						}
					}), "view_tinymce");

					return style;
				}
			)
		]).then(
			function(_, scripts) {
				var expression, options, tinyInstance,
				  updateView = function () {
					ngModel.$setViewValue(elm.val());
					if (!scope.$root.$$phase) {
					  scope.$apply();
					}
				  };
		
				// generate an ID if not present
				if (!attrs.id) {
				  attrs.$set('id', 'uiTinymce' + generatedIds++);
				}
		
				if (attrs.uiTinymce) {
				  expression = scope.$eval(attrs.uiTinymce);
				} else {
				  expression = {};
				}
		
				// make config'ed setup method available
				if (expression.setup) {
				  var configSetup = expression.setup;
				  delete expression.setup;
				}
		
				options = {
				  // Update model when calling setContent (such as from the source editor popup)
				  setup: function (ed) {
					var args;
					ed.on('init', function(args) {
					  ngModel.$render();
					  ngModel.$setPristine();
					});
					// Update model on button click
					ed.on('ExecCommand', function (e) {
					  ed.save();
					  updateView();
					});
					// Update model on keypress
					ed.on('KeyUp', function (e) {
					  ed.save();
					  updateView();
					});
					// Update model on change, i.e. copy/pasted text, plugins altering content
					ed.on('SetContent', function (e) {
					  if (!e.initial && ngModel.$viewValue !== e.content) {
						ed.save();
						updateView();
					  }
					});
					ed.on('blur', function(e) {
						elm.blur();
					});
					// Update model when an object has been resized (table, image)
					ed.on('ObjectResized', function (e) {
					  ed.save();
					  updateView();
					});
					if (configSetup) {
					  configSetup(ed);
					}
				  },
				  mode: 'exact',
				  elements: attrs.id
				};
				// extend options with initial uiTinymceConfig and options from directive attribute value
				angular.extend(options, uiTinymceConfig, expression);
				setTimeout(function () {
				  tinymce.init(options);
				});
		
				ngModel.$render = function() {
				  if (!tinyInstance) {
					tinyInstance = tinymce.get(attrs.id);
				  }
				  if (tinyInstance) {
					tinyInstance.setContent(ngModel.$viewValue || '');
				  }
				};
		
				scope.$on('$destroy', function() {
				  if (!tinyInstance) { tinyInstance = tinymce.get(attrs.id); }
				  if (tinyInstance) {
					tinyInstance.remove();
					tinyInstance = null;
				  }
				});
			}
		);
      }
    };
  }]);


angular.module('adminApp.filters', [
]).filter('translateValue', function () {
	return function(input, lang) {
		lang = (typeof(lang) == "undefined") ? "en" : lang;
		return (input && typeof(input) == "object")? input[lang] : input;
	};
}).filter('matchExpectedParentValue', function () {
	return function(input, expectedParentFieldValue) {
		if (!expectedParentFieldValue) {
			return input;
		}

		return iMed.$.grep(input, function(obj, i) {
			return !obj.parent_field_value || obj.parent_field_value == expectedParentFieldValue;
		});
	};
}).filter('regexp_has_matches', function() {
	return function(input, expr) {
		if (input && expr) {
			var matches = input.match(new RegExp(expr));
			return matches && matches.length > 0;
		}
		return false;
	};
});

angular.module('adminApp.directives', [
	'adminApp.filters'
]).directive('pwCheck', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    // console.info(elem.val() === $(firstPassword).val());
                    ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                });
            });
        }
    }
}]).directive('affix', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).affix({
				offset: {
					top: $(element).offset().top
				}
			});
        }
    };
}).directive('placementField', [function() {
    return {
        restrict: 'AE',
		transclude: true,
		scope: {
			placement:"=",
			model:"="
		},
        link: function(scope, element, attrs) {
        },
		templateUrl: window.location.protocol+"//"+iMedMediaCME.plugin_base+'/js/admin_app/directives/placement_field.html'
    };
}]);

var adminApp = angular.module('adminApp', [
	'ngAnimate',
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ui.bootstrap',
	'ui.router',
	'ui.utils',
	'ui.tinymce',
	'pascalprecht.translate',
	'schemaForm',
	'ngTable',
	'ngTagsInput',
	'duScroll',
	'angularFileUpload',
	'adminApp.filters',
	'adminApp.directives',
	'adminApp.Dashboard',
	'adminApp.Course',
	'adminApp.Course.categoryForm',
	'adminApp.MailingList'
]).config(function ($httpProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise("/dashboard/courses");
});

adminApp.constant('site_config', iMedMediaCME);