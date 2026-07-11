export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  emoji: string;
}

export const products: Product[] = [
  { id: 'p1', name: 'Wireless Earbuds', price: 79.99, description: 'Premium noise-cancelling with 30hr battery life', category: 'Audio', emoji: '🎧' },
  { id: 'p2', name: 'Smart Watch', price: 249.99, description: 'Health tracking, GPS, always-on display', category: 'Wearable', emoji: '⌚' },
  { id: 'p3', name: 'Mechanical Keyboard', price: 159.99, description: 'Cherry MX switches, RGB backlight, aluminum frame', category: 'Peripherals', emoji: '⌨️' },
  { id: 'p4', name: '4K Monitor', price: 449.99, description: '32-inch IPS, 144Hz, HDR1000, USB-C hub', category: 'Display', emoji: '🖥️' },
  { id: 'p5', name: 'Gaming Laptop', price: 1299.99, description: 'RTX 4070, 32GB RAM, 1TB NVMe, 165Hz display', category: 'Computing', emoji: '💻' },
  { id: 'p6', name: 'USB-C Hub', price: 45.99, description: '7-in-1: HDMI, USB-A, SD, ethernet, PD charging', category: 'Accessories', emoji: '🔌' },
];
