
export interface LanguageLabels {
	lang_code: string;
	loading: string;
	website: string;
	control_panel: string;
	login: string;
	logout: string;
	username: string;
	password: string;
	noscript: string;

	pages: {
		first_time_setup: {
			title: string;
		};
		login: {
			title: string;
			prompt: string;
		};
		main: {
			title: string;
		};
		posts: {
			title: string;
		};
		settings: {
			title: string;
		};
		color_themes: {
			title: string;
			
			select_subtitle: string;
			select_label_light_mode: string;
			select_label_dark_mode: string;
			select_update: string;
			
			create_subtitle: string;
			create_label_start_from: string;
			create_label_new_name: string;
			create_theme: string;

			edit_subtitle: string;
			edit_label_theme: string;
			edit_colors: string;
			delete_theme: string;
		};
		templates: {
			title: string;
		};
		users: {
			title: string;
		};
	};
}
