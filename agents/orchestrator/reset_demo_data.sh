#!/bin/bash
set -e

echo "Clearing all tables..."
for table in lifeops-tasks lifeops-reminders lifeops-approvals lifeops-actions lifeops-documents; do
  key_field=$(aws dynamodb describe-table --table-name "$table" --region us-east-1 --query "Table.KeySchema[0].AttributeName" --output text)
  for id in $(aws dynamodb scan --table-name "$table" --region us-east-1 --query "Items[].${key_field}.S" --output text); do
    aws dynamodb delete-item --table-name "$table" --key "{\"${key_field}\":{\"S\":\"$id\"}}" --region us-east-1
  done
done

echo "Regenerating clean demo data..."
source .venv/bin/activate
python3 -c "from killer_workflow import run_workflow; run_workflow('./sample_receipt.txt', 'demo-receipt')"
python3 -c "from killer_workflow import run_workflow; run_workflow('./sample_appointment.txt', 'demo-appointment')"

echo "Done. Tables reset to two clean demo documents."
