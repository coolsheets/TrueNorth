const concurrently = require('concurrently');
const { result } = concurrently([
  { 
    command: 'npm run dev:app:secure', 
    name: 'frontend', 
    prefixColor: 'blue'
  },
  { 
    command: 'npm run dev:server:secure', 
    name: 'backend', 
    prefixColor: 'green'
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
});

result.then(
  () => console.log('All processes exited successfully'),
  (err) => console.error('One or more processes failed', err)
);