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
    console.error('Error in AI generation:', error);
    alert(error.message || 'There was an error generating the style. Please check the console for details.');
  } finally {
    submitAIPrompt.disabled = false;
    submitAIPrompt.textContent = 'Generate Style';
  }
});

// Function to call AI API
async function generateAIStyle(prompt) {
  const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!API_KEY) {
    throw new Error('OpenAI API key not found. Please add it to your .env file.');
  }

  const systemPrompt = `You are a professional design system generator. Your task is to create a cohesive style tile based on brand descriptions. 
  You must output valid JSON that matches this exact structure, with HSL colors and only using the available fonts.
  
  Rules for generation:
  1. Colors should be harmonious and reflect the brand's personality
  2. Typography choices should be readable and match the brand's tone
  3. Content should be realistic and match the brand's voice
  4. Adjectives should capture the brand's key attributes`;

  const userPrompt = `Generate a style tile design for the following brand description: ${prompt}

  Available fonts: ${fonts.map(f => f.name).join(', ')}

  Respond only with valid JSON in this exact structure:
  {
    "colors": {
      "primary": "hsl(H, S%, L%)",
      "secondary": "hsl(H, S%, L%)",
      "accent": "hsl(H, S%, L%)",
      "text": "hsl(H, S%, L%)",
      "background": "hsl(H, S%, L%)"
    },
    "typography": {
      "headingFont": "font name from available fonts",
      "bodyFont": "font name from available fonts"
    },
    "content": {
      "projectName": "brand name",
      "tagline": "brand tagline in caps",
      "primaryHeading": "compelling heading",
      "secondaryHeading": "supporting subheading",
      "bodyText": "2-3 sentence paragraph about the brand",
      "ctaText": "action-oriented button text",
      "linkText": "engaging link text with »"
    },
    "adjectives": ["word1", "word2", "word3", "word4"]
  }`;

  try {
    console.log('Sending request to OpenAI...');
    const response = await fetch(OPENAI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    console.log('OpenAI Response:', data);

    // The response is already JSON, no need to parse
    const styleData = JSON.parse(data.choices[0].message.content);
    console.log('Parsed Style Data:', styleData);

    // Validate the response structure
    const requiredKeys = {
      colors: ['primary', 'secondary', 'accent', 'text', 'background'],
      typography: ['headingFont', 'bodyFont'],
      content: ['projectName', 'tagline', 'primaryHeading', 'secondaryHeading', 'bodyText', 'ctaText', 'linkText'],
      adjectives: null
    };

    for (const [section, keys] of Object.entries(requiredKeys)) {
      if (!styleData[section]) {
        throw new Error(`Missing ${section} section in AI response`);
      }
      if (keys) {
        for (const key of keys) {
          if (!styleData[section][key]) {
            throw new Error(`Missing ${section}.${key} in AI response`);
          }
        }
      }
    }

    if (!Array.isArray(styleData.adjectives) || styleData.adjectives.length !== 4) {
      throw new Error('Invalid adjectives array in AI response');
    }

    // Validate fonts
    const availableFonts = fonts.map(f => f.name);
    if (!availableFonts.includes(styleData.typography.headingFont) || 
        !availableFonts.includes(styleData.typography.bodyFont)) {
      throw new Error('Invalid font selection in AI response');
    }

    // Validate HSL colors
    const hslRegex = /^hsl\(\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%\)$/;
    for (const [key, value] of Object.entries(styleData.colors)) {
      if (!hslRegex.test(value)) {
        throw new Error(`Invalid HSL color format for ${key}: ${value}`);
      }
    }

    return styleData;
  } catch (error) {
    console.error('Error in generateAIStyle:', error);
    throw new Error('Failed to generate style. Please check the console for details.');
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
