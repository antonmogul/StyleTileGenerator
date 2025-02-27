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

// Modal handling
const modal = document.getElementById('aiPromptModal');
const generateAIBtn = document.getElementById('generateAIBtn');
const cancelAIPrompt = document.getElementById('cancelAIPrompt');
const submitAIPrompt = document.getElementById('submitAIPrompt');
const aiPromptInput = document.getElementById('aiPrompt');

generateAIBtn.addEventListener('click', () => {
  modal.classList.add('active');
});

cancelAIPrompt.addEventListener('click', () => {
  modal.classList.remove('active');
  aiPromptInput.value = '';
});

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    aiPromptInput.value = '';
  }
});

// AI prompt submission
submitAIPrompt.addEventListener('click', async () => {
  const prompt = aiPromptInput.value.trim();
  if (!prompt) {
    alert('Please enter a description of your brand or design.');
    return;
  }

  submitAIPrompt.disabled = true;
  submitAIPrompt.textContent = 'Generating...';

  try {
    const styleData = await generateAIStyle(prompt);
    updateStyleTileFromAI(styleData);
    modal.classList.remove('active');
    aiPromptInput.value = '';
  } catch (error) {
    console.error('Error generating AI style:', error);
    alert('There was an error generating the style. Please try again.');
  } finally {
    submitAIPrompt.disabled = false;
    submitAIPrompt.textContent = 'Generate Style';
  }
});

// Function to call AI API
async function generateAIStyle(prompt) {
  // Replace this with your actual API endpoint and key
  const API_ENDPOINT = 'YOUR_API_ENDPOINT';
  const API_KEY = 'YOUR_API_KEY';

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: `Generate a style tile design for the following brand description: ${prompt}
        
        Please provide a JSON response with the following structure:
        {
          "colors": {
            "primary": "color in HSL format",
            "secondary": "color in HSL format",
            "accent": "color in HSL format",
            "text": "color in HSL format",
            "background": "color in HSL format"
          },
          "typography": {
            "headingFont": "font name from available fonts",
            "bodyFont": "font name from available fonts"
          },
          "content": {
            "projectName": "brand name",
            "tagline": "brand tagline",
            "primaryHeading": "sample heading",
            "secondaryHeading": "sample subheading",
            "bodyText": "sample paragraph",
            "ctaText": "call to action text",
            "linkText": "sample link text"
          },
          "adjectives": ["word1", "word2", "word3", "word4"]
        }
        
        Available fonts: ${fonts.map(f => f.name).join(', ')}`
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw error;
  }
}

// Function to update style tile with AI-generated data
function updateStyleTileFromAI(styleData) {
  // Update colors
  document.documentElement.style.setProperty('--primary-color', styleData.colors.primary);
  document.documentElement.style.setProperty('--secondary-color', styleData.colors.secondary);
  document.documentElement.style.setProperty('--accent-color', styleData.colors.accent);
  document.documentElement.style.setProperty('--text-color', styleData.colors.text);
  document.documentElement.style.setProperty('--background-color', styleData.colors.background);

  // Update typography
  document.querySelector('.primary-heading').style.fontFamily = styleData.typography.headingFont;
  document.querySelector('.secondary-heading').style.fontFamily = styleData.typography.bodyFont;
  document.querySelector('.body-text').style.fontFamily = styleData.typography.bodyFont;
  
  // Update font names
  document.querySelector('.primary-font-name').textContent = styleData.typography.headingFont;
  document.querySelector('.secondary-font-name').textContent = styleData.typography.bodyFont;

  // Update content
  document.getElementById('projectName').textContent = styleData.content.projectName;
  document.getElementById('tagline').textContent = styleData.content.tagline;
  document.getElementById('primaryHeading').textContent = styleData.content.primaryHeading;
  document.getElementById('secondaryHeading').textContent = styleData.content.secondaryHeading;
  document.getElementById('bodyText').textContent = styleData.content.bodyText;
  document.getElementById('ctaButton').textContent = styleData.content.ctaText;
  document.getElementById('textLink').textContent = styleData.content.linkText;

  // Update adjectives
  document.getElementById('adjective1').textContent = styleData.adjectives[0];
  document.getElementById('adjective2').textContent = styleData.adjectives[1];
  document.getElementById('adjective3').textContent = styleData.adjectives[2];
  document.getElementById('adjective4').textContent = styleData.adjectives[3];

  // Generate and update patterns
  const patterns = [
    `radial-gradient(circle at 30% 30%, ${styleData.colors.primary} 10%, transparent 10.2%)`,
    `linear-gradient(45deg, ${styleData.colors.secondary} 25%, transparent 25%, transparent 75%, ${styleData.colors.secondary} 75%, ${styleData.colors.secondary})`,
    `repeating-linear-gradient(-45deg, ${styleData.colors.accent}, ${styleData.colors.accent} 10px, transparent 10px, transparent 20px)`
  ];

  document.querySelectorAll('.pattern-swatch').forEach((swatch, index) => {
    swatch.style.backgroundImage = patterns[index];
    swatch.style.backgroundSize = '20px 20px';
  });
}

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
