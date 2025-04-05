// generate-proto.ts
import { execSync } from 'child_process';
const path = process.argv[2];
const protoDir = `apps/${path}/src/proto`;
const outputDir = `apps/${path}/src/proto/generated`;

execSync(`
  npx protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=${outputDir} \
  --ts_proto_opt=nestJs=true \
  --ts_proto_opt=addGrpcMetadata=true \
  --proto_path=${protoDir} \
  ${protoDir}/*.proto
`, { stdio: 'inherit' });