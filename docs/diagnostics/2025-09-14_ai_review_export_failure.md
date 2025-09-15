# AI Review and Export Failure Analysis - 2025-09-14

## 1. Executive Summary

The "Review export" feature is failing because of an inconsistency between two different local AI summary implementations. When the online AI service fails (likely due to the ongoing MongoDB connectivity issues), the system falls back to a local AI function from `app/src/features/inspection/utils/localAi.ts`. This function returns a raw markdown string.

However, the application, particularly the `normalizeAiSummary` function, expects a structured object like the one produced by the online API or the *correct* local AI implementation in `app/src/utils/localAiReview.ts`. Processing the incorrect string format leads to a malformed `summary` state, which then causes the export functionality to fail.

## 2. Root Cause Analysis

The core of the problem lies in the `Review.tsx` component, where two different `generateLocalAiReview` functions are being used incorrectly.

1.  **Incorrect Fallback Implementation:** In the `catch` block for the remote AI API call within `generateSummary`, the code mistakenly calls the wrong local AI function.
    *   **File:** [`app/src/features/inspection/pages/Review.tsx`](/home/mfretwell/Documents/Projects/TrueNorth/app/src/features/inspection/pages/Review.tsx)
    *   **Problem:** The `catch` block starting around line 188 calls `generateLocalAiReview` from `app/src/features/inspection/utils/localAi.ts`. This function returns a simple markdown `string`.
    *   **Consequence:** This string is passed to `setSummary`, which expects a structured `AiReviewResult` object. The subsequent logic, including the export feature, breaks because it tries to access properties like `summary.suggestedAdjustments` on a string.

2.  **Conflicting Local AI Functions:** The project contains two separate local AI utilities, which is the source of the confusion.
    *   `app/src/utils/localAiReview.ts`: This is the **correct** utility. It mimics the structure of the online API response, returning a full `AiReviewResult` object.
    *   `app/src/features/inspection/utils/localAi.ts`: This is the **incorrect** utility in this context. It appears to be an older or alternative implementation that only generates a markdown string.

The `generateSummary` function correctly uses the object-based `localAiReview` when `useLocalAi` is checked, but incorrectly uses the string-based one when the online API call fails.

## 3. Proposed Solution

To resolve this issue, we must ensure the application consistently uses the correct local AI implementation (`app/src/utils/localAiReview.ts`) that returns a structured object. This involves correcting the import and function call in the error handling logic of `Review.tsx`.

### Step 1: Remove the Incorrect Local AI Utility

The file `app/src/features/inspection/utils/localAi.ts` appears to be dead code or a remnant of a previous implementation. It should be deleted to prevent future confusion.

```bash
rm /home/mfretwell/Documents/Projects/TrueNorth/app/src/features/inspection/utils/localAi.ts
```

### Step 2: Correct the `Review.tsx` Component

Update `Review.tsx` to use the correct `generateLocalAiReview` from `app/src/utils/localAiReview.ts` in all scenarios (explicit local generation, offline mode, and as a fallback for API failure).

````typescript
// filepath: /home/mfretwell/Documents/Projects/TrueNorth/app/src/features/inspection/pages/Review.tsx
// ...existing code...
import { useNetworkState } from '../../../hooks/useNetworkState';
import { generateLocalAiReview } from '../../../utils/localAiReview';
import { AiReviewResult } from '../../../utils/localAiReview';

const getStatusText = (status: string) => {
// ...existing code...
// ...existing code...
    try {
      // Use local AI if offline or user selected local AI
      if (isOffline || useLocalAi) {
        // Use local AI implementation
        // Convert draft to expected format for localAiReview
// ...existing code...
        });
        
        const localSummary = generateLocalAiReview(vehicle, sections);
        setSummary(normalizeAiSummary(localSummary));
      } else {
        // Use remote AI service with local fallback
// ...existing code...
// ...existing code...
      if (!isOffline && !useLocalAi) {
        // If online API failed, try local AI as fallback
        try {
          setError("Online AI service unavailable. Using local AI as fallback.");
          
          // Convert draft to expected format for localAiReview
          const vehicle = {
            make: draft.vehicle.make || 'Unknown',
            model: draft.vehicle.model || 'Unknown',
            year: draft.vehicle.year || 0,
            vin: draft.vehicle.vin || 'Unknown',
            odo: draft.vehicle.odo || 0,
            ...draft.vehicle
          };
          
          // Convert sections to expected format for localAiReview
          const sections = draft.sections.map(section => {
            // Find the template section to get the name
            const templateSection = templateSections.find(ts => ts.slug === section.slug);
            return {
              name: templateSection?.name || section.slug,
              slug: section.slug,
              items: section.items
            };
          });
          
          const localSummary = generateLocalAiReview(vehicle, sections);
          setSummary(normalizeAiSummary(localSummary));
        } catch (localErr) {
          console.error("Local AI fallback failed:", localErr);
          setError("Failed to generate AI summary. Server might be unavailable.");
// ...existing code...
````

By making these changes, the application will gracefully fall back to the local AI and produce the correctly structured data, which will resolve the failure in the "Review export" feature. This also aligns with the best practices outlined in your `AI_ASSISTANT_CONFIG.md` by ensuring proper offline fallbacks.