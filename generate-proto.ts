import { execSync, ExecSyncOptions } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';

const protoDir = path.resolve(__dirname, `apps/libs/proto`);
const outputDir = path.resolve(protoDir, 'generated');
const googleProtoDir = path.resolve(
  __dirname,
  'node_modules/google-proto-files',
);

// Windows fix: .cmd extension required
const pluginExt = process.platform === 'win32' ? '.cmd' : '';
const pluginPath = path.resolve(
  __dirname,
  `node_modules/.bin/protoc-gen-ts_proto${pluginExt}`,
);

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}
// Собираем команду без \ и лишних кавычек
const commandParts = [
  'npx',
  'protoc',
  `--plugin=protoc-gen-ts_proto=${pluginPath}`,
  `--ts_proto_out=${outputDir}`,
  `--ts_proto_opt=nestJs=true,addGrpcMetadata=true`,
  `--proto_path=${protoDir}`,
  `--proto_path=${googleProtoDir}`,
  `${protoDir}/*.proto`,
];

console.log('🚀 Генерация .ts из .proto...');
execSync(commandParts.join(' '), {
  stdio: 'inherit',
  shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
});
console.log('✅ Готово!');
