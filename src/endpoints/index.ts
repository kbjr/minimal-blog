
// ===== Public Web API =====

import './web/status';

// Sitemap + Robots
import './web/robots';
import './web/sitemap';

// Asset files (CSS/JS/Images)
import './web/js';
import './web/css';
// import './web/favicon';

// Various feed formats
import './web/feed-atom';
import './web/feed-json';
import './web/feed-rss';

// HTML pages
import './web/feed-html';
// import './web/post-html';

// ===== Control Panel API =====

import './ctrl/status';
import './ctrl/get-token';
import './ctrl/ui';

// Users / authentication
import './ctrl/get-token';
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
// ...

// Posts
// ...

// Authors
// ...

// Tags
// ...
