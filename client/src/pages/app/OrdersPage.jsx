import Button from "#components/ui/Button.jsx";
import Badge from "#components/ui/Badge.jsx";
import { orderStatusStyles } from "#constants/orderStatus.js";

export default function OrdersPage() {
    const mockOrder = { status: "Pending" };

    return (
        <div>
            <Button variant="primary">New Order</Button>
            <Badge label={mockOrder.status} {...orderStatusStyles[mockOrder.status]} />
        </div>
    );
}