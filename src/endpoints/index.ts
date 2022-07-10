
export function import_endpoints() {
	// ===== Public Web API =====
	
	require('./web/status');
	
	// Sitemap
	require('./web/sitemap');
	
	// OpenSearch
	require('./web/opensearch');
	
	// Asset files (CSS/JS/Images)
	require('./web/assets');
	require('./web/favicon');
	
	// Various feed formats
	// require('./web/feed-atom');
	require('./web/feed-json');
	require('./web/feed-jf2');
	require('./web/feed-rss');

	// iCalendar
	require('./web/event-icalendar');
	
	// HTML pages
	require('./web/feed-html');
	require('./web/post-html');
	require('./web/comment-html');
	require('./web/note-html');
	require('./web/event-html');
	require('./web/rsvp-html');
	
	// Interactions
	require('./web/pingback');
	require('./web/webmention');
	
	// ===== Control Panel API =====
	
	require('./ctrl/status');
	require('./ctrl/robots');
	require('./ctrl/microformats');
	require('./ctrl/preview-markdown');
	require('./ctrl/token/get');
	require('./ctrl/token/validate');
	require('./ctrl/snowflake');
	
	// UI
	require('./ctrl/ui/assets');
	require('./ctrl/ui/login');
	require('./ctrl/ui/dashboard');
	require('./ctrl/ui/posts');
	require('./ctrl/ui/edit-post');
	require('./ctrl/ui/settings');
	require('./ctrl/ui/color-themes');
	require('./ctrl/ui/mention-settings');
	require('./ctrl/ui/moderation-queue');
	require('./ctrl/ui/templates');
	
	// Authentication
	require('./ctrl/token/get');
	
	// Settings
	require('./ctrl/settings/get');
	require('./ctrl/settings/update');
	require('./ctrl/settings/setup');
	require('./ctrl/settings/update-favicon');
	require('./ctrl/settings/update-password');
	
	// Links
	require('./ctrl/links/get');
	require('./ctrl/links/update');
	
	// Templates
	require('./ctrl/templates/get');
	require('./ctrl/templates/update');
	require('./ctrl/templates/reset');
	
	// Themes
	require('./ctrl/themes/get');
	require('./ctrl/themes/create');
	// require('./ctrl/themes/update');
	// require('./ctrl/themes/delete');
	
	// Posts
	require('./ctrl/posts/list');
	require('./ctrl/posts/list-drafts');
	require('./ctrl/posts/get');
	require('./ctrl/posts/create');
	require('./ctrl/posts/update');
	require('./ctrl/posts/delete');

	// Mentions
	// TODO: Mentions

	// Syndications
	// TODO: Syndications
	
	// Tags
	// require('./ctrl/tags/list');
	// require('./ctrl/tags/delete');
}
