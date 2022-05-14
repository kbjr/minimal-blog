
// ===== Public Web API =====

import './web/status';

// Sitemap
import './web/sitemap';

// Asset files (CSS/JS/Images)
import './web/assets';
// import './web/favicon';

// Various feed formats
import './web/feed-atom';
import './web/feed-json';
import './web/feed-rss';

// HTML pages
import './web/feed-html';
// import './web/post-html';

// Interactions
import './web/pingback';
import './web/webmention';

// ===== Control Panel API =====

import './ctrl/status';
import './ctrl/robots';
import './ctrl/preview-markdown';
import './ctrl/token/get';
import './ctrl/token/validate';

// UI
import './ctrl/ui/assets';
import './ctrl/ui/login';
import './ctrl/ui/main';
import './ctrl/ui/color-themes';
import './ctrl/ui/posts';
import './ctrl/ui/edit-post';
import './ctrl/ui/settings';
import './ctrl/ui/templates';
import './ctrl/ui/users';

// Users / authentication
import './ctrl/token/get';
import './ctrl/users/list';
import './ctrl/users/create';
import './ctrl/users/update-password';
import './ctrl/users/delete';

// Settings
import './ctrl/settings/get';
import './ctrl/settings/update';

// Templates
import './ctrl/templates/get';
import './ctrl/templates/put';
// import './ctrl/templates/put-favicon';

// Themes
import './ctrl/themes/get';
import './ctrl/themes/create';
// import './ctrl/themes/put';
// import './ctrl/themes/delete';

// Posts
// import './ctrl/posts/list';
// import './ctrl/posts/get';
// import './ctrl/posts/put';
// import './ctrl/posts/delete';
// import './ctrl/posts/preview';

// Authors
// import './ctrl/authors/list';
// import './ctrl/authors/get';
// import './ctrl/authors/post';
// import './ctrl/authors/put';
// import './ctrl/authors/delete';

// Tags
// import './ctrl/tags/list';
// import './ctrl/tags/delete';
