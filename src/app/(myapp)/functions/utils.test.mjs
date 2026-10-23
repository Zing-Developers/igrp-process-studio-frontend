import assert from 'node:assert/strict';
import test from 'node:test';
import { convertCamundaToActiviti } from './utils.ts';

const definitions = (task) =>
  `<bpmn2:definitions xmlns:camunda="http://camunda.org/schema/1.0/bpmn">${task}</bpmn2:definitions>`;

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
