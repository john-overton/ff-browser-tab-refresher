# Tab Refresher & Page Navigator Extension

A powerful Firefox browser extension that allows you to automatically refresh tabs and configure click sequences for nested content navigation.

## Features

### Tab Refresh
- Automatically refresh any tab at specified intervals
- Configure different refresh intervals for different tabs
- Works on both active and inactive tabs
- Draggable timer display showing time until next refresh
- Start and stop refreshes independently for each tab

### Page Navigation
- Configure click sequences to navigate through nested content
- Support for both CSS selectors and XPath selectors
- Configurable delay between navigation steps
- Automatic element detection for links, buttons, and icons
- Step-by-step navigation for content that loads dynamically

### User Interface
- Modern and beautiful UI with a cohesive color scheme
- Easy-to-use tab-based interface
- Real-time list of active refresh jobs
- Draggable timer display on web pages

## Installation

### From Source
1. Clone this repository or download the source code
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension directory

### From Firefox Add-ons
*Coming soon*

## Usage

### Setting Up Tab Refresh
1. Click the extension icon to open the popup
2. Go to the "Tab Refresh" tab
3. Enter the desired refresh interval in seconds
4. Click "Start Refresh" to begin

### Configuring Navigation Steps
1. Open the extension popup
2. Go to the "Page Navigation" tab
3. Click "Add Step" to add a navigation step
4. Enter either a CSS selector or XPath for the element to click
5. Set the delay before the click (in milliseconds)
6. Add additional steps as needed
7. Click "Save Configuration" to apply the steps

### Managing Active Jobs
1. Open the "Running Jobs" tab in the popup
2. View all active refresh jobs
3. Click "Stop" next to any job to stop it

## Development

The extension is built using Firefox's WebExtension APIs and modern web technologies:
- Pure JavaScript for functionality
- CSS3 for styling
- Firefox WebExtension APIs for browser integration

## File Structure

- `manifest.json` - Extension configuration and permissions
- `popup.html` - Main extension popup interface
- `popup.css` - Styles for the popup interface
- `popup.js` - Popup functionality and user interactions
- `background.js` - Background script for managing jobs
- `content.js` - Content script for page interactions
- `content.css` - Styles injected into web pages

## Color Scheme

The extension uses a carefully selected color palette:
- Primary Blue: #57afeb
- Cyan: #57ebe9
- Mint: #57ebab
- Green: #57eb6e
- Yellow: #ebdd57
- Orange: #eb9f57
- Red: #eb6157
- Dark: #010300
- Light: #f3fef0

## Browser Compatibility

This extension is primarily developed for Firefox (version 109.0 or later) using the WebExtension API. Chrome compatibility may be added in future releases.