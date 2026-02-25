const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

async function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/px-4 py-2/g, 'px-2 py-1');
    content = content.replace(/rows="2"/g, 'rows="1"');
    content = content.replace(/mb-8/g, 'mb-4');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
}

async function main() {
    // Update files
    updateFile('./src/app/(protected)/admin/templates/page.tsx');
    updateFile('./src/app/actions/db-actions.ts');

    // Update DB Templates
    const prisma = new PrismaClient();
    const templates = await prisma.template.findMany();
    for (const t of templates) {
        let code = t.code;
        code = code.replace(/px-4 py-2/g, 'px-2 py-1');
        code = code.replace(/rows="2"/g, 'rows="1"');
        code = code.replace(/mb-8/g, 'mb-4');
        await prisma.template.update({
            where: { sectorId: t.sectorId },
            data: { code }
        });
        console.log(`Updated template for sector ${t.sectorId} in DB`);
    }
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
