
// ===== Public Web API =====

import './web/status';

// Sitemap + Robots
import './web/robots';
import './web/sitemap';

// Asset files (CSS/JS/Images)
import './web/css';
// import './web/favicon';

// Various feed formats
// import './web/feed-atom';
import './web/feed-json';
import './web/feed-rss';

// ...

// ===== Control Panel API =====

import './ctrl/status';

// Settings
import './ctrl/settings/get';
import './ctrl/settings/patch';

// Themes
import './ctrl/themes/get';
// ...
