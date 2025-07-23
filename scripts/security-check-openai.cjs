// scripts/security-check-openai.js
const fs = require('fs');
const path = require('path');

const forbiddenPatterns = [/VITE_OPENAI_API_KEY/, /sk-\w{10,}/];
const frontendDirs = ['src', 'public'];
let found = false;

function scanDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      forbiddenPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          console.error(`❌ Padrão proibido encontrado em ${fullPath}: ${pattern}`);
          found = true;
        }
      });
    }
  });
}

frontendDirs.forEach(scanDir);
if (found) {
  console.error('❌ Build bloqueado: Chave OpenAI ou variável insegura encontrada no frontend!');
  process.exit(1);
} else {
  console.log('✅ Segurança OpenAI: Nenhuma chave ou variável insegura encontrada no frontend.');
} 