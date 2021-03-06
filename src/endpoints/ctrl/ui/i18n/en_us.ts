
import { LanguageLabels } from './lang';

export const en_us: LanguageLabels = {
	lang_code: 'en-US',
	loading: 'Loading...',
	website: 'Website',
	control_panel: 'Control Panel',
	login: 'Login',
	logout: 'Logout',
	username: 'Username',
	password: 'Password',
	noscript: 'JavaScript is required to use this control panel',
	optional: 'optional',

	enums: {
		mention_type: {
			all: 'All',
			pingback: 'Pingback',
			webmention: 'WebMention',
		},
		rule_type: {
			block: 'Block',
			review: 'Review',
			allow: 'Allow',
			trust: 'Trust',
		},
		rsvp_type: {
			yes: 'Yes',
			no: 'No',
			maybe: 'Maybe',
			interested: 'Interested',
		},
	},

	pages: {
		first_time_setup: {
			title: 'First Time Setup',
		},
		login: {
			title: 'Login',
			prompt: 'Login to continue',
		},
		dashboard: {
			title: 'Dashboard',
			drafts: 'Drafts',
			recent_entries: 'Recently Published Entries',
			recent_mentions: 'Recent Mentions',
			no_drafts: 'Nothing to show here.<br />This is where your unpublished drafts will show up.',
			no_entries: 'Nothing to show here.<br />This is where your published entries will show up.',
			no_mentions: 'Nothing to show here.<br />This is where external pages mentioning your blog will show up if you receive WebMentions or Pingbacks.',
		},
		posts: {
			title: 'View & Edit Posts',
			post_subtitle: 'Sub-Title / Summary',
			post_body: 'Body',
			post_tags: 'Tags',
			preview: 'Preview',
			cancel: 'Cancel',
			published: 'Published',
			not_published: 'Not Published',
			tags_pattern_hint: 'Tags should be comma delimited, and contain only letters, numbers, and hyphens',
			types: {
				post: {
					post_title: 'Post Title',
				},
				comment: {
					external_url: 'Reply To URL',
				},
				note: {
				},
				event: {
					post_title: 'Event Title',
				},
				rsvp: {
					external_url: 'Event URL',
					rsvp_type: 'RSVP Type',
					rsvp_types: {
						yes: 'Going',
						no: 'Not Going',
						maybe: 'Maybe',
						interested: 'Interested',
					},
				},
			}
		},
		create_post: {
			title: 'Create New Post',
			save: 'Save Draft Post',
			publish: 'Create & Publish Post',
		},
		create_comment: {
			title: 'Create New Comment',
			save: 'Save Draft Comment',
			publish: 'Create & Publish Comment',
		},
		create_note: {
			title: 'Create New Note',
			save: 'Save Draft Note',
			publish: 'Create & Publish Note',
		},
		create_event: {
			title: 'Create New Event',
			save: 'Save Draft Event',
			publish: 'Create & Publish Event',
		},
		create_rsvp: {
			title: 'Create New RSVP',
			save: 'Save Draft RSVP',
			publish: 'Create & Publish RSVP',
		},
		edit_post: {
			title: 'Edit Post',
			save: 'Save Post',
			publish: 'Publish Post',
		},
		edit_comment: {
			title: 'Edit Comment',
			save: 'Save Comment',
			publish: 'Publish Comment',
		},
		edit_note: {
			title: 'Edit Note',
			save: 'Save Note',
			publish: 'Publish Note',
		},
		edit_event: {
			title: 'Edit Event',
			save: 'Save Event',
			publish: 'Publish Event',
		},
		edit_rsvp: {
			title: 'Edit RSVP',
			save: 'Save RSVP',
			publish: 'Publish RSVP',
		},
		mention_settings: {
			title: 'Mention Settings',
		},
		settings: {
			title: 'General Settings',
		},
		color_themes: {
			title: 'Color Themes',
			select_subtitle: 'Active Color Themes',
			select_label_light_mode: 'Light-Mode Theme',
			select_label_dark_mode: 'Dark-Mode Theme',
			select_update: 'Update',
			create_label_start_from: 'Start From',
			create_label_new_name: 'New Theme Name',
			create_theme: 'Create Theme',
			create_subtitle: 'Create a New Color Theme',
			edit_subtitle: 'Modify or Delete a Color Theme',
			edit_label_theme: 'Select a Theme to Edit',
			edit_colors: 'Edit Colors',
			delete_theme: 'Delete Color Theme',
		},
		templates: {
			title: 'Templates',
		},
		moderation_queue: {
			title: 'Moderation Queue'
		},
		users: {
			title: 'Users',
		},
	},
};
