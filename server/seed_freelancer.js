import { models } from './src/models/index.js';

async function seed() {
    try {
        const { Users, Material, Product, ProductMaterial, Orders, OrderItem } = models;
        
        // 1. Create User
        const user = await Users.create({
            username: 'PaperCraft Studio',
            business_name: 'PaperCraft Studio',
            email: 'papercraft.studio@example.com',
            password: 'password123',
            is_verified: true,
            bio: 'Home-based studio specializing in handmade paper goods and stationery.',
            description: 'We create beautiful, handcrafted stationery, greeting cards, and custom prints right from our home studio. Every piece is made with care, precision, and high-quality materials.',
            theme_color: '#8D4A52'
        });

        // 2. Create Materials
        const cardstock = await Material.create({
            user_id: user.user_id,
            material_code: 'MAT-001',
            material_name: 'Premium White Cardstock (A4)',
            unit: 'sheets',
            unit_cost: 5.50,
            quantity: 500,
            low_stock_threshold: 50
        });

        const ink = await Material.create({
            user_id: user.user_id,
            material_code: 'MAT-002',
            material_name: 'Printer Ink Cartridge (Black)',
            unit: 'pcs',
            unit_cost: 850.00,
            quantity: 4,
            low_stock_threshold: 1
        });

        const envelopes = await Material.create({
            user_id: user.user_id,
            material_code: 'MAT-003',
            material_name: 'Kraft Envelopes (5x7)',
            unit: 'pcs',
            unit_cost: 12.00,
            quantity: 200,
            low_stock_threshold: 30
        });

        const twine = await Material.create({
            user_id: user.user_id,
            material_code: 'MAT-004',
            material_name: 'Rustic Jute Twine (Roll)',
            unit: 'rolls',
            unit_cost: 45.00,
            quantity: 10,
            low_stock_threshold: 2
        });

        // 3. Create Products
        const greetingCard = await Product.create({
            user_id: user.user_id,
            product_code: 'PRD-001',
            product_name: 'Custom Greeting Card (Set of 5)',
            price: 350.00,
            description: 'A beautiful set of 5 handcrafted greeting cards with custom designs.',
            estimated_days: 3
        });

        const weddingInvites = await Product.create({
            user_id: user.user_id,
            product_code: 'PRD-002',
            product_name: 'Rustic Wedding Invitations (50 pcs)',
            price: 4500.00,
            description: 'Elegant, rustic-themed wedding invitations printed on premium cardstock and wrapped in jute twine.',
            estimated_days: 14
        });

        // 4. Create ProductMaterials
        await ProductMaterial.create({
            product_id: greetingCard.product_id,
            material_id: cardstock.material_id,
            quantity_required: 5
        });
        await ProductMaterial.create({
            product_id: greetingCard.product_id,
            material_id: envelopes.material_id,
            quantity_required: 5
        });

        await ProductMaterial.create({
            product_id: weddingInvites.product_id,
            material_id: cardstock.material_id,
            quantity_required: 50
        });
        await ProductMaterial.create({
            product_id: weddingInvites.product_id,
            material_id: envelopes.material_id,
            quantity_required: 50
        });
        await ProductMaterial.create({
            product_id: weddingInvites.product_id,
            material_id: twine.material_id,
            quantity_required: 1
        });

        // 5. Create Orders
        const today = new Date();
        
        const order1 = await Orders.create({
            user_id: user.user_id,
            customer_name: 'Alice Johnson',
            order_date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_amount: 350.00,
            deadline: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'Delivered'
        });
        await OrderItem.create({
            order_id: order1.order_id,
            product_id: greetingCard.product_id,
            quantity: 1,
            subtotal: 350.00
        });

        const order2 = await Orders.create({
            user_id: user.user_id,
            customer_name: 'Mark & Sarah',
            order_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_amount: 4500.00,
            deadline: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'Pending'
        });
        await OrderItem.create({
            order_id: order2.order_id,
            product_id: weddingInvites.product_id,
            quantity: 1,
            subtotal: 4500.00
        });

        const order3 = await Orders.create({
            user_id: user.user_id,
            customer_name: 'Local Boutique',
            order_date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_amount: 1750.00,
            deadline: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'Pending'
        });
        await OrderItem.create({
            order_id: order3.order_id,
            product_id: greetingCard.product_id,
            quantity: 5,
            subtotal: 1750.00
        });

        console.log('Seeding completed successfully.');
        console.log(`Created user: ${user.email} | password: password123`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
