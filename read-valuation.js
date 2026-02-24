const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const v = await prisma.valuation.findFirst({ orderBy: { createdAt: 'desc' } });
    fs.writeFileSync('val-debug.json', JSON.stringify(v, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    });
