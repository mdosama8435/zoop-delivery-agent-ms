import 'dotenv/config';
import { PrismaClient, AgentStatus } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const mockAgents = [
  {
    name: 'Aarav Sharma',
    phone: '+919876543201',
    email: 'aarav.sharma@zoop.delivery',
    serviceArea: 'Central Delhi',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Priya Patel',
    phone: '+919876543202',
    email: 'priya.patel@zoop.delivery',
    serviceArea: 'West Mumbai',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Rohan Gupta',
    phone: '+919876543203',
    email: 'rohan.gupta@zoop.delivery',
    serviceArea: 'South Bangalore',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Ananya Iyer',
    phone: '+919876543204',
    email: 'ananya.iyer@zoop.delivery',
    serviceArea: 'North Chennai',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Vikram Malhotra',
    phone: '+919876543205',
    email: 'vikram.malhotra@zoop.delivery',
    serviceArea: 'East Hyderabad',
    status: AgentStatus.INACTIVE,
  },
  {
    name: 'Sneha Kulkarni',
    phone: '+919876543206',
    email: 'sneha.kulkarni@zoop.delivery',
    serviceArea: 'Central Pune',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Kabir Verma',
    phone: '+919876543207',
    email: 'kabir.verma@zoop.delivery',
    serviceArea: 'Central Delhi',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Neha Singhal',
    phone: '+919876543208',
    email: 'neha.singhal@zoop.delivery',
    serviceArea: 'West Mumbai',
    status: AgentStatus.INACTIVE,
  },
  {
    name: 'Aditya Nair',
    phone: '+919876543209',
    email: 'aditya.nair@zoop.delivery',
    serviceArea: 'South Bangalore',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Meera Rao',
    phone: '+919876543210',
    email: 'meera.rao@zoop.delivery',
    serviceArea: 'North Chennai',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Devansh Joshi',
    phone: '+919876543211',
    email: 'devansh.joshi@zoop.delivery',
    serviceArea: 'East Hyderabad',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Tanvi Deshmukh',
    phone: '+919876543212',
    email: 'tanvi.deshmukh@zoop.delivery',
    serviceArea: 'Central Pune',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Karan Mehra',
    phone: '+919876543213',
    email: 'karan.mehra@zoop.delivery',
    serviceArea: 'Gurugram Cybercity',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Pooja Bhatia',
    phone: '+919876543214',
    email: 'pooja.bhatia@zoop.delivery',
    serviceArea: 'Noida Sector 62',
    status: AgentStatus.INACTIVE,
  },
  {
    name: 'Siddharth Sen',
    phone: '+919876543215',
    email: 'siddharth.sen@zoop.delivery',
    serviceArea: 'Kolkata Salt Lake',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Ritu Agarwal',
    phone: '+919876543216',
    email: 'ritu.agarwal@zoop.delivery',
    serviceArea: 'Ahmedabad SG Highway',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Harsh Vardhan',
    phone: '+919876543217',
    email: 'harsh.vardhan@zoop.delivery',
    serviceArea: 'Jaipur Malviya Nagar',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Divya Nambiar',
    phone: '+919876543218',
    email: 'divya.nambiar@zoop.delivery',
    serviceArea: 'Kochi Marine Drive',
    status: AgentStatus.INACTIVE,
  },
  {
    name: 'Manish Tiwari',
    phone: '+919876543219',
    email: 'manish.tiwari@zoop.delivery',
    serviceArea: 'Lucknow Gomti Nagar',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Shreya Ghosh',
    phone: '+919876543220',
    email: 'shreya.ghosh@zoop.delivery',
    serviceArea: 'Kolkata Park Street',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Arjun Reddy',
    phone: '+919876543221',
    email: 'arjun.reddy@zoop.delivery',
    serviceArea: 'Hyderabad Hitec City',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Bhavna Chawla',
    phone: '+919876543222',
    email: 'bhavna.chawla@zoop.delivery',
    serviceArea: 'Chandigarh Sector 17',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Zayn Merchant',
    phone: '+919876543223',
    email: 'zayn.merchant@zoop.delivery',
    serviceArea: 'South Mumbai',
    status: AgentStatus.INACTIVE,
  },
  {
    name: 'Kavita Pillai',
    phone: '+919876543224',
    email: 'kavita.pillai@zoop.delivery',
    serviceArea: 'Bengaluru Indiranagar',
    status: AgentStatus.ACTIVE,
  },
  {
    name: 'Sameer Sheikh',
    phone: '+919876543225',
    email: 'sameer.sheikh@zoop.delivery',
    serviceArea: 'Bhopal MP Nagar',
    status: AgentStatus.ACTIVE,
  },
];

async function main() {
  console.log('Seeding Delivery Agents into database...');

  // Clean existing records to allow repeatable idempotent seeding
  await prisma.deliveryAgent.deleteMany();

  for (const agent of mockAgents) {
    await prisma.deliveryAgent.create({
      data: agent,
    });
  }

  const count = await prisma.deliveryAgent.count();
  console.log(`Successfully seeded ${count} Delivery Agents!`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
