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
				cme_site_id: <?= get_settings("cme_site_id") ?>,
				language_iso: "en",
				course_url: window.location.protocol+"//"+window.location.hostname+"<?= get_settings("cme_course_url") ?>",
				register_url: window.location.protocol+"//"+window.location.hostname+"<?= get_settings("cme_register_url") ?>",
				query: iMed.$.deparam(parsed.query)
			};
		})();
	</script>
	<?php
});

add_action( 'admin_init', 'my_admin_init' );
function my_admin_init() {
    register_setting( 'my-settings-group', 'cme_site_id' );
	register_setting( 'my-settings-group', 'cme_domain_id' );
	register_setting( 'my-settings-group', 'cme_course_url' );
	register_setting( 'my-settings-group', 'cme_register_url' );

    add_settings_section( 'configuration', 'Configuration', 'configuration_callback', 'imedmedia_cme-plugin' );
    add_settings_field( 'cme_site_id', 'CME ID', 'iMedMediaCME.cme_site_id_callback', 'imedmedia_cme-plugin', 'configuration' );
	add_settings_field( 'cme_domain_id', 'Backend Domain', 'cme_domain_callback', 'imedmedia_cme-plugin', 'configuration' );
	add_settings_field( 'cme_course_url', 'Course URL', 'cme_course_url_callback', 'imedmedia_cme-plugin', 'configuration' );
	add_settings_field( 'cme_register_url', 'Register URL', 'cme_register_url_callback', 'imedmedia_cme-plugin', 'configuration' );
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
		/*
		$title = apply_filters( 'widget_title', $instance['title'] );
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