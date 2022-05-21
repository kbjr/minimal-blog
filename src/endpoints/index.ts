
export function import_endpoints() {
	// ===== Public Web API =====
	
	require('./web/status');
	
	// Sitemap
	require('./web/sitemap');
	
	// Asset files (CSS/JS/Images)
	require('./web/assets');
	// require('./web/favicon');
	
	// Various feed formats
	require('./web/feed-atom');
	require('./web/feed-json');
	require('./web/feed-rss');
	
	// HTML pages
	require('./web/feed-html');
	// require('./web/post-html');
	// require('./web/comment-html');
	
	// Interactions
	require('./web/pingback');
	require('./web/webmention');
	
	// ===== Control Panel API =====
	
	require('./ctrl/status');
	require('./ctrl/robots');
	require('./ctrl/preview-markdown');
	require('./ctrl/token/get');
	require('./ctrl/token/validate');
	require('./ctrl/snowflake');
	
	// UI
	require('./ctrl/ui/assets');
	require('./ctrl/ui/login');
	require('./ctrl/ui/main');
	require('./ctrl/ui/color-themes');
	require('./ctrl/ui/posts');
	require('./ctrl/ui/edit-post');
	require('./ctrl/ui/interactions');
	require('./ctrl/ui/settings');
	require('./ctrl/ui/templates');
	require('./ctrl/ui/users');
	
	// Users / authentication
	require('./ctrl/token/get');
	require('./ctrl/users/list');
	require('./ctrl/users/create');
	require('./ctrl/users/update-password');
	require('./ctrl/users/delete');
	
	// Settings
	require('./ctrl/settings/get');
	require('./ctrl/settings/update');
	
	// Templates
	require('./ctrl/templates/get');
	require('./ctrl/templates/update');
	// require('./ctrl/templates/update-favicon');
	
	// Themes
	require('./ctrl/themes/get');
	require('./ctrl/themes/create');
	// require('./ctrl/themes/update');
	// require('./ctrl/themes/delete');
	
	// Posts
	require('./ctrl/posts/list');
	// require('./ctrl/posts/get');
	require('./ctrl/posts/create');
	// require('./ctrl/posts/update');
	// require('./ctrl/posts/delete');

	// Interactions
	// TODO: Interactions
	
	// Tags
	// require('./ctrl/tags/list');
	// require('./ctrl/tags/delete');
}
