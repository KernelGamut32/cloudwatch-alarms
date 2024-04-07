import { Construct } from 'constructs';
import { v4 as uuid } from 'uuid';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

export class TopSecretBucketCreator extends Construct {
    public bucket: s3.Bucket;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.bucket = new s3.Bucket(this, id, {
            bucketName: `top-secret-bucket-${uuid()}`,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
            removalPolicy: RemovalPolicy.RETAIN,
        });
    }
}
