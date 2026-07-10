import { sequelize, models } from './src/models/index.js';

const { Users, Product, Orders, OrderItem, Material, MaterialTransaction, Expense, ProductMaterial } = models;

const generateRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function seed() {
    try {
        console.log('Syncing database (force: true)...');
        await sequelize.sync({ force: true });

        console.log('Creating User...');
        // Note: Users.beforeCreate hook handles the bcrypt hashing automatically, so we pass plaintext here.
        const user = await Users.create({
            username: 'demo_user',
            business_name: 'Freelance Studios',
            email: 'demo@example.com',
            password: 'Password123!'
        });

        console.log('Creating Products...');
        const productsData = [
            { product_code: 'LOG-001', product_name: 'Custom Logo Design', price: 5000 },
            { product_code: 'WEB-001', product_name: 'Landing Page UI', price: 15000 },
            { product_code: 'ILL-001', product_name: 'Vector Illustration', price: 3000 },
            { product_code: 'VID-001', product_name: 'Promotional Video', price: 25000 },
            { product_code: 'SEO-001', product_name: 'SEO Audit', price: 8000 }
        ];

        const products = [];
        for (const p of productsData) {
            products.push(await Product.create({ ...p, user_id: user.user_id }));
        }

        console.log('Creating Materials (Software Subscriptions & Assets)...');
        const materialsData = [
            { material_name: 'Adobe Creative Cloud', material_code: 'MAT-001', unit_cost: 50, quantity: 12, unit: 'month' },
            { material_name: 'Figma Pro', material_code: 'MAT-002', unit_cost: 15, quantity: 12, unit: 'month' },
            { material_name: 'Stock Video Assets', material_code: 'MAT-003', unit_cost: 100, quantity: 5, unit: 'pack' },
            { material_name: 'Premium Fonts', material_code: 'MAT-004', unit_cost: 25, quantity: 1, unit: 'license' },
            { material_name: 'Cloud Hosting', material_code: 'MAT-005', unit_cost: 20, quantity: 12, unit: 'month' }
        ];

        const materials = [];
        for (const m of materialsData) {
            materials.push(await Material.create({ ...m, user_id: user.user_id, alert_threshold: 2 }));
        }

        console.log('Linking Products with Materials (BOM)...');
        // Web UI uses Figma
        await ProductMaterial.create({ product_id: products[1].product_id, material_id: materials[1].material_id, quantity_required: 1 });
        // Logo Design uses Adobe CC
        await ProductMaterial.create({ product_id: products[0].product_id, material_id: materials[0].material_id, quantity_required: 1 });
        // Promo Video uses Stock Assets and Adobe
        await ProductMaterial.create({ product_id: products[3].product_id, material_id: materials[2].material_id, quantity_required: 1 });
        await ProductMaterial.create({ product_id: products[3].product_id, material_id: materials[0].material_id, quantity_required: 1 });

        console.log('Creating 100 Orders from January to now...');
        const statuses = ['Done', 'Delivered', 'Delivered', 'Delivered', 'Pending', 'Pending'];
        const customers = ['John Doe', 'Acme Corp', 'Startup Inc', 'Maria Santos', 'Tech Solutions', 'Local Bakery', 'Finance Group', 'Alpha Agency'];

        const startDate = new Date('2026-01-01');
        const endDate = new Date('2026-07-07'); // up to today

        for (let i = 1; i <= 100; i++) {
            const orderDate = generateRandomDate(startDate, endDate);
            
            // Generate a deadline 3-14 days after the order date
            const deadline = new Date(orderDate.getTime() + (Math.floor(Math.random() * 12) + 3) * 24 * 60 * 60 * 1000);
            
            // If the deadline is in the past, status is likely completed
            let status = statuses[Math.floor(Math.random() * statuses.length)];
            if (deadline < new Date() && Math.random() > 0.1) {
                status = 'Delivered';
            }

            const customer_name = customers[Math.floor(Math.random() * customers.length)];

            // Create Order first (total_amount = 0 initially)
            const order = await Orders.create({
                user_id: user.user_id,
                customer_name,
                order_date: orderDate.toISOString().split('T')[0],
                deadline: deadline.toISOString().split('T')[0],
                status,
                total_amount: 0 // Will update after adding items
            });

            // Add 1 to 3 random items to this order
            const numItems = Math.floor(Math.random() * 3) + 1;
            let orderTotal = 0;
            const chosenProducts = new Set();

            for (let j = 0; j < numItems; j++) {
                let product = products[Math.floor(Math.random() * products.length)];
                // avoid duplicate products in the same order
                while(chosenProducts.has(product.product_id)) {
                    product = products[Math.floor(Math.random() * products.length)];
                }
                chosenProducts.add(product.product_id);

                const quantity = Math.floor(Math.random() * 2) + 1;
                const price = parseFloat(product.price);

                await OrderItem.create({
                    order_id: order.order_id,
                    product_id: product.product_id,
                    quantity,
                    subtotal: price * quantity
                });

                orderTotal += (price * quantity);
            }

            // Update order total
            await order.update({ total_amount: orderTotal });
        }

        console.log('Creating Expenses...');
        for (let i = 0; i < 30; i++) {
            const expenseDate = generateRandomDate(startDate, endDate);
            const amount = Math.floor(Math.random() * 2000) + 500;
            const categories = ['Software', 'Hardware', 'Marketing', 'Internet', 'Office Supplies'];
            const category = categories[Math.floor(Math.random() * categories.length)];
            
            await Expense.create({
                user_id: user.user_id,
                title: `${category} Expense`,
                amount,
                category,
                description: `Monthly ${category} expense`,
                expense_date: expenseDate.toISOString().split('T')[0]
            });
        }

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

seed();
