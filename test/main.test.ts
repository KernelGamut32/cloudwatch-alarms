import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CloudWatchAlarmsStack } from '../src/main';

test('Snapshot', () => {
  const app = new App();
  const stack = new CloudWatchAlarmsStack(app, 'test');

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});