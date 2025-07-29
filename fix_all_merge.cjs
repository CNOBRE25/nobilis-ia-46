const fs = require('fs');
const path = require('path');

function fixAllMergeConflicts(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      fixAllMergeConflicts(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        // Remove all merge conflict markers and keep the HEAD version
        content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [^\n]+\n/g, '$1');
        
        // Remove any remaining individual markers
        content = content.replace(/<<<<<<< HEAD\n/g, '');
        content = content.replace(/=======\n/g, '');
        content = content.replace(/>>>>>>> [^\n]+\n/g, '');
        
        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Fixed: ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
      }
    }
  }
}

// Start fixing from the current directory
console.log('Fixing all merge conflicts...');
fixAllMergeConflicts(__dirname);
console.log('Done!'); 