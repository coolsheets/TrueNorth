# AI Inspection Summary Feature

## Description
This pull request adds AI-powered features to the vehicle inspection process, enhancing the value of inspection reports for users. It implements both server-based AI using OpenAI and a local fallback option for offline usage.

## Features Added
- **AI Inspection Summary**: Analyzes inspection data to provide a comprehensive review of the vehicle's condition
- **Offline Support**: Added local AI implementation that works without internet connection
- **PDF Report Integration**: AI summaries can be included in generated PDF reports
- **Red/Yellow/Green Flags**: Categorizes issues by severity for better decision-making
- **Repair Cost Estimates**: Provides estimated repair costs in CAD
- **Negotiation Suggestions**: Offers advice for price negotiations based on inspection findings

## Implementation Details
- Added OpenAI integration on the server side with GPT-4o-mini model
- Created `/api/ai/summarize` endpoint to generate comprehensive summaries
- Implemented `localAiReview.ts` utility for offline inspection analysis
- Updated Export and Review components to support AI summaries
- Added options to include/exclude AI summary in PDF reports
- Ensured proper error handling for both online and offline modes

## Technical Considerations
- The server requires an OpenAI API key configured in environment variables
- Added proper error handling to gracefully fall back to local AI when online services are unavailable
- Optimized for offline-first PWA operation with graceful degradation
- Added toggle switch to let users choose between online AI (more detailed) and local AI

## Testing
- Tested in both online and offline modes
- Verified PDF generation with AI summary sections
- Confirmed local AI fallback works correctly when offline
- Ensured the app handles API failures gracefully

## Screenshots
![AI Summary on Review Screen](image.png)

## Dependencies
- Added `openai` v4.55.0 to server dependencies

## Future Improvements
- Add more fine-tuned AI models specific to vehicle inspections
- Implement offer letter generation based on findings
- Enhance local AI with more sophisticated analysis
