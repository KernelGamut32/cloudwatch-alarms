import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Duration } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudWatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudWatchAction from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cloudTrail from 'aws-cdk-lib/aws-cloudtrail';

export class MonitoringResourcesCreator extends Construct {
    constructor(scope: Construct, id: string, snsTopic: sns.ITopic, bucket: s3.Bucket) {
        super(scope, id);

        const logGroup = this.configureMetricFilterWithAlarm(id, snsTopic, bucket);
        this.configureCloudTrail(id, logGroup, bucket);
    }

    private configureMetricFilterWithAlarm(id: string, snsTopic: sns.ITopic, bucket: s3.Bucket): logs.LogGroup{
        const logGroup = new logs.LogGroup(this, `LogGroup-${id}`, {
            logGroupName: 'aws-cloudtrail-logs',
        });
        logGroup.addMetricFilter(`MetricFilter-${id}`, {
            filterPattern: { logPatternString: '{ ($.eventSource = s3.amazonaws.com) && (($.eventName = PutObject) || ($.eventName = GetObject)) }' },
            metricNamespace: 'MetricFilters',
            metricName: 'MetricFilters',
            metricValue: '1',
        }).metric({
            statistic: cloudWatch.Stats.AVERAGE,
            period: Duration.minutes(5),
            label: 'AccessS3BucketMetric',
        }).createAlarm(this, `Alarm-${id}`, {
            alarmName: 'AccessS3BucketAlarm',
            alarmDescription: `
            # Warning!
            
            An attempt to access a **top secret** data repository was observed (${bucket.bucketName}). Please investigate!!
            `,
            actionsEnabled: true,
            evaluationPeriods: 1,
            datapointsToAlarm: 1,
            threshold: 1,
            comparisonOperator: cloudWatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: cloudWatch.TreatMissingData.MISSING,
        }).addAlarmAction(new cloudWatchAction.SnsAction(snsTopic));
        return logGroup;
    }

    private configureCloudTrail(id: string, logGroup: logs.LogGroup, bucket: s3.Bucket) {
        const role = new iam.Role(this, `CloudTrailRole-${id}`, {
            assumedBy: new iam.ServicePrincipal('cloudtrail.amazonaws.com'),
        });
        new iam.ManagedPolicy(this, `CloudTrailPolicy-${id}`, {
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'logs:CreateLogStream',
                        'logs:PutLogEvents',
                    ],
                    resources: [logGroup.logGroupArn],
                }),
            ],
            roles: [role],
        });
        new cloudTrail.Trail(this, `CloudTrail-${id}`, {
            enableFileValidation: true,
            includeGlobalServiceEvents: true,
            isMultiRegionTrail: true,
            sendToCloudWatchLogs: true,
            cloudWatchLogGroup: logGroup,
        }).addS3EventSelector([{
            bucket,
        }]); 
    }
}
