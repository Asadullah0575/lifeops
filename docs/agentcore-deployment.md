# AgentCore Runtime Deployment Notes

## Tooling
Use the AgentCore CLI (`@aws/agentcore`), not the older Python `bedrock-agentcore-starter-toolkit`,
which is now marked legacy. Also needs AWS CDK and `uv` installed.

    npm install -g aws-cdk @aws/agentcore
    curl -LsSf https://astral.sh/uv/install.sh | sh

## Setup
    cdk bootstrap aws://<ACCOUNT_ID>/us-east-1
    agentcore create --name lifeopsAgent --framework Strands --protocol HTTP \
      --model-provider Bedrock --memory none --build CodeZip

## Known gotcha: IAM permissions
`agentcore create` auto-generates an execution role that can call Bedrock, but it has
NO access to your own S3 buckets or DynamoDB tables by default. First deploy will pass,
but any invoke touching S3/DynamoDB fails with a 403 AccessDenied that only shows up
in CloudWatch, not in the CLI output. Fix: attach a policy to the generated execution
role (find it via `aws iam list-roles`, look for `AgentCore-<project>-...`) granting
the specific S3/DynamoDB actions and resource ARNs needed. No redeploy required,
IAM changes apply immediately.

## Debugging logs
The AWS CLI installed via pip defaulted to v1, which has no `logs tail` command.
Use `filter-log-events` instead against the log group
`/aws/bedrock-agentcore/runtimes/<agent>-DEFAULT`.

## Deploy / invoke / status
    agentcore deploy
    agentcore invoke '{"document_id": "receipt-001"}'
    agentcore status

## Known limitation: sequential processing
The API currently processes one upload at a time. Concurrent requests queue
rather than running in parallel, confirmed by timing two simultaneous uploads,
which took roughly the sum of both individually rather than overlapping. No
data crossed between them, safe for single-user demo use. Would need an
async rewrite of run_workflow to support true concurrency, out of scope
before the deadline.
