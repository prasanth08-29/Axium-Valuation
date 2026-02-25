"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- Sector Actions ---

export async function getSectors() {
  return await db.sector.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createSector(id: string, name: string) {
  const sector = await db.sector.create({
    data: { id, name },
  });
  revalidatePath("/");
  return sector;
}

export async function deleteSector(id: string) {
  await db.sector.delete({
    where: { id },
  });
  revalidatePath("/");
}

// --- Valuation Actions ---

export async function getValuations() {
  const vals = await db.valuation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return vals.map((v: any) => ({
    ...v,
    dynamicData: v.dynamicData ? JSON.parse(v.dynamicData) : {}
  }));
}

export async function createValuation(data: {
  sectorId: string;
  clientName: string;
  propertyAddress: string;
  valuationAmount: number;
  valuationDate: string;
  status?: string;
  notes?: string;
  dynamicData?: object;
}) {
  const valuation = await db.valuation.create({
    data: {
      sectorId: data.sectorId,
      clientName: data.clientName,
      propertyAddress: data.propertyAddress,
      valuationAmount: data.valuationAmount,
      valuationDate: data.valuationDate,
      notes: data.notes,
      status: data.status || "Pending",
      dynamicData: data.dynamicData ? JSON.stringify(data.dynamicData) : null,
    },
  });
  revalidatePath("/");
  return valuation;
}

export async function updateValuation(id: string, data: {
  clientName: string;
  propertyAddress: string;
  valuationAmount: number;
  valuationDate: string;
  status?: string;
  notes?: string;
  dynamicData?: object;
}) {
  const valuation = await db.valuation.update({
    where: { id },
    data: {
      clientName: data.clientName,
      propertyAddress: data.propertyAddress,
      valuationAmount: data.valuationAmount,
      valuationDate: data.valuationDate,
      notes: data.notes,
      status: data.status || "Pending",
      dynamicData: data.dynamicData ? JSON.stringify(data.dynamicData) : null,
    },
  });
  revalidatePath("/");
  return valuation;
}

export async function deleteValuation(id: string) {
  await db.valuation.delete({
    where: { id },
  });
  revalidatePath("/");
}

// --- Template Actions ---

export async function getTemplates() {
  const templates = await db.template.findMany();
  // Convert array to Record<SectorId, Template> for context compatibility
  const templateRecord: Record<string, any> = {
    bank: null,
    individual: null,
    company: null,
  };

  templates.forEach((t: any) => {
    templateRecord[t.sectorId] = {
      ...t,
      fields: JSON.parse(t.fields),
    };
  });

  return templateRecord;
}

export async function saveTemplate(sectorId: string, code: string, fields: string[]) {
  const template = await db.template.upsert({
    where: { sectorId },
    update: {
      code,
      fields: JSON.stringify(fields),
    },
    create: {
      sectorId,
      code,
      fields: JSON.stringify(fields),
    },
  });
  revalidatePath("/admin/templates");
  return template;
}

export async function deleteTemplate(sectorId: string) {
  await db.template.delete({
    where: { sectorId },
  });
  revalidatePath("/admin/templates");
}

// --- User Actions ---
export async function getUsers(search?: string) {
  return await db.user.findMany({
    where: search ? {
      OR: [
        { name: { contains: search } },
        { username: { contains: search } }
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50, // Limit to 50 for performance
  });
}

export async function createUser(data: { name: string; username: string; password?: string; role: string; status: string }) {
  const user = await db.user.create({
    data: {
      name: data.name,
      username: data.username.toLowerCase(),
      password: data.password || "password123", // Default password if none provided
      role: data.role,
      status: data.status,
    }
  });
  revalidatePath("/admin/users");
  return user;
}

export async function updateUser(id: string, data: { name: string; username: string; password?: string; role: string; status: string }) {
  const updateData: any = {
    name: data.name,
    username: data.username.toLowerCase(),
    role: data.role,
    status: data.status,
  };

  if (data.password && data.password.trim() !== "") {
    updateData.password = data.password;
  }

  const user = await db.user.update({
    where: { id },
    data: updateData,
  });
  revalidatePath("/admin/users");
  return user;
}

export async function deleteUser(id: string) {
  await db.user.delete({
    where: { id },
  });
  revalidatePath("/admin/users");
}

export async function verifyUser(username: string, password: string) {
  const cleanUsername = username.trim().toLowerCase();
  const user = await db.user.findFirst({
    where: { username: cleanUsername }
  });

  // In a real app, use bcrypt.compare here
  if (user && user.password === password) {
    return {
      username: user.username,
      role: user.role,
    };
  }

  return null;
}

// Used for mock setup initially
export async function seedInitialData() {
  // Create default sectors if none exist
  const sectorCount = await db.sector.count();
  if (sectorCount === 0) {
    await db.sector.createMany({
      data: [
        { id: "bank", name: "Bank Valuation" },
        { id: "individual", name: "Individual Valuation" },
        { id: "company", name: "Company Valuation" },
      ],
    });
  }

  // Create default templates for these sectors if they don't have one
  const sectors = ["bank", "individual", "company"];
  for (const sectorId of sectors) {
    const template = await db.template.findUnique({ where: { sectorId } });
    if (!template) {
      const sector = await db.sector.findUnique({ where: { id: sectorId } });
      const name = sector?.name || sectorId;
      const code = `
<div class="valuation-report-content">
  <div class="text-center mb-8">
    <h2 class="text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block pb-1">Valuation Report</h2>
  </div>

  <table class="w-full border-collapse border-2 border-black mb-8">
    <thead>
      <tr>
        <th colspan="3" class="bg-gray-100 border border-black px-4 py-2 text-left font-bold uppercase text-sm">GENERAL INFORMATION</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-black px-4 py-2 text-center w-12">1</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Name of the party/owner</td>
        <td class="border border-black px-4 py-2">
          <input type="text" name="clientName" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Enter owner name">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">2</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Address of the property</td>
        <td class="border border-black px-4 py-2">
          <textarea name="propertyAddress" rows="2" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Enter full address"></textarea>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">3</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Name/s of reported owner & registration details</td>
        <td class="border border-black px-4 py-2">
          <textarea name="reportedOwner" rows="2" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Registration details..."></textarea>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">4</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Purpose of valuation</td>
        <td class="border border-black px-4 py-2">
          <input type="text" name="valuationPurpose" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="e.g. Bank Loan">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">5</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">List of documents produced</td>
        <td class="border border-black px-4 py-2">
          <textarea name="documentsProduced" rows="2" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Documents..."></textarea>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">6</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Date of inspection</td>
        <td class="border border-black px-4 py-2">
          <input type="date" name="inspectionDate" class="w-full border border-gray-300 rounded px-2 py-1">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">7</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Date of valuation</td>
        <td class="border border-black px-4 py-2">
          <input type="date" name="valuationDate" class="w-full border border-gray-300 rounded px-2 py-1" required>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">8</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Distance from branch</td>
        <td class="border border-black px-4 py-2">
          <input type="text" name="branchDistance" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="e.g. 5 km">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">9</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Situation/location description</td>
        <td class="border border-black px-4 py-2">
          <textarea name="locationDescription" rows="2" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="Describe locality..."></textarea>
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">10</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold">Latitude & Longitude</td>
        <td class="border border-black px-4 py-2">
          <input type="text" name="latLong" class="w-full border border-gray-300 rounded px-2 py-1" placeholder="GPS coordinates">
        </td>
      </tr>
      <tr>
        <td class="border border-black px-4 py-2 text-center">11</td>
        <td class="border border-black px-4 py-2 text-sm font-semibold italic">Valuation Amount ($)</td>
        <td class="border border-black px-4 py-2">
          <input type="number" name="valuationAmount" class="w-full border border-gray-300 rounded px-2 py-1 font-bold" placeholder="0" required>
        </td>
      </tr>
    </tbody>
  </table>
</div>
`;
      const fields = ["clientName", "propertyAddress", "reportedOwner", "valuationPurpose", "documentsProduced", "inspectionDate", "valuationDate", "branchDistance", "locationDescription", "latLong", "valuationAmount"];
      await db.template.create({
        data: {
          sectorId,
          code,
          fields: JSON.stringify(fields)
        }
      });
    }
  }

  // Create mock users for login if none exist
  const userCount = await db.user.count();
  if (userCount === 0) {
    await db.user.createMany({
      data: [
        { name: "Admin User", username: "admin", password: "admin_password", role: "admin" },
        { name: "Standard User", username: "user", password: "user_password", role: "user" }
      ]
    });
  }
}
