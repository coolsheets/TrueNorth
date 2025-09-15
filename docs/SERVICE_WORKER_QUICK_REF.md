# Quick Reference: Service Worker Troubleshooting

## Service Worker Database Connection Issues

If your service worker can't connect to the database:

1. **Fix the scope issue**:
   ```bash
   # Run from the app directory
   ./fix-service-worker.sh
   ```
   Then access at https://localhost:3000

2. **Run the diagnostic tool**:
   ```bash
   # Run from the app directory
   ./troubleshoot-sw-db.sh
   ```

3. **Check for certificate issues**:
   ```bash
   # If you need new certificates
   ../scripts/generate-certs.sh
   ```

## Common Error Messages

### Scope Error
```
Failed to register a ServiceWorker for scope ('https://localhost:3000/') with script ('https://localhost:3000/dev-dist/sw.js')
```
**Solution**: Run `fix-service-worker.sh` or add `Service-Worker-Allowed: /` header

### Database Connection Failed
```
Error connecting to database
```
**Solution**: 
- Ensure service worker is properly registered (check Application tab in DevTools)
- Try accessing the database management page at `/manage-db.html`
- Check if IndexedDB is enabled in your browser

### HTTPS Required
```
Service Worker registration failed: SecurityError
```
**Solution**: 
- Use HTTPS (even on localhost)
- Run with the fix script to ensure proper SSL

## Debugging Tools

1. **Chrome DevTools**:
   - Application tab > Service Workers
   - Application tab > IndexedDB

2. **Database Manager**:
   - Access `/manage-db.html` to check database contents

3. **Unregister Service Workers**:
   - Access `/unregister-sw.html` to clear service workers

## Step-by-Step Debugging Process

1. Check if service worker is registered (Application tab > Service Workers)
2. Verify if it has the correct scope (should be `/`)
3. Check browser console for errors
4. Try unregistering and reloading (via `/unregister-sw.html`)
5. Run the fix script and access via https://localhost:3000
6. Verify database access via `/manage-db.html`

For detailed help, see [SERVICE_WORKER_DB_CONNECTION_FIX.md](/docs/SERVICE_WORKER_DB_CONNECTION_FIX.md)