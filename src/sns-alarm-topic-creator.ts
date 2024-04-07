import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';

export class SnsAlarmTopicCreator extends Construct {
    public topic: sns.Topic;

    constructor(scope: Construct, id: string, emailAddress: string) {
        super(scope, id);

        this.topic = new sns.Topic(this, id, {
            topicName: 'MetricFilter_Alarm_Topic',
        });
        new sns.Subscription(this, `SNSSubscription-${id}`, {
            topic: this.topic,
            endpoint: emailAddress,
            protocol: sns.SubscriptionProtocol.EMAIL,
            region: process.env.CDK_DEFAULT_REGION,
        });
    }
}
