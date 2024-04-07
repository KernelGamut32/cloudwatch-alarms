import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TopSecretBucketCreator } from './topsecret-bucket-creator';
import { MonitoringResourcesCreator } from './monitoring-resources-creator';
import { SnsAlarmTopicCreator } from './sns-alarm-topic-creator';

export class CloudWatchAlarmsStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const bucket = new TopSecretBucketCreator(this, 'TopSecretBucket');
    const snsTopic = new SnsAlarmTopicCreator(this, 'SnsAlarmTopic', app.node.tryGetContext('emailAddress')).topic;
    new MonitoringResourcesCreator(this, 'MonitoringResources', snsTopic, bucket.bucket);
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new CloudWatchAlarmsStack(app, 'cloudwatch-alarms-dev', { env: devEnv });
// new CloudWatchAlarmsStack(app, 'cloudwatch-alarms-prod', { env: prodEnv });

app.synth();