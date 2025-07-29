const fs = require('fs');
const path = require('path');

function fixMergeConflicts(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      fixMergeConflicts(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        // Remove all merge conflict markers
        content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [a-f0-9]+\n/g, '$1');
        content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [^\n]+\n/g, '$1');
        
        // Remove any remaining HEAD markers
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

// Start fixing from the src directory
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  console.log('Fixing merge conflicts in src directory...');
  fixMergeConflicts(srcDir);
  console.log('Done!');
} else {
  console.log('src directory not found');
} 