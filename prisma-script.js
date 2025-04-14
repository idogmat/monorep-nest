const { execSync } = require("child_process");
const type = process.argv[2];
const service = process.argv[3];
if (!service || !type) {
  console.error("Set type and srvice, example: yarn prisma generate gateway");
  process.exit(1);
}

let command = ''
switch (type) {
  case 'generate':
    command = `cd apps/${service} && npx prisma generate`;
    break;
  case 'migrate':
    command = `cd apps/${service} && npx prisma migrate dev --name init`;
    break;
  default:
    break;
}
if (!command) process.exit(1);
try {
  execSync(command, { stdio: "inherit" });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
