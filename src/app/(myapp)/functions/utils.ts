/**
 * Utility functions for BPMN XML conversion between Camunda and Activiti formats
 */

type XmlAttribute = {
  name: string;
  value: string;
  start: number;
  nameStart: number;
  nameEnd: number;
  valueStart: number;
  valueEnd: number;
  end: number;
};

function parseOpeningTag(tag: string) {
  const element = /^<([A-Za-z_][\w:.-]*)/.exec(tag);
  if (!element) return null;

  const attributes: XmlAttribute[] = [];
  let position = element[0].length;
  while (position < tag.length) {
    const start = position;
    while (/\s/.test(tag[position] ?? '')) position++;
    if (tag[position] === '>' || tag[position] === '/') break;

    const nameStart = position;
    while (position < tag.length && !/[\s=/>]/.test(tag[position])) position++;
    const nameEnd = position;
    if (nameStart === nameEnd) return null;
    while (/\s/.test(tag[position] ?? '')) position++;
    if (tag[position++] !== '=') return null;
    while (/\s/.test(tag[position] ?? '')) position++;

    const quote = tag[position++];
    if (quote !== '"' && quote !== "'") return null;
    const valueStart = position;
    const valueEnd = tag.indexOf(quote, valueStart);
    if (valueEnd === -1) return null;
    position = valueEnd + 1;
    attributes.push({
      name: tag.slice(nameStart, nameEnd),
      value: tag.slice(valueStart, valueEnd),
      start,
      nameStart,
      nameEnd,
      valueStart,
      valueEnd,
      end: position,
    });
  }
  return { name: element[1], nameEnd: element[0].length, attributes };
}

function convertOpeningTag(tag: string, source: 'camunda' | 'activiti', target: 'camunda' | 'activiti') {
  const parsed = parseOpeningTag(tag);
  if (!parsed) return tag;

  const sourceNamespace = `xmlns:${source}`;
  const targetNamespace = `xmlns:${target}`;
  const targetUri = target === 'activiti' ? 'http://activiti.org/bpmn' : 'http://camunda.org/schema/1.0/bpmn';
  const sourcePrefix = `${source}:`;
  const sourceAsync = parsed.attributes.filter(
    ({ name }) => name === 'camunda:asyncBefore' || name === 'camunda:asyncAfter' || name === 'camunda:async',
  );
  const hasBeforeOrAfter = sourceAsync.some(
    ({ name }) => name === 'camunda:asyncBefore' || name === 'camunda:asyncAfter',
  );
  // Preserve the existing service-task rule, including its true-if-either-is-true behavior.
  const collapseAsync =
    source === 'camunda' &&
    parsed.name === 'bpmn2:serviceTask' &&
    hasBeforeOrAfter &&
    sourceAsync.every(({ value }) => value === 'true' || value === 'false');
  const asyncValue = sourceAsync.some(({ value }) => value === 'true') ? 'true' : 'false';

  const converted = parsed.attributes.map((attribute) => {
    const { name } = attribute;
    const dropForAsync =
      collapseAsync &&
      (name === 'camunda:asyncBefore' || name === 'camunda:asyncAfter' || name === 'camunda:async' || name === 'activiti:async');
    const mappedName =
      name === sourceNamespace
        ? targetNamespace
        : name.startsWith(sourcePrefix)
          ? `${target}:${name.slice(sourcePrefix.length)}`
          : name;
    return {
      attribute,
      name: mappedName,
      value: name === sourceNamespace ? targetUri : attribute.value,
      priority: name === targetNamespace ? 3 : name === sourceNamespace || name.startsWith(sourcePrefix) ? 2 : 1,
      dropForAsync,
    };
  });

  // Resolve collisions on this element only. The source value wins, except for
  // a namespace declaration that already exists for the target prefix.
  const winners = new Map<string, number>();
  converted.forEach((entry, index) => {
    if (entry.dropForAsync) return;
    const previous = winners.get(entry.name);
    if (previous === undefined || entry.priority > converted[previous].priority) winners.set(entry.name, index);
  });

  const elementName = parsed.name.startsWith(sourcePrefix)
    ? `${target}:${parsed.name.slice(sourcePrefix.length)}`
    : parsed.name;
  let result = `<${elementName}`;
  let cursor = parsed.nameEnd;
  converted.forEach(({ attribute, name, value }, index) => {
    result += tag.slice(cursor, attribute.start);
    if (winners.get(name) === index) {
      result +=
        tag.slice(attribute.start, attribute.nameStart) +
        name +
        tag.slice(attribute.nameEnd, attribute.valueStart) +
        value +
        tag.slice(attribute.valueEnd, attribute.end);
    }
    cursor = attribute.end;
  });
  result += tag.slice(cursor);
  if (collapseAsync) result = result.replace(/(\s*\/?>)$/, ` activiti:async="${asyncValue}"$1`);
  return result;
}

function findMarkupEnd(xml: string, start: number): number {
  let quote: string | null = null;
  let brackets = 0;
  const isDoctype = xml.startsWith('<!DOCTYPE', start);
  for (let index = start + 1; index < xml.length; index++) {
    const char = xml[index];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (isDoctype && char === '[') {
      brackets++;
    } else if (isDoctype && char === ']' && brackets > 0) {
      brackets--;
    } else if (char === '>' && brackets === 0) {
      return index;
    }
  }
  return -1;
}

function convertXml(xml: string, source: 'camunda' | 'activiti', target: 'camunda' | 'activiti'): string {
  if (!xml || typeof xml !== 'string') return xml;

  let result = '';
  let cursor = 0;
  while (cursor < xml.length) {
    const start = xml.indexOf('<', cursor);
    if (start === -1) return result + xml.slice(cursor);
    result += xml.slice(cursor, start);

    const comment = xml.startsWith('<!--', start);
    const cdata = xml.startsWith('<![CDATA[', start);
    const specialEnd = comment
      ? xml.indexOf('-->', start + 4)
      : cdata
        ? xml.indexOf(']]>', start + 9)
        : -1;
    if (comment || cdata) {
      if (specialEnd === -1) return result + xml.slice(start);
      cursor = specialEnd + 3;
      result += xml.slice(start, cursor);
      continue;
    }

    const end = findMarkupEnd(xml, start);
    if (end === -1) return result + xml.slice(start);
    const tag = xml.slice(start, end + 1);
    result += tag.startsWith(`</${source}:`)
      ? `</${target}:${tag.slice(source.length + 3)}`
      : convertOpeningTag(tag, source, target);
    cursor = end + 1;
  }
  return result;
}

/**
 * Converts Camunda BPMN XML to Activiti format
 * @param xml - The BPMN XML string
 * @returns Converted XML string with Activiti namespace and attributes
 */
export function convertCamundaToActiviti(xml: string): string {
  return convertXml(xml, 'camunda', 'activiti');
}

/**
 * Converts Activiti BPMN XML to Camunda format (reverse function)
 * @param xml - The BPMN XML string
 * @returns Converted XML string with Camunda namespace and attributes
 */
export function convertActivitiToCamunda(xml: string): string {
  return convertXml(xml, 'activiti', 'camunda');
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
  if (targetEngine === 'activiti') {
    return convertCamundaToActiviti(xml);
  } else {
    return convertActivitiToCamunda(xml);
  }
}

