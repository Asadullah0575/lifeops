import json
import uuid
import boto3

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
processed_table = dynamodb.Table("lifeops-processed-events")

agentcore_client = boto3.client("bedrock-agentcore", region_name="us-east-1")
AGENT_ARN = "arn:aws:bedrock-agentcore:us-east-1:210288271673:runtime/lifeopsAgent_lifeopsAgent-LN65dx7Y64"


def handler(event, context):
    for record in event["Records"]:
        key = record["s3"]["object"]["key"]
        document_id = key.split("/", 1)[1] if "/" in key else key

        try:
            processed_table.put_item(
                Item={"document_id": document_id},
                ConditionExpression="attribute_not_exists(document_id)",
            )
        except Exception as e:
            if "ConditionalCheckFailedException" in str(e):
                print(f"Skipping {document_id}, already processed")
                continue
            raise

        payload = json.dumps({"document_id": document_id}).encode()
        response = agentcore_client.invoke_agent_runtime(
            agentRuntimeArn=AGENT_ARN,
            runtimeSessionId=str(uuid.uuid4()),
            payload=payload,
            qualifier="DEFAULT",
        )
        content = [chunk.decode("utf-8") for chunk in response.get("response", [])]
        print("Agent response:", "".join(content))

    return {"statusCode": 200}
