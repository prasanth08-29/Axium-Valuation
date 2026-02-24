const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking users...");
    const users = await prisma.user.findMany();
    users.forEach(u => console.log(`User: ${u.username} | Pass: ${u.password}`));

    if (users.length === 0) {
        console.log("Seeding mock users...");
        await prisma.user.createMany({
            data: [
                { name: "Admin User", username: "admin", password: "admin_password", role: "admin" },
                { name: "Standard User", username: "user", password: "user_password", role: "user" }
            ]
        });
        console.log("Seed complete!");

        const newUsers = await prisma.user.findMany();
        console.log("New users:", newUsers);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    });
