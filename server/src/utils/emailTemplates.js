export const getVerificationEmailHtml = (username, verificationToken) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Work Sans', Arial, sans-serif;
            background-color: #FFF7E6;
            margin: 0;
            padding: 0;
            color: #0F1D29;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            text-align: center;
        }
        .logo {
            font-family: 'Manrope', Arial, sans-serif;
            font-size: 32px;
            font-weight: bold;
            color: #0F1D29;
            margin-bottom: 8px;
        }
        .subtitle {
            color: #551E26;
            font-size: 14px;
            margin-bottom: 32px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            text-align: left;
        }
        .otp-container {
            background-color: #FFF7E6;
            border: 2px dashed #CBA0AA;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #8D4A52;
            letter-spacing: 4px;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #888888;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">ADA</div>
        <div class="subtitle">Create. Sell. Track</div>
        
        <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>Thank you for using ADA. Please use the verification code below to complete your request:</p>
            
            <div class="otp-container">
                <div class="otp-code">${verificationToken}</div>
            </div>
            
            <p>This code will expire in 5 minutes. Please do not share this code with anyone.</p>
            <p>If you did not request this, please ignore this email and your account will remain secure.</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ADA. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const getDeadlineReminderHtml = (username, orders) => {
    let ordersHtml = orders.map(o => `
        <div class="order-card">
            <div class="order-header">Order #${o.order_id}</div>
            <div class="order-detail"><strong>Due:</strong> ${o.deadline}</div>
            <div class="order-detail"><strong>Total Amount:</strong> ₱${o.total_amount}</div>
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Work Sans', Arial, sans-serif;
            background-color: #FFF7E6;
            margin: 0;
            padding: 0;
            color: #0F1D29;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            text-align: center;
        }
        .logo {
            font-family: 'Manrope', Arial, sans-serif;
            font-size: 32px;
            font-weight: bold;
            color: #0F1D29;
            margin-bottom: 8px;
        }
        .subtitle {
            color: #551E26;
            font-size: 14px;
            margin-bottom: 32px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            text-align: left;
        }
        .order-card {
            background-color: #FFF7E6;
            border: 2px dashed #CBA0AA;
            border-radius: 12px;
            padding: 24px;
            margin: 16px 0;
            text-align: left;
        }
        .order-header {
            font-weight: bold;
            color: #8D4A52;
            font-size: 18px;
            margin-bottom: 8px;
        }
        .order-detail {
            color: #551E26;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .btn-container {
            text-align: center;
            margin: 32px 0;
        }
        .btn {
            background-color: #8D4A52;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 24px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #888888;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">ADA</div>
        <div class="subtitle">Create. Sell. Track</div>
        
        <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>This is a quick reminder about your upcoming tasks that are due soon.</p>
            
            ${ordersHtml}
            
            <div class="btn-container">
                <a href="https://ada-pied-iota.vercel.app/dashboard" class="btn">View Dashboard</a>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ADA. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};

export const getScheduleReminderHtml = (username, taskName, startTime) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Work Sans', Arial, sans-serif;
            background-color: #FFF7E6;
            margin: 0;
            padding: 0;
            color: #0F1D29;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            text-align: center;
        }
        .logo {
            font-family: 'Manrope', Arial, sans-serif;
            font-size: 32px;
            font-weight: bold;
            color: #0F1D29;
            margin-bottom: 8px;
        }
        .subtitle {
            color: #551E26;
            font-size: 14px;
            margin-bottom: 32px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            text-align: left;
        }
        .task-card {
            background-color: #FFF7E6;
            border: 2px dashed #CBA0AA;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
        }
        .task-title {
            font-size: 20px;
            font-weight: bold;
            color: #8D4A52;
            margin-bottom: 8px;
        }
        .task-time {
            color: #551E26;
            font-size: 16px;
        }
        .btn-container {
            text-align: center;
            margin: 32px 0;
        }
        .btn {
            background-color: #8D4A52;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 24px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #888888;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">ADA</div>
        <div class="subtitle">Create. Sell. Track</div>
        
        <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            <p>Your scheduled work block is starting in <strong>5 minutes</strong> (${startTime}).</p>
            <p>Based on your current priorities and deadlines, we suggest you focus on the following task:</p>
            
            <div class="task-card">
                <div class="task-title">${taskName}</div>
                <div class="task-time">Starts at ${startTime}</div>
            </div>
            
            <div class="btn-container">
                <a href="https://ada-pied-iota.vercel.app/tasks" class="btn">View My Tasks</a>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ADA. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};

export const getNewOrderRequestHtml = (freelancerName, clientName, items, totalAmount, deadline) => {
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6d3; color: #0F1D29;">${item.product_name}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6d3; text-align: center; color: #0F1D29;">${item.quantity}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6d3; text-align: right; color: #8D4A52; font-weight: bold;">₱${Number(item.subtotal).toFixed(2)}</td>
        </tr>
    `).join('');

    const deadlineHtml = deadline
        ? `<p style="margin: 4px 0;"><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>`
        : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Work Sans', Arial, sans-serif; background-color: #FFF7E6; margin: 0; padding: 0; color: #0F1D29; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .logo { font-family: 'Manrope', Arial, sans-serif; font-size: 32px; font-weight: bold; color: #0F1D29; margin-bottom: 8px; text-align: center; }
        .subtitle { color: #551E26; font-size: 14px; margin-bottom: 32px; text-align: center; }
        .badge { display: inline-block; background-color: #FFF7E6; border: 1px solid #CBA0AA; color: #8D4A52; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 999px; margin-bottom: 24px; }
        .order-meta { background-color: #FFF7E6; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background-color: #0F1D29; color: #ffffff; padding: 10px 12px; text-align: left; font-size: 13px; }
        th:nth-child(2) { text-align: center; }
        th:nth-child(3) { text-align: right; }
        .total-row { background-color: #FFF7E6; }
        .total-row td { padding: 12px; font-weight: bold; font-size: 16px; }
        .btn { display: inline-block; background-color: #8D4A52; color: #ffffff !important; padding: 14px 32px; border-radius: 24px; text-decoration: none; font-weight: bold; font-size: 15px; margin-top: 8px; }
        .footer { margin-top: 40px; font-size: 12px; color: #888888; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">ADA</div>
        <div class="subtitle">Create. Sell. Track</div>

        <span class="badge">🛒 New Order Request</span>

        <p>Hi <strong>${freelancerName}</strong>,</p>
        <p>You have received a new order request from <strong>${clientName}</strong> that requires your approval.</p>

        <div class="order-meta">
            <p style="margin: 4px 0;"><strong>Client:</strong> ${clientName}</p>
            ${deadlineHtml}
        </div>

        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
                <tr class="total-row">
                    <td colspan="2" style="padding: 12px; color: #0F1D29;">Total Amount</td>
                    <td style="padding: 12px; text-align: right; color: #8D4A52;">₱${Number(totalAmount).toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <p>Log in to your ADA dashboard to <strong>approve or decline</strong> this order request.</p>

        <div style="text-align: center; margin: 28px 0;">
            <a href="https://ada-pied-iota.vercel.app/orders" class="btn">Review Order Request →</a>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ADA. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};

