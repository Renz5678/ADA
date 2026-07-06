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
        }
        .logo {
            font-family: 'Manrope', Arial, sans-serif;
            font-size: 32px;
            font-weight: bold;
            color: #0F1D29;
            margin-bottom: 8px;
            text-align: center;
        }
        .subtitle {
            color: #551E26;
            font-size: 14px;
            margin-bottom: 32px;
            text-align: center;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
        }
        .order-card {
            background-color: #FFF7E6;
            border-left: 4px solid #8D4A52;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        }
        .order-header {
            font-weight: bold;
            color: #0F1D29;
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
                <a href="http://localhost:5173/dashboard" class="btn">View Dashboard</a>
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
