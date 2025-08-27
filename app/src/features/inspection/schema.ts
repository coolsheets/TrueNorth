export type Status = 'ok'|'warn'|'fail'|'na';
export type Item = { id: string; label: string };
export type Section = { name: string; slug: string; items: Item[] };

export const sections: Section[] = [
  { name: 'Vehicle Basics', slug: 'vehicle', items: [
    { id: 'vin', label: 'VIN verified matches docs' },
    { id: 'odo', label: 'Odometer (km) recorded' },
    { id: 'province', label: 'Province & AMVIC/OOP notes' }
  ]},
  { name: 'Exterior', slug: 'exterior', items: [
    { id: 'panels', label: 'Panels/gaps/paint match' },
    { id: 'glass', label: 'Windshield chips/cracks' },
    { id: 'lights', label: 'All exterior lights work' },
  ]},
  { name: 'Undercarriage & Rust (Canada)', slug: 'rust', items: [
    { id: 'frame', label: 'Frame rails/crossmembers rust' },
    { id: 'cab', label: 'Cab corners/rockers/bed supports' },
    { id: 'bumpers', label: 'Bumpers & mounts corrosion' }
  ]},
  { name: 'Engine Bay', slug: 'engine', items: [
    { id: 'leaks', label: 'Leaks (oil/coolant/trans)' },
    { id: 'belts', label: 'Belts/hoses condition' },
    { id: 'battery', label: 'Battery & terminals (CCA if avail.)' }
  ]},
  { name: 'Interior & Electronics', slug: 'interior', items: [
    { id: 'hvac', label: 'Heater/AC/defrost all modes' },
    { id: 'infotainment', label: 'Bluetooth/USB/controls' },
    { id: 'windows', label: 'Windows/mirrors/seats' }
  ]},
  { name: 'Road Test', slug: 'road', items: [
    { id: 'startup', label: 'Cold start smooth / no warning lights' },
    { id: 'drive', label: 'Shifts, acceleration, steering true' },
    { id: 'brakes', label: 'Straight stops / ABS ok' },
    { id: '4x4', label: '4H/4L engage (if applicable)' }
  ]},
  { name: 'Post-Drive', slug: 'post', items: [
    { id: 'leaks-hot', label: 'No fresh leaks after drive' },
    { id: 'odours', label: 'No burnt oil/coolant odour' },
    { id: 'restart', label: 'Hot restart quick' }
  ]}
];
