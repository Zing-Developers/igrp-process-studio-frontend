import assert from 'node:assert/strict';
import test from 'node:test';
import { convertActivitiToCamunda, convertBpmnEngine, convertCamundaToActiviti } from './utils.ts';

const definitions = (task) =>
  `<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" ` +
  `xmlns:camunda="http://camunda.org/schema/1.0/bpmn" ` +
  `xmlns:activiti="http://activiti.org/bpmn">${task}</bpmn2:definitions>`;

test('collapses both service task async flags into one Activiti attribute', () => {
  const xml = definitions(
    '<bpmn2:serviceTask id="Activity_0az1emc" camunda:asyncBefore="true" camunda:asyncAfter="true" camunda:delegateExpression="${igrpWebhookDelegate}" />',
  );

  const result = convertCamundaToActiviti(xml);

  assert.match(result, /<bpmn2:serviceTask\b[^>]*activiti:async="true"/);
  assert.equal((result.match(/activiti:async=/g) ?? []).length, 1);
  assert.doesNotMatch(result, /(?:camunda|activiti):async(?:Before|After)=/);
  assert.match(result, /activiti:delegateExpression="\$\{igrpWebhookDelegate\}"/);
});

test('uses true if either service task flag is true and removes an existing async value', () => {
  const xml = definitions(
    '<bpmn2:serviceTask camunda:asyncBefore="false" camunda:asyncAfter="true" activiti:async="false" />',
  );

  const result = convertCamundaToActiviti(xml);

  assert.equal((result.match(/activiti:async="true"/g) ?? []).length, 1);
  assert.doesNotMatch(result, /activiti:async="false"/);
});

test('converts either service task flag when it appears alone', () => {
  for (const attribute of ['asyncBefore', 'asyncAfter']) {
    const result = convertCamundaToActiviti(
      definitions(`<bpmn2:serviceTask camunda:${attribute}="true" />`),
    );

    assert.match(result, /<bpmn2:serviceTask\b[^>]*activiti:async="true"/);
    assert.equal((result.match(/activiti:async=/g) ?? []).length, 1);
  }
});

test('preserves false and limits the async collapse to bpmn2 service tasks', () => {
  const xml = definitions(
    '<bpmn2:serviceTask camunda:asyncBefore="false" camunda:asyncAfter="false" />' +
      '<bpmn2:userTask camunda:asyncBefore="true" />',
  );

  const result = convertCamundaToActiviti(xml);

  assert.match(result, /<bpmn2:serviceTask\b[^>]*activiti:async="false"/);
  assert.match(result, /<bpmn2:userTask\b[^>]*activiti:asyncBefore="true"/);
});

test('repeated conversion preserves standalone Activiti attributes', () => {
  const xml = definitions(
    '<bpmn2:serviceTask camunda:delegateExpression="worker" />' +
      '<bpmn2:serviceTask activiti:expression="${notify()}" activiti:resultVariable="result" />',
  );
  const once = convertCamundaToActiviti(xml);

  assert.equal(convertCamundaToActiviti(once), once);
  assert.match(once, /activiti:delegateExpression="worker"/);
  assert.match(once, /activiti:expression="\$\{notify\(\)\}"/);
  assert.match(once, /activiti:resultVariable="result"/);
});

test('resolves duplicate attributes on each element and keeps the Camunda value', () => {
  const xml = definitions(
    '<bpmn2:serviceTask camunda:exclusive="false" activiti:exclusive="true" ' +
      'camunda:delegateExpression="newWorker" activiti:delegateExpression="oldWorker" />' +
      '<bpmn2:userTask activiti:exclusive="true" />',
  );
  const once = convertCamundaToActiviti(xml);

  assert.match(once, /<bpmn2:serviceTask\b[^>]*activiti:exclusive="false"/);
  assert.match(once, /<bpmn2:serviceTask\b[^>]*activiti:delegateExpression="newWorker"/);
  assert.doesNotMatch(once, /oldWorker/);
  assert.equal((once.match(/activiti:exclusive=/g) ?? []).length, 2);
  assert.equal((once.match(/activiti:delegateExpression=/g) ?? []).length, 1);
  assert.equal(convertCamundaToActiviti(once), once);
});

test('preserves quoted attribute values, comments, and CDATA', () => {
  const xml = definitions(
    '<!-- <bpmn2:serviceTask camunda:asyncBefore="true" /> -->' +
      '<bpmn2:userTask name="set camunda:asyncBefore=\'true\' later" ' +
      'camunda:exclusive="false" activiti:exclusive="true" />' +
      '<![CDATA[<bpmn2:serviceTask camunda:asyncAfter="true" />]]>',
  );
  const once = convertCamundaToActiviti(xml);

  assert.match(once, /name="set camunda:asyncBefore='true' later"/);
  assert.match(once, /<!-- <bpmn2:serviceTask camunda:asyncBefore="true" \/> -->/);
  assert.match(once, /<!\[CDATA\[<bpmn2:serviceTask camunda:asyncAfter="true" \/>\]\]>/);
  assert.equal((once.match(/activiti:exclusive=/g) ?? []).length, 1);
  assert.equal(convertCamundaToActiviti(once), once);
});

test('keeps one namespace declaration with single-quoted XML attributes', () => {
  const xml =
    "<bpmn2:definitions xmlns:bpmn2='http://www.omg.org/spec/BPMN/20100524/MODEL' " +
    "xmlns:camunda='http://camunda.org/schema/1.0/bpmn' " +
    "xmlns:activiti='http://activiti.org/bpmn'><bpmn2:serviceTask camunda:asyncBefore='true' /></bpmn2:definitions>";
  const once = convertCamundaToActiviti(xml);

  assert.equal((once.match(/xmlns:activiti=/g) ?? []).length, 1);
  assert.doesNotMatch(once, /xmlns:camunda=/);
  assert.match(once, /activiti:async="true"/);
  assert.equal(convertCamundaToActiviti(once), once);
});

test('reverse conversion is repeatable and resolves attribute conflicts', () => {
  const xml =
    '<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
    'xmlns:activiti="http://activiti.org/bpmn" xmlns:camunda="http://camunda.org/schema/1.0/bpmn">' +
    '<bpmn2:serviceTask activiti:delegateExpression="worker" camunda:delegateExpression="oldWorker" />' +
    '</bpmn2:definitions>';
  const once = convertActivitiToCamunda(xml);

  assert.equal((once.match(/camunda:delegateExpression=/g) ?? []).length, 1);
  assert.match(once, /camunda:delegateExpression="worker"/);
  assert.equal(convertActivitiToCamunda(once), once);
});

test('engine wrapper normalizes mixed attributes even when the target namespace exists', () => {
  const xml = definitions('<bpmn2:serviceTask camunda:exclusive="false" activiti:exclusive="true" />');
  const result = convertBpmnEngine(xml, 'camunda');

  assert.equal((result.match(/camunda:exclusive=/g) ?? []).length, 1);
  assert.match(result, /camunda:exclusive="true"/);
  assert.equal(convertBpmnEngine(result, 'camunda'), result);
});

test('an editor round trip does not create another async attribute', () => {
  const xml = definitions(
    '<bpmn2:serviceTask camunda:asyncBefore="true" camunda:asyncAfter="false" />',
  );
  const deployed = convertCamundaToActiviti(xml);
  const reopened = convertActivitiToCamunda(deployed);
  const redeployed = convertCamundaToActiviti(reopened);

  assert.equal(redeployed, deployed);
  assert.equal((redeployed.match(/activiti:async=/g) ?? []).length, 1);
});
