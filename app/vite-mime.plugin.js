// This is a custom Express.js middleware to fix MIME type issues
module.exports = function fixMimeTypes() {
  return function(req, res, next) {
    // Fix for manifest file
    if (req.url.endsWith('.webmanifest')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    }
    
    // Fix for JavaScript modules
    if (req.url.endsWith('.js') || req.url.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    
    // Fix for service worker
    if (req.url.includes('sw.js') || req.url.includes('registerSW')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
    }
    
    next();
  };
};
