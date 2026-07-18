const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src', 'controllers');
const files = fs.readdirSync(controllersDir);

for (const file of files) {
  if (file.endsWith('.js')) {
    const filePath = path.join(controllersDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    let modified = false;

    // Match "catch (var) {" and inside it replace the 500 block.
    // Handles 'Internal Server Error' and 'Internal Server Error!'
    const regex = /catch\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*\{([\s\S]*?)return\s+res\.status\(500\)\.json\(\{\s*message\s*:\s*'Internal Server Error!?'\s*\}\);/g;
    
    content = content.replace(regex, (match, errVar, beforeReturn) => {
        modified = true;
        return `catch (${errVar}) {${beforeReturn}console.error('Error in controller:', ${errVar});\n        return res.status(500).json({ message: \`Server Error: \${${errVar}.message || 'An unexpected error occurred.'}\`, error: ${errVar}.name });`;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${file}`);
    }
  }
}
