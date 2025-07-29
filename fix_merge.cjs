const fs = require('fs');
const path = require('path');

function removeMergeMarkers(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remove all merge conflict markers and keep the HEAD version
    content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [^\n]+\n/g, '$1');
    
    // Remove any remaining individual markers
    content = content.replace(/<<<<<<< HEAD\n/g, '');
    content = content.replace(/=======\n/g, '');
    content = content.replace(/>>>>>>> [^\n]+\n/g, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Fix specific files that are causing issues
const filesToFix = [
  'src/components/ProcessList.tsx',
  'src/hooks/useProcessStats.tsx',
  'src/hooks/useUnifiedStats.tsx',
  'src/hooks/useDetailedStats.tsx',
  'src/hooks/usePareceres.tsx',
  'src/hooks/useCrimeStats.tsx',
  'src/components/StatisticsPage.tsx',
  'src/components/UnifiedStatsPanel.tsx',
  'src/components/FunctionalityTable.tsx'
];

console.log('Fixing merge conflicts...');
filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    removeMergeMarkers(fullPath);
  }
});
console.log('Done!'); 