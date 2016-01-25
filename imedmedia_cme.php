<?php
/*
Plugin Name:    iMedMedia CME
Plugin URI:     http://wordpress.org/extend/plugins/imedmedia_cme
Description:    Adds iMedMedia CME functionality
Version:        0.1
Author:         Butch Marshall
Author URI:     https://github.com/butchmarshall
 
Text Domain:   imedmedia-cme
*/ 

$plugin_dir = basename(dirname(__FILE__));

add_action( 'admin_menu', 'imedmedia_cme_custom_admin_menu' );
  
function imedmedia_cme_custom_admin_menu() {
    add_options_page(
        'iMedMedia CME',
        'iMedMedia CME',
        'manage_options',
        'imedmedia_cme-plugin',
        'imedmedia_cme_options_page'
    );
}

/**
 * Enqueues scripts and styles.
 *
 * @since Cme Site 1.0
 */
function imedmedia_cme_site_scripts() {
	// Load the CME core script
	wp_enqueue_script( 'imedmedia_core', "//". get_settings("cme_domain") . '/assets/core.js', array(), "1.0.0");
}
add_action('wp_enqueue_scripts', 'imedmedia_cme_site_scripts');
add_action('wp_head', function() {
	?>
	<script type="text/javascript" id="cme_script_common">
		(function() {
			var parsed = iMed.$.Request.parseUri(window.location.href);

			window.iMedMediaCME = {
				site_base: window.location.hostname,
				plugin_base: "<?= plugins_url('', __FILE__) ?>".replace(/^http[s]?:\/\//,''),
				cme_site_id: <?= get_settings("cme_site_id") ?>,
				language_iso: "en",
				my_courses_url: window.location.protocol+"//"+window.location.hostname+"<?= get_settings("cme_my_courses_url") ?>",
				presenting_courses_url: window.location.protocol+"//"+window.location.hostname+"<?= get_settings("cme_presenting_courses_url") ?>",
				admin_url: window.location.protocol+"//"+window.location.hostname+"<?= get_settings("cme_admin_url") ?>",
				course_url: window.location.protocol+"//"+window.location.hostname+"<?= get_settings("cme_course_url") ?>",
				register_url: window.location.protocol+"//"+window.location.hostname+"<?= get_settings("cme_register_url") ?>",
				query: iMed.$.deparam(parsed.query),
				on_login: function(app, noCache) {
					iMed.Promise.all([
						app.on_ready.promise,
						iMed.Api.execute("get_cme_site", { cme_site_id: window.iMedMediaCME.cme_site_id }, {}, noCache)
					]).spread(
						function(ready, cme_site) {
							if (cme_site.links.registered_courses) {
								app.add_item({
									"name": "My Courses",
									"href": window.iMedMediaCME.my_courses_url
								});
							}
							if (cme_site.links.presenting_courses) {
								app.add_item({
									"name": "Presenting Courses",
									"href": window.iMedMediaCME.presenting_courses_url
								});
							}
							if (iMed.$.inArray("PUT", cme_site.links.self.methods) !== -1) {
								app.add_item({
									"name": "Manage Courses",
									"href": window.iMedMediaCME.admin_url
								});
							}
						}
					);
				}
			};
		})();
	</script>
	<?php
});

add_action( 'admin_init', 'my_admin_init' );
function my_admin_init() {
    register_setting( 'my-settings-group', 'cme_site_id' );
	register_setting( 'my-settings-group', 'cme_domain' );
	register_setting( 'my-settings-group', 'cme_course_url' );
	register_setting( 'my-settings-group', 'cme_register_url' );
	register_setting( 'my-settings-group', 'cme_my_courses_url' );
	register_setting( 'my-settings-group', 'cme_presenting_courses_url' );
	register_setting( 'my-settings-group', 'cme_admin_url' );

    add_settings_section( 'configuration', 'Configuration', 'configuration_callback', 'imedmedia_cme-plugin' );
    add_settings_field( 'cme_site_id', 'CME ID', 'cme_site_id_callback', 'imedmedia_cme-plugin', 'configuration' );
	add_settings_field( 'cme_domain_id', 'Backend Domain', 'cme_domain_callback', 'imedmedia_cme-plugin', 'configuration' );
	add_settings_field( 'cme_course_url', 'Course URL', 'cme_course_url_callback', 'imedmedia_cme-plugin', 'configuration' );
	add_settings_field( 'cme_register_url', 'Register URL', 'cme_register_url_callback', 'imedmedia_cme-plugin', 'configuration' );
	add_settings_field( 'cme_my_courses_url', 'My Courses URL', 'cme_my_courses_url_callback', 'imedmedia_cme-plugin', 'configuration' );
	add_settings_field( 'cme_presenting_courses_url', 'Presenting Courses URL', 'cme_presenting_courses_url_callback', 'imedmedia_cme-plugin', 'configuration' );
	add_settings_field( 'cme_admin_url', 'Admin URL', 'cme_admin_url_callback', 'imedmedia_cme-plugin', 'configuration' );
}

function configuration_callback() {
    echo 'Configure your CME below.';
}

function cme_site_id_callback() {
    $setting = esc_attr( get_option( 'cme_site_id' ) );
    echo "<input type='text' name='cme_site_id' value='$setting' />";
}
function cme_domain_callback() {
    $setting = esc_attr( get_option( 'cme_domain' ) );
    echo "<input type='text' name='cme_domain' value='$setting' />";
}
function cme_course_url_callback() {
    $setting = esc_attr( get_option( 'cme_course_url' ) );
    echo "<input type='text' name='cme_course_url' value='$setting' />";
}
function cme_register_url_callback() {
    $setting = esc_attr( get_option( 'cme_register_url' ) );
    echo "<input type='text' name='cme_register_url' value='$setting' />";
}
function cme_my_courses_url_callback() {
    $setting = esc_attr( get_option( 'cme_my_courses_url' ) );
    echo "<input type='text' name='cme_my_courses_url' value='$setting' />";
}
function cme_presenting_courses_url_callback() {
    $setting = esc_attr( get_option( 'cme_presenting_courses_url' ) );
    echo "<input type='text' name='cme_presenting_courses_url' value='$setting' />";
}
function cme_admin_url_callback() {
    $setting = esc_attr( get_option( 'cme_admin_url' ) );
    echo "<input type='text' name='cme_admin_url' value='$setting' />";
}


function imedmedia_cme_options_page() {
    ?>
    <div class="wrap">
        <h2>iMedMedia CME</h2>
        <form method="post" action="options.php">
			<?php settings_fields( 'my-settings-group' ); ?>
			<?php do_settings_sections( 'imedmedia_cme-plugin' ); ?>
			<?php submit_button(); ?>
		</form>
    </div>
    <?php
}

/**************************************************************************************************************************
 * Widgets
 **************************************************************************************************************************/


// CME Banner

class imedmedia_cme_banner_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_banner_widget', 
			// Widget name will appear in UI
			__('CME Banner', 'imedmedia_cme_banner_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME Banner', 'imedmedia_cme_banner_widget_domain' ), ) 
		);

		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
					iMed.App.Load("Cme", "Desktop_CourseBanners",
						target,
						{
							language_iso: iMedMediaCME.language_iso,
							cme_site_id: iMedMediaCME.cme_site_id,
							course_url: iMedMediaCME.course_url,
							register_url: iMedMediaCME.register_url
						}
					);
				}
			});
			</script>
			<?php
		});
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		?>
		<div id="<?= $this->id ?>"></div>
		<?php
	}
			
	// Widget Backend 
	public function form( $instance ) {

	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_banner_load_widget() {
	register_widget( 'imedmedia_cme_banner_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_banner_load_widget' );


// Upcoming Courses

class imedmedia_cme_upcoming_courses_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_upcoming_courses_widget', 
			// Widget name will appear in UI
			__('CME Upcoming Courses', 'imedmedia_cme_upcoming_courses_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME Upcoming Courses', 'imedmedia_cme_upcoming_courses_widget_domain' ), ) 
		);

		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
				iMed.App.Load("Cme", "Desktop_UpcomingCourses",
					target,
					{
						language_iso: iMedMediaCME.language_iso,
						cme_site_id: iMedMediaCME.cme_site_id,
						course_url: iMedMediaCME.course_url,
						register_url: iMedMediaCME.register_url,
						course_list: {
							query: {
								limit: 5,
								search: {
									state: [
										"scheduled", "open", "completed"
									]
								},
								order: [
									{ position: "ASC" }
								]
							}
						}
					}
				);
				}
			});
			</script>
			<?php
		});
	}
	
	public function widget( $args, $instance ) {
		?>
		<div id="<?= $this->id ?>"></div>
		<?php
	}
			
	// Widget Backend 
	public function form( $instance ) {

	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
}

// Register and load the widget
function imedmedia_cme_upcoming_courses_load_widget() {
	register_widget( 'imedmedia_cme_upcoming_courses_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_upcoming_courses_load_widget' );



// All Courses

class imedmedia_cme_all_courses_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_all_courses_widget', 
			// Widget name will appear in UI
			__('CME All Courses', 'imedmedia_cme_all_courses_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME All Courses', 'imedmedia_cme_all_courses_widget_domain' ), ) 
		);

		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
				iMed.App.Load("Cme", "Desktop_Courses",
					target,
					{
						language_iso: iMedMediaCME.language_iso,
						cme_site_id: iMedMediaCME.cme_site_id,
						course_url: iMedMediaCME.course_url,
						register_url: iMedMediaCME.register_url,
						course_list: {
							query: {
								limit: 10,
								search: {
									state: [
										"scheduled", "open", "completed", "archived"
									]
								},
								order: [
									{
										starts_at: "DESC"
									}
								]
							}
						}
					}
				);
				}
			});
			</script>
			<?php
		});
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		?>
		<div id="<?= $this->id ?>"></div>
		<?php
	}

	// Widget Backend 
	public function form( $instance ) {

	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_all_courses_load_widget() {
	register_widget( 'imedmedia_cme_all_courses_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_all_courses_load_widget' );



// CME Admin

class imedmedia_cme_admin_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_admin_widget', 
			// Widget name will appear in UI
			__('CME Admin', 'imedmedia_cme_admin_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME Admin', 'imedmedia_cme_admin_widget_domain' ), ) 
		);

		$styles = array(
			"/css/cme_admin.css",
			"/js/admin_app/bower_components/bootstrap/dist/css/bootstrap.min.css",
			"/js/admin_app/bower_components/bootstrap/dist/css/bootstrap-theme.min.css",
			"/js/admin_app/bower_components/ng-table/dist/ng-table.min.css",
			"/js/admin_app/bower_components/ng-tags-input/ng-tags-input.min.css",
		);
		foreach($styles as $k=>$v) {
			wp_register_style("angular-style-$k", plugins_url($v, __FILE__), array(),'0.1', "all");
			wp_enqueue_style("angular-style-$k");
		}

		$scripts = array(
			"/js/admin_app/bower_components/jquery/dist/jquery.min.js",
			"/js/admin_app/bower_components/bootstrap/dist/js/bootstrap.min.js",
			"/js/admin_app/bower_components/angular/angular.min.js",
			"/js/admin_app/bower_components/angular-bootstrap/ui-bootstrap.min.js",
			"/js/admin_app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
			"/js/admin_app/bower_components/angular-animate/angular-animate.min.js",
			"/js/admin_app/bower_components/angular-cookies/angular-cookies.min.js",
			"/js/admin_app/bower_components/angular-resource/angular-resource.min.js",
			"/js/admin_app/bower_components/angular-sanitize/angular-sanitize.min.js",
			"/js/admin_app/bower_components/angular-ui-router/release/angular-ui-router.min.js",
			"/js/admin_app/bower_components/angular-ui-utils/ui-utils.min.js",
			"/js/admin_app/bower_components/angular-translate/angular-translate.min.js",
			"/js/admin_app/bower_components/objectpath/lib/ObjectPath.js",
			"/js/admin_app/bower_components/tv4/tv4.js",
			"/js/admin_app/bower_components/angular-schema-form/dist/schema-form.min.js",
			"/js/admin_app/bower_components/angular-schema-form/dist/bootstrap-decorator.min.js",
			"/js/admin_app/bower_components/ng-table/dist/ng-table.min.js",
			"/js/admin_app/bower_components/ng-tags-input/ng-tags-input.js",
			"/js/admin_app/bower_components/angular-scroll/angular-scroll.min.js",
			"/js/admin_app/bower_components/angular-file-upload/angular-file-upload.min.js",

			"/js/admin_app/adminApp/dashboard/controller.js",
			"/js/admin_app/adminApp/dashboard/module.js",
			"/js/admin_app/adminApp/course/controller.js",
			"/js/admin_app/adminApp/course/module.js",
			"/js/admin_app/adminApp/mailing_list/controller.js",
			"/js/admin_app/adminApp/mailing_list/module.js",
			"/js/admin_app/adminApp.js",
			"/js/admin_app/services/api.js",
		);
		foreach($scripts as $k=>$v) {
			wp_register_script("angular-script-$k", plugins_url($v, __FILE__), array(),'0.1', true);
			wp_enqueue_script("angular-script-$k");
		}
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		?>
		<div id="<?= $this->id ?>" ng-app="adminApp" ui-view>
			<div class="loader">
				<span class="loader-inner">
					<span class="text">Loading your display&hellip;</span>
					<span class="loading-bar"></span>
				</span>
			</div>
		</div>
		<?php
	}
			
	// Widget Backend 
	public function form( $instance ) {

	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_admin_load_widget() {
	register_widget( 'imedmedia_cme_admin_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_admin_load_widget' );



// CME Course Menu

class imedmedia_cme_course_menu_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_course_menu_widget', 
			// Widget name will appear in UI
			__('CME Course Menu', 'imedmedia_cme_course_menu_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME Course Menu', 'imedmedia_cme_course_menu_widget_domain' ), ) 
		);
		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
				iMed.App.Load("Cme", "Desktop_CourseMenu",
					target,
					{
						language_iso: iMedMediaCME.language_iso,
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: parseInt(iMedMediaCME.query.course_id),
						course_url: iMedMediaCME.course_url,
						register_url: iMedMediaCME.register_url
					}
				);
				}
			});
			</script>
			<?php
		});
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		?>
		<div id="<?= $this->id ?>"></div>
		<?php
	}
			
	// Widget Backend 
	public function form( $instance ) {

	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_course_menu_load_widget() {
	register_widget( 'imedmedia_cme_course_menu_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_course_menu_load_widget' );



// CME Course

class imedmedia_cme_course_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_course_widget', 
			// Widget name will appear in UI
			__('CME Course', 'imedmedia_cme_course_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME Course', 'imedmedia_cme_course_widget_domain' ), ) 
		);
		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
				iMed.App.Load("Cme", "Desktop_CourseCategory",
					target,
					{
						language_iso: iMedMediaCME.language_iso,
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: parseInt(iMedMediaCME.query.course_id),
						course_url: iMedMediaCME.course_url,
						register_url: iMedMediaCME.register_url
					}
				);
				}
			});
			</script>
			<?php
		});
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		?>
		<div id="<?= $this->id ?>"></div>
		<?php
	}
			
	// Widget Backend 
	public function form( $instance ) {

	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_course_load_widget() {
	register_widget( 'imedmedia_cme_course_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_course_load_widget' );


// Mailing LIst

class imedmedia_cme_mailing_list_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_mailing_list_widget', 
			// Widget name will appear in UI
			__('CME Mailing List', 'imedmedia_cme_mailing_list_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME Mailing List', 'imedmedia_cme_mailing_list_widget_domain' ), ) 
		);

		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
				iMed.App.Load("Cme", "Desktop_JoinMailingList",
					target,
					{
						language_iso: iMedMediaCME.language_iso,
						cme_site_id: iMedMediaCME.cme_site_id
					}
				);
				}
			});
			</script>
			<?php
		});
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		$title = apply_filters( 'widget_title', $instance['title'] );
		?>
		<span class="box mailing-list">
			<h2><span class="text"><?= $title ?></span></h2>
			<span class="box-content imed-app-4" id="<?= $this->id ?>"></span></span>
		</span>
		<?php
		/*$title = apply_filters( 'widget_title', $instance['title'] );
		// before and after widget arguments are defined by themes
		echo $args['before_widget'];
		if ( ! empty( $title ) )
		echo $args['before_title'] . $title . $args['after_title'];

		// This is where you run the code and display the output
		echo __( 'Hello, World!', 'cme_site_banner_widget_domain' );
		echo $args['after_widget'];*/
	}
			
	// Widget Backend 
	public function form( $instance ) {
		if ( isset( $instance[ 'title' ] ) ) {
			$title = $instance[ 'title' ];
		}
		else {
			$title = __( 'New title', 'imedmedia_cme_register_widget_domain' );
		}
		// Widget admin form
		?>
			<p>
			<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label> 
			<input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" />
			</p>
		<?php 
	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_mailing_list_load_widget() {
	register_widget( 'imedmedia_cme_mailing_list_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_mailing_list_load_widget' );


// CME Register

class imedmedia_cme_register_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_register_widget', 
			// Widget name will appear in UI
			__('CME Register', 'imedmedia_cme_register_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME Register', 'imedmedia_cme_register_widget_domain' ), ) 
		);
		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
				iMed.App.Load("Cme", "Desktop_CourseCheckout",
					target,
					{
						language_iso: iMedMediaCME.language_iso,
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: parseInt(iMedMediaCME.query.course_id),
						course_url: iMedMediaCME.course_url,
						register_url: iMedMediaCME.register_url
					}
				);
				}
			});
			</script>
			<?php
		});
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		?>
		<div id="<?= $this->id ?>"></div>
		<?php
	}
			
	// Widget Backend 
	public function form( $instance ) {
		/*if ( isset( $instance[ 'title' ] ) ) {
			$title = $instance[ 'title' ];
		}
		else {
			$title = __( 'New title', 'imedmedia_cme_register_widget_domain' );
		}
		// Widget admin form
		?>
			<p>
			<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label> 
			<input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" />
			</p>
		<?php */
	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_register_load_widget() {
	register_widget( 'imedmedia_cme_register_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_register_load_widget' );



// CME Authentication

class imedmedia_cme_authentication_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_authentication_widget', 
			// Widget name will appear in UI
			__('CME Authentication', 'imedmedia_cme_authentication_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME Authentication', 'imedmedia_cme_authentication_widget_domain' ), ) 
		);
		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
				iMed.App.Load("Cme", "Desktop_Authentication",
					target,
					{
						language_iso: iMedMediaCME.language_iso,
						cme_site_id: iMedMediaCME.cme_site_id
					}
				).then(
					function(app) {
						iMedMediaCME.on_login(app, false);
						app.subscribe("login", function(action, current_user) {
							iMedMediaCME.on_login(app, true);
						});
					}
				);
				}
			});
			</script>
			<?php
		});
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		?>
		<li id="<?= $this->id ?>"></li>
		<?php
	}
			
	// Widget Backend 
	public function form( $instance ) {

	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_authentication_load_widget() {
	register_widget( 'imedmedia_cme_authentication_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_authentication_load_widget' );



// CME My Courses

class imedmedia_cme_my_courses_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_my_courses_widget', 
			// Widget name will appear in UI
			__('CME My Courses', 'imedmedia_cme_my_courses_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME My Courses', 'imedmedia_cme_my_courses_widget_domain' ), ) 
		);
		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
				iMed.App.Load("Cme", "Desktop_MyCourses",
					target,
					{
						language_iso: iMedMediaCME.language_iso,
						cme_site_id: iMedMediaCME.cme_site_id,
						cme_course_id: parseInt(iMedMediaCME.query.course_id),
						course_url: iMedMediaCME.course_url,
						register_url: iMedMediaCME.register_url
					}
				);
				}
			});
			</script>
			<?php
		});
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		?>
		<div id="<?= $this->id ?>"></div>
		<?php
	}
			
	// Widget Backend 
	public function form( $instance ) {

	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_my_courses_load_widget() {
	register_widget( 'imedmedia_cme_my_courses_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_my_courses_load_widget' );



// CME Presenting Courses

class imedmedia_cme_presenting_courses_widget extends WP_Widget {

	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'imedmedia_cme_presenting_courses_widget', 
			// Widget name will appear in UI
			__('CME Presenting Courses', 'imedmedia_cme_presenting_courses_widget_domain'),
			// Widget description
			array( 'description' => __( 'CME Presenting Courses', 'imedmedia_cme_presenting_courses_widget_domain' ), ) 
		);
		add_action('wp_head', function() {
			?>
			<script type="text/javascript" id="script_<?= $this->id ?>">
			iMed.$(document).ready(function() {
				var target = document.getElementById("<?= $this->id ?>");
				if (target) {
				iMed.App.Load("Cme", "Desktop_PresentingCourses",
					target,
					{
						language_iso: iMedMediaCME.language_iso,
						cme_site_id: iMedMediaCME.cme_site_id,
						course_url: iMedMediaCME.course_url,
						register_url: iMedMediaCME.register_url
					}
				);
				}
			});
			</script>
			<?php
		});
	}
	
	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		?>
		<div id="<?= $this->id ?>"></div>
		<?php
	}
			
	// Widget Backend 
	public function form( $instance ) {
	}
		
	// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		return $instance;
	}
} // Class cme_site_banner_widget ends here

// Register and load the widget
function imedmedia_cme_presenting_courses_load_widget() {
	register_widget( 'imedmedia_cme_presenting_courses_widget' );
}
add_action( 'widgets_init', 'imedmedia_cme_presenting_courses_load_widget' );