/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const t = await prisma.template.findFirst();
    if (t) {
        fs.writeFileSync('template-debug.html', t.code);
        fs.writeFileSync('template-fields.json', t.fields);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    });
