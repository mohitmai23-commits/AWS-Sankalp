#!/bin/bash
# Serverless Deployment Script for AnuJnana
# Uses: Lambda Container Image + API Gateway + S3

set -e

REGION="ap-south-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
APP_NAME="anujnana"
ECR_REPO="${APP_NAME}-backend"
LAMBDA_FUNCTION="${APP_NAME}-api"
API_NAME="${APP_NAME}-api-gateway"
S3_BUCKET="${APP_NAME}-frontend-${ACCOUNT_ID}"

echo "📦 AnuJnana Serverless Deployment"
echo "=================================="
echo "Region: $REGION"
echo "Account: $ACCOUNT_ID"

# Step 1: Create ECR Repository
echo ""
echo "🔧 Step 1: Creating ECR Repository..."
aws ecr describe-repositories --repository-names $ECR_REPO --region $REGION 2>/dev/null || \
aws ecr create-repository --repository-name $ECR_REPO --region $REGION

# Get ECR login
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# Step 2: Build and Push Docker Image
echo ""
echo "🐳 Step 2: Building Docker Image with ML Models..."
cd /Users/mohit/Desktop/adaptive-learning-platform\ copy/backend

# Build the image
docker build -f Dockerfile.lambda -t ${ECR_REPO}:latest .

# Tag and push
docker tag ${ECR_REPO}:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO}:latest
docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO}:latest

IMAGE_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO}:latest"
echo "✅ Image pushed: $IMAGE_URI"

# Step 3: Create IAM Role for Lambda
echo ""
echo "🔐 Step 3: Creating IAM Role for Lambda..."
ROLE_NAME="${APP_NAME}-lambda-role"

# Create trust policy
cat > /tmp/trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file:///tmp/trust-policy.json 2>/dev/null || echo "Role exists"
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || true
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonRDSDataFullAccess 2>/dev/null || true

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
echo "✅ Role: $ROLE_ARN"

# Wait for role to propagate
sleep 10

# Step 4: Create Lambda Function
echo ""
echo "⚡ Step 4: Creating Lambda Function..."

# Environment variables
ENV_VARS='{
  "DATABASE_URL": "postgresql://postgres:<DB_PASSWORD>@<RDS_ENDPOINT>:5432/anujnana",
  "SECRET_KEY": "<YOUR_SECRET_KEY>",
  "GEMINI_API_KEY": "<YOUR_GEMINI_API_KEY>",
  "COGNITIVE_LOAD_MODEL_PATH": "models/cognitive_load_model.pkl",
  "MEMORY_RETENTION_MODEL_PATH": "models/memory_retention_model.pkl"
}'

# Check if function exists
if aws lambda get-function --function-name $LAMBDA_FUNCTION --region $REGION 2>/dev/null; then
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $LAMBDA_FUNCTION \
        --image-uri $IMAGE_URI \
        --region $REGION
else
    echo "Creating new Lambda function..."
    aws lambda create-function \
        --function-name $LAMBDA_FUNCTION \
        --package-type Image \
        --code ImageUri=$IMAGE_URI \
        --role $ROLE_ARN \
        --timeout 30 \
        --memory-size 1024 \
        --environment "Variables=$ENV_VARS" \
        --region $REGION
fi

echo "✅ Lambda function created/updated"

# Step 5: Create API Gateway
echo ""
echo "🌐 Step 5: Creating API Gateway..."

# Create HTTP API
API_ID=$(aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='$API_NAME'].ApiId" --output text)

if [ -z "$API_ID" ] || [ "$API_ID" == "None" ]; then
    API_ID=$(aws apigatewayv2 create-api \
        --name $API_NAME \
        --protocol-type HTTP \
        --cors-configuration AllowOrigins='*',AllowMethods='*',AllowHeaders='*' \
        --region $REGION \
        --query 'ApiId' --output text)
    echo "Created new API: $API_ID"
else
    echo "Using existing API: $API_ID"
fi

# Create Lambda integration
LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_FUNCTION}"

INTEGRATION_ID=$(aws apigatewayv2 get-integrations --api-id $API_ID --region $REGION --query "Items[0].IntegrationId" --output text 2>/dev/null)

if [ -z "$INTEGRATION_ID" ] || [ "$INTEGRATION_ID" == "None" ]; then
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id $API_ID \
        --integration-type AWS_PROXY \
        --integration-uri $LAMBDA_ARN \
        --payload-format-version 2.0 \
        --region $REGION \
        --query 'IntegrationId' --output text)
fi

# Create route for all paths
aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key 'ANY /{proxy+}' \
    --target "integrations/$INTEGRATION_ID" \
    --region $REGION 2>/dev/null || true

aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key 'ANY /' \
    --target "integrations/$INTEGRATION_ID" \
    --region $REGION 2>/dev/null || true

# Create stage
aws apigatewayv2 create-stage \
    --api-id $API_ID \
    --stage-name prod \
    --auto-deploy \
    --region $REGION 2>/dev/null || true

# Add Lambda permission for API Gateway
aws lambda add-permission \
    --function-name $LAMBDA_FUNCTION \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*" \
    --region $REGION 2>/dev/null || true

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"
echo "✅ API Gateway: $API_URL"

# Step 6: Create S3 Bucket for Frontend
echo ""
echo "🪣 Step 6: Creating S3 Bucket for Frontend..."

aws s3 mb s3://$S3_BUCKET --region $REGION 2>/dev/null || echo "Bucket exists"

# Enable static website hosting
aws s3 website s3://$S3_BUCKET --index-document index.html --error-document index.html

# Set bucket policy for public access
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${S3_BUCKET}/*"
        }
    ]
}
EOF

aws s3api put-public-access-block \
    --bucket $S3_BUCKET \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" 2>/dev/null || true

aws s3api put-bucket-policy --bucket $S3_BUCKET --policy file:///tmp/bucket-policy.json 2>/dev/null || true

FRONTEND_URL="http://${S3_BUCKET}.s3-website.${REGION}.amazonaws.com"
echo "✅ S3 Bucket: $FRONTEND_URL"

echo ""
echo "========================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "========================================"
echo ""
echo "📡 API Endpoint: $API_URL"
echo "🌐 Frontend URL: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Update frontend/.env with API_URL=$API_URL"
echo "2. Build frontend: cd frontend && npm run build"
echo "3. Upload frontend: aws s3 sync dist/ s3://$S3_BUCKET/"
echo ""
