/**
 * Utility functions for VIN decoding and vehicle information
 */

interface VinDecodingResponse {
  success: boolean;
  error?: string;
  data?: {
    year: string;
    make: string;
    model: string;
    trim?: string;
    engine?: string;
    transmission?: string;
    bodyType?: string;
    drivetrain?: string;
    // Additional vehicle details
    manufacturer?: string;
    displacement?: string;
    fuelType?: string;
    cylinderCount?: string;
    horsePower?: string;
    cabType?: string;
    gvwr?: string;
    plantInfo?: string;
    airbagLocations?: string;
    brakeSystemType?: string;
    tpmsType?: string;
  };
}

/**
 * Decode a Vehicle Identification Number (VIN) to get vehicle details
 * 
 * This uses a public VIN decoder API
 * 
 * @param vin The Vehicle Identification Number
 * @returns Information about the vehicle
 */
export async function decodeVin(vin: string): Promise<VinDecodingResponse> {
  if (!vin || vin.length !== 17) {
    return {
      success: false,
      error: 'VIN must be 17 characters'
    };
  }

  try {
    // First try the NHTSA API which is free and reliable
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    const response = await fetch(nhtsaUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from NHTSA API');
    }
    
    const result = await response.json();
    
    if (!result.Results || !Array.isArray(result.Results)) {
      throw new Error('Invalid response format from NHTSA API');
    }
    
    // Extract relevant info from NHTSA response
    const getResultValue = (variableName: string) => {
      const item = result.Results.find((r: any) => r.Variable === variableName);
      return item && item.Value !== 'Not Applicable' ? item.Value : '';
    };
    
    const year = getResultValue('Model Year');
    const make = getResultValue('Make');
    const model = getResultValue('Model');
    const trim = getResultValue('Trim');
    const engine = getResultValue('Engine Configuration');
    const transmission = getResultValue('Transmission Style');
    const bodyType = getResultValue('Body Class');
    const drivetrain = getResultValue('Drive Type');
    
    // If we have at least the basic info, return it
    if (year && make && model) {
      return {
        success: true,
        data: {
          year,
          make,
          model,
          trim,
          engine,
          transmission,
          bodyType,
          drivetrain,
          // Additional data fields
          manufacturer: getResultValue('Manufacturer Name'),
          displacement: getResultValue('Displacement (L)'),
          fuelType: getResultValue('Fuel Type - Primary'),
          cylinderCount: getResultValue('Engine Number of Cylinders'),
          horsePower: getResultValue('Engine Brake (hp) From'),
          cabType: getResultValue('Cab Type'),
          gvwr: getResultValue('Gross Vehicle Weight Rating From'),
          plantInfo: `${getResultValue('Plant City')}, ${getResultValue('Plant State')}, ${getResultValue('Plant Country')}`.replace(/, ,/g, ''),
          airbagLocations: [
            getResultValue('Front Air Bag Locations'), 
            getResultValue('Side Air Bag Locations')
          ].filter(Boolean).join(', '),
          brakeSystemType: getResultValue('Brake System Type'),
          tpmsType: getResultValue('Tire Pressure Monitoring System (TPMS) Type'),
        }
      };
    } else {
      throw new Error('Could not extract basic vehicle info from VIN');
    }
  } catch (error) {
    console.error('Error decoding VIN:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Validates a Vehicle Identification Number (VIN)
 * 
 * @param vin The VIN to validate
 * @returns True if the VIN is valid, false otherwise
 */
export function validateVin(vin: string): boolean {
  // Basic validation - must be 17 characters and contain only alphanumeric characters
  // excluding I, O, and Q (which are not used in VINs to avoid confusion)
  if (!vin || vin.length !== 17) {
    return false;
  }
  
  const validVinPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return validVinPattern.test(vin);
}
