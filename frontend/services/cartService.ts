import { Cart, CartItem, Product } from '@/types/product';

class CartService {
    private static cart: Cart = {
        items: [],
        total: 0
    };

    private static listeners: ((cart: Cart) => void)[] = [];

    static subscribe(listener: (cart: Cart) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static notifyListeners() {
        // สร้าง deep copy ของ cart เพื่อให้ React รู้จักการเปลี่ยนแปลง
        const cartCopy: Cart = {
            items: this.cart.items.map(item => ({
                product: { ...item.product },
                quantity: item.quantity
            })),
            total: this.cart.total
        };
        this.listeners.forEach((listener, index) => {
            listener(cartCopy);
        });
    }

    // คำนวณยอดรวม
    private static updateTotal() {
        this.cart.total = this.cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    // ดึงข้อมูลตะกร้า
    static getCart(): Cart {
        return {
            items: this.cart.items.map(item => ({
                product: { ...item.product },
                quantity: item.quantity
            })),
            total: this.cart.total
        };
    }

    // เพิ่มสินค้าลงตะกร้า
    static addToCart(product: Product, quantity: number = 1): boolean {
        const existingItem = this.cart.items.find(item => item.product.id === product.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            // ตรวจสอบว่าจำนวนใหม่ไม่เกินสต๊อกที่มีอยู่
            if (newQuantity <= product.stockQuantity) {
                existingItem.quantity = newQuantity;
            } else {
                return false; // สต๊อกไม่เพียงพอ
            }
        } else {
            if (quantity <= product.stockQuantity) {
                this.cart.items.push({
                    product: { ...product },
                    quantity
                });
            } else {
                console.log('❌ Insufficient stock for new item');
                return false; // สต๊อกไม่เพียงพอ
            }
        }

        this.updateTotal();
        this.notifyListeners();
        return true;
    }

    // อัพเดทจำนวนสินค้าในตะกร้า
    static updateQuantity(productId: string, quantity: number): boolean {
        const item = this.cart.items.find(item => item.product.id === productId);
        if (!item) return false;

        if (quantity <= 0) {
            this.removeFromCart(productId);
            return true;
        }

        if (quantity <= item.product.stockQuantity) {
            item.quantity = quantity;
            this.updateTotal();
            this.notifyListeners();
            return true;
        }

        return false; // สต๊อกไม่เพียงพอ
    }

    // ลบสินค้าออกจากตะกร้า
    static removeFromCart(productId: string) {
        this.cart.items = this.cart.items.filter(item => item.product.id !== productId);
        this.updateTotal();
        this.notifyListeners();
    }

    // เคลียร์ตะกร้า
    static clearCart() {
        this.cart.items = [];
        this.cart.total = 0;
        this.notifyListeners();
    }

    // นับจำนวนสินค้าในตะกร้า
    static getCartItemCount(): number {
        return this.cart.items.reduce((count, item) => count + item.quantity, 0);
    }

    // บังคับให้ทุก listener อัพเดทข้อมูล (สำหรับเรียกจากหน้า Cart)
    static triggerUpdate() {
        this.notifyListeners();
    }
}

export default CartService;