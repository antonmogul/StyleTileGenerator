// Available Google Fonts
const fonts = [
  { name: 'Playfair Display', weight: 700, category: 'serif' },
  { name: 'Roboto', weight: 400, category: 'sans-serif' },
  { name: 'Montserrat', weight: 800, category: 'sans-serif' },
  { name: 'Poppins', weight: 300, category: 'sans-serif' },
  { name: 'Merriweather', weight: 700, category: 'serif' },
  { name: 'Lora', weight: 400, category: 'serif' },
  { name: 'Inter', weight: 800, category: 'sans-serif' },
  { name: 'Roboto Mono', weight: 500, category: 'monospace' }
];

// Function to generate a random color
function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30 + 70); // 70-100%
  const lightness = Math.floor(Math.random() * 30 + 35); // 35-65%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Function to generate a color palette
function generateColorPalette() {
  const primary = generateRandomColor();
  const secondary = `hsl(${(Math.floor(Math.random() * 30) + 165) % 360}, 70%, 50%)`; // Complementary
  const accent = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`; // Random bright color
  const text = 'hsl(0, 0%, 20%)'; // Dark grey for text
  const background = 'hsl(0, 0%, 100%)'; // White background

  return { primary, secondary, accent, text, background };
}

// Function to generate random font combinations
function generateFontCombination() {
  const headingFont = fonts[Math.floor(Math.random() * fonts.length)];
  let bodyFont;
  do {
    bodyFont = fonts[Math.floor(Math.random() * fonts.length)];
  } while (bodyFont.name === headingFont.name);

  return { headingFont, bodyFont };
}

// Function to update the style tile
function updateStyleTile() {
  const colors = generateColorPalette();
  const fonts = generateFontCombination();

  // Update CSS variables
  document.documentElement.style.setProperty('--primary-color', colors.primary);
  document.documentElement.style.setProperty('--secondary-color', colors.secondary);
  document.documentElement.style.setProperty('--accent-color', colors.accent);
  document.documentElement.style.setProperty('--text-color', colors.text);
  document.documentElement.style.setProperty('--background-color', colors.background);

  // Update typography
  document.querySelector('.primary-heading').style.fontFamily = fonts.headingFont.name;
  document.querySelector('.secondary-heading').style.fontFamily = fonts.bodyFont.name;
  document.querySelector('.body-text').style.fontFamily = fonts.bodyFont.name;
  
  // Update font names in the display
  document.querySelector('.primary-font-name').textContent = fonts.headingFont.name;
  document.querySelector('.secondary-font-name').textContent = fonts.bodyFont.name;

  // Generate random patterns
  const patterns = [
    `radial-gradient(circle at 30% 30%, ${colors.primary} 10%, transparent 10.2%)`,
    `linear-gradient(45deg, ${colors.secondary} 25%, transparent 25%, transparent 75%, ${colors.secondary} 75%, ${colors.secondary})`,
    `repeating-linear-gradient(-45deg, ${colors.accent}, ${colors.accent} 10px, transparent 10px, transparent 20px)`
  ];

  // Apply patterns
  document.querySelectorAll('.pattern-swatch').forEach((swatch, index) => {
    swatch.style.backgroundImage = patterns[index];
    swatch.style.backgroundSize = '20px 20px';
  });
}

// Function to export the style tile
async function exportStyleTile() {
  const styleTile = document.getElementById('styleTile');
  
  try {
    const canvas = await html2canvas(styleTile, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'style-tile.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting style tile:', error);
  }
}

// Event listeners
document.getElementById('generateBtn').addEventListener('click', updateStyleTile);
document.getElementById('exportBtn').addEventListener('click', exportStyleTile);

// Initialize with random styles
document.addEventListener('DOMContentLoaded', updateStyleTile);
