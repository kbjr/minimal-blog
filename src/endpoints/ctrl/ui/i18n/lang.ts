
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
	optional: string;

	enums: {
		mention_type: {
			all: string;
			pingback: string;
			webmention: string;
		};
		rule_type: {
			block: string;
			review: string;
			allow: string;
			trust: string;
		};
	};

	pages: {
		first_time_setup: {
			title: string;
		};
		login: {
			title: string;
			prompt: string;
		};
		dashboard: {
			title: string;
			drafts: string;
			recent_posts: string;
			recent_mentions: string;
		};
		posts: {
			title: string;
			post_subtitle: string;
			post_body: string;
			post_tags: string;
			preview: string;
			cancel: string;
			published: string;
			not_published: string;
			tags_pattern_hint: string;
			types: {
				post: {
					post_title: string;
					helper_text: string;
				};
				comment: {
					external_url: string;
					helper_text: string;
				};
				note: {
					helper_text: string;
				};
				event: {
					post_title: string;
					helper_text: string;
				};
				rsvp: {
					external_url: string;
					helper_text: string;
					rsvp_type: string;
					rsvp_types: {
						yes: string;
						no: string;
						maybe: string;
						interested: string;
					};
				};
			};
		};
		create_post: {
			title: string;
			save: string;
			publish: string;
		};
		create_comment: {
			title: string;
			save: string;
			publish: string;
		};
		create_note: {
			title: string;
			save: string;
			publish: string;
		};
		create_event: {
			title: string;
			save: string;
			publish: string;
		};
		create_rsvp: {
			title: string;
			save: string;
			publish: string;
		};
		edit_post: {
			title: string;
			save: string;
			publish: string;
		};
		edit_comment: {
			title: string;
			save: string;
			publish: string;
		};
		edit_note: {
			title: string;
			save: string;
			publish: string;
		};
		edit_event: {
			title: string;
			save: string;
			publish: string;
		};
		edit_rsvp: {
			title: string;
			save: string;
			publish: string;
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
		interactions: {
			title: string;
		};
		users: {
			title: string;
		};
	};
}
