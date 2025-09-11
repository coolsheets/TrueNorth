// Local fallback for AI API

/**
 * Generate a local inspection summary when the remote AI service is unavailable
 * @param vehicle The vehicle data
 * @param sections The inspection sections
 * @returns A locally generated summary
 */
export function generateLocalAiReview(
  vehicle: any, 
  sections: any[]
): string {
  // Extract key information
  const { year, make, model, vin, odo: mileage } = vehicle;
  
  // Count issues by severity
  const issues = {
    critical: 0,
    major: 0,
    minor: 0,
    good: 0,
    total: 0
  };
  
  // Process sections to count issues
  sections.forEach(section => {
    section.items.forEach((item: {condition?: string}) => {
      issues.total++;
      
      if (item.condition === 'critical' || item.condition === 'fail') {
        issues.critical++;
      } else if (item.condition === 'major' || item.condition === 'warn') {
        issues.major++;
      } else if (item.condition === 'minor') {
        issues.minor++;
      } else if (item.condition === 'good' || item.condition === 'ok') {
        issues.good++;
      }
    });
  });
  
  // Generate the summary
  const summary = `
# Inspection Summary for ${year} ${make} ${model}

VIN: ${vin}
Mileage: ${mileage.toLocaleString()} miles

## Overall Assessment

This ${year} ${make} ${model} was inspected and has the following condition overview:

- **Critical issues**: ${issues.critical}
- **Major issues**: ${issues.major}
- **Minor issues**: ${issues.minor}
- **Good condition items**: ${issues.good}

${generateOverallVerdict(issues)}

## Key Areas Inspected

${sections.map(section => `- ${section.title}`).join('\n')}

---

*This report was generated automatically based on the inspection data. For detailed findings, please refer to the full inspection report.*

*Generated using the local AI service as the remote service was unavailable.*
`;

  return summary;
}

/**
 * Generate an overall verdict based on the issues found
 */
function generateOverallVerdict(issues: { critical: number, major: number, minor: number, good: number }): string {
  if (issues.critical > 0) {
    return "⚠️ **CRITICAL ISSUES FOUND**: This vehicle has critical issues that require immediate attention. We recommend addressing these issues before purchase consideration.";
  } else if (issues.major > 2) {
    return "⚠️ **SIGNIFICANT CONCERNS**: This vehicle has several major issues that should be carefully considered before purchase.";
  } else if (issues.major > 0) {
    return "⚠️ **SOME CONCERNS**: This vehicle has a few issues that may require attention but could be addressed with regular maintenance.";
  } else if (issues.minor > 3) {
    return "✓ **GENERALLY GOOD**: This vehicle is in generally good condition with some minor issues noted.";
  } else {
    return "✓ **EXCELLENT CONDITION**: This vehicle appears to be in excellent condition with minimal issues detected.";
  }
}
