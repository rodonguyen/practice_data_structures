# Text-to-Image Generator Plan

## Project Overview
Build a simple single-page HTML application that converts text input into a 100x100 pixel image using TypeScript and the Go1 font.

## Core Requirements
- **Input**: Text string from user
- **Output**: 100x100 pixel image containing the text
- **Font**: Use Go1 font from go1.com
- **Text Handling**: Center text, wrap if too long
- **Font Loading**: Ensure font is loaded before rendering

## Technical Architecture

### File Structure
```
text-to-image-generator.html (single file)
├── HTML structure
├── CSS styling + font loading
└── TypeScript/JavaScript logic
```

### Technology Stack
- **Frontend**: HTML5, CSS3, TypeScript/JavaScript
- **Graphics**: HTML5 Canvas API
- **Font Loading**: CSS @font-face + FontFace API
- **No external libraries needed**

## Implementation Plan

### Phase 1: HTML Structure & Setup
- [ ] Create basic HTML layout
- [ ] Add text input field
- [ ] Add generate button
- [ ] Create hidden 100x100 canvas element
- [ ] Add image display area
- [ ] Add download functionality

### Phase 2: Font Integration
- [ ] Research Go1 font URL from go1.com
- [ ] Implement CSS @font-face declaration
- [ ] Add font loading verification using FontFace API
- [ ] Create font loading indicator/status
- [ ] Fallback font handling

### Phase 3: Core Text Processing Logic
- [ ] **Text Measurement System**
  - Implement canvas measureText() wrapper
  - Create text width/height calculation functions
  
- [ ] **Font Sizing Algorithm**
  - Start with base font size (16px)
  - Implement adaptive font scaling based on text length
  - Ensure text fits within 100x100 bounds
  
- [ ] **Text Wrapping Logic**
  - Word-based text wrapping
  - Line break calculation
  - Multi-line text handling
  - Maximum lines constraint

### Phase 4: Canvas Rendering Engine
- [ ] **Canvas Setup**
  - Initialize 100x100 canvas
  - Set up 2D rendering context
  - Background color/styling
  
- [ ] **Text Positioning System**
  - Horizontal centering calculation
  - Vertical centering for multi-line text
  - Line spacing management
  
- [ ] **Rendering Pipeline**
  - Clear canvas
  - Apply font settings
  - Draw each text line with proper positioning
  - Handle text styling (color, weight)

### Phase 5: Image Export & UI
- [ ] Canvas to image conversion (PNG format)
- [ ] Display generated image to user
- [ ] Implement download functionality
- [ ] Error handling and user feedback
- [ ] Responsive design considerations

## Detailed Technical Specifications

### Text Processing Algorithm
```typescript
interface TextRenderConfig {
  maxWidth: number;      // 100px
  maxHeight: number;     // 100px  
  baseFontSize: number;  // 16px
  minFontSize: number;   // 8px
  lineSpacing: number;   // 1.2
  padding: number;       // 10px
}
```

### Text Wrapping Strategy
1. **Initial Assessment**: Measure text at base font size
2. **Word Wrapping**: Break text into words, wrap by word boundaries
3. **Font Scaling**: If wrapped text exceeds height, reduce font size
4. **Iteration**: Repeat until text fits or minimum font size reached
5. **Fallback**: Truncate with ellipsis if still doesn't fit

### Centering Calculations
- **Horizontal**: `x = (canvasWidth - textWidth) / 2`
- **Vertical**: `y = (canvasHeight - totalTextHeight) / 2 + firstLineBaseline`
- **Multi-line**: Calculate total text block height, center the block

### Font Loading Implementation
```typescript
// Font loading verification
const font = new FontFace('Go1', 'url(https://go1.com/path/to/font.woff2)');
await font.load();
document.fonts.add(font);
```

## User Experience Flow
1. User enters text in input field
2. User clicks "Generate Image" button
3. System loads Go1 font (if not already loaded)
4. System processes text (wrapping, sizing)
5. System renders text to canvas
6. System displays generated 100x100 image
7. User can download the image

## Error Handling
- [ ] Font loading failures (fallback to system fonts)
- [ ] Empty text input validation
- [ ] Canvas rendering errors
- [ ] Browser compatibility issues
- [ ] User feedback for all error states

## Testing Strategy
- [ ] Test with various text lengths (short, medium, long)
- [ ] Test with special characters and unicode
- [ ] Test font loading in different browsers
- [ ] Test text wrapping edge cases
- [ ] Test download functionality
- [ ] Mobile responsiveness testing

## Performance Considerations
- Font caching after first load
- Debounce text input for real-time preview
- Canvas rendering optimization
- Memory management for image generation

## Future Enhancements (Optional)
- [ ] Multiple font options
- [ ] Color customization
- [ ] Background patterns/colors
- [ ] Different image sizes
- [ ] Export formats (JPEG, SVG)
- [ ] Batch processing
- [ ] Text styling options (bold, italic)

## Deliverable
Single HTML file (~200-300 lines) containing complete functionality with embedded CSS and TypeScript/JavaScript.