/**
 * Utility functions for BPMN XML conversion between Camunda and Activiti formats
 */

/**
 * Converts Camunda BPMN XML to Activiti format
 * @param xml - The BPMN XML string
 * @returns Converted XML string with Activiti namespace and attributes
 */
export function convertCamundaToActiviti(xml: string): string {
  if (!xml || typeof xml !== 'string') {
    return xml;
  }

  let convertedXml = xml;

  // Check if XML already has Activiti namespace to avoid duplicates
  const hasActivitiNamespace = convertedXml.includes('xmlns:activiti=');
  
  // Only replace Camunda namespace if Activiti namespace doesn't exist
  if (!hasActivitiNamespace) {
    convertedXml = convertedXml.replace(
      /xmlns:camunda="http:\/\/camunda\.org\/schema\/1\.0\/bpmn"/g,
      'xmlns:activiti="http://activiti.org/bpmn"'
    );
  } else {
    // If Activiti namespace already exists, just remove the Camunda namespace
    convertedXml = convertedXml.replace(
      /xmlns:camunda="http:\/\/camunda\.org\/schema\/1\.0\/bpmn"/g,
      ''
    );
  }

  // Handle duplicate attributes by removing existing activiti attributes before converting camunda ones
  // This prevents duplicate attribute errors
  convertedXml = convertedXml.replace(
    /(\s+activiti:delegateExpression="[^"]*")/g,
    '' // Remove existing activiti:delegateExpression attributes
  );
  
  convertedXml = convertedXml.replace(
    /(\s+activiti:expression="[^"]*")/g,
    '' // Remove existing activiti:expression attributes
  );
  
  convertedXml = convertedXml.replace(
    /(\s+activiti:resultVariable="[^"]*")/g,
    '' // Remove existing activiti:resultVariable attributes
  );

  // Replace all camunda: attributes with activiti: attributes
  convertedXml = convertedXml.replace(/camunda:/g, 'activiti:');

  // Replace Camunda-specific elements with Activiti equivalents
  convertedXml = convertedXml.replace(
    /<camunda:([^>]+)>/g,
    '<activiti:$1>'
  );
  convertedXml = convertedXml.replace(
    /<\/camunda:([^>]+)>/g,
    '</activiti:$1>'
  );

  return convertedXml;
}

/**
 * Converts Activiti BPMN XML to Camunda format (reverse function)
 * @param xml - The BPMN XML string
 * @returns Converted XML string with Camunda namespace and attributes
 */
export function convertActivitiToCamunda(xml: string): string {
  if (!xml || typeof xml !== 'string') {
    return xml;
  }

  let convertedXml = xml;

  // Check if XML already has Camunda namespace to avoid duplicates
  const hasCamundaNamespace = convertedXml.includes('xmlns:camunda=');
  
  // Only replace Activiti namespace if Camunda namespace doesn't exist
  if (!hasCamundaNamespace) {
    convertedXml = convertedXml.replace(
      /xmlns:activiti="http:\/\/activiti\.org\/bpmn"/g,
      'xmlns:camunda="http://camunda.org/schema/1.0/bpmn"'
    );
  } else {
    // If Camunda namespace already exists, just remove the Activiti namespace
    convertedXml = convertedXml.replace(
      /xmlns:activiti="http:\/\/activiti\.org\/bpmn"/g,
      ''
    );
  }

  // Handle duplicate attributes by removing existing camunda attributes before converting activiti ones
  // This prevents duplicate attribute errors
  convertedXml = convertedXml.replace(
    /(\s+camunda:delegateExpression="[^"]*")/g,
    '' // Remove existing camunda:delegateExpression attributes
  );
  
  convertedXml = convertedXml.replace(
    /(\s+camunda:expression="[^"]*")/g,
    '' // Remove existing camunda:expression attributes
  );
  
  convertedXml = convertedXml.replace(
    /(\s+camunda:resultVariable="[^"]*")/g,
    '' // Remove existing camunda:resultVariable attributes
  );

  // Replace all activiti: attributes with camunda: attributes
  convertedXml = convertedXml.replace(/activiti:/g, 'camunda:');

  // Replace Activiti-specific elements with Camunda equivalents
  convertedXml = convertedXml.replace(
    /<activiti:([^>]+)>/g,
    '<camunda:$1>'
  );
  convertedXml = convertedXml.replace(
    /<\/activiti:([^>]+)>/g,
    '</camunda:$1>'
  );

  return convertedXml;
}

/**
 * Detects if the BPMN XML contains Camunda or Activiti namespace
 * @param xml - The BPMN XML string
 * @returns 'camunda' | 'activiti' | 'unknown'
 */
export function detectBpmnEngine(xml: string): 'camunda' | 'activiti' | 'unknown' {
  if (!xml || typeof xml !== 'string') {
    return 'unknown';
  }

  if (xml.includes('xmlns:camunda=')) {
    return 'camunda';
  }

  if (xml.includes('xmlns:activiti=')) {
    return 'activiti';
  }

  return 'unknown';
}

/**
 * Converts BPMN XML between Camunda and Activiti formats based on current format
 * @param xml - The BPMN XML string
 * @param targetEngine - The target engine format ('camunda' | 'activiti')
 * @returns Converted XML string
 */
export function convertBpmnEngine(xml: string, targetEngine: 'camunda' | 'activiti'): string {
  const currentEngine = detectBpmnEngine(xml);
  
  if (currentEngine === targetEngine) {
    return xml; // No conversion needed
  }
  
  if (targetEngine === 'activiti') {
    return convertCamundaToActiviti(xml);
  } else {
    return convertActivitiToCamunda(xml);
  }
}

